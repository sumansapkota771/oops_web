"use server";

import { updateTag } from "next/cache";
import { CONTENT_TAG } from "@/lib/data";
import { assertAdmin, assertAdminRead } from "@/lib/admin/auth";
import { COLLECTIONS, isCollection, type CollectionKey } from "@/lib/admin/collections";
import type { Doc } from "@/lib/admin/fields";
import { PAGE_FIELDS, PAGE_SEO_FIELDS, SETTINGS_FIELDS } from "@/lib/admin/page-schemas";
import { canWrite, listEnquiries, listMedia, mediaFolders, toMediaItem, type MediaItem } from "@/lib/admin/store";
import { normalize, validate } from "@/lib/admin/validate";
import { serviceClient } from "@/lib/supabase/server";
import type { MediaRecord, PageSlug } from "@/lib/types";
import { slugify } from "@/lib/utils";

type Fail = { ok: false; error: string };
export type ActionResult = { ok: true; id?: string; message?: string; url?: string } | Fail;

const NOT_CONNECTED: Fail = {
  ok: false,
  error: "Supabase isn't connected yet, so changes can't be saved. Add the Supabase keys to .env.local and run pnpm db:setup && pnpm db:seed.",
};

async function guard(): Promise<Fail | null> {
  try {
    await assertAdmin();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  return canWrite() ? null : NOT_CONNECTED;
}

function fail(error: unknown): Fail {
  const message = error instanceof Error ? error.message : String(error);
  console.error("[admin]", message);
  return { ok: false, error: message };
}

function parse(payload: string): unknown {
  try {
    return JSON.parse(payload);
  } catch {
    throw new Error("The form data could not be read.");
  }
}

// ---------------------------------------------------------------------------
// Settings & pages
// ---------------------------------------------------------------------------
export async function saveSettingsAction(payload: string): Promise<ActionResult> {
  const blocked = await guard();
  if (blocked) return blocked;
  try {
    const doc = normalize(SETTINGS_FIELDS, parse(payload));
    const errors = validate(SETTINGS_FIELDS, doc);
    if (errors.length) return { ok: false, error: errors.join(" ") };
    const { error } = await serviceClient().from("site_settings").upsert({ id: 1, data: doc });
    if (error) throw error;
    updateTag(CONTENT_TAG);
    return { ok: true, message: "Settings saved." };
  } catch (e) {
    return fail(e);
  }
}

export async function savePageAction(slug: PageSlug, payload: string): Promise<ActionResult> {
  const blocked = await guard();
  if (blocked) return blocked;
  const fields = PAGE_FIELDS[slug];
  if (!fields) return { ok: false, error: "Unknown page." };
  try {
    const raw = parse(payload) as Doc;
    const meta = normalize(PAGE_SEO_FIELDS, raw);
    const content = normalize(fields, raw.content);
    const errors = validate(fields, content);
    if (errors.length) return { ok: false, error: errors.join(" ") };
    const { error } = await serviceClient()
      .from("pages")
      .upsert({ slug, title: meta.title || slug, seo_title: meta.seo_title || null, seo_description: meta.seo_description || null, og_image: meta.og_image, content });
    if (error) throw error;
    updateTag(CONTENT_TAG);
    return { ok: true, message: "Page saved." };
  } catch (e) {
    return fail(e);
  }
}

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------
async function uniqueSlug(key: CollectionKey, field: string, base: string, id: string | null) {
  const root = slugify(base) || "item";
  const { data } = await serviceClient().from(key).select("*").like(field, `${root}%`);
  const taken = new Set(((data ?? []) as Doc[]).filter((r) => r.id !== id).map((r) => r[field] as string));
  let candidate = root;
  for (let n = 2; taken.has(candidate); n++) candidate = `${root}-${n}`;
  return candidate;
}

export async function saveItemAction(key: string, id: string | null, payload: string): Promise<ActionResult> {
  const blocked = await guard();
  if (blocked) return blocked;
  if (!isCollection(key)) return { ok: false, error: "Unknown collection." };
  const collection = COLLECTIONS[key];
  try {
    const doc = normalize(collection.fields, parse(payload));
    const errors = validate(collection.fields, doc);
    if (errors.length) return { ok: false, error: errors.join(" ") };
    if (collection.slugField) {
      const source = (doc[collection.slugField] as string) || (doc[collection.titleField] as string) || "";
      doc[collection.slugField] = await uniqueSlug(key, collection.slugField, source, id);
    }
    const client = serviceClient();
    if (id) {
      const { error } = await client.from(key).update(doc).eq("id", id);
      if (error) throw error;
      updateTag(CONTENT_TAG);
      return { ok: true, id, message: `${collection.singular} saved.` };
    }
    if (!doc.sort) {
      const { data: last } = await client.from(key).select("sort").order("sort", { ascending: false }).limit(1).maybeSingle();
      doc.sort = ((last?.sort as number | undefined) ?? 0) + 1;
    }
    const { data, error } = await client.from(key).insert(doc).select("id").single();
    if (error) throw error;
    updateTag(CONTENT_TAG);
    return { ok: true, id: data.id as string, message: `${collection.singular} created.` };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteItemAction(key: string, id: string): Promise<ActionResult> {
  const blocked = await guard();
  if (blocked) return blocked;
  if (!isCollection(key)) return { ok: false, error: "Unknown collection." };
  try {
    const { error } = await serviceClient().from(key).delete().eq("id", id);
    if (error) throw error;
    updateTag(CONTENT_TAG);
    return { ok: true, message: "Deleted." };
  } catch (e) {
    return fail(e);
  }
}

export async function toggleItemAction(key: string, id: string, visible: boolean): Promise<ActionResult> {
  const blocked = await guard();
  if (blocked) return blocked;
  if (!isCollection(key)) return { ok: false, error: "Unknown collection." };
  try {
    const { error } = await serviceClient().from(key).update({ is_visible: visible }).eq("id", id);
    if (error) throw error;
    updateTag(CONTENT_TAG);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** Saves a new order: `ids` in the order they should appear (one database call). */
export async function reorderAction(key: string, ids: string[]): Promise<ActionResult> {
  const blocked = await guard();
  if (blocked) return blocked;
  if (!isCollection(key)) return { ok: false, error: "Unknown collection." };
  try {
    const { error } = await serviceClient().rpc("reorder_rows", { tbl: key, ids });
    if (error) throw error;
    updateTag(CONTENT_TAG);
    return { ok: true, message: "Order saved." };
  } catch (e) {
    return fail(e);
  }
}

export async function addGalleryItemsAction(album: string, paths: string[]): Promise<ActionResult> {
  const blocked = await guard();
  if (blocked) return blocked;
  try {
    const client = serviceClient();
    const { data: last } = await client.from("gallery_items").select("sort").eq("album_slug", album).order("sort", { ascending: false }).limit(1).maybeSingle();
    const start = ((last?.sort as number | undefined) ?? 0) + 1;
    const rows = paths.map((image, i) => ({ album_slug: album, image, caption: null, sort: start + i, is_visible: true }));
    const { error } = await client.from("gallery_items").insert(rows);
    if (error) throw error;
    updateTag(CONTENT_TAG);
    return { ok: true, message: `${rows.length} photo${rows.length === 1 ? "" : "s"} added.` };
  } catch (e) {
    return fail(e);
  }
}

// ---------------------------------------------------------------------------
// Media library
// ---------------------------------------------------------------------------
export async function listMediaAction(opts: { q?: string; folder?: string; kind?: "image" | "video" | "any"; offset?: number }) {
  await assertAdminRead();
  const [result, folders] = await Promise.all([listMedia({ ...opts, limit: 60 }), mediaFolders()]);
  return { ...result, folders };
}

type UploadRequest = { name: string; folder: string; ext: string; widths: number[]; posterExt?: string; posterWidths?: number[] };

const EXT = /^(webp|jpg|jpeg|png|gif|svg|mp4|webm|pdf)$/;

/** Reserves storage paths and returns one signed upload URL per file (the browser uploads directly). */
export async function createUploadAction(req: UploadRequest) {
  const blocked = await guard();
  if (blocked) return blocked;
  try {
    if (!EXT.test(req.ext)) throw new Error("This file type isn't supported.");
    const folder = req.folder
      .split("/")
      .map((p) => slugify(p))
      .filter(Boolean)
      .join("/") || "uploads";
    const stem = slugify(req.name.replace(/\.[^.]+$/, "")).slice(0, 48) || "file";
    const base = `${folder}/${stem}-${crypto.randomUUID().slice(0, 6)}`;
    const files = req.widths.length ? req.widths.map((w) => `${base}-${w}.${req.ext}`) : [`${base}.${req.ext}`];
    const posterFiles = req.posterExt && req.posterWidths?.length ? req.posterWidths.map((w) => `${base}-poster-${w}.${req.posterExt}`) : [];
    const storage = serviceClient().storage.from("media");
    const targets = await Promise.all(
      [...files, ...posterFiles].map(async (path) => {
        const { data, error } = await storage.createSignedUploadUrl(path);
        if (error) throw error;
        return { path, token: data.token };
      }),
    );
    return { ok: true as const, base, folder, targets };
  } catch (e) {
    return fail(e);
  }
}

export async function registerMediaAction(record: MediaRecord): Promise<{ ok: true; item: MediaItem } | { ok: false; error: string }> {
  const blocked = await guard();
  if (blocked) return blocked;
  try {
    const row = {
      path: record.path,
      bucket: "media",
      kind: record.kind,
      ext: record.ext,
      widths: record.widths ?? [],
      width: record.width,
      height: record.height,
      bytes: record.bytes ?? 0,
      blur: record.blur,
      alt: record.alt?.slice(0, 300) ?? null,
      folder: record.folder,
      name: record.name?.slice(0, 200) ?? null,
      poster: record.poster,
      duration: record.duration,
    };
    const { data, error } = await serviceClient().from("media").upsert(row, { onConflict: "path" }).select("*").single();
    if (error) throw error;
    updateTag(CONTENT_TAG);
    return { ok: true, item: toMediaItem(data as MediaRecord) };
  } catch (e) {
    return fail(e);
  }
}

export async function updateMediaAction(path: string, patch: { alt?: string; name?: string }): Promise<ActionResult> {
  const blocked = await guard();
  if (blocked) return blocked;
  try {
    const { error } = await serviceClient()
      .from("media")
      .update({ alt: patch.alt?.trim().slice(0, 300) ?? null, name: patch.name?.trim().slice(0, 200) ?? null })
      .eq("path", path);
    if (error) throw error;
    updateTag(CONTENT_TAG);
    return { ok: true, message: "Saved." };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteMediaAction(path: string): Promise<ActionResult> {
  const blocked = await guard();
  if (blocked) return blocked;
  try {
    const client = serviceClient();
    const { data: row } = await client.from("media").select("*").eq("path", path).maybeSingle();
    if (!row) return { ok: false, error: "File not found." };
    const m = row as MediaRecord;
    const files = m.widths?.length ? m.widths.map((w) => `${m.path}-${w}.${m.ext}`) : [`${m.path}.${m.ext}`];
    if (m.poster) {
      const { data: poster } = await client.from("media").select("*").eq("path", m.poster).maybeSingle();
      if (poster) {
        const p = poster as MediaRecord;
        files.push(...(p.widths?.length ? p.widths.map((w) => `${p.path}-${w}.${p.ext}`) : [`${p.path}.${p.ext}`]));
        await client.from("media").delete().eq("path", p.path);
      }
    }
    await client.storage.from("media").remove(files);
    const { error } = await client.from("media").delete().eq("path", path);
    if (error) throw error;
    updateTag(CONTENT_TAG);
    return { ok: true, message: "File deleted." };
  } catch (e) {
    return fail(e);
  }
}

// ---------------------------------------------------------------------------
// Enquiries & exports (stored in the private "data" bucket)
// ---------------------------------------------------------------------------
export async function setEnquiryStatusAction(id: string, status: "new" | "contacted" | "closed"): Promise<ActionResult> {
  const blocked = await guard();
  if (blocked) return blocked;
  if (!["new", "contacted", "closed"].includes(status)) return { ok: false, error: "Invalid status." };
  try {
    const { error } = await serviceClient().from("enquiries").update({ status }).eq("id", id);
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteEnquiryAction(id: string): Promise<ActionResult> {
  const blocked = await guard();
  if (blocked) return blocked;
  try {
    const { error } = await serviceClient().from("enquiries").delete().eq("id", id);
    if (error) throw error;
    return { ok: true, message: "Enquiry deleted." };
  } catch (e) {
    return fail(e);
  }
}

const csvCell = (v: unknown) => {
  const s = v == null ? "" : String(v);
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

async function storeExport(path: string, body: string, contentType: string): Promise<ActionResult> {
  const storage = serviceClient().storage.from("data");
  const { error } = await storage.upload(path, new Blob([body], { type: contentType }), { contentType, upsert: true });
  if (error) throw error;
  const { data, error: signError } = await storage.createSignedUrl(path, 60 * 60, { download: true });
  if (signError) throw signError;
  return { ok: true, url: data.signedUrl, message: `Saved to the data bucket: ${path}` };
}

export async function exportEnquiriesAction(): Promise<ActionResult> {
  const blocked = await guard();
  if (blocked) return blocked;
  try {
    const rows = await listEnquiries("all");
    const lines = [
      ["Date", "Name", "Phone", "Email", "Message", "Page", "Status"].map(csvCell).join(","),
      ...rows.map((r) => [r.created_at, r.name, r.phone, r.email, r.message, r.source, r.status].map(csvCell).join(",")),
    ];
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    return await storeExport(`exports/enquiries-${stamp}.csv`, `﻿${lines.join("\n")}`, "text/csv");
  } catch (e) {
    return fail(e);
  }
}

const BACKUP_TABLES = [
  "site_settings",
  "pages",
  "categories",
  "attractions",
  "offers",
  "powerplay_tiers",
  "event_types",
  "events",
  "gallery_albums",
  "gallery_items",
  "reviews",
  "faqs",
  "policy_sections",
  "media",
] as const;

export async function exportBackupAction(): Promise<ActionResult> {
  const blocked = await guard();
  if (blocked) return blocked;
  try {
    const client = serviceClient();
    const snapshot: Record<string, unknown> = { exported_at: new Date().toISOString() };
    for (const table of BACKUP_TABLES) {
      const { data, error } = await client.from(table).select("*").limit(10000);
      if (error) throw error;
      snapshot[table] = data;
    }
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    return await storeExport(`backups/content-${stamp}.json`, JSON.stringify(snapshot, null, 1), "application/json");
  } catch (e) {
    return fail(e);
  }
}
