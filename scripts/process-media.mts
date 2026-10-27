/**
 * Converts the client's raw asset folders (one level above /website) into
 * web-ready media under public/media and writes a manifest that the seed
 * content and the Supabase seeder use.
 *
 *   pnpm media            # incremental
 *   pnpm media --force    # re-encode everything
 *
 * Images: auto-rotated, EXIF/GPS stripped, WebP at fixed widths + blur placeholder.
 * Videos: H.264 MP4 (faststart) via ffmpeg-static, plus a poster frame.
 * Identical files (same bytes) are stored once; every source path is recorded.
 */
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import ffmpegPath from "ffmpeg-static";

const run = promisify(execFile);

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.resolve(ROOT, "..");
const OUT = path.join(ROOT, "public", "media");
const MANIFEST = path.join(ROOT, "src", "content", "seed", "media.generated.json");
const CACHE = path.join(ROOT, "scripts", ".media-cache.json");
const FORCE = process.argv.includes("--force");

type Kind = "photo" | "poster" | "logo" | "brand";

export type MediaRecord = {
  path: string;
  kind: "image" | "svg" | "video";
  ext: "webp" | "svg" | "mp4";
  widths: number[];
  width: number;
  height: number;
  blur?: string;
  bytes: number;
  folder: string;
  name: string;
  sources: string[];
  hash: string;
  poster?: string;
  duration?: number;
};

const WIDTHS: Record<Kind, number[]> = {
  photo: [480, 960, 1600],
  poster: [480, 960, 1600],
  logo: [240, 480],
  brand: [320, 640, 1280],
};

const FOLDERS: Array<{ from: string; to: string; kind?: Kind }> = [
  { from: "Attractions/ARCADE", to: "attractions/arcade" },
  { from: "Attractions/BANQUET HALL", to: "attractions/banquet-hall" },
  { from: "Attractions/CAFE", to: "attractions/cafe" },
  { from: "Attractions/CARNIVAL GAMES", to: "attractions/carnival-games" },
  { from: "Attractions/CHARGING STATION", to: "attractions/ev-charging-station" },
  { from: "Attractions/FOOD COURT", to: "attractions/food-court" },
  { from: "Attractions/FOOD STALLS", to: "attractions/food-stalls" },
  { from: "Attractions/INDOOR GAMES/MASSAGE CHAIRS", to: "attractions/massage-chairs" },
  { from: "Attractions/INDOOR GAMES/POOL TABLE", to: "attractions/pool-table" },
  { from: "Attractions/RECREATIONAL & AMUSEMENT/BOWLING", to: "attractions/bowling" },
  { from: "Attractions/RECREATIONAL & AMUSEMENT/BUMPER CAR", to: "attractions/bumper-car" },
  { from: "Attractions/RECREATIONAL & AMUSEMENT/CRICKET SIMULATOR", to: "attractions/cricket-simulator" },
  { from: "Attractions/RECREATIONAL & AMUSEMENT/ZIPLINE", to: "attractions/zipline" },
  { from: "Attractions/REDEMPTION", to: "attractions/redemption-games" },
  { from: "Attractions/ROPECOURSE", to: "attractions/rope-course" },
  { from: "Attractions/SOFTPLAY", to: "attractions/soft-play" },
  { from: "Attractions/THRILL RIDES/KIDS EXCAVATOR", to: "attractions/kids-excavator" },
  { from: "Attractions/TRAMPOLINE", to: "attractions/trampoline" },
  { from: "Attractions/VENDING MACHINE", to: "attractions/vending-machines" },
  { from: "Attractions/VIRTUAL REALITY", to: "attractions/virtual-reality" },
  { from: "Attractions/WALL CLIMBING", to: "attractions/wall-climbing" },
  { from: "Homepage/Photos", to: "home/photos" },
  { from: "Events/Corporate Events", to: "events/corporate" },
  { from: "Events/Social and Private Events", to: "events/social" },
  { from: "Gallery/General", to: "gallery/general" },
  { from: "Events/Gallery/General", to: "gallery/general" },
  { from: "Gallery/Hall of Fame", to: "gallery/hall-of-fame" },
  { from: "Events/Gallery/Hall of Fame", to: "gallery/hall-of-fame" },
  { from: "Gallery/Partner brands", to: "gallery/partners", kind: "logo" },
  { from: "Events/Gallery/Partner brands", to: "gallery/partners", kind: "logo" },
  { from: "Prices & Offers/Powerplay Recharges", to: "offers/powerplay", kind: "poster" },
  { from: "Prices & Offers/Adventure Marathon (Everyday)", to: "offers/adventure-marathon", kind: "poster" },
  { from: "Prices & Offers/30 Taps Thrill (Every Tuesday)", to: "offers/30-taps-thrill", kind: "poster" },
  { from: "Prices & Offers/Unlimited Friday (Every Friday)", to: "offers/unlimited-friday", kind: "poster" },
  { from: "Prices & Offers/other offers", to: "offers/special", kind: "poster" },
];

