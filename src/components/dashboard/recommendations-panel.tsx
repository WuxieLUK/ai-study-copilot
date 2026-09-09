import { Sparkles } from "lucide-react";

import { Panel } from "@/components/dashboard/panel";

export type WeakTopicEntry = { topic: string; missed: number };

type RecommendationsPanelProps = {
  weakTopics: WeakTopicEntry[];
};

export function RecommendationsPanel({ weakTopics }: RecommendationsPanelProps) {
  const hasWeaknesses = weakTopics.length > 0;

  return (
    <Panel
      title="Recommended topics"
      description="Personalized review queue"
      icon={Sparkles}
    >
      {!hasWeaknesses ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-4 py-8 text-center">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-950 dark:text-brand-400">
            <Sparkles className="h-4.5 w-4.5" aria-hidden />
          </span>
          <p className="mt-2 text-xs font-medium text-foreground">
            Finish a quiz to unlock recommendations
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Wrong answers are grouped into weak topics — we&apos;ll suggest
            what to review next and why.
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {weakTopics.map((weak) => (
            <li
              key={weak.topic}
              className="flex items-start gap-2.5 rounded-xl border border-amber-500/25 bg-amber-50/50 px-3.5 py-2.5 dark:bg-amber-950/20"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
                <Sparkles className="h-3 w-3" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  Review {weak.topic}
                </p>
                <p className="text-xs text-muted-foreground">
                  Missed in {weak.missed} question
                  {weak.missed === 1 ? "" : "s"} so far
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
