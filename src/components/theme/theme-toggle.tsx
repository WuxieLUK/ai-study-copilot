"use client";

import { Moon, Sun } from "lucide-react";

/**
 * Dark/light toggle. The `.dark` class on <html> is applied before first
 * paint by an inline script in the root layout; this button only flips it.
 * Both icons are always rendered — CSS (dark:) decides which shows — so there
 * is no state, no effect and no hydration mismatch.
 */
export function ThemeToggle() {
  function toggle() {
    const isDark = document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", !isDark);
    try {
      localStorage.setItem("theme", isDark ? "light" : "dark");
    } catch {
      /* private mode */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle color theme"
      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <Sun className="h-4 w-4 dark:hidden" aria-hidden />
      <Moon className="hidden h-4 w-4 dark:block" aria-hidden />
    </button>
  );
}
