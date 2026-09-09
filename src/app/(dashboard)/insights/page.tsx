import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Award,
  BarChart3,
  LineChart,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import { Panel } from "@/components/dashboard/panel";
import { ScoreHistory, TopicBarList } from "@/components/insights/insights-views";
import { computeInsights } from "@/lib/analytics/insights";
import { getCurrentUser } from "@/lib/auth/session";
import { getQuizSessionDetails } from "@/lib/db/queries";
import { isSupabaseConfigured } from "@/lib/env/client";

export const metadata: Metadata = { title: "Study Insights" };

export default async function InsightsPage() {
  if (!isSupabaseConfigured) {
    return null;
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // DB returns newest-first; computeInsights expects chronological order.
  const sessions = (await getQuizSessionDetails(user.id, 50)).reverse();
  const insights = computeInsights(sessions);

  if (insights.sessionCount === 0) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <BarChart3 className="h-8 w-8 text-muted-foreground" aria-hidden />
          <p className="mt-3 font-medium text-foreground">No insights yet</p>
          <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">
            Complete your first quiz and this page will track your strong and
            weak topics, score trends and review recommendations.
          </p>
          <Link
            href="/quiz"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            <Target className="h-4 w-4" aria-hidden />
            Take a quiz
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={BarChart3}
          label="Quizzes taken"
          value={String(insights.sessionCount)}
        />
        <MetricCard
          icon={LineChart}
          label="Average score"
          value={`${insights.averageScore}%`}
        />
        <MetricCard
          icon={Award}
          label="Best score"
          value={`${insights.bestScore}%`}
        />
        <MetricCard
          icon={TrendingUp}
          label="Latest score"
          value={
            insights.lastScore === null
              ? "—"
              : `${insights.lastScore}%`
          }
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Score history" description="Last quizzes" icon={LineChart}>
            <ScoreHistory sessions={sessions.slice(-8)} />
          </Panel>
        </div>
        <Panel
          title="Topic breakdown"
          description="Across all questions"
          icon={Sparkles}
        >
          <TopicBreakdown
            strongCount={insights.strongTopics.length}
            weakCount={insights.weakTopics.length}
          />
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel
          title="Strong topics"
          description="Keep it up"
          icon={Award}
        >
          <TopicBarList
            topics={insights.strongTopics}
            tone="strong"
            emptyMessage="Answer more questions to discover strong topics."
          />
        </Panel>
        <Panel title="Needs review" description="Prioritize these" icon={Target}>
          <TopicBarList
            topics={insights.weakTopics}
            tone="weak"
            emptyMessage="Nothing flagged — great accuracy!"
          />
        </Panel>
      </div>
    </div>
  );
}

function PageHeader() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Study Insights
      </h1>
      <p className="mt-1 text-muted-foreground">
        Your performance across quizzes — which topics are solid and which
        need another pass.
      </p>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BarChart3;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}

function TopicBreakdown({
  strongCount,
  weakCount,
}: {
  strongCount: number;
  weakCount: number;
}) {
  return (
    <ul className="space-y-2.5">
      <li className="flex items-center justify-between rounded-xl bg-emerald-50/60 px-4 py-3 dark:bg-emerald-950/25">
        <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
          Strong
        </span>
        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-sm font-semibold tabular-nums text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
          {strongCount}
        </span>
      </li>
      <li className="flex items-center justify-between rounded-xl bg-amber-50/60 px-4 py-3 dark:bg-amber-950/25">
        <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
          Needs review
        </span>
        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-sm font-semibold tabular-nums text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
          {weakCount}
        </span>
      </li>
      <p className="px-1 pt-1 text-xs leading-relaxed text-muted-foreground">
        Topics are split by accuracy: 80%+ is strong, below 70% lands in needs
        review.
      </p>
    </ul>
  );
}
