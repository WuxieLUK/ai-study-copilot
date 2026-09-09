"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/documents", label: "Documents" },
  { href: "/tutor", label: "Tutor" },
  { href: "/quiz", label: "Quiz" },
  { href: "/insights", label: "Insights" },
];

/** Top navigation with active-route highlighting (client: needs pathname). */
export function NavLinks() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard" || pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav
      aria-label="Main"
      className="flex items-center gap-1 overflow-x-auto text-sm font-medium [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {LINKS.map((link) => {
        const active = isActive(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 rounded-lg px-3 py-1.5 transition-colors ${
              active
                ? "bg-muted font-semibold text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
