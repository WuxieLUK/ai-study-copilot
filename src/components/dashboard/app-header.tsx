import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { SignOutButton } from "@/components/dashboard/sign-out-button";

type AppHeaderProps = {
  email: string | undefined;
};

export function AppHeader({ email }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold tracking-tight text-foreground"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white">
            <GraduationCap className="h-4 w-4" aria-hidden />
          </span>
          <span className="hidden sm:inline">AI Study Copilot</span>
        </Link>

        <nav className="flex items-center gap-1 text-sm font-medium">
          <Link
            href="/dashboard"
            className="rounded-lg px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            href="/documents"
            className="rounded-lg px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Documents
          </Link>
          <Link
            href="/tutor"
            className="rounded-lg px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Tutor
          </Link>
          <Link
            href="/quiz"
            className="rounded-lg px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Quiz
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <span
            className="hidden max-w-48 truncate text-sm text-muted-foreground sm:inline"
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
