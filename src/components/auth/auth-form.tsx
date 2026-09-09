"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { login, signUp, type AuthFormState } from "@/lib/auth/actions";

const INITIAL_STATE: AuthFormState = { status: "idle" };

type AuthFormProps = {
  mode: "login" | "signup";
  next: string;
  banner?: string | null;
};

const inputClasses =
  "w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 disabled:opacity-60";
const errorInputClasses =
  "w-full rounded-lg border border-red-500/70 bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-red-500/40 disabled:opacity-60";

export function AuthForm({ mode, next, banner }: AuthFormProps) {
  const isLogin = mode === "login";
  const [state, formAction, isPending] = useActionState(
    isLogin ? login : signUp,
    INITIAL_STATE,
  );

  const emailError = state.status === "error" ? state.fieldErrors?.email : null;
  const passwordError =
    state.status === "error" ? state.fieldErrors?.password : null;

  return (
    <div className="space-y-5">
      {(banner || state.status === "error") && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/40 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-300"
        >
          {state.status === "error" ? state.message : banner}
        </div>
      )}

      {state.status === "success" && (
        <div
          role="status"
          className="rounded-lg border border-emerald-500/40 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-4" noValidate>
        <input type="hidden" name="next" value={next} />
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="text-sm font-medium text-foreground"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@university.edu"
            className={emailError ? errorInputClasses : inputClasses}
            aria-invalid={Boolean(emailError)}
          />
          {emailError && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {emailError}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="text-sm font-medium text-foreground"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
            placeholder={isLogin ? "••••••••" : "At least 8 characters"}
            className={passwordError ? errorInputClasses : inputClasses}
            aria-invalid={Boolean(passwordError)}
          />
          {passwordError && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {passwordError}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-70"
        >
          {/*
           * Keep the children structurally stable across the pending toggle:
           * mounting/unmounting the icon while the button becomes `disabled`
           * can race the browser and throw "insertBefore … not a child".
           * The icon stays mounted and is shown/hidden via CSS only.
           */}
          <Loader2
            className={`h-4 w-4 animate-spin ${isPending ? "" : "hidden"}`}
            aria-hidden
          />
          <span>
            {isPending
              ? isLogin
                ? "Signing in…"
                : "Creating account…"
              : isLogin
                ? "Sign in"
                : "Create account"}
          </span>
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {isLogin ? (
          <>
            Don&apos;t have an account?{" "}
            <Link
              href={`/signup${next !== "/dashboard" ? `?next=${encodeURIComponent(next)}` : ""}`}
              className="font-medium text-brand-600 hover:underline dark:text-brand-400"
            >
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link
              href={`/login${next !== "/dashboard" ? `?next=${encodeURIComponent(next)}` : ""}`}
              className="font-medium text-brand-600 hover:underline dark:text-brand-400"
            >
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
