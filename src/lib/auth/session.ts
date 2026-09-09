import { cache } from "react";

import { isSupabaseConfigured } from "@/lib/env/client";
import { createClient } from "@/lib/supabase/server";

/**
 * Current signed-in user, memoized per request (React `cache`), so the
 * proxy → layout → page chain performs a single `getUser()` network call.
 * Returns `null` when Supabase is not configured.
 */
export const getCurrentUser = cache(async () => {
  if (!isSupabaseConfigured) {
    return null;
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
