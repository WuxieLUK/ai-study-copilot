import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { QuizFlow } from "@/components/quiz/quiz-flow";
import { getCurrentUser } from "@/lib/auth/session";
import { getReadyDocuments } from "@/lib/db/queries";
import { isSupabaseConfigured } from "@/lib/env/client";

export const metadata: Metadata = { title: "Quiz" };

export default async function QuizPage() {
  // Without Supabase the (dashboard) layout shows its setup notice.
  if (!isSupabaseConfigured) {
    return null;
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const documents = await getReadyDocuments(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Quiz generator
        </h1>
        <p className="mt-1 text-muted-foreground">
          Turn your processed documents into practice questions. Submit and get
          a score, explanations and your weak topics.
        </p>
      </div>
      <QuizFlow documents={documents} />
    </div>
  );
}
