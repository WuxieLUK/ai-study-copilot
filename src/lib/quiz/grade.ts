import "server-only";

import OpenAI from "openai";

import { aggregateWeakTopics } from "@/lib/quiz/aggregate";
import { buildShortAnswerGradingPrompt } from "@/lib/quiz/prompts";
import {
  computeWeightedScorePct,
  isCorrectBool,
  isCorrectSelection,
} from "@/lib/quiz/score";
import type {
  GradedQuestion,
  QuizAnswerInput,
  QuizQuestion,
  QuizResult,
} from "@/lib/quiz/types";
import { envServer } from "@/lib/env/server";
import { createClient } from "@/lib/supabase/server";

export class QuizNotConfiguredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuizNotConfiguredError";
  }
}

export class GradeInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GradeInputError";
  }
}

type GradeShortAnswerInput = {
  question: string;
  rubric: string;
  answer: string;
};

async function gradeShortAnswer(
  item: GradeShortAnswerInput,
): Promise<{ score: number; feedback: string }> {
  const client = new OpenAI({ apiKey: envServer.openaiApiKey });
  const completion = await client.chat.completions.create({
    model: envServer.openaiChatModel,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "user", content: buildShortAnswerGradingPrompt(item.question, item.rubric, item.answer) },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  try {
    const parsed = JSON.parse(raw) as { score?: unknown; feedback?: unknown };
    const score = Math.min(1, Math.max(0, Number(parsed.score) || 0));
    const feedback =
      typeof parsed.feedback === "string" ? parsed.feedback : "";
    return { score, feedback };
  } catch {
    return { score: 0, feedback: "Could not grade this answer automatically." };
  }
}

function correctAnswerText(question: QuizQuestion): string | undefined {
  if (question.type === "multiple_choice") {
    return question.options?.[question.correctIndex ?? -1];
  }
  if (question.type === "true_false") {
    return question.correctBool ? "True" : "False";
  }
  return undefined;
}

export type GradeQuizInput = {
  title: string;
  documentIds: string[];
  questions: QuizQuestion[];
  answers: QuizAnswerInput[];
};

/**
 * Grades a completed quiz: deterministic for multiple_choice / true_false,
 * LLM-graded short answers, then persists a quiz_sessions row.
 */
export async function gradeQuiz(
  userId: string,
  input: GradeQuizInput,
): Promise<QuizResult & { sessionId: string }> {
  if (!envServer.openaiApiKey) {
    throw new QuizNotConfiguredError(
      "OPENAI_API_KEY is not configured. Add it to your environment to grade quizzes.",
    );
  }

  const questions = input.questions;
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new GradeInputError("No questions to grade.");
  }

  const graded: GradedQuestion[] = [];
  for (const question of questions) {
    const answer = input.answers.find((a) => a.questionId === question.id);

    if (question.type === "multiple_choice") {
      const correct = isCorrectSelection(
        question.correctIndex ?? -1,
        answer?.selectedIndex,
      );
      graded.push({
        ...question,
        correct,
        score: correct ? 1 : 0,
        correctAnswerText: correctAnswerText(question),
      });
      continue;
    }

    if (question.type === "true_false") {
      const correct = isCorrectBool(
        question.correctBool ?? false,
        answer?.selectedBool,
      );
      graded.push({
        ...question,
        correct,
        score: correct ? 1 : 0,
        correctAnswerText: correctAnswerText(question),
      });
      continue;
    }

    // short_answer
    const text = (answer?.text ?? "").trim();
    if (text.length < 3) {
      graded.push({
        ...question,
        correct: false,
        score: 0,
        feedback: "No answer was provided.",
      });
      continue;
    }
    const { score, feedback } = await gradeShortAnswer({
      question: question.question,
      rubric: question.rubric ?? "",
      answer: text,
    });
    graded.push({
      ...question,
      correct: score >= 0.5,
      score,
      feedback,
    });
  }

  const correctCount = graded.filter((q) => q.correct).length;
  const weightedPct = computeWeightedScorePct(
    graded.reduce((sum, q) => sum + q.score, 0),
    graded.length,
  );
  const weakTopics = aggregateWeakTopics(graded);

  const responses = graded.map((q) => ({
    questionId: q.id,
    type: q.type,
    topic: q.topic,
    question: q.question,
    correct: q.correct,
    score: q.score,
    explanation: q.explanation,
    correctAnswerText: q.correctAnswerText ?? null,
    feedback: q.feedback ?? null,
  }));

  const supabase = await createClient();
  const { data: session, error } = await supabase
    .from("quiz_sessions")
    .insert({
      user_id: userId,
      document_ids: input.documentIds,
      title: input.title,
      question_count: graded.length,
      correct_count: correctCount,
      score_pct: weightedPct,
      weak_topics: weakTopics,
      responses,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Could not save the quiz result: ${error.message}`);
  }

  return {
    title: input.title,
    questionCount: graded.length,
    correctCount,
    scorePct: weightedPct,
    questions: graded,
    weakTopics,
    sessionId: (session?.id as string) ?? "",
  };
}
