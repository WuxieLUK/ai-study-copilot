import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import {
  QuizNoContentError,
  QuizNotConfiguredError,
  generateQuiz,
} from "@/lib/quiz/generate";
import { QuizParseError } from "@/lib/quiz/parse";

/**
 * POST /api/quiz/generate
 * Body: { documentIds?: string[], questionCount?: number }
 * Returns: { title, questions }
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { message: "Authentication required." },
      { status: 401 },
    );
  }

  let body: { documentIds?: unknown; questionCount?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const documentIds =
    Array.isArray(body?.documentIds)
      ? (body.documentIds as unknown[]).filter(
          (id): id is string => typeof id === "string",
        )
      : undefined;
  const questionCount =
    typeof body?.questionCount === "number"
      ? body.questionCount
      : undefined;

  try {
    const quiz = await generateQuiz(user.id, { documentIds, questionCount });
    return NextResponse.json(quiz);
  } catch (err) {
    if (err instanceof QuizNotConfiguredError) {
      return NextResponse.json({ message: err.message }, { status: 503 });
    }
    if (err instanceof QuizNoContentError) {
      return NextResponse.json({ message: err.message }, { status: 422 });
    }
    if (err instanceof QuizParseError) {
      return NextResponse.json(
        { message: "The quiz generator returned an invalid quiz. Try again." },
        { status: 502 },
      );
    }
    console.error("[quiz] generate failed:", err);
    return NextResponse.json(
      { message: "Could not generate a quiz right now. Please try again." },
      { status: 500 },
    );
  }
}
