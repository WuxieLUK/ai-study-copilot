import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CalendarDays } from "lucide-react";

import { StudyPlanPanel } from "@/components/study-plan/study-plan-panel";
import { getCurrentUser } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/env/client";

export const metadata: Metadata = { title: "Study Plan" };

export default async function StudyPlanPage() {
  if (!isSupabaseConfigured) return null;

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Study Plan
          </h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            A coach-designed schedule that turns your documents and quiz
            performance into a focused, day-by-day learning path.
          </p>
        </div>
        <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400 sm:flex">
          <CalendarDays className="h-5 w-5" aria-hidden />
        </span>
      </div>

      <StudyPlanPanel />
    </div>
  );
}
