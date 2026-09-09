"use client";

import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  GraduationCap,
  Loader2,
  Quote,
  Send,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import type { SearchChunk } from "@/lib/rag/search";

type ChatRole = "user" | "assistant";

type ChatItem = {
  id: string;
  role: ChatRole;
  content: string;
  sources?: SearchChunk[];
  grounded?: boolean;
};

type TutorResponse = {
  answer: string;
  grounded: boolean;
  sources: SearchChunk[];
};

const SUGGESTIONS = [
  "Summarize the key ideas in my notes.",
  "Explain the most important formula so far.",
  "Quiz me on the main concepts.",
  "What are the common mistakes in this topic?",
];

let idCounter = 0;
const nextId = () => `m${++idCounter}-${Date.now()}`;

export function TutorChat() {
  const [messages, setMessages] = useState<ChatItem[]>([]);
  const [input, setInput] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isAsking]);

  async function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed || isAsking) return;

    const history = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-8)
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: "user", content: trimmed },
    ]);
    setInput("");
    setIsAsking(true);
    setError(null);

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, history }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        if (response.status === 503) {
          setError(
            data?.message ??
              "The tutor is not configured yet (missing environment keys).",
          );
        } else {
          setError(data?.message ?? "The tutor could not answer right now.");
        }
        return;
      }

      const result = (await response.json()) as TutorResponse;
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: "assistant",
          content: result.answer,
          sources: result.sources,
          grounded: result.grounded,
        },
      ]);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setIsAsking(false);
    }
  }

  const showWelcome = messages.length === 0;

  return (
    <div className="flex h-[calc(100vh-11rem)] min-h-[28rem] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Scrollable message area */}
      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        {showWelcome && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/25">
              <GraduationCap className="h-7 w-7" aria-hidden />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-foreground">
              Ask your AI tutor
            </h2>
            <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">
              Answers come from your uploaded documents only, with the exact
              passages cited as sources.
            </p>
            <div className="mt-6 grid w-full max-w-md gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => ask(suggestion)}
                  className="rounded-xl border border-border bg-background px-3 py-2.5 text-left text-xs font-medium text-foreground transition-colors hover:border-brand-400/70 hover:bg-brand-50/50 dark:hover:bg-brand-950/30"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isAsking && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-brand-500" aria-hidden />
              Searching your materials…
            </span>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-300"
          >
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{error}</span>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void ask(input);
        }}
        className="border-t border-border p-3"
      >
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void ask(input);
              }
            }}
            rows={2}
            placeholder="Ask about anything in your course materials…"
            aria-label="Question for the tutor"
            className="flex-1 resize-none rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isAsking || !input.trim()}
            aria-label="Send question"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {/* Stable children — CSS-visible spinner avoids DOM churn mid-disabled. */}
            <Loader2
              className={`h-4 w-4 animate-spin ${isAsking ? "" : "hidden"}`}
              aria-hidden
            />
            <Send
              className={`h-4 w-4 ${isAsking ? "hidden" : ""}`}
              aria-hidden
            />
          </button>
        </div>
        <p className="mt-1.5 px-1 text-[11px] text-muted-foreground">
          Enter to send · Shift+Enter for a new line. The tutor only uses your
          own documents.
        </p>
      </form>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatItem }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-brand-600 px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-white">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex max-w-[92%] items-start gap-2">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300">
          <BookOpen className="h-3.5 w-3.5" aria-hidden />
        </span>
        <div className="rounded-2xl rounded-tl-sm border border-border bg-muted/40 px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
          {message.content}
        </div>
      </div>

      {message.sources && message.sources.length > 0 && (
        <div className="ml-9 space-y-1.5">
          <p className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            <Quote className="h-3 w-3" aria-hidden />
            Sources
          </p>
          {message.sources.map((source, index) => (
            <details
              key={`${source.document_id}-${source.chunk_index}`}
              className="group rounded-lg border border-border bg-background"
            >
              <summary className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-brand-50 font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate">
                  {source.filename}
                </span>
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                  {Math.round(source.similarity * 100)}% match
                </span>
              </summary>
              <p className="border-t border-border px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
                {source.content.slice(0, 600)}
                {source.content.length > 600 ? "…" : ""}
              </p>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
