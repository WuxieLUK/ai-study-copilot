import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { envClient } from "@/lib/env/client";

const AUTH_PAGES = ["/login", "/signup"];

/**
 * Proxy (Next 16: formerly middleware).
 *
 * Optimistic auth guard: redirects signed-out users away from `/dashboard`
 * and signed-in users away from the auth pages. Real authorization still
 * happens in the dashboard layout / data layer.
 *
 * When Supabase env vars are missing the proxy passes everything through so
 * the rest of the app can render its "not configured" guidance.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!envClient.supabaseUrl || !envClient.supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  const response = NextResponse.next({ request });
  const supabase = createServerClient(
    envClient.supabaseUrl,
    envClient.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() verifies the JWT with Supabase Auth (not just cookie presence).
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Auth API unreachable — let layouts decide; never crash the proxy.
  }

  if (!user && pathname.startsWith("/dashboard")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
};
