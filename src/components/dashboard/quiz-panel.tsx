import { Target } from "lucide-react";

import { Panel } from "@/components/dashboard/panel";

/**
 * Quiz scores widget. Real attempts/accuracy land here in Phase 7 (quiz
 * generator + session storage); until then it renders a clear empty state.
 */
export function QuizPanel() {
  return (
    <Panel title="Quiz scores" description="Accuracy over time" icon={Target}>
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-4 py-8 text-center">
        <p className="text-xs font-medium text-muted-foreground">No quizzes yet</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Once you have ready documents, generate a quiz and your scores will
          show up here.
        </p>
      </div>
    </Panel>
  );
}
