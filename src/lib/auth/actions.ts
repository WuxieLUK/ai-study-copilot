"use server";

import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/env/client";
import { envServer } from "@/lib/env/server";
import { createClient } from "@/lib/supabase/server";
import {
  hasErrors,
  resolveSafeRedirect,
  validateCredentials,
  type CredentialErrors,
} from "@/lib/auth/validators";

export type AuthFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: CredentialErrors;
};

const NOT_CONFIGURED_MESSAGE =
  "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and " +
  "NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment to enable accounts.";

function readCredentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    next: resolveSafeRedirect(String(formData.get("next") ?? "")),
  };
}

export async function login(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const { email, password, next } = readCredentials(formData);

  const fieldErrors = validateCredentials(email, password);
  if (hasErrors(fieldErrors)) {
    return {
      status: "error",
      fieldErrors,
      message: "Please fix the highlighted fields.",
    };
  }

  if (!isSupabaseConfigured) {
    return { status: "error", message: NOT_CONFIGURED_MESSAGE };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  redirect(next);
}

export async function signUp(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const { email, password, next } = readCredentials(formData);

  const fieldErrors = validateCredentials(email, password);
  if (hasErrors(fieldErrors)) {
    return {
      status: "error",
      fieldErrors,
      message: "Please fix the highlighted fields.",
    };
  }

  if (!isSupabaseConfigured) {
    return { status: "error", message: NOT_CONFIGURED_MESSAGE };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${envServer.appUrl}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  // Email confirmation enabled → no session yet, ask the user to verify.
  if (!data.session) {
    return {
      status: "success",
      message:
        "Almost there — we sent a confirmation link to your inbox. " +
        "Click it, then sign in.",
    };
  }

  redirect(next);
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
