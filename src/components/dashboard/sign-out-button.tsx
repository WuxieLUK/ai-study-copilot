"use client";

import { useTransition } from "react";
import { LogOut, Loader2 } from "lucide-react";

import { signOut } from "@/lib/auth/actions";

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={() => {
        startTransition(async () => {
          await signOut();
        });
      }}
    >
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-60"
      >
        {/*
         * Stable children: swap visibility via CSS instead of mounting/
         * unmounting the icon while the button is being disabled, which can
         * race the browser and throw "insertBefore … not a child".
         */}
        <Loader2
          className={`h-4 w-4 animate-spin ${isPending ? "" : "hidden"}`}
          aria-hidden
        />
        <LogOut
          className={`h-4 w-4 ${isPending ? "hidden" : ""}`}
          aria-hidden
        />
        Sign out
      </button>
    </form>
  );
}
