import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AppHeader } from "@/components/dashboard/app-header";
import { SupabaseSetupNotice } from "@/components/shared/supabase-setup-notice";
import { isSupabaseConfigured } from "@/lib/env/client";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let email: string | undefined;

  if (isSupabaseConfigured) {
    // getUser() is memoized per request via React `cache`, so the proxy,
    // layout and page perform a single auth round-trip between them.
    const user = await getCurrentUser();

    // Proxy already guards this, but never trust a single layer.
    if (!user) {
      redirect("/login");
    }
    email = user.email ?? undefined;
  }

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader email={email} />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {isSupabaseConfigured ? children : <SupabaseSetupNotice />}
      </div>
    </div>
  );
}
