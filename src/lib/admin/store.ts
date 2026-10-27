import "server-only";
import * as seed from "@/content/seed";
import { mediaBaseUrl } from "@/lib/env";
import { hasServiceRole, serviceClient } from "@/lib/supabase/server";
import type { Enquiry, MediaRecord, Page, PageSlug, SiteSettings } from "@/lib/types";
import { withDefaults } from "@/lib/utils";
import type { CollectionKey } from "./collections";
import type { Doc } from "./fields";

/** True once Supabase (with the service-role key) is configured; until then the admin is read-only. */
export const canWrite = () => hasServiceRole();

const SEED: Record<CollectionKey, Doc[]> = {
  attractions: seed.attractions,
  categories: seed.categories,
  offers: seed.offers,
  powerplay_tiers: seed.powerplayTiers,
  event_types: seed.eventTypes,
  events: seed.upcomingEvents,
  gallery_albums: seed.galleryAlbums,
  gallery_items: seed.galleryItems,
  reviews: seed.reviews,
  faqs: seed.faqs,
  policy_sections: seed.policySections,
} as unknown as Record<CollectionKey, Doc[]>;

export async function listRows(key: CollectionKey): Promise<Doc[]> {
  if (!canWrite()) return SEED[key];
  const rows: Doc[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await serviceClient()
      .from(key)
      .select("*")
      .order("sort", { ascending: true })
      .order("created_at", { ascending: true })
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  return rows;
}

export async function getRow(key: CollectionKey, id: string): Promise<Doc | null> {
  if (!canWrite()) return SEED[key].find((r) => r.id === id) ?? null;
  const { data, error } = await serviceClient().from(key).select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function getSettingsDoc(): Promise<SiteSettings> {
  if (!canWrite()) return seed.settings;
  const { data } = await serviceClient().from("site_settings").select("data").eq("id", 1).maybeSingle();
  return withDefaults(seed.settings, data?.data);
}

export async function getPageDoc(slug: PageSlug): Promise<Page> {
  const fallback = seed.pages.find((p) => p.slug === slug)!;
  if (!canWrite()) return fallback;
  const { data } = await serviceClient().from("pages").select("*").eq("slug", slug).maybeSingle();
  if (!data) return fallback;
  return { ...fallback, ...data, content: withDefaults(fallback.content, data.content) } as Page;
}

export type MediaItem = MediaRecord & { thumb: string; url: string };

export function toMediaItem(m: MediaRecord): MediaItem {
  const base = `${mediaBaseUrl}/${m.path}`;
  if (m.kind === "video") {
    const poster = m.poster ? `${mediaBaseUrl}/${m.poster}-480.webp` : "";
    return { ...m, thumb: poster, url: `${base}.${m.ext}` };
  }
  if (m.kind === "svg" || !m.widths?.length) return { ...m, thumb: `${base}.${m.ext}`, url: `${base}.${m.ext}` };
  const largest = m.widths[m.widths.length - 1];
  return { ...m, thumb: `${base}-${m.widths[0]}.${m.ext}`, url: `${base}-${largest}.${m.ext}` };
}

export async function listMedia(opts: { q?: string; folder?: string; kind?: "image" | "video" | "any"; offset?: number; limit?: number }) {
  const limit = Math.min(opts.limit ?? 60, 200);
  const offset = opts.offset ?? 0;
  const q = opts.q?.trim().toLowerCase();
  const wantVideo = opts.kind === "video";
  const wantImage = opts.kind === "image";

  if (!canWrite()) {
    let rows = seed.media.filter((m) => !m.path.endsWith("-poster") || !wantImage);
    if (wantVideo) rows = rows.filter((m) => m.kind === "video");
    if (wantImage) rows = rows.filter((m) => m.kind === "image" || m.kind === "svg");
    if (opts.folder) rows = rows.filter((m) => m.folder === opts.folder || m.folder.startsWith(`${opts.folder}/`));
    if (q) rows = rows.filter((m) => `${m.path} ${m.alt ?? ""} ${m.name ?? ""}`.toLowerCase().includes(q));
    return { items: rows.slice(offset, offset + limit).map(toMediaItem), total: rows.length };
  }

  let query = serviceClient().from("media").select("*", { count: "exact" }).order("created_at", { ascending: false }).order("path");
  if (wantVideo) query = query.eq("kind", "video");
  if (wantImage) query = query.in("kind", ["image", "svg"]);
  if (opts.folder) query = query.or(`folder.eq.${opts.folder},folder.like.${opts.folder}/%`);
  if (q) query = query.or(`path.ilike.%${q.replace(/[%,()]/g, "")}%,alt.ilike.%${q.replace(/[%,()]/g, "")}%`);
  const { data, error, count } = await query.range(offset, offset + limit - 1);
  if (error) throw new Error(error.message);
  return { items: ((data ?? []) as MediaRecord[]).map(toMediaItem), total: count ?? 0 };
}

export async function mediaFolders(): Promise<string[]> {
  const folders = canWrite()
    ? ((await serviceClient().from("media").select("folder").limit(5000)).data ?? []).map((r) => r.folder as string)
    : seed.media.map((m) => m.folder);
  return [...new Set(folders.map((f) => f.split("/").slice(0, 2).join("/")))].sort();
}

export async function getMediaByPaths(paths: string[]): Promise<MediaItem[]> {
  const unique = [...new Set(paths.filter(Boolean))];
  if (!unique.length) return [];
  if (!canWrite()) return seed.media.filter((m) => unique.includes(m.path)).map(toMediaItem);
  const { data } = await serviceClient().from("media").select("*").in("path", unique);
  return ((data ?? []) as MediaRecord[]).map(toMediaItem);
}

export async function listEnquiries(status?: string): Promise<Enquiry[]> {
  if (!canWrite()) return [];
  let query = serviceClient().from("enquiries").select("*").order("created_at", { ascending: false }).limit(500);
  if (status && status !== "all") query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Enquiry[];
}

export async function countRows(table: string, filter?: [string, string]) {
  if (!canWrite()) return null;
  let query = serviceClient().from(table).select("id", { count: "exact", head: true });
  if (filter) query = query.eq(filter[0], filter[1]);
  const { count } = await query;
  return count ?? 0;
}
