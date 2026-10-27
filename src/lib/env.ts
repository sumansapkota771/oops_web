/** Supabase connection details. Supports both the classic (anon / service_role) and the newer (publishable / secret) key names. */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabasePublicKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublicKey);

/** Public base URL of the "media" storage bucket, or the local /public/media folder before Supabase is connected. */
export const mediaBaseUrl = isSupabaseConfigured
  ? `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/media`
  : "/media";
