import { NextResponse, type NextRequest } from "next/server";

import { resolveSafeRedirect } from "@/lib/auth/validators";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth / email-confirmation callback: exchanges the `code` for a session
 * and redirects back into the app.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = resolveSafeRedirect(url.searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  return NextResponse.redirect(
    new URL("/login?error=auth-callback", url.origin),
  );
}
