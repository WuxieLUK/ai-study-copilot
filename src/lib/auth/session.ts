import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

/**
 * Current signed-in user, memoized per request (React `cache`), so the
 * proxy → layout → page chain performs a single `getUser()` network call.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
