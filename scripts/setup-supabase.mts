/**
 * One-time Supabase setup (safe to re-run):
 *   1. creates the database tables, row level security and helper function
 *   2. creates the storage buckets:  media (public)  and  data (private)
 *   3. checks that everything is reachable
 *
 *   pnpm db:setup
 *
 * The SQL can be applied three ways, tried in this order:
 *   • SUPABASE_DB_URL        direct Postgres connection string
 *   • SUPABASE_ACCESS_TOKEN  a Supabase personal access token (Management API)
 *   • otherwise the script tells you to paste supabase/migrations/0001_init.sql into the SQL Editor.
 * The migration itself creates the buckets; with the service-role key they are also checked through the Storage API.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { admin, dbUrl, pg, projectRef, requireEnv, serviceKey } from "./_supabase.mts";

requireEnv();

const sqlFile = path.resolve(import.meta.dirname, "..", "supabase", "migrations", "0001_init.sql");
const sql = await fs.readFile(sqlFile, "utf8");
const client = serviceKey ? admin() : null;
const CHECK_TABLES = ["site_settings", "pages", "attractions", "offers", "media", "enquiries"];

async function applySql(): Promise<"db-url" | "management-api" | "manual"> {
  if (dbUrl) {
    const db = pg();
    try {
      await db.unsafe(sql);
    } finally {
      await db.end({ timeout: 5 });
    }
    return "db-url";
  }
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (token && projectRef) {
    const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query: sql }),
    });
    if (res.ok) return "management-api";
    console.warn(`  ! Management API said ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  return "manual";
}

async function tablesExist() {
  if (!client) return false;
  const { error } = await client.from("site_settings").select("id", { head: true, count: "exact" });
  return !error;
}

console.log("\nOOPS! Nepal — Supabase setup\n");

console.log("1/3  Database schema");
const how = await applySql();
if (how === "manual") {
  if (await tablesExist()) {
    console.log("     ✓ tables already exist (nothing to apply)");
  } else {
    console.log(
      [
        "     ! Could not apply the SQL automatically (no SUPABASE_DB_URL or SUPABASE_ACCESS_TOKEN).",
        "       Do this once, then run `pnpm db:setup` again:",
        "         1. Supabase dashboard → SQL Editor → New query",
        `         2. Paste the contents of ${path.relative(process.cwd(), sqlFile)} and press Run`,
        "",
      ].join("\n"),
    );
    process.exit(1);
  }
} else {
  console.log(`     ✓ applied ${path.basename(sqlFile)} via ${how}`);
}

console.log("2/3  Storage buckets");
if (client) {
  for (const [id, options] of [
    ["media", { public: true, fileSizeLimit: 50 * 1024 * 1024, allowedMimeTypes: ["image/webp", "image/jpeg", "image/png", "image/gif", "image/avif", "image/svg+xml", "video/mp4", "video/webm", "application/pdf"] }],
    ["data", { public: false, fileSizeLimit: 50 * 1024 * 1024 }],
  ] as const) {
    const { error } = await client.storage.createBucket(id, { ...options, allowedMimeTypes: "allowedMimeTypes" in options ? [...options.allowedMimeTypes] : undefined });
    if (error && !/already exists|duplicate/i.test(error.message)) throw error;
    if (error) await client.storage.updateBucket(id, { ...options, allowedMimeTypes: "allowedMimeTypes" in options ? [...options.allowedMimeTypes] : undefined });
  }
  console.log("     ✓ media (public) and data (private) via the Storage API");
} else {
  console.log("     ✓ media (public) and data (private) created by the migration");
}

console.log("3/3  Checks");
let ok = true;
if (dbUrl) {
  const db = pg();
  try {
    for (const t of CHECK_TABLES) {
      const [{ n }] = await db.unsafe(`select count(*)::int n from public."${t}"`);
      console.log(`     ✓ table ${t} (${n} rows)`);
    }
    for (const b of await db`select id, public from storage.buckets where id in ('media','data') order by id`) {
      console.log(`     ✓ bucket ${b.id} (${b.public ? "public" : "private"})`);
    }
    const [{ n }] = await db`select count(*)::int n from storage.buckets where id in ('media','data')`;
    ok = n === 2;
  } catch (e) {
    console.log(`     ✗ ${(e as Error).message}`);
    ok = false;
  } finally {
    await db.end({ timeout: 5 });
  }
} else if (client) {
  for (const t of CHECK_TABLES) {
    const { error } = await client.from(t).select("*", { head: true, count: "exact" });
    console.log(`     ${error ? "✗" : "✓"} table ${t}${error ? ` — ${error.message}` : ""}`);
    ok &&= !error;
  }
}

if (!ok) process.exit(1);
console.log("\nDone. Next:  pnpm db:seed   (uploads the media and fills in all the content)\n");
