import { mediaBaseUrl } from "@/lib/env";
import type { MediaMap } from "@/lib/data";
import type { ImageData, VideoData } from "@/lib/types";

const isUrl = (value: string) => /^(https?:)?\/\//.test(value) || value.startsWith("/");

/** Resolves a media-library path (or an absolute URL) to everything <Img> needs. */
export function toImage(map: MediaMap, path: string | null | undefined, alt?: string): ImageData | undefined {
  if (!path) return undefined;
  const m = map[path];
  if (!m) {
    if (isUrl(path)) return { base: path, ext: "", widths: [], width: 1600, height: 1000, alt: alt ?? "" };
    return undefined;
  }
  if (m.kind === "video") return m.poster ? toImage(map, m.poster, alt) : undefined;
  return {
    base: `${mediaBaseUrl}/${m.path}`,
    ext: m.ext,
    widths: m.kind === "svg" ? [] : m.widths ?? [],
    width: m.width ?? 1600,
    height: m.height ?? 1000,
    blur: m.blur ?? undefined,
    alt: alt ?? m.alt ?? "",
  };
}

export function toImages(map: MediaMap, paths: Array<string | null | undefined>, alt?: string): ImageData[] {
  return paths.map((p) => toImage(map, p, alt)).filter((i): i is ImageData => Boolean(i));
}

/** Resolves a video path (media library) or an external URL. */
export function toVideo(map: MediaMap, path: string | null | undefined): VideoData | undefined {
  if (!path) return undefined;
  const m = map[path];
  if (!m) return isUrl(path) ? { src: path, width: 1280, height: 720 } : undefined;
  if (m.kind !== "video") return undefined;
  return {
    src: `${mediaBaseUrl}/${m.path}.${m.ext || "mp4"}`,
    poster: toImage(map, m.poster),
    width: m.width ?? 1280,
    height: m.height ?? 720,
  };
}

/** The URL of one rendition of an image, e.g. for Open Graph tags or CSS backgrounds. */
export function imageUrl(image: ImageData | undefined, width = 1600) {
  if (!image) return undefined;
  if (!image.widths.length) return image.ext ? `${image.base}.${image.ext}` : image.base;
  const w = image.widths.find((x) => x >= width) ?? image.widths.at(-1);
  return `${image.base}-${w}.${image.ext}`;
}
