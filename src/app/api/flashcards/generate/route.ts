import { type NextRequest } from "next/server";

import { ApiError, jsonError, readJsonBody, requestId } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/session";
import {
  FlashcardsNoContentError,
  FlashcardsNotConfiguredError,
  generateFlashcards,
} from "@/lib/flashcards/generate";
import { checkRateLimit } from "@/lib/rate-limit";

/** POST /api/flashcards/generate — creates a spaced-repetition card deck. */
export async function POST(request: NextRequest) {
  const reqId = requestId(request.headers);

  const user = await getCurrentUser();
  if (!user) {
    return jsonError(new ApiError(401, "Authentication required.", "unauthenticated"), reqId);
  }

  const limit = checkRateLimit(`flashcards:${user.id}`, 10, 5 * 60_000);
  if (!limit.allowed) {
    return jsonError(
      new ApiError(
        429,
        `Too many requests. Try again in ${limit.retryAfterSec}s.`,
        "rate_limited",
      ),
      reqId,
    );
  }

  try {
    const body = await readJsonBody(request);
    const count =
      typeof body.count === "number" && Number.isFinite(body.count)
        ? Math.floor(body.count)
        : undefined;
    const documentIds = Array.isArray(body.documentIds)
      ? body.documentIds.filter((id): id is string => typeof id === "string")
      : undefined;

    const deck = await generateFlashcards(user.id, { documentIds, count });
    return Response.json(deck);
  } catch (error) {
    if (error instanceof FlashcardsNotConfiguredError) {
      return jsonError(new ApiError(503, error.message, "not_configured"), reqId);
    }
    if (error instanceof FlashcardsNoContentError) {
      return jsonError(new ApiError(422, error.message, "no_content"), reqId);
    }
    return jsonError(error, reqId);
  }
}
