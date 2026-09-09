import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { NavLinks } from "@/components/dashboard/nav-links";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";

type AppHeaderProps = {
  email: string | undefined;
};

export function AppHeader({ email }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/dashboard"
          className="flex shrink-0 items-center gap-2 font-semibold tracking-tight text-foreground"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white">
            <GraduationCap className="h-4 w-4" aria-hidden />
          </span>
          <span className="hidden lg:inline">AI Study Copilot</span>
        </Link>

        <NavLinks />

        <div className="flex shrink-0 items-center gap-1.5">
          <ThemeToggle />
          <span
            className="hidden max-w-40 truncate text-sm text-muted-foreground xl:inline"
            title={email}
          >
            {email}
          </span>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
