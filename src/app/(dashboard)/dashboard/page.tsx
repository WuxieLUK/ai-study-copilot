import { BookOpen, Sparkles, FileText, Target } from "lucide-react";

/**
 * Dashboard shell (Phase 2). Widgets for documents / progress / scores /
 * recommendations land here in Phase 3 and beyond.
 */
export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Study Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          Upload materials to start — your copilot will build summaries,
          quizzes and a tutor around them.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={FileText}
          label="Documents"
          hint="Upload a PDF, Markdown or TXT to begin"
        />
        <StatCard
          icon={BookOpen}
          label="Study progress"
          hint="Tracked once you start learning"
        />
        <StatCard
          icon={Target}
          label="Quiz scores"
          hint="Auto-generated quizzes land here"
        />
        <StatCard
          icon={Sparkles}
          label="Recommended topics"
          hint="Personalized from your performance"
        />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  hint,
}: {
  icon: typeof FileText;
  label: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
        <Icon className="h-4.5 w-4.5" aria-hidden />
      </span>
      <p className="mt-3 text-sm font-medium text-foreground">{label}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {hint}
      </p>
    </div>
  );
}