const FILES: Array<{ from: string; to: string; kind: Kind }> = [
  { from: "FINAL OOPS LOGO  CROPPED white-01.png", to: "brand/logo-white", kind: "brand" },
  { from: "oops logo black -01.png", to: "brand/logo-black", kind: "brand" },
];

type VideoJob = {
  from: string;
  to: string;
  start?: number;
  duration?: number;
  scale: string;
  audio: boolean;
  crf: number;
  posterAt: number;
};

const VIDEOS: VideoJob[] = [
  // Muted background loop for the homepage hero (skips the black intro and the credits).
  { from: "Homepage/Video/Oops movie.mp4", to: "home/hero-loop", start: 6, duration: 30, scale: "1280:-2", audio: false, crf: 30, posterAt: 0 },
  { from: "Homepage/Video/Oops movie.mp4", to: "home/oops-movie", scale: "1280:-2", audio: true, crf: 26, posterAt: 6 },
  { from: "Events/Social and Private Events/Birthday Packages.mp4", to: "events/social/birthday-packages", scale: "720:-2", audio: true, crf: 27, posterAt: 2 },
  { from: "Events/Social and Private Events/birthdayy oops.mp4", to: "events/social/birthday-at-oops", scale: "720:-2", audio: true, crf: 27, posterAt: 2 },
];

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".tif", ".tiff"]);

function slugify(input: string) {
  const base = input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\.(jpe?g|png)$/i, "")
    .toLowerCase()
    .replace(/\bcopy\b/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return base || "image";
}

async function exists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function listFiles(dir: string): Promise<string[]> {
  const abs = path.join(SRC, dir);
  if (!(await exists(abs))) {
    console.warn(`  ! missing folder: ${dir}`);
    return [];
  }
  const entries = await fs.readdir(abs, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.name.startsWith("._") || entry.name === ".DS_Store") continue;
    const rel = path.posix.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(rel)));
    else files.push(rel);
  }
  return files.sort((a, b) => a.localeCompare(b));
}

async function hashFile(abs: string) {
  const buf = await fs.readFile(abs);
  return createHash("sha1").update(buf).digest("hex");
}

type Cache = Record<string, { size: number; mtimeMs: number; hash: string }>;

async function pool<T>(items: T[], size: number, worker: (item: T, index: number) => Promise<void>) {
  let cursor = 0;
  const runners = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      await worker(items[index], index);
    }
  });
  await Promise.all(runners);
}

