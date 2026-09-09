import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import {
  GradeInputError,
  QuizNotConfiguredError,
  gradeQuiz,
  type GradeQuizInput,
} from "@/lib/quiz/grade";

/**
 * POST /api/quiz/grade
 * Body: { title, documentIds, questions, answers }
 * Grades deterministically (+ LLM for short answers), persists the session
 * and returns the full result with per-question feedback and weak topics.
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { message: "Authentication required." },
      { status: 401 },
    );
  }

  let body: {
    title?: unknown;
    documentIds?: unknown;
    questions?: unknown;
    answers?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON body." },
      { status: 400 },
    );
  }

  if (!Array.isArray(body?.questions) || !Array.isArray(body?.answers)) {
    return NextResponse.json(
      { message: "questions and answers arrays are required." },
      { status: 400 },
    );
  }

  try {
    const result = await gradeQuiz(user.id, {
      title:
        typeof body.title === "string" ? body.title.slice(0, 200) : "Quiz",
      documentIds: Array.isArray(body.documentIds)
        ? body.documentIds.filter(
            (id): id is string => typeof id === "string",
          )
        : [],
      questions: body.questions as GradeQuizInput["questions"],
      answers: body.answers as GradeQuizInput["answers"],
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof QuizNotConfiguredError) {
      return NextResponse.json({ message: err.message }, { status: 503 });
    }
    if (err instanceof GradeInputError) {
      return NextResponse.json({ message: err.message }, { status: 400 });
    }
    console.error("[quiz] grade failed:", err);
    return NextResponse.json(
      { message: "Could not grade the quiz right now. Please try again." },
      { status: 500 },
    );
  }
}
