import { Sparkles } from "lucide-react";

import { Panel } from "@/components/dashboard/panel";

/**
 * Recommended topics widget. Populated in Phase 8 from quiz performance;
 * shows guidance until the first quiz has been completed.
 */
export function RecommendationsPanel() {
  return (
    <Panel
      title="Recommended topics"
      description="Personalized review queue"
      icon={Sparkles}
    >
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-4 py-8 text-center">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-950 dark:text-brand-400">
          <Sparkles className="h-4.5 w-4.5" aria-hidden />
        </span>
        <p className="mt-2 text-xs font-medium text-foreground">
          Finish a quiz to unlock recommendations
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Wrong answers are grouped into weak topics — we&apos;ll suggest what
          to review next and why.
        </p>
      </div>
    </Panel>
  );
}
