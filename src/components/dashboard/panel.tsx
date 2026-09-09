import type { LucideIcon } from "lucide-react";

type PanelProps = {
  title: string;
  icon: LucideIcon;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

/** Shared card shell for dashboard widgets. */
export function Panel({
  title,
  icon: Icon,
  description,
  action,
  className = "",
  children,
}: PanelProps) {
  return (
    <section
      className={`flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {action}
      </div>
      <div className="mt-4 flex-1">{children}</div>
    </section>
  );
}
