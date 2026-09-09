import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Cta() {
  return (
    <section className="border-t border-border/70">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-600 to-violet-600 px-6 py-16 text-center shadow-xl shadow-brand-600/20 sm:px-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute -top-16 -left-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          </div>
          <h2 className="relative mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">
            Stop re-reading. Start actually learning.
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-brand-50/90">
            Free to start. Upload one PDF and see your personal study system
            come to life.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-brand-700 shadow-lg transition-transform hover:scale-[1.02]"
            >
              Create free account
              <ArrowRight
                className="h-4.5 w-4.5 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center rounded-xl border border-white/30 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-white/10"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
