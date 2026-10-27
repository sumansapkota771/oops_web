import "server-only";
import type { Option, Doc, Field } from "./fields";
import { collectMediaPaths } from "./fields";
import { getMediaByPaths, listRows, type MediaItem } from "./store";

/** Select options + media thumbnails every admin form needs. */
export async function formContext(fields: Field[], docs: Array<Doc | null | undefined>) {
  const flat = JSON.stringify(fields);
  const [cats, albums, media] = await Promise.all([
    flat.includes('"categories"') ? listRows("categories") : [],
    flat.includes('"albums"') ? listRows("gallery_albums") : [],
    getMediaByPaths(docs.flatMap((d) => collectMediaPaths(fields, d))),
  ]);
  const opt = (rows: Doc[], label: string): Option[] => rows.map((r) => ({ value: r.slug as string, label: r[label] as string }));
  return {
    ctx: { categories: opt(cats, "name"), albums: opt(albums, "title") },
    media: Object.fromEntries(media.map((m) => [m.path, m])) as Record<string, MediaItem>,
  };
}
