"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

import { envClient, isSupabaseConfigured } from "@/lib/env/client";

export { isSupabaseConfigured };

/**
 * Browser Supabase client bound to the current origin's auth cookies.
 *
 * Returns `null` when Supabase is not configured yet so UI can show a
 * clear "set up your environment" state instead of crashing.
 */
export function createClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    return null;
  }
  return createBrowserClient(envClient.supabaseUrl, envClient.supabaseAnonKey);
}
