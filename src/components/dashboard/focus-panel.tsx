"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Timer } from "lucide-react";

const MODES = [
  { label: "Focus", seconds: 25 * 60 },
  { label: "Short break", seconds: 5 * 60 },
  { label: "Long break", seconds: 15 * 60 },
] as const;

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function FocusPanel() {
  const [modeIndex, setModeIndex] = useState(0);
  const [remaining, setRemaining] = useState(MODES[0].seconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const mode = MODES[modeIndex];
  const progress = 1 - remaining / mode.seconds;

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((current) => {
        const next = Math.max(0, current - 1);
        if (next === 0) setRunning(false);
        return next;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  function chooseMode(index: number) {
    setModeIndex(index);
    setRemaining(MODES[index].seconds);
    setRunning(false);
  }

  function reset() {
    setRemaining(mode.seconds);
    setRunning(false);
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Timer className="h-4 w-4 text-brand-600 dark:text-brand-400" aria-hidden />
          Focus timer
        </div>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Reset timer"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="mt-5 flex items-center justify-center">
        <div className="relative flex h-32 w-32 items-center justify-center">
          <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90">
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="var(--color-border)"
              strokeWidth="6"
            />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="var(--color-brand-500)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress)}`}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <span className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
            {formatTime(remaining)}
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-1 rounded-xl bg-muted/60 p-1">
        {MODES.map((item, index) => (
          <button
            key={item.label}
            type="button"
            onClick={() => chooseMode(index)}
            className={`rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
              modeIndex === index
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setRunning((value) => !value)}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
      >
        {running ? (
          <>
            <Pause className="h-4 w-4" aria-hidden />
            Pause
          </>
        ) : (
          <>
            <Play className="h-4 w-4" aria-hidden />
            Start focus session
          </>
        )}
      </button>
    </div>
  );
}
