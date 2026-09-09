/**
 * Public marketing home (route group `(marketing)`).
 * A full landing page (hero, features, demo, CTA) lands here in Phase 2.
 */
export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24">
      <p className="text-sm font-medium uppercase tracking-widest text-brand-600 dark:text-brand-400">
        AI Study Copilot
      </p>
      <h1 className="max-w-2xl text-center text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        Your course materials, turned into a personal learning system.
      </h1>
      <p className="max-w-xl text-center text-lg text-muted-foreground">
        Landing page coming in the next phase.
      </p>
    </main>
  );
}
