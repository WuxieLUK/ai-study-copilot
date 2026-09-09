import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { DocumentsPanel } from "@/components/dashboard/documents-panel";
import { ProgressPanel } from "@/components/dashboard/progress-panel";
import { QuizPanel } from "@/components/dashboard/quiz-panel";
import { RecommendationsPanel } from "@/components/dashboard/recommendations-panel";
import { getCurrentUser } from "@/lib/auth/session";
import { getDashboardSnapshot } from "@/lib/db/queries";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // Layout already guards this route; keep the page self-sufficient.
  if (!user) {
    redirect("/login");
  }

  const snapshot = await getDashboardSnapshot(user.id);
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

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <DocumentsPanel documents={snapshot.recentDocuments} />
          <RecommendationsPanel />
        </div>
        <div className="space-y-5">
          <ProgressPanel
            readyDocuments={snapshot.readyDocuments}
            inFlightDocuments={snapshot.inFlightDocuments}
            failedDocuments={snapshot.failedDocuments}
            totalDocuments={snapshot.totalDocuments}
          />
          <QuizPanel />
        </div>
      </div>
    </div>
  );
}
