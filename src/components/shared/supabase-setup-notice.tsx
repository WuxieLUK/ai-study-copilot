import { TriangleAlert } from "lucide-react";

/**
 * Shown whenever a feature needs Supabase/OpenAI credentials that are
 * missing from the environment — keeps the app browsable pre-configuration.
 */
export function SupabaseSetupNotice() {
  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <TriangleAlert
            className="mt-0.5 h-5 w-5 shrink-0 text-amber-500"
            aria-hidden
          />
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-card-foreground">
              Supabase is not configured
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              This screen needs Supabase Auth and a database. Copy{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                .env.example
              </code>{" "}
              to{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                .env.local
              </code>{" "}
              and fill in your project&apos;s public credentials:
            </p>
            <pre className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs leading-relaxed text-foreground">
              {`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`}
            </pre>
            <p className="text-xs text-muted-foreground">
              Grab them from your Supabase project under Settings → API.
              No Supabase account yet? Create one at supabase.com — it&apos;s
              free to start.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
