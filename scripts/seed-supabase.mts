/**
 * Loads the starter content into Supabase:
 *   • uploads every file in public/media to the "media" bucket
 *   • fills the media library table
 *   • inserts site settings, pages, attractions, offers, FAQ, reviews, gallery …
 *
 *   pnpm db:seed              adds anything that is missing and never overwrites edits
 *   pnpm db:seed --force      also re-uploads files that already exist (needs the service-role key)
 *   pnpm db:seed --reset      ⚠ deletes all content tables first, then re-seeds (enquiries and media files are kept)
 *   pnpm db:seed --no-media   skip the file upload (content only)
 *
 * Two modes, chosen automatically:
 *   • SUPABASE_SERVICE_ROLE_KEY set → everything goes through the Supabase API.
 *   • otherwise SUPABASE_DB_URL     → rows are written straight to Postgres, and files are uploaded with the
 *     publishable key through a temporary storage policy that is removed again when the script ends.
 *
 * Run `pnpm media` first (once) to generate public/media, and `pnpm db:setup` to create the tables and buckets.
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";
import path from "node:path";
import * as seed from "../src/content/seed/index.ts";
import { rawMedia } from "../src/content/seed/media.ts";
import { admin, pg, publicKey, requireEnv, serviceKey, url } from "./_supabase.mts";

requireEnv();

const FORCE = process.argv.includes("--force");
const RESET = process.argv.includes("--reset");
const SKIP_MEDIA = process.argv.includes("--no-media");
const ROOT = path.resolve(import.meta.dirname, "..", "public", "media");
const POLICY = "oops bootstrap upload";

type Row = Record<string, unknown>;
const strip = (row: Row) => Object.fromEntries(Object.entries(row).filter(([key]) => key !== "id"));

const MIME: Record<string, string> = {
  webp: "image/webp",
  jpg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  mp4: "video/mp4",
  webm: "video/webm",
};

const CONTENT_TABLES = ["gallery_items", "gallery_albums", "attractions", "categories", "offers", "powerplay_tiers", "event_types", "events", "reviews", "faqs", "policy_sections", "pages", "site_settings"];

// ---------------------------------------------------------------------------
// Row writer: Supabase API (service key) or direct Postgres
// ---------------------------------------------------------------------------
const api = serviceKey ? admin() : null;
const db = api ? null : pg();

async function write(table: string, rows: Row[], onConflict?: string) {
  if (!rows.length) return;
  if (api) {
    const q = onConflict ? api.from(table).upsert(rows, { onConflict, ignoreDuplicates: true }) : api.from(table).insert(rows);
    const { error } = await q;
    if (error) fail(table, error.message);
    return;
  }
  const cols = [...new Set(rows.flatMap((r) => Object.keys(r)))];
  for (let i = 0; i < rows.length; i += 100) {
    const chunk = rows.slice(i, i + 100).map((r) =>
      Object.fromEntries(cols.map((c) => [c, r[c] !== null && typeof r[c] === "object" ? db!.json(r[c] as never) : (r[c] ?? null)])),
    );
    const conflict = onConflict ? db!`on conflict (${db!(onConflict)}) do nothing` : db!``;
    await db!`insert into ${db!(table)} ${db!(chunk, ...cols)} ${conflict}`.catch((e: Error) => fail(table, e.message));
  }
}

async function count(table: string): Promise<number> {
  if (api) {
    const { count: n, error } = await api.from(table).select("id", { count: "exact", head: true });
    if (error) fail(table, error.message);
    return n ?? 0;
  }
  const [{ n }] = await db!.unsafe(`select count(*)::int n from public."${table}"`);
  return n as number;
}

async function clear(table: string) {
  if (api) {
    const col = table === "pages" ? "slug" : "id";
    const { error } = await api.from(table).delete().not(col, "is", null);
    if (error) fail(`clear ${table}`, error.message);
  } else {
    await db!.unsafe(`delete from public."${table}"`);
  }
}

function fail(label: string, message: string): never {
  console.error(`\n  ✗ ${label}: ${message}`);
  process.exit(1);
}

async function pool<T>(items: T[], size: number, worker: (item: T) => Promise<void>) {
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (cursor < items.length) await worker(items[cursor++]);
    }),
  );
}

async function exists(file: string) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

console.log(`\nOOPS! Nepal — seeding Supabase (${api ? "API mode" : "direct database mode"})\n`);

try {
  // -------------------------------------------------------------------------
  // 0. Reset
  // -------------------------------------------------------------------------
  if (RESET) {
    console.log("Reset: clearing content tables…");
    for (const table of CONTENT_TABLES) await clear(table);
  }

  // -------------------------------------------------------------------------
  // 1. Media files → bucket "media"
  // -------------------------------------------------------------------------
  if (!SKIP_MEDIA) {
    if (!(await exists(ROOT))) fail("media", "public/media not found — run `pnpm media` first.");
    const files = rawMedia.flatMap((m) => (m.kind === "image" ? m.widths.map((w) => `${m.path}-${w}.${m.ext}`) : [`${m.path}.${m.ext}`]));
    console.log(`1/3  Uploading ${files.length} files to the "media" bucket`);

    let uploader = api;
    if (!uploader) {
      if (!publicKey) fail("media", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or ANON key) is needed to upload without the service-role key.");
      await db!.unsafe(`drop policy if exists "${POLICY}" on storage.objects`);
      await db!.unsafe(`create policy "${POLICY}" on storage.objects for insert to anon with check (bucket_id = 'media')`);
      uploader = createClient(url, publicKey, { auth: { persistSession: false } });
      if (FORCE) console.log("     (--force can't overwrite files without the service-role key; existing files are skipped)");
    }
    const storage = uploader.storage.from("media");

    let uploaded = 0;
    let skipped = 0;
    let missing = 0;
    const failures: string[] = [];
    try {
      await pool(files, 6, async (name) => {
        const local = path.join(ROOT, name);
        if (!(await exists(local))) {
          missing++;
          return;
        }
        const ext = name.split(".").pop() ?? "";
        const body = await fs.readFile(local);
        const { error } = await storage.upload(name, body, { contentType: MIME[ext] ?? "application/octet-stream", cacheControl: "31536000", upsert: Boolean(api) && FORCE });
        if (!error) uploaded++;
        else if (/already exists|duplicate/i.test(error.message) || (error as { statusCode?: string }).statusCode === "409") skipped++;
        else failures.push(`${name}: ${error.message}`);
        const done = uploaded + skipped + missing + failures.length;
        if (done % 50 === 0 || done === files.length) process.stdout.write(`\r     ${done}/${files.length}`);
      });
    } finally {
      if (db) await db.unsafe(`drop policy if exists "${POLICY}" on storage.objects`);
    }
    console.log(`\n     ✓ ${uploaded} uploaded, ${skipped} already there${missing ? `, ${missing} missing locally` : ""}`);
    if (db) console.log("     ✓ temporary upload policy removed");
    if (failures.length) fail("upload", `${failures.length} files failed, e.g.\n       ${failures.slice(0, 5).join("\n       ")}`);
  } else {
    console.log("1/3  Skipping media upload (--no-media)");
  }

  // -------------------------------------------------------------------------
  // 2. Media library rows
  // -------------------------------------------------------------------------
  console.log("2/3  Media library");
  const mediaRows = seed.media.map((m) => ({
    path: m.path,
    bucket: "media",
    kind: m.kind,
    ext: m.ext,
    widths: m.widths,
    width: m.width,
    height: m.height,
    bytes: m.bytes,
    blur: m.blur,
    alt: m.alt,
    folder: m.folder,
    name: m.name,
    poster: m.poster,
    duration: m.duration,
  }));
  await write("media", mediaRows, "path");
  console.log(`     ✓ ${mediaRows.length} files in the library`);

  // -------------------------------------------------------------------------
  // 3. Content
  // -------------------------------------------------------------------------
  console.log("3/3  Content");

  async function byKey(table: string, rows: Row[], onConflict: string) {
    await write(table, rows, onConflict);
    console.log(`     ✓ ${table} (${rows.length})`);
  }

  async function ifEmpty(table: string, rows: Row[]) {
    if (!rows.length) return;
    const n = await count(table);
    if (n) return console.log(`     • ${table}: already has ${n} rows — left untouched`);
    await write(table, rows);
    console.log(`     ✓ ${table} (${rows.length})`);
  }

  await byKey("site_settings", [{ id: 1, data: seed.settings }], "id");
  await byKey(
    "pages",
    seed.pages.map((p) => ({ slug: p.slug, title: p.title, seo_title: p.seo_title, seo_description: p.seo_description, og_image: p.og_image, content: p.content })),
    "slug",
  );
  await byKey("categories", seed.categories.map(strip), "slug");
  await byKey("attractions", seed.attractions.map(strip), "slug");
  await byKey("offers", seed.offers.map(strip), "slug");
  await byKey("event_types", seed.eventTypes.map(strip), "slug");
  await byKey("gallery_albums", seed.galleryAlbums.map(strip), "slug");
  await ifEmpty("gallery_items", seed.galleryItems.map(strip));
  await ifEmpty("powerplay_tiers", seed.powerplayTiers.map(strip));
  await ifEmpty("events", seed.upcomingEvents.map(strip));
  await ifEmpty("reviews", seed.reviews.map(strip));
  await ifEmpty("faqs", seed.faqs.map(strip));
  await ifEmpty("policy_sections", seed.policySections.map(strip));

  console.log("\nDone. Start the site with `pnpm dev` — it now reads everything from Supabase.\n");
} finally {
  if (db) await db.end({ timeout: 5 });
}

