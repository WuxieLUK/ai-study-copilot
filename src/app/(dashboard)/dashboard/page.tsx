import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BarChart3,
  ListChecks,
  MessagesSquare,
  UploadCloud,
} from "lucide-react";

import { DocumentsPanel } from "@/components/dashboard/documents-panel";
import { ProgressPanel } from "@/components/dashboard/progress-panel";
import { QuizPanel } from "@/components/dashboard/quiz-panel";
import { RecommendationsPanel } from "@/components/dashboard/recommendations-panel";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getDashboardSnapshot,
  getQuizSessionsSummary,
} from "@/lib/db/queries";
import { isSupabaseConfigured } from "@/lib/env/client";
import { aggregateWeakTopicsAcrossSessions } from "@/lib/analytics/insights";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  // Without Supabase the layout renders its setup notice; skip data work.
  if (!isSupabaseConfigured) {
    return null;
  }

  const user = await getCurrentUser();

  // Layout already guards this route; keep the page self-sufficient.
  if (!user) {
    redirect("/login");
  }

  const [snapshot, quizSessions] = await Promise.all([
    getDashboardSnapshot(user.id),
    getQuizSessionsSummary(user.id, 6),
  ]);
  const weakTopics = aggregateWeakTopicsAcrossSessions(quizSessions).slice(0, 5);
  const firstName = user.email?.split("@")[0] ?? "there";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s what&apos;s happening across your studies today.
        </p>
      </div>

      <QuickLinks />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <DocumentsPanel documents={snapshot.recentDocuments} />
          <RecommendationsPanel weakTopics={weakTopics} />
        </div>
        <div className="space-y-5">
          <ProgressPanel
            readyDocuments={snapshot.readyDocuments}
            inFlightDocuments={snapshot.inFlightDocuments}
            failedDocuments={snapshot.failedDocuments}
            totalDocuments={snapshot.totalDocuments}
          />
          <QuizPanel sessions={quizSessions.slice(0, 5)} />
        </div>
      </div>
    </div>
  );
}

const QUICK_LINKS = [
  { href: "/documents", label: "Upload materials", icon: UploadCloud },
  { href: "/tutor", label: "Ask the tutor", icon: MessagesSquare },
  { href: "/quiz", label: "Take a quiz", icon: ListChecks },
  { href: "/insights", label: "View insights", icon: BarChart3 },
];

function QuickLinks() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm transition-colors hover:border-brand-400/60 hover:bg-brand-50/40 dark:hover:bg-brand-950/20"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-brand-100 group-hover:text-brand-700 dark:group-hover:bg-brand-900/60 dark:group-hover:text-brand-300">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
          <span className="truncate text-sm font-medium text-foreground">
            {label}
          </span>
        </Link>
      ))}
    </div>
  );
}
