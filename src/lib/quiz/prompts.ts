/** Pure prompt builders for the quiz generator and short-answer grader. */

export const QUIZ_JSON_SCHEMA_HINT = `Return ONLY valid JSON with no markdown fences. Shape:
{
  "title": string,
  "questions": [
    {
      "type": "multiple_choice" | "true_false" | "short_answer",
      "topic": "short topic label, e.g. 'Backpropagation'",
      "question": string,
      "options": ["...", "..."] (only for multiple_choice, 4 options),
      "correctIndex": number (only for multiple_choice, index into options),
      "correctBool": boolean (only for true_false),
      "rubric": "what a full-credit answer must mention" (only for short_answer),
      "explanation": "short explanation of the answer"
    }
  ]
}`;

export function buildQuizGenerationPrompt(
  context: string,
  questionCount: number,
): string {
  return `You are a teaching assistant. Create a short, high-quality quiz from the student's course material below to help them test their understanding.

Requirements:
- ${questionCount} questions total, mixing types: prefer 2-3 multiple_choice, some true_false, and up to 1-2 short_answer (all ${questionCount} must be present).
- Questions must be answerable from the material; vary difficulty; avoid trivia.
- Every question carries a concise "topic" (a concept label) and a short "explanation".
- ${QUIZ_JSON_SCHEMA_HINT}

Course material:
${context.slice(0, 20000)}`;
}

export function buildShortAnswerGradingPrompt(
  question: string,
  rubric: string,
  studentAnswer: string,
): string {
  return `Grade this short-answer response as a fair tutor.

Question: ${question}

What a full-credit answer should cover:
${rubric}

Student's answer:
${studentAnswer}

Return ONLY JSON: {"score": 0.0..1.0, "feedback": "one or two sentences explaining the grade and what to improve"}.
Be strict but fair: award 1.0 only if the main points are present.`;
}
