import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabasePublicKey, supabaseUrl } from "@/lib/env";

const options = { auth: { persistSession: false, autoRefreshToken: false } } as const;

/** Read-only client for published content (row level security applies). */
export function publicClient(): SupabaseClient {
  if (!isSupabaseConfigured) throw new Error("Supabase is not configured");
  return createClient(supabaseUrl, supabasePublicKey, options);
}

const serviceKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY ?? "";

export const hasServiceRole = () => Boolean(isSupabaseConfigured && serviceKey());

/** Full-access client. Only call after the admin has been verified. */
export function serviceClient(): SupabaseClient {
  const key = serviceKey();
  if (!isSupabaseConfigured || !key) {
    throw new Error("Supabase service role key is missing — add SUPABASE_SERVICE_ROLE_KEY to .env.local");
  }
  return createClient(supabaseUrl, key, options);
}
