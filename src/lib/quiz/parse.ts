import {
  QUESTION_TYPES,
  type QuestionType,
  type QuizDraft,
  type QuizQuestion,
} from "@/lib/quiz/types";

export class QuizParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuizParseError";
  }
}

const TYPE_SET = new Set<string>(QUESTION_TYPES);

function requireString(value: unknown, field: string, index: number): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new QuizParseError(`Question ${index + 1}: ${field} is missing.`);
  }
  return value.trim();
}

function parseQuestion(raw: unknown, index: number): QuizQuestion {
  if (!raw || typeof raw !== "object") {
    throw new QuizParseError(`Question ${index + 1} is not an object.`);
  }
  const item = raw as Record<string, unknown>;

  const type = item.type;
  if (typeof type !== "string" || !TYPE_SET.has(type)) {
    throw new QuizParseError(`Question ${index + 1} has an unknown type.`);
  }
  const qType = type as QuestionType;

  const question = requireString(item.question, "question", index);
  const topic = requireString(item.topic, "topic", index);
  const explanation =
    typeof item.explanation === "string" ? item.explanation.trim() : "";

  const base: QuizQuestion = {
    id: `q${index + 1}`,
    type: qType,
    topic,
    question,
    explanation,
  };

  if (qType === "multiple_choice") {
    if (!Array.isArray(item.options) || item.options.length < 2 || item.options.length > 6) {
      throw new QuizParseError(
        `Question ${index + 1}: multiple_choice needs 2-6 options.`,
      );
    }
    const options = item.options.map((option) =>
      typeof option === "string" ? option.trim() : "",
    );
    if (options.some((option) => !option) || new Set(options).size !== options.length) {
      throw new QuizParseError(
        `Question ${index + 1}: options must be non-empty and unique.`,
      );
    }
    const correctIndex = item.correctIndex;
    if (
      typeof correctIndex !== "number" ||
      !Number.isInteger(correctIndex) ||
      correctIndex < 0 ||
      correctIndex >= options.length
    ) {
      throw new QuizParseError(
        `Question ${index + 1}: correctIndex is out of range.`,
      );
    }
    return { ...base, options, correctIndex };
  }

  if (qType === "true_false") {
    if (typeof item.correctBool !== "boolean") {
      throw new QuizParseError(
        `Question ${index + 1}: true_false needs a boolean correctBool.`,
      );
    }
    return { ...base, correctBool: item.correctBool };
  }

  // short_answer
  const rubric =
    typeof item.rubric === "string" ? item.rubric.trim() : "";
  if (!rubric) {
    throw new QuizParseError(
      `Question ${index + 1}: short_answer needs a rubric.`,
    );
  }
  return { ...base, rubric };
}

/** Validates and normalizes an LLM quiz-generation response. */
export function parseGeneratedQuiz(raw: unknown): QuizDraft {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new QuizParseError("Quiz response is not an object.");
  }
  const root = raw as { title?: unknown; questions?: unknown };
  if (!Array.isArray(root.questions) || root.questions.length === 0) {
    throw new QuizParseError("Quiz contains no questions.");
  }

  const questions = root.questions.map(parseQuestion);
  const title =
    typeof root.title === "string" && root.title.trim()
      ? root.title.trim()
      : "Generated quiz";

  return { title, questions };
}
