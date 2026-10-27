import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import postgres from "postgres";

export const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
export const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY ?? "";
export const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
export const dbUrl = process.env.SUPABASE_DB_URL ?? "";

/** Needs the project URL plus either the service-role key or a direct database connection. */
export function requireEnv() {
  const missing: string[] = [];
  if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceKey && !dbUrl) missing.push("SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_DB_URL)");
  if (missing.length) {
    console.error(
      [
        "",
        `✗ Missing in website/.env.local: ${missing.join(", ")}`,
        "",
        "  Copy .env.example to .env.local and fill in the Supabase values",
        "  (Supabase dashboard → Project Settings → API, and Connect → connection string), then run this again.",
        "",
      ].join("\n"),
    );
    process.exit(1);
  }
}

export function admin(): SupabaseClient {
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function pg() {
  return postgres(dbUrl, { max: 1, ssl: "require", connect_timeout: 30, onnotice: () => {} });
}

/** e.g. https://abcd1234.supabase.co → abcd1234 */
export const projectRef = /^https:\/\/([a-z0-9]+)\.supabase\.(co|in)/i.exec(url)?.[1];
