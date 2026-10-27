"use client";

import { useEffect, useRef, useState } from "react";
import { useMediaQuery, usePrefersReducedMotion } from "@/components/ui/use-media-query";

/**
 * Fixed WebGL star field behind the whole site.
 * - three depth layers drifting at different speeds (parallax on scroll + pointer)
 * - twinkle and soft round points in a tiny shader
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

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "low-power" });
      } catch {
        setWebglFailed(true);
        return;
      }

      const lowPower = (navigator.hardwareConcurrency ?? 8) <= 4 || window.innerWidth < 768;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1 : 1.5));
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      renderer.setClearColor(0x000000, 0);
      const canvas = renderer.domElement;
      canvas.setAttribute("aria-hidden", "true");
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      host.appendChild(canvas);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
      camera.position.z = 600;

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

      const material = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uPixelRatio: { value: renderer.getPixelRatio() } },
        vertexShader: /* glsl */ `
          attribute float aSize;
          attribute float aPhase;
          attribute vec3 aColor;
          uniform float uTime;
          uniform float uPixelRatio;
          varying vec3 vColor;
          varying float vAlpha;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mv;
            float twinkle = 0.55 + 0.45 * sin(uTime * (0.6 + aPhase * 1.4) + aPhase * 6.2831);
            vAlpha = twinkle;
            vColor = aColor;
            gl_PointSize = aSize * uPixelRatio * (420.0 / -mv.z);
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vColor;
          varying float vAlpha;
          void main() {
            vec2 c = gl_PointCoord - 0.5;
            float d = length(c);
            float core = smoothstep(0.5, 0.0, d);
            float glow = pow(core, 2.6);
            gl_FragColor = vec4(vColor, glow * vAlpha);
          }
        `,
      });

      const layers: Array<{ points: import("three").Points; speed: number; depth: number }> = [];
      const makeLayer = (count: number, spread: number, zMin: number, zMax: number, size: [number, number], speed: number, depth: number) => {
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const phases = new Float32Array(count);
        const colors = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
          positions[i * 3] = (rand() - 0.5) * spread * 2;
          positions[i * 3 + 1] = (rand() - 0.5) * spread * 1.4;
          positions[i * 3 + 2] = zMin + rand() * (zMax - zMin);
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
        scene.add(points);
        layers.push({ points, speed, depth });
      };

      const scale = lowPower ? 0.55 : 1;
      makeLayer(Math.round(1400 * scale), 900, -700, -200, [1.2, 3.2], 0.004, 0.08);
      makeLayer(Math.round(700 * scale), 800, -200, 150, [1.6, 4.6], 0.008, 0.18);
      makeLayer(Math.round(160 * scale), 700, 150, 420, [2.4, 7.5], 0.014, 0.34);

      // Low-poly planets in the brand colours. They sit at the edges of the screen, spin, bob with the scroll
      // and lean towards the pointer, so the page feels like drifting through space.
      scene.add(new THREE.AmbientLight(0xffffff, 0.9));
      const sun = new THREE.DirectionalLight(0xffffff, 2.4);
      sun.position.set(-300, 260, 400);
      scene.add(sun);

      type Planet = { group: import("three").Group; body: import("three").Mesh; fx: number; fy: number; depth: number; phase: number; spin: number };
      const planets: Planet[] = [];
      const disposables: Array<{ dispose: () => void }> = [];
      const addPlanet = (color: string, radius: number, fx: number, fy: number, z: number, opts: { ring?: boolean; spin: number; depth: number }) => {
        const group = new THREE.Group();
        const geometry = new THREE.IcosahedronGeometry(radius, 2);
        const material = new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.85, metalness: 0.05 });
        const body = new THREE.Mesh(geometry, material);
        group.add(body);
        disposables.push(geometry, material);
        if (opts.ring) {
          const ringGeometry = new THREE.RingGeometry(radius * 1.45, radius * 2.05, 64);
          const ringMaterial = new THREE.MeshBasicMaterial({ color: "#a8ecff", side: THREE.DoubleSide, transparent: true, opacity: 0.35 });
          const ring = new THREE.Mesh(ringGeometry, ringMaterial);
          ring.rotation.x = Math.PI / 2.35;
          ring.rotation.y = 0.35;
          group.add(ring);
          disposables.push(ringGeometry, ringMaterial);
        }
        group.position.z = z;
        group.scale.setScalar(0.001);
        scene.add(group);
        planets.push({ group, body, fx, fy, depth: opts.depth, phase: rand() * 6.28, spin: opts.spin });
      };
      // fx / fy are fractions of the visible half-width / half-height at that depth.
      addPlanet("#22b8e6", 64, -1.08, 0.55, -120, { ring: true, spin: 0.18, depth: 1 });
      addPlanet("#ff6a13", 30, 1.02, 0.1, -60, { spin: 0.3, depth: 1.4 });
      addPlanet("#8b3dff", 46, 1.0, -0.7, -260, { spin: 0.22, depth: 0.8 });
      addPlanet("#6cbf2a", 22, -1.0, -0.35, 40, { spin: 0.4, depth: 1.8 });
      if (!lowPower) addPlanet("#ff2d87", 26, 0.15, 0.95, -340, { spin: 0.26, depth: 0.6 });

      const placePlanets = () => {
        const halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
        const halfW = halfH * camera.aspect;
        for (const planet of planets) {
          // Scale the distance with the camera so z-depth does not push them off screen.
          const k = (camera.position.z - planet.group.position.z) / camera.position.z;
          planet.group.userData.x = planet.fx * halfW * k;
          planet.group.userData.y = planet.fy * halfH * k;
        }
      };
      placePlanets();

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
        placePlanets();
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
        material.uniforms.uTime.value = t;
        pointer.x += (pointer.tx - pointer.x) * 0.04;
        pointer.y += (pointer.ty - pointer.y) * 0.04;
        smoothScroll += (scrollY - smoothScroll) * 0.08;
        for (const layer of layers) {
          layer.points.rotation.z = t * layer.speed;
          layer.points.position.x = -pointer.x * 40 * layer.depth * 3;
          layer.points.position.y = pointer.y * 30 * layer.depth * 3 + smoothScroll * layer.depth * 0.6;
        }
        for (const planet of planets) {
          const { group, body, depth, phase, spin } = planet;
          const scale = group.scale.x + (1 - group.scale.x) * 0.035; // grow in when the page opens
          group.scale.setScalar(scale);
          group.position.x = group.userData.x - pointer.x * 22 * depth;
          group.position.y = group.userData.y + Math.sin(smoothScroll * 0.0011 * depth + phase) * 70 + Math.sin(t * 0.45 + phase) * 9 + pointer.y * 14 * depth;
          body.rotation.y += spin * dt;
          body.rotation.x = smoothScroll * 0.0005 * depth + phase;
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
        for (const layer of layers) layer.points.geometry.dispose();
        for (const item of disposables) item.dispose();
        material.dispose();
        renderer.dispose();
        canvas.remove();
      };
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
