import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { ThemeToggle } from "@/components/theme/theme-toggle";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#demo", label: "Demo" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-semibold tracking-tight text-foreground"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <GraduationCap className="h-4.5 w-4.5" aria-hidden />
          </span>
          <span className="hidden sm:inline">AI Study Copilot</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
