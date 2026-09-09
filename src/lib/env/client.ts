/**
 * Client-safe environment access.
 *
 * This module only ever reads `NEXT_PUBLIC_*` values, so it is safe to
 * import from browser code. Secrets live in `@/lib/env/server` (server-only).
 */
export const envClient = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
} as const;

/** True when the public Supabase pair is present in the environment. */
export const isSupabaseConfigured = Boolean(
  envClient.supabaseUrl && envClient.supabaseAnonKey,
);
