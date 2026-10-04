"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Layers3,
  Loader2,
  RotateCw,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import type { FlashcardDeck } from "@/lib/flashcards/types";

type DeckState =
  | { status: "idle"; error?: string }
  | { status: "loading"; error?: string }
  | { status: "ready"; deck: FlashcardDeck; error?: string };

const COUNT_OPTIONS = [8, 12, 16];

export function FlashcardsPanel() {
  const [state, setState] = useState<DeckState>({ status: "idle" });
  const [count, setCount] = useState(12);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<string>>(new Set());

  const deck = state.status === "ready" ? state.deck : undefined;
  const card = deck?.cards[index];
  const progress = useMemo(() => {
    if (!deck) return 0;
    return ((index + 1) / deck.cards.length) * 100;
  }, [deck, index]);

  useEffect(() => {
    if (!deck) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") {
        setFlipped(false);
        setIndex((current) => Math.min(deck!.cards.length - 1, current + 1));
      }
      if (event.key === "ArrowLeft") {
        setFlipped(false);
        setIndex((current) => Math.max(0, current - 1));
      }
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        setFlipped((current) => !current);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deck]);

  async function generate() {
    setState({ status: "loading" });
    setIndex(0);
    setFlipped(false);
    setKnown(new Set());
    try {
      const response = await fetch("/api/flashcards/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ count }),
      });
      const data = (await response.json().catch(() => null)) as
        | FlashcardDeck
        | { error?: { message?: string } }
        | null;

      if (!response.ok || !data || "error" in data) {
        const message =
          data && "error" in data && data.error?.message
            ? data.error.message
            : "Could not generate flashcards. Please try again.";
        setState({ status: "idle", error: message });
        return;
      }
      setState({ status: "ready", deck: data as FlashcardDeck });
    } catch {
      setState({
        status: "idle",
        error: "Network error while generating flashcards.",
      });
    }
  }

  function toggleKnown() {
    if (!card) return;
    setKnown((current) => {
      const next = new Set(current);
      if (next.has(card.id)) next.delete(card.id);
      else next.add(card.id);
      return next;
    });
  }

  if (!deck || !card) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -bottom-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-2xl px-6 py-14 text-center sm:py-20">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
            <Layers3 className="h-6 w-6" aria-hidden />
          </span>
          <h2 className="mt-6 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Active recall, one card at a time
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
            Turn your notes into retrieval-practice flashcards. Self-testing is
            one of the highest-leverage study techniques there is.
          </p>

          <div className="mx-auto mt-8 grid max-w-sm grid-cols-3 gap-2">
            {COUNT_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setCount(option)}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
                  count === option
                    ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300"
                    : "border-border bg-card text-muted-foreground hover:border-brand-300 hover:text-foreground"
                }`}
              >
                {option} cards
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={generate}
            disabled={state.status === "loading"}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {state.status === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Building your deck…
              </>
            ) : (
              <>
                <WandSparkles className="h-4 w-4" aria-hidden />
                Generate flashcards
              </>
            )}
          </button>

          {state.status === "idle" && state.error && (
            <p className="mt-5 rounded-xl border border-red-500/40 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-300">
              {state.error}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-brand-600 dark:text-brand-400">
            <Sparkles className="h-4 w-4" aria-hidden />
            {deck.cards.length} cards · {known.size} mastered
          </div>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {deck.title}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setState({ status: "idle" })}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <RotateCw className="h-4 w-4" aria-hidden />
          New deck
        </button>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mx-auto w-full max-w-3xl">
        <button
          type="button"
          onClick={() => setFlipped((current) => !current)}
          className="block w-full text-left [perspective:1400px] focus:outline-none"
          aria-label={flipped ? "Show question" : "Show answer"}
        >
          <div
            className="relative h-80 w-full transition-transform duration-500 [transform-style:preserve-3d] sm:h-72"
            style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
          >
            <div className="absolute inset-0 flex flex-col rounded-3xl border border-border bg-card p-6 shadow-lg shadow-black/5 [backface-visibility:hidden] sm:p-8">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
                  Question {index + 1}
                </span>
                <span className="text-xs text-muted-foreground">Click to flip</span>
              </div>
              <p className="mt-6 text-xl font-semibold leading-relaxed text-balance text-foreground sm:text-2xl">
                {card.front}
              </p>
              {card.hint && (
                <p className="mt-auto text-sm text-muted-foreground">
                  Hint: {card.hint}
                </p>
              )}
            </div>

            <div className="absolute inset-0 flex flex-col rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50 to-violet-50 p-6 shadow-lg shadow-brand-500/10 [backface-visibility:hidden] [transform:rotateY(180deg)] dark:border-brand-900 dark:from-brand-950/70 dark:to-violet-950/40 sm:p-8">
              <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-white/10 dark:text-brand-200">
                Answer
              </span>
              <p className="mt-6 text-base leading-relaxed text-pretty text-foreground sm:text-lg">
                {card.back}
              </p>
            </div>
          </div>
        </button>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setFlipped(false);
              setIndex((current) => Math.max(0, current - 1));
            }}
            disabled={index === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Previous
          </button>

          <button
            type="button"
            onClick={toggleKnown}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
              known.has(card.id)
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "border border-emerald-600/30 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
            }`}
          >
            <Check className="h-4 w-4" aria-hidden />
            {known.has(card.id) ? "Mastered" : "I know it"}
          </button>

          <button
            type="button"
            onClick={() => {
              setFlipped(false);
              setIndex((current) =>
                Math.min(deck.cards.length - 1, current + 1),
              );
            }}
            disabled={index === deck.cards.length - 1}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-40"
          >
            Next
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Tip: use ← / → to navigate and Space to flip.
        </p>
      </div>
    </div>
  );
}
