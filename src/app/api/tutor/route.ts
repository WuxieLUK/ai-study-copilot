import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/env/client";
import {
  TutorNotConfiguredError,
  answerQuestion,
} from "@/lib/tutor/answer";
import { sanitizeQuestion } from "@/lib/tutor/format";

/**
 * POST /api/tutor
 * Body: { question: string, history?: { role, content }[] }
 * Returns: { answer, grounded, sources }
 */
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { message: "Supabase is not configured." },
      { status: 503 },
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { message: "Authentication required." },
      { status: 401 },
    );
  }

  let body: { question?: unknown; history?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const question =
    typeof body?.question === "string" ? body.question : "";
  if (!sanitizeQuestion(question)) {
    return NextResponse.json(
      { message: "Question is required." },
      { status: 400 },
    );
  }

  try {
    const result = await answerQuestion(question, body?.history);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof TutorNotConfiguredError) {
      return NextResponse.json(
        { message: err.message },
        { status: 503 },
      );
    }
    console.error("[tutor] answerQuestion failed:", err);
    return NextResponse.json(
      { message: "The tutor could not answer right now. Please try again." },
      { status: 500 },
    );
  }
}
