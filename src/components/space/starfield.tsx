"use client";

import { useEffect, useRef, useState } from "react";
import { useMediaQuery, usePrefersReducedMotion } from "@/components/ui/use-media-query";

/**
 * Fixed WebGL deep-space scene behind the whole site.
 * - stars in four depth bands plus soft out-of-focus dust in front; every star parallaxes by its own distance
 *   (scroll and pointer), and wraps around so the sky never runs out
 * - far-off nebula clouds
 * - textured, normal-mapped planets with clouds, atmosphere and orbiting moons, lit by one sun and a cool rim light
 * - DPR clamped, paused when the tab is hidden, fully disposed on unmount
 * - static CSS stars for reduced motion, save-data, or no WebGL
 */
export function Starfield() {
  const hostRef = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const saveData = useMediaQuery("(prefers-reduced-data: reduce)");
  const [webglFailed, setWebglFailed] = useState(false);
  const fallback = reduceMotion || saveData || webglFailed;

  useEffect(() => {
    const host = hostRef.current;
    if (!host || fallback) return;

    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      if (disposed) return;

      const lowPower = (navigator.hardwareConcurrency ?? 8) <= 4 || window.innerWidth < 768;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: !lowPower, alpha: true, powerPreference: lowPower ? "low-power" : "default" });
      } catch {
        setWebglFailed(true);
        return;
      }

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1 : 2));
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      const canvas = renderer.domElement;
      canvas.setAttribute("aria-hidden", "true");
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      host.appendChild(canvas);

      const scene = new THREE.Scene();
      // A narrow lens far back (instead of a wide one up close) keeps the same framing but stops spheres near the
      // screen edges stretching into ovals. Every distance below is written for a camera at z = 600 with a 60° lens;
      // S rescales them, and Z() converts such a z into this camera's space.
      const FOV = 34;
      const S = Math.tan(Math.PI / 6) / Math.tan((FOV * Math.PI) / 360);
      const CAM_Z = 600 * S;
      const Z = (z: number) => CAM_Z - (600 - z) * S;
      const camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, 50, 6000);
      camera.position.z = CAM_Z;
      const TAN = Math.tan((camera.fov * Math.PI) / 360);

      const disposables: Array<{ dispose: () => void }> = [];
      const palette = [
        new THREE.Color("#ffffff"),
        new THREE.Color("#cfefff"),
        new THREE.Color("#5fd3f5"),
        new THREE.Color("#b99bff"),
        new THREE.Color("#ffd6ea"),
      ];

      // Seeded random so the sky looks the same on every visit.
      let seed = 1337;
      const rand = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };

      // Stars are stored as screen-space coordinates (x, y in 0..1) plus a world depth z. The vertex shader turns them
      // into positions that exactly fill the view at that depth, offsets them by scroll/pointer scaled by 1/distance
      // (near stars slide further than far ones) and wraps them, so parallax and density stay right at every depth.
      const sharedUniforms = {
        uTime: { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uAspect: { value: camera.aspect },
        uTan: { value: TAN },
        uCamZ: { value: CAM_Z },
        uRef: { value: 500 * S },
        uS: { value: S },
        uOffset: { value: new THREE.Vector2() },
      };
      const starVertex = /* glsl */ `
        attribute float aSize;
        attribute float aPhase;
        attribute vec3 aColor;
        uniform float uTime;
        uniform float uPixelRatio;
        uniform float uAspect;
        uniform float uTan;
        uniform float uCamZ;
        uniform float uRef;
        uniform float uS;
        uniform vec2 uOffset;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          float dist = uCamZ - position.z;
          float spanY = 2.0 * uTan * dist * 1.1;
          float spanX = spanY * uAspect;
          vec2 n = fract(position.xy + uOffset * (uRef / dist)) - 0.5;
          vec4 mv = modelViewMatrix * vec4(n.x * spanX, n.y * spanY, position.z, 1.0);
          gl_Position = projectionMatrix * mv;
          vAlpha = 0.55 + 0.45 * sin(uTime * (0.6 + aPhase * 1.4) + aPhase * 6.2831);
          vColor = aColor;
          gl_PointSize = aSize * uPixelRatio * (420.0 * uS / -mv.z);
        }
      `;
      const starMaterial = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: sharedUniforms,
        vertexShader: starVertex,
        fragmentShader: /* glsl */ `
          varying vec3 vColor;
          varying float vAlpha;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float core = smoothstep(0.5, 0.0, d);
            gl_FragColor = vec4(vColor, pow(core, 2.6) * vAlpha);
          }
        `,
      });
      // Big, faint, out-of-focus discs close to the camera: the depth-of-field cue.
      const dustMaterial = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: sharedUniforms,
        vertexShader: starVertex,
        fragmentShader: /* glsl */ `
          varying vec3 vColor;
          varying float vAlpha;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float disc = smoothstep(0.5, 0.36, d) * 0.55 + smoothstep(0.5, 0.0, d) * 0.45;
            gl_FragColor = vec4(vColor, disc * (0.45 + 0.55 * vAlpha) * 0.11);
          }
        `,
      });
      disposables.push(starMaterial, dustMaterial);

      const makeLayer = (material: import("three").ShaderMaterial, count: number, zMin: number, zMax: number, size: [number, number]) => {
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const phases = new Float32Array(count);
        const colors = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
          positions[i * 3] = rand();
          positions[i * 3 + 1] = rand();
          positions[i * 3 + 2] = Z(zMin + rand() * (zMax - zMin));
          sizes[i] = size[0] + Math.pow(rand(), 3) * (size[1] - size[0]);
          phases[i] = rand();
          const color = palette[Math.floor(rand() * palette.length)];
          colors[i * 3] = color.r;
          colors[i * 3 + 1] = color.g;
          colors[i * 3 + 2] = color.b;
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
        geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
        const points = new THREE.Points(geometry, material);
        points.frustumCulled = false; // positions are computed in the shader, so the stored bounds mean nothing
        scene.add(points);
        disposables.push(geometry);
      };

      const scale = lowPower ? 0.55 : 1;
      makeLayer(starMaterial, Math.round(1700 * scale), -1150, -700, [2.6, 5.2]);
      makeLayer(starMaterial, Math.round(950 * scale), -700, -200, [1.8, 4.8]);
      makeLayer(starMaterial, Math.round(280 * scale), -200, 150, [2.2, 6]);
      makeLayer(starMaterial, Math.round(70 * scale), 150, 420, [3, 8.5]);
      makeLayer(dustMaterial, Math.round(30 * scale), 280, 480, [5, 16]);

      // Lighting: a warm key from the upper left, a cool rim from behind, and a faint sky/ground fill so the night side
      // is never pure black.
      const sun = new THREE.DirectionalLight(0xfff1e0, 3.4);
      sun.position.set(-300, 260, 400);
      scene.add(sun);
      const rim = new THREE.DirectionalLight(0x7fd8ff, 1.5);
      rim.position.set(420, -120, -320);
      scene.add(rim);
      scene.add(new THREE.HemisphereLight(0x8fb4ff, 0x2a1450, 0.4));
      const sunDir = sun.position.clone().normalize();

      // ---- procedural textures -------------------------------------------------------------------------------------
      const hash = (x: number, y: number) => {
        let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + 1337) | 0;
        h = Math.imul(h ^ (h >>> 13), 1274126177);
        return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
      };
      const quintic = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
      const smooth = (t: number) => t * t * (3 - 2 * t);
      const clamp01 = (t: number) => Math.min(Math.max(t, 0), 1);
      // Value noise whose lattice wraps in x, so textures are seamless around the equator.
      const valueNoise = (x: number, y: number, period: number) => {
        const xi = Math.floor(x);
        const yi = Math.floor(y);
        const fx = quintic(x - xi);
        const fy = quintic(y - yi);
        const x0 = ((xi % period) + period) % period;
        const x1 = (x0 + 1) % period;
        const top = hash(x0, yi) * (1 - fx) + hash(x1, yi) * fx;
        const bottom = hash(x0, yi + 1) * (1 - fx) + hash(x1, yi + 1) * fx;
        return top * (1 - fy) + bottom * fy;
      };
      const fbm = (x: number, y: number, period: number, octaves = 5) => {
        let sum = 0;
        let amp = 0.5;
        let norm = 0;
        for (let o = 0; o < octaves; o++) {
          sum += amp * valueNoise(x * 2 ** o, y * 2 ** o, period * 2 ** o);
          norm += amp;
          amp *= 0.5;
        }
        return sum / norm;
      };
      const rgb = (hex: string): [number, number, number] => {
        const c = new THREE.Color(hex);
        return [c.r * 255, c.g * 255, c.b * 255];
      };
      const ramp = (stops: Array<[number, number, number]>, t: number) => {
        const k = clamp01(t) * (stops.length - 1);
        const i = Math.min(Math.floor(k), stops.length - 2);
        const f = smooth(k - i);
        return stops[i].map((v, c) => v + (stops[i + 1][c] - v) * f);
      };
      // Craters: a jittered grid of bowls with raised rims (grid is 2:1 so craters stay round on the sphere).
      const craters = (u: number, v: number) => {
        const gx = u * 16;
        const gy = v * 8;
        const cx = Math.floor(gx);
        const cy = Math.floor(gy);
        let h = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const ix = cx + dx;
            const iy = cy + dy;
            const wx = ((ix % 16) + 16) % 16;
            const px = ix + hash(wx, iy * 7 + 3);
            const py = iy + hash(wx + 31, iy * 5 + 9);
            const r = 0.2 + 0.32 * hash(wx + 7, iy + 13);
            const d = Math.hypot(gx - px, gy - py) / r;
            if (d < 1) h -= (1 - d * d) * 0.55;
            else if (d < 1.25) h += (1 - (d - 1) / 0.25) * 0.18;
          }
        }
        return h;
      };

      // Paint in row batches and hand the thread back between them so the page never stalls on load.
      const yieldToMain = async () => {
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
        if (disposed) throw new Error("disposed");
      };

      const texW = lowPower ? 256 : 768;
      const texH = texW / 2;
      const maxAniso = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
      type Surface = {
        kind: "gas" | "rock" | "moon";
        stops: string[];
        bands?: number;
        sea?: number; // heights below this are flat ocean
        relief: number; // normal-map strength
      };
      const paintSurface = async (surface: Surface, w: number, h: number) => {
        const colorCanvas = document.createElement("canvas");
        colorCanvas.width = w;
        colorCanvas.height = h;
        const ctx = colorCanvas.getContext("2d")!;
        const img = ctx.createImageData(w, h);
        const heights = new Float32Array(w * h);
        const stops = surface.stops.map(rgb);
        for (let y = 0; y < h; y++) {
          const v = y / h;
          for (let x = 0; x < w; x++) {
            const u = x / w;
            let t: number;
            let height: number;
            if (surface.kind === "gas") {
              const warp = fbm(u * 3, v * 6, 3) * 2.4;
              const turbulence = fbm(u * 9 + warp, v * 18, 9, 4);
              const band = Math.sin(v * Math.PI * (surface.bands ?? 9) + warp * 3 + turbulence * 1.6) * 0.5 + 0.5;
              t = band * 0.72 + fbm(u * 6, v * 12, 6) * 0.28;
              height = band * 0.5 + turbulence * 0.5;
            } else if (surface.kind === "rock") {
              const continents = fbm(u * 4, v * 2, 4);
              const detail = fbm(u * 16, v * 8, 16);
              t = (continents * 0.8 + detail * 0.2 - 0.2) * 1.9 + Math.max(Math.abs(v - 0.5) * 2 - 0.82, 0) * 6;
              height = surface.sea !== undefined ? Math.max(t, surface.sea) : t;
              height += detail * 0.25;
            } else {
              const c = craters(u, v);
              const detail = fbm(u * 10, v * 5, 10);
              height = c + detail * 0.35;
              t = 0.5 + c * 0.55 + (detail - 0.5) * 0.5;
            }
            const [r, g, b] = ramp(stops, t);
            const o = (y * w + x) * 4;
            img.data[o] = r;
            img.data[o + 1] = g;
            img.data[o + 2] = b;
            img.data[o + 3] = 255;
            heights[y * w + x] = height;
          }
          if (y % 24 === 23) await yieldToMain();
        }
        ctx.putImageData(img, 0, 0);

        // Normal map from the height field (wraps in x), so the surface catches the sun instead of reading as paint.
        const normalCanvas = document.createElement("canvas");
        normalCanvas.width = w;
        normalCanvas.height = h;
        const nctx = normalCanvas.getContext("2d")!;
        const nimg = nctx.createImageData(w, h);
        const S = surface.relief * 15 * (w / 512);
        for (let y = 0; y < h; y++) {
          const ym = Math.max(y - 1, 0);
          const yp = Math.min(y + 1, h - 1);
          for (let x = 0; x < w; x++) {
            const xm = (x - 1 + w) % w;
            const xp = (x + 1) % w;
            const nx = -(heights[y * w + xp] - heights[y * w + xm]) * S;
            const ny = (heights[yp * w + x] - heights[ym * w + x]) * S;
            const len = Math.hypot(nx, ny, 1);
            const o = (y * w + x) * 4;
            nimg.data[o] = (nx / len) * 127.5 + 127.5;
            nimg.data[o + 1] = (ny / len) * 127.5 + 127.5;
            nimg.data[o + 2] = (1 / len) * 127.5 + 127.5;
            nimg.data[o + 3] = 255;
          }
          if (y % 48 === 47) await yieldToMain();
        }
        nctx.putImageData(nimg, 0, 0);

        const map = new THREE.CanvasTexture(colorCanvas);
        map.colorSpace = THREE.SRGBColorSpace;
        map.anisotropy = maxAniso;
        const normalMap = new THREE.CanvasTexture(normalCanvas);
        normalMap.anisotropy = maxAniso;
        disposables.push(map, normalMap);
        return { map, normalMap };
      };

      const paintClouds = async (w: number, h: number, coverage: number) => {
        const canvas2d = document.createElement("canvas");
        canvas2d.width = w;
        canvas2d.height = h;
        const ctx = canvas2d.getContext("2d")!;
        const img = ctx.createImageData(w, h);
        for (let y = 0; y < h; y++) {
          const v = y / h;
          for (let x = 0; x < w; x++) {
            const u = x / w;
            const warp = fbm(u * 3, v * 3, 3, 3) * 1.8;
            const d = fbm(u * 5 + warp, v * 2.5, 5) * 0.65 + fbm(u * 14, v * 7, 14, 4) * 0.35;
            const a = smooth(clamp01((d - (0.64 - coverage * 0.22)) / 0.2));
            const o = (y * w + x) * 4;
            img.data[o] = 244;
            img.data[o + 1] = 247;
            img.data[o + 2] = 255;
            img.data[o + 3] = a * 235;
          }
          if (y % 32 === 31) await yieldToMain();
        }
        ctx.putImageData(img, 0, 0);
        const texture = new THREE.CanvasTexture(canvas2d);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = maxAniso;
        disposables.push(texture);
        return texture;
      };

      const paintRing = (inner: string, outer: string) => {
        const canvas2d = document.createElement("canvas");
        canvas2d.width = 1024;
        canvas2d.height = 4;
        const ctx = canvas2d.getContext("2d")!;
        const a = rgb(inner);
        const b = rgb(outer);
        const img = ctx.createImageData(1024, 4);
        for (let x = 0; x < 1024; x++) {
          const t = x / 1023;
          const stripes = 0.4 + 0.6 * fbm(t * 60, 0.5, 60, 4);
          const fine = 0.94 + 0.06 * Math.sin(t * 120);
          const gap = t > 0.52 && t < 0.58 ? 0.1 : 1; // Cassini-style division
          const edge = clamp01(Math.min(t / 0.07, (1 - t) / 0.12));
          for (let y = 0; y < 4; y++) {
            const o = (y * 1024 + x) * 4;
            img.data[o] = a[0] + (b[0] - a[0]) * t;
            img.data[o + 1] = a[1] + (b[1] - a[1]) * t;
            img.data[o + 2] = a[2] + (b[2] - a[2]) * t;
            img.data[o + 3] = 255 * 0.88 * stripes * fine * gap * edge;
          }
        }
        ctx.putImageData(img, 0, 0);
        const texture = new THREE.CanvasTexture(canvas2d);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = maxAniso;
        disposables.push(texture);
        return texture;
      };

      // Far-off nebula clouds: huge additive sprites behind everything.
      const paintNebula = async (hex: string) => {
        const size = lowPower ? 96 : 160;
        const canvas2d = document.createElement("canvas");
        canvas2d.width = size;
        canvas2d.height = size;
        const ctx = canvas2d.getContext("2d")!;
        const img = ctx.createImageData(size, size);
        const [r, g, b] = rgb(hex);
        const ox = rand() * 40;
        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            const u = x / size;
            const v = y / size;
            const warp = fbm(u * 3 + ox, v * 3, 64, 3);
            const d = fbm(u * 4 + warp * 1.6 + ox, v * 4 + warp, 64, 5);
            const mask = smooth(clamp01(1 - Math.hypot(u - 0.5, v - 0.5) * 2));
            const a = Math.pow(clamp01((d - 0.3) * 1.9), 1.6) * mask * mask;
            const o = (y * size + x) * 4;
            img.data[o] = r;
            img.data[o + 1] = g;
            img.data[o + 2] = b;
            img.data[o + 3] = a * 255;
          }
          if (y % 32 === 31) await yieldToMain();
        }
        ctx.putImageData(img, 0, 0);
        const texture = new THREE.CanvasTexture(canvas2d);
        texture.colorSpace = THREE.SRGBColorSpace;
        disposables.push(texture);
        return texture;
      };

      // ---- planets -------------------------------------------------------------------------------------------------
      const atmosphere = (color: string, side: "front" | "back", strength: number) =>
        new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          side: side === "back" ? THREE.BackSide : THREE.FrontSide,
          blending: THREE.AdditiveBlending,
          uniforms: { uColor: { value: new THREE.Color(color) }, uSun: { value: sunDir }, uStrength: { value: strength } },
          vertexShader: /* glsl */ `
            varying vec3 vNormal;
            varying vec3 vView;
            void main() {
              vec4 mv = modelViewMatrix * vec4(position, 1.0);
              vNormal = normalize(normalMatrix * normal);
              vView = normalize(-mv.xyz);
              gl_Position = projectionMatrix * mv;
            }
          `,
          fragmentShader:
            side === "back"
              ? /* glsl */ `
            uniform vec3 uColor;
            uniform vec3 uSun;
            uniform float uStrength;
            varying vec3 vNormal;
            varying vec3 vView;
            void main() {
              vec3 n = normalize(vNormal);
              float rim = pow(clamp(-dot(n, normalize(vView)) / 0.5, 0.0, 1.0), 2.0);
              float day = mix(0.35, 1.0, smoothstep(-0.6, 0.6, dot(n, uSun)));
              gl_FragColor = vec4(uColor, rim * day * uStrength);
            }
          `
              : /* glsl */ `
            uniform vec3 uColor;
            uniform vec3 uSun;
            uniform float uStrength;
            varying vec3 vNormal;
            varying vec3 vView;
            void main() {
              vec3 n = normalize(vNormal);
              float fres = pow(1.0 - max(dot(n, normalize(vView)), 0.0), 3.2);
              float day = smoothstep(-0.35, 0.55, dot(n, uSun));
              gl_FragColor = vec4(uColor, fres * mix(0.15, 1.0, day) * uStrength);
            }
          `,
        });

      type Moon = { spin: import("three").Object3D; speed: number; mesh: import("three").Mesh; selfSpin: number };
      type Planet = {
        group: import("three").Group;
        body: import("three").Mesh;
        clouds?: import("three").Mesh;
        moons: Moon[];
        fx: number;
        fy: number;
        z: number;
        depth: number;
        phase: number;
        angle: number;
        spin: number;
      };
      const planets: Planet[] = [];
      type PlanetOptions = {
        ring?: [string, string];
        clouds?: number; // coverage 0..1; omit for none
        moons?: Array<{ radius: number; orbit: number; speed: number; tilt: number }>;
        tint?: number; // <1 dims far-away planets (atmospheric perspective)
        spin: number;
        depth: number;
      };
      const addPlanet = async (surface: Surface, glow: string, radiusBase: number, fx: number, fy: number, zBase: number, opts: PlanetOptions) => {
        const radius = radiusBase * S;
        const z = Z(zBase);
        const group = new THREE.Group();
        // One shared axial tilt: the bands, clouds, ring plane and moon orbits all sit on the same equator, and every
        // planet leans the same way, so the whole sky reads as one consistent system.
        const axis = new THREE.Group();
        axis.rotation.set(0.38, 0, -0.32);
        group.add(axis);
        const seg: [number, number] = lowPower ? [48, 32] : [96, 64];
        const { map, normalMap } = await paintSurface(surface, texW, texH);
        const geometry = new THREE.SphereGeometry(radius, seg[0], seg[1]);
        const material = new THREE.MeshStandardMaterial({
          map,
          normalMap,
          normalScale: new THREE.Vector2(1, 1),
          roughness: surface.kind === "gas" ? 0.62 : 0.86,
          metalness: 0,
          color: new THREE.Color().setScalar(opts.tint ?? 1),
        });
        const body = new THREE.Mesh(geometry, material);
        axis.add(body);
        disposables.push(geometry, material);

        let clouds: import("three").Mesh | undefined;
        if (opts.clouds && !lowPower) {
          const cloudMap = await paintClouds(texW / 2, texH / 2, opts.clouds);
          const cloudGeometry = new THREE.SphereGeometry(radius * 1.02, seg[0], seg[1]);
          const cloudMaterial = new THREE.MeshStandardMaterial({
            map: cloudMap,
            transparent: true,
            depthWrite: false,
            roughness: 1,
            metalness: 0,
            color: new THREE.Color().setScalar(opts.tint ?? 1),
          });
          clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
          axis.add(clouds);
          disposables.push(cloudGeometry, cloudMaterial);
        }

        const innerGeometry = new THREE.SphereGeometry(radius * (opts.clouds ? 1.03 : 1.012), seg[0] / 2, seg[1] / 2);
        const innerGlow = atmosphere(glow, "front", 0.9);
        group.add(new THREE.Mesh(innerGeometry, innerGlow));
        const haloGeometry = new THREE.SphereGeometry(radius * 1.16, seg[0] / 2, seg[1] / 2);
        const haloGlow = atmosphere(glow, "back", 0.8);
        group.add(new THREE.Mesh(haloGeometry, haloGlow));
        disposables.push(innerGeometry, innerGlow, haloGeometry, haloGlow);

        if (opts.ring) {
          const inner = radius * 1.45;
          const outer = radius * 2.15;
          const ringGeometry = new THREE.RingGeometry(inner, outer, 160, 1);
          // RingGeometry UVs are planar; remap u to the radial position so the texture reads as concentric bands.
          const pos = ringGeometry.attributes.position;
          const uv = ringGeometry.attributes.uv;
          for (let i = 0; i < pos.count; i++) {
            uv.setXY(i, (Math.hypot(pos.getX(i), pos.getY(i)) - inner) / (outer - inner), 0.5);
          }
          const ringMap = paintRing(opts.ring[0], opts.ring[1]);
          const ringMaterial = new THREE.MeshStandardMaterial({
            map: ringMap,
            emissive: new THREE.Color(0xffffff),
            emissiveMap: ringMap,
            emissiveIntensity: 0.4,
            side: THREE.DoubleSide,
            transparent: true,
            depthWrite: false,
            roughness: 1,
            metalness: 0,
          });
          const ring = new THREE.Mesh(ringGeometry, ringMaterial);
          ring.rotation.x = Math.PI / 2; // flat in the equatorial plane
          axis.add(ring);
          disposables.push(ringGeometry, ringMaterial);
        }

        const moons: Moon[] = [];
        if (opts.moons && (!lowPower || planets.length === 0)) {
          const moonSurface: Surface = { kind: "moon", stops: ["#4a4955", "#8a8896", "#c9c7d6", "#f1eff8"], relief: 1.6 };
          for (const m of opts.moons.slice(0, lowPower ? 1 : 3)) {
            const { map: moonMap, normalMap: moonNormal } = await paintSurface(moonSurface, 256, 128);
            const tilt = new THREE.Group();
            tilt.rotation.x = m.tilt * 0.2; // a few degrees off the equator so the orbit reads as 3D
            const spinPivot = new THREE.Object3D();
            const moonGeometry = new THREE.SphereGeometry(m.radius * S, 40, 28);
            const moonMaterial = new THREE.MeshStandardMaterial({ map: moonMap, normalMap: moonNormal, roughness: 0.95, metalness: 0 });
            const mesh = new THREE.Mesh(moonGeometry, moonMaterial);
            mesh.position.x = m.orbit * S;
            spinPivot.rotation.y = rand() * Math.PI * 2;
            spinPivot.add(mesh);
            tilt.add(spinPivot);
            axis.add(tilt);
            disposables.push(moonGeometry, moonMaterial);
            moons.push({ spin: spinPivot, speed: m.speed, mesh, selfSpin: 0.3 });
          }
        }

        group.scale.setScalar(0.001);
        group.position.z = z;
        scene.add(group);
        planets.push({ group, body, clouds, moons, fx, fy, z, depth: opts.depth, phase: rand() * 6.28, angle: rand() * 6.28, spin: opts.spin });
        placePlanets();
      };

      // fx / fy are fractions of the visible half-width / half-height at that depth.
      function placePlanets() {
        const halfH = TAN * CAM_Z;
        const halfW = halfH * camera.aspect;
        const edge = camera.aspect < 1 ? 1 : 0.84; // pull in from the very edge on landscape screens
        for (const planet of planets) {
          // Scale the distance with the camera so z-depth does not push them off screen.
          const k = (CAM_Z - planet.z) / CAM_Z;
          planet.group.userData.x = planet.fx * edge * halfW * k;
          planet.group.userData.y = planet.fy * halfH * k;
        }
      }

      type Cloud = { sprite: import("three").Sprite; fx: number; fy: number; z: number; phase: number; drift: number };
      const nebulae: Cloud[] = [];
      function placeNebulae() {
        for (const n of nebulae) {
          const dist = CAM_Z - n.z;
          n.sprite.userData.x = n.fx * TAN * dist * camera.aspect;
          n.sprite.userData.y = n.fy * TAN * dist;
        }
      }

      const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
      const onPointer = (e: PointerEvent) => {
        pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
        pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      let scrollY = window.scrollY;
      let smoothScroll = scrollY;
      const onScroll = () => {
        scrollY = window.scrollY;
      };
      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight, false);
        sharedUniforms.uAspect.value = camera.aspect;
        placePlanets();
        placeNebulae();
      };
      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize);

      let frame = 0;
      let running = true;
      let last = performance.now();
      let t = 0;
      const tick = () => {
        if (!running) return;
        frame = requestAnimationFrame(tick);
        const now = performance.now();
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        t += dt;
        sharedUniforms.uTime.value = t;
        pointer.x += (pointer.tx - pointer.x) * 0.04;
        pointer.y += (pointer.ty - pointer.y) * 0.04;
        smoothScroll += (scrollY - smoothScroll) * 0.08;

        // Screen-fraction offset at the 500-unit reference distance; the shader scales it per star by 1/distance.
        sharedUniforms.uOffset.value.set(-pointer.x * 0.012 + t * 0.0007, pointer.y * 0.008 + (smoothScroll / window.innerHeight) * 0.18);

        for (const n of nebulae) {
          n.sprite.position.x = n.sprite.userData.x + (-pointer.x * 18 + Math.sin(t * 0.03 + n.phase) * 40) * S;
          n.sprite.position.y = n.sprite.userData.y + (pointer.y * 12 + Math.sin(smoothScroll * 0.0005 + n.phase) * 90) * S;
          n.sprite.material.rotation = t * n.drift + n.phase;
        }

        for (const planet of planets) {
          const { group, body, clouds, moons, depth, phase, spin } = planet;
          planet.angle += spin * dt;
          const s = group.scale.x + (1 - group.scale.x) * 0.035; // grow in when the page opens
          group.scale.setScalar(s);
          group.position.x = group.userData.x - pointer.x * 22 * depth * S;
          group.position.y = group.userData.y + (Math.sin(smoothScroll * 0.0011 * depth + phase) * 70 + Math.sin(t * 0.45 + phase) * 9 + pointer.y * 14 * depth) * S;
          // Spin about the planet's own axis only; scrolling adds a little extra turn.
          const turn = planet.angle + smoothScroll * 0.0007 * depth;
          body.rotation.y = turn;
          if (clouds) clouds.rotation.y = turn * 1.35;
          for (const moon of moons) {
            moon.spin.rotation.y += moon.speed * dt;
            moon.mesh.rotation.y += moon.selfSpin * dt;
          }
        }
        renderer.render(scene, camera);
      };
      tick();

      const onVisibility = () => {
        if (document.hidden) {
          running = false;
          cancelAnimationFrame(frame);
        } else if (!running) {
          running = true;
          last = performance.now();
          tick();
        }
      };
      document.addEventListener("visibilitychange", onVisibility);

      cleanup = () => {
        running = false;
        cancelAnimationFrame(frame);
        window.removeEventListener("pointermove", onPointer);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
        document.removeEventListener("visibilitychange", onVisibility);
        for (const item of disposables) item.dispose();
        renderer.dispose();
        canvas.remove();
      };

      // The sky is already drifting by now; nebulae and planets stream in as their textures are painted, so the first
      // paint is never blocked by the procedural work.
      try {
        const clouds: Array<[string, number, number, number, number, number]> = [
          ["#5b2bd0", -0.9, 0.45, -1250, 2800, 0.5],
          ["#1a8fc4", 0.85, -0.35, -1150, 2400, 0.34],
          ["#ff2d87", 0.45, 0.8, -1350, 2200, 0.24],
          ["#8b3dff", -0.55, -0.8, -1000, 1900, 0.32],
          ["#0e5f9a", 0.0, 0.05, -1450, 3200, 0.26],
        ];
        for (const [color, fx, fy, z, size, opacity] of clouds.slice(0, lowPower ? 3 : clouds.length)) {
          const texture = await paintNebula(color);
          const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity });
          const sprite = new THREE.Sprite(material);
          sprite.scale.set(size * S, size * S, 1);
          sprite.position.z = Z(z);
          scene.add(sprite);
          disposables.push(material);
          nebulae.push({ sprite, fx, fy, z: Z(z), phase: rand() * 6.28, drift: (rand() - 0.5) * 0.006 });
          placeNebulae();
        }

        // Far, dim planets first (they sit furthest back), then the hero planets.
        if (!lowPower) {
          await addPlanet({ kind: "gas", stops: ["#3a2a14", "#9b7a3d", "#e8c97a", "#fff1c9"], bands: 13, relief: 0.5 }, "#ffd58a", 40, -0.58, -0.92, -900, { spin: 0.1, depth: 0.35, tint: 0.62 });
          await addPlanet({ kind: "rock", stops: ["#12345a", "#3a7fb0", "#a9d8f0", "#f4fbff"], sea: 0.28, relief: 1.2 }, "#9fdcff", 30, 0.62, -0.9, -650, { spin: 0.16, depth: 0.45, tint: 0.75, clouds: 0.5 });
        }
        await addPlanet({ kind: "gas", stops: ["#0b4f78", "#22b8e6", "#9be8ff", "#e8fbff"], bands: 11, relief: 0.5 }, "#5fd3f5", 64, -1.08, 0.55, -120, {
          ring: ["#8fdcf5", "#e9fbff"],
          spin: 0.12,
          depth: 1,
          moons: [{ radius: 9, orbit: 180, speed: 0.22, tilt: 0.5 }],
        });
        await addPlanet({ kind: "gas", stops: ["#2a1070", "#5b2bd0", "#8b3dff", "#d9c4ff"], bands: 7, relief: 0.5 }, "#b99bff", 46, 1.0, -0.7, -260, {
          spin: 0.14,
          depth: 0.8,
          moons: [{ radius: 7, orbit: 88, speed: 0.35, tilt: -0.4 }],
        });
        await addPlanet({ kind: "rock", stops: ["#4a1f08", "#b8470f", "#ff6a13", "#ffc48a"], relief: 1.8 }, "#ff9a55", 30, 1.02, 0.1, -60, { spin: 0.2, depth: 1.4, clouds: 0.25 });
        await addPlanet({ kind: "rock", stops: ["#0a2f5c", "#1f6d9c", "#3f8f3a", "#6cbf2a", "#3d7a1c", "#e8f4e0"], sea: 0.3, relief: 1.6 }, "#8fe0ff", 22, -1.0, -0.35, 40, {
          spin: 0.26,
          depth: 1.8,
          clouds: 0.7,
          moons: [{ radius: 4, orbit: 42, speed: 0.6, tilt: 0.3 }],
        });
        if (!lowPower) {
          await addPlanet({ kind: "gas", stops: ["#6b0f3a", "#ff2d87", "#ff8fbd", "#ffe3ef"], bands: 8, relief: 0.5 }, "#ff9ccb", 26, 0.15, 0.95, -340, { spin: 0.17, depth: 0.6 });
        }
      } catch {
        // Unmounted mid-build ("disposed") or a canvas was unavailable: the stars alone are fine.
      }
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [fallback]);

  return (
    <>
      <div className="nebula" aria-hidden />
      {fallback ? <div className="stars-fallback" aria-hidden /> : null}
      <div ref={hostRef} className="pointer-events-none fixed inset-0 -z-[1]" aria-hidden />
    </>
  );
}