async function main() {
  sharp.concurrency(2);
  await fs.mkdir(OUT, { recursive: true });
  await fs.mkdir(path.dirname(MANIFEST), { recursive: true });

  const cache: Cache = (await exists(CACHE)) ? JSON.parse(await fs.readFile(CACHE, "utf8")) : {};
  const previous: MediaRecord[] = !FORCE && (await exists(MANIFEST)) ? JSON.parse(await fs.readFile(MANIFEST, "utf8")) : [];
  const previousByHash = new Map(previous.filter((r) => r.kind !== "video").map((r) => [r.hash, r]));

  // 1. Collect source files and their target folder.
  type Task = { rel: string; to: string; kind: Kind };
  const tasks: Task[] = [];
  const skipped: string[] = [];
  for (const group of FOLDERS) {
    for (const rel of await listFiles(group.from)) {
      const ext = path.extname(rel).toLowerCase();
      if (ext === ".svg" || IMAGE_EXT.has(ext)) tasks.push({ rel, to: group.to, kind: group.kind ?? "photo" });
      else if (ext !== ".mp4") skipped.push(rel);
    }
  }
  for (const file of FILES) tasks.push({ rel: file.from, to: path.posix.dirname(file.to), kind: file.kind });

  // 2. Hash (cached by size + mtime) and dedupe.
  const byHash = new Map<string, { task: Task; sources: string[] }>();
  for (const task of tasks) {
    const abs = path.join(SRC, task.rel);
    const stat = await fs.stat(abs);
    const cached = cache[task.rel];
    const hash =
      cached && cached.size === stat.size && cached.mtimeMs === stat.mtimeMs ? cached.hash : await hashFile(abs);
    cache[task.rel] = { size: stat.size, mtimeMs: stat.mtimeMs, hash };
    const hit = byHash.get(hash);
    if (hit) hit.sources.push(task.rel);
    else byHash.set(hash, { task, sources: [task.rel] });
  }

  // 3. Assign unique, readable output paths.
  const taken = new Set<string>();
  const fixedNames = new Map(FILES.map((f) => [f.from, f.to]));
  const jobs = [...byHash.entries()].map(([hash, { task, sources }]) => {
    let target = fixedNames.get(task.rel);
    if (!target) {
      const stem = slugify(path.basename(task.rel, path.extname(task.rel)));
      target = `${task.to}/${stem}`;
      for (let n = 2; taken.has(target); n++) target = `${task.to}/${stem}-${n}`;
    }
    taken.add(target);
    return { hash, task, sources, target };
  });

  const records: MediaRecord[] = [];
  let done = 0;
  await pool(jobs, 4, async ({ hash, task, sources, target }) => {
    const abs = path.join(SRC, task.rel);
    const ext = path.extname(task.rel).toLowerCase();
    const name = path.basename(task.rel, path.extname(task.rel));
    const reuse = previousByHash.get(hash);

    if (ext === ".svg") {
      const outFile = path.join(OUT, `${target}.svg`);
      await fs.mkdir(path.dirname(outFile), { recursive: true });
      await fs.copyFile(abs, outFile);
      const meta = await sharp(abs).metadata();
      records.push({
        path: target, kind: "svg", ext: "svg", widths: [], width: meta.width ?? 400, height: meta.height ?? 200,
        bytes: (await fs.stat(outFile)).size, folder: task.to, name, sources, hash,
      });
    } else {
      const widths = WIDTHS[task.kind];
      const outputs = widths.map((w) => path.join(OUT, `${target}-${w}.webp`));
      const upToDate =
        reuse && reuse.path === target && !FORCE && (await Promise.all(outputs.map(exists))).every(Boolean);
      if (upToDate) {
        records.push({ ...reuse, sources, folder: task.to, name });
      } else {
        await fs.mkdir(path.dirname(outputs[0]), { recursive: true });
        const base = sharp(abs, { limitInputPixels: false, animated: false }).rotate();
        let largest = { width: 0, height: 0 };
        let bytes = 0;
        for (const [i, w] of widths.entries()) {
          const pipeline = base.clone().resize({ width: w, withoutEnlargement: true });
          const info = await pipeline
            .webp({ quality: task.kind === "logo" || task.kind === "brand" ? 90 : 76, effort: 5, alphaQuality: 90 })
            .toFile(outputs[i]);
          bytes += info.size;
          if (info.width > largest.width) largest = { width: info.width, height: info.height };
        }
        const blurBuf = await base
          .clone()
          .resize({ width: 16 })
          .webp({ quality: 40 })
          .toBuffer();
        records.push({
          path: target, kind: "image", ext: "webp", widths, width: largest.width, height: largest.height,
          blur: `data:image/webp;base64,${blurBuf.toString("base64")}`,
          bytes, folder: task.to, name, sources, hash,
        });
      }
    }
    done++;
    if (done % 25 === 0 || done === jobs.length) console.log(`  images ${done}/${jobs.length}`);
  });

  // 4. Videos.
  if (!ffmpegPath) throw new Error("ffmpeg-static binary not found");
  for (const job of VIDEOS) {
    const abs = path.join(SRC, job.from);
    if (!(await exists(abs))) {
      console.warn(`  ! missing video: ${job.from}`);
      continue;
    }
    const outFile = path.join(OUT, `${job.to}.mp4`);
    const posterTmp = path.join(OUT, `${job.to}-poster.jpg`);
    await fs.mkdir(path.dirname(outFile), { recursive: true });
    if (FORCE || !(await exists(outFile))) {
      console.log(`  encoding ${job.to}.mp4 …`);
      const args = ["-hide_banner", "-loglevel", "error", "-y"];
      if (job.start) args.push("-ss", String(job.start));
      args.push("-i", abs);
      if (job.duration) args.push("-t", String(job.duration));
      args.push(
        "-vf", `scale=${job.scale}:flags=lanczos,fps=30`,
        "-c:v", "libx264", "-preset", "slow", "-crf", String(job.crf), "-profile:v", "high", "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
      );
      if (job.audio) args.push("-c:a", "aac", "-b:a", "128k");
      else args.push("-an");
      args.push(outFile);
      await run(ffmpegPath, args, { maxBuffer: 1 << 26 });
    }
    // Poster frame from the encoded file so it matches the first frame exactly.
    await run(ffmpegPath, ["-hide_banner", "-loglevel", "error", "-y", "-ss", String(job.posterAt), "-i", outFile, "-frames:v", "1", "-q:v", "2", posterTmp]);
    const posterPath = `${job.to}-poster`;
    const posterWidths = WIDTHS.photo;
    let pw = 0;
    let ph = 0;
    let posterBytes = 0;
    for (const w of posterWidths) {
      const info = await sharp(posterTmp).resize({ width: w, withoutEnlargement: true }).webp({ quality: 74 }).toFile(path.join(OUT, `${posterPath}-${w}.webp`));
      posterBytes += info.size;
      if (info.width > pw) [pw, ph] = [info.width, info.height];
    }
    const posterBlur = await sharp(posterTmp).resize({ width: 16 }).webp({ quality: 40 }).toBuffer();
    await fs.rm(posterTmp);
    records.push({
      path: posterPath, kind: "image", ext: "webp", widths: posterWidths, width: pw, height: ph,
      blur: `data:image/webp;base64,${posterBlur.toString("base64")}`, bytes: posterBytes,
      folder: path.posix.dirname(job.to), name: `${path.basename(job.to)} poster`, sources: [job.from], hash: `poster:${job.to}`,
    });
    const probe = await sharp(path.join(OUT, `${posterPath}-${posterWidths.at(-1)}.webp`)).metadata();
    const { stderr } = await run(ffmpegPath, ["-hide_banner", "-i", outFile], { maxBuffer: 1 << 20 }).catch((e) => e);
    const match = /Duration: (\d+):(\d+):(\d+\.\d+)/.exec(String(stderr));
    const duration = match ? Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]) : undefined;
    records.push({
      path: job.to, kind: "video", ext: "mp4", widths: [], width: probe.width ?? pw, height: probe.height ?? ph,
      bytes: (await fs.stat(outFile)).size, folder: path.posix.dirname(job.to), name: path.basename(job.to),
      sources: [job.from], hash: `video:${job.to}`, poster: posterPath, duration,
    });
  }

  records.sort((a, b) => a.path.localeCompare(b.path));
  await fs.writeFile(MANIFEST, JSON.stringify(records, null, 1));
  await fs.writeFile(CACHE, JSON.stringify(cache));

  const total = records.reduce((sum, r) => sum + r.bytes, 0);
  console.log(`\n✓ ${records.length} media records, ${(total / 1024 / 1024).toFixed(1)} MB in public/media`);
  if (skipped.length) console.log(`  skipped (unsupported): ${skipped.join(", ")}`);
  console.log("  not processed: About US/IMG_0366.CR2 (camera RAW — export a JPG to include it)");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
