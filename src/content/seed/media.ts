import manifest from "./media.generated.json";
import type { MediaPath, MediaRecord } from "@/lib/types";

type RawMedia = {
  path: string;
  kind: "image" | "svg" | "video";
  ext: string;
  widths: number[];
  width: number;
  height: number;
  blur?: string;
  bytes: number;
  folder: string;
  name: string;
  sources: string[];
  poster?: string;
  duration?: number;
};

const raw = manifest as RawMedia[];

const isPoster = (m: RawMedia) => m.path.endsWith("-poster") && m.sources.some((s) => s.endsWith(".mp4"));

/** Media paths for every file that came from a client folder (deduplicated, in source order). */
export function fromSource(...folders: string[]): MediaPath[] {
  const seen = new Set<string>();
  const out: MediaPath[] = [];
  for (const folder of folders) {
    const prefix = `${folder}/`;
    const hits = raw
      .flatMap((m) => m.sources.filter((s) => s.startsWith(prefix)).map((s) => ({ m, s })))
      .filter(({ m }) => m.kind !== "video" && !isPoster(m))
      .sort((a, b) => a.s.localeCompare(b.s));
    for (const { m } of hits) {
      if (!seen.has(m.path)) {
        seen.add(m.path);
        out.push(m.path);
      }
    }
  }
  return out;
}

const titleCase = (s: string) =>
  s
    .toLowerCase()
    .replace(/(^|[\s&(/-])([a-z])/g, (_, p: string, c: string) => p + c.toUpperCase())
    .replace(/\bAnd\b/g, "and");

const UNNAMED = /^(screenshot|whatsapp|img[-_ ]?\d|image$|unnamed|untitled|temp|fb[-_ ]img|snapinsta|\d|[0-9a-f]{8}|dsc|kl9a|oops[-_ ]bd|channels4|be5|cp[-_ ]plus)/i;

/** A person's name taken from a Hall of Fame file name, or "" when the file has no name. */
export function personName(name: string) {
  if (UNNAMED.test(name.trim())) return "";
  return titleCase(name.trim());
}

/** A best-effort brand name from a logo file name (editable later in the media library). */
export function brandName(name: string) {
  if (UNNAMED.test(name.trim())) return "";
  const cleaned = name
    .replace(/\.(svg|png|jpe?g|webp|avif)$/i, "")
    .replace(/[_]+/g, " ")
    .replace(/\(.*?\)/g, " ")
    .replace(/\b(logo|logos|new|full|copy|vertical|horizontal|with|tag ?line|scaled|blue|black|white|rounded|free|png|wordmark|svg|brandlogos\.net\S*|\d+ftx\d+ft|\d{4}(-present)?|news app)\b/gi, " ")
    .replace(/[-–]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned || /^\d+$/.test(cleaned) || cleaned.length < 2) return "";
  return cleaned.length <= 4 ? cleaned.toUpperCase() : titleCase(cleaned);
}

const ATTRACTION_NAMES: Record<string, string> = {
  arcade: "Arcade games",
  "banquet-hall": "Banquet hall",
  bowling: "Bowling",
  "bumper-car": "Bumper cars",
  cafe: "Café",
  "carnival-games": "Carnival games",
  "cricket-simulator": "Cricket simulator",
  "ev-charging-station": "EV charging station",
  "food-court": "Food court",
  "food-stalls": "Food stalls",
  "kids-excavator": "Kids excavator",
  "massage-chairs": "Massage chairs",
  "pool-table": "Pool table",
  "redemption-games": "Redemption games",
  "rope-course": "Rope course",
  "soft-play": "Soft play",
  trampoline: "Trampoline",
  "vending-machines": "Vending machines",
  "virtual-reality": "Virtual reality",
  "wall-climbing": "Wall climbing",
  zipline: "Zipline",
};

function altFor(m: RawMedia): string {
  const [section, sub] = m.folder.split("/");
  if (section === "attractions" && sub) return `${ATTRACTION_NAMES[sub] ?? titleCase(sub.replace(/-/g, " "))} at OOPS! Nepal`;
  if (section === "brand") return "OOPS! I Like It logo";
  if (m.folder === "home") return "Inside OOPS! Nepal, Dhumbarahi, Kathmandu";
  if (m.folder === "home/photos") return "Guests having fun at OOPS! Nepal";
  if (m.folder === "events/social") return "Birthday party and social event at OOPS! Nepal";
  if (m.folder === "events/corporate") return "Corporate event and bowling tournament at OOPS! Nepal";
  if (m.folder === "gallery/general") return "A fun moment at OOPS! Nepal";
  if (m.folder === "gallery/hall-of-fame") {
    const who = personName(m.name);
    return who ? `${who} at OOPS! Nepal` : "Celebrity guest at OOPS! Nepal";
  }
  if (m.folder === "gallery/partners") {
    const brand = brandName(m.name);
    return brand ? `${brand} logo` : "Partner brand logo";
  }
  if (section === "offers") return `${titleCase((sub ?? "offer").replace(/-/g, " "))} offer poster`;
  return "OOPS! Nepal";
}

export const seedMedia: MediaRecord[] = raw.map((m) => ({
  path: m.path,
  bucket: "media",
  kind: m.kind,
  ext: m.ext,
  widths: m.widths,
  width: m.width,
  height: m.height,
  bytes: m.bytes,
  blur: m.blur ?? null,
  alt: altFor(m),
  folder: m.folder,
  name: m.name,
  poster: m.poster ?? null,
  duration: m.duration ?? null,
}));

export const rawMedia = raw;
