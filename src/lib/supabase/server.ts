import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { envServer } from "@/lib/env/server";

/**
 * Server Supabase client for Server Components, Server Actions and Route
 * Handlers. Always creates a fresh client per request (never shared).
 *
 * Callers must check `isSupabaseConfigured` first.
 */
export async function createClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  return createServerClient(
    envServer.supabaseUrl,
    envServer.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component where cookies are read-only —
            // the proxy layer refreshes sessions in that case.
          }
        },
      },
    },
  );
}
