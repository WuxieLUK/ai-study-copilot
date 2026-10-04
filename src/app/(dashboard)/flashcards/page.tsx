import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Layers3 } from "lucide-react";

import { FlashcardsPanel } from "@/components/flashcards/flashcards-panel";
import { getCurrentUser } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/env/client";

export const metadata: Metadata = { title: "Flashcards" };

export default async function FlashcardsPage() {
  if (!isSupabaseConfigured) return null;

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Flashcards
          </h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            Practice active recall with decks generated from your own notes.
          </p>
        </div>
        <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300 sm:flex">
          <Layers3 className="h-5 w-5" aria-hidden />
        </span>
      </div>

      <FlashcardsPanel />
    </div>
  );
}
