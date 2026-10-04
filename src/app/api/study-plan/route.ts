import { type NextRequest } from "next/server";

import { ApiError, jsonError, readJsonBody, requestId } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  StudyPlanNoContentError,
  StudyPlanNotConfiguredError,
  generateStudyPlan,
} from "@/lib/study-plan/generate";

/** POST /api/study-plan — generates a personalized multi-day plan. */
export async function POST(request: NextRequest) {
  const reqId = requestId(request.headers);

  const user = await getCurrentUser();
  if (!user) {
    return jsonError(new ApiError(401, "Authentication required.", "unauthenticated"), reqId);
  }

  const limit = checkRateLimit(`study-plan:${user.id}`, 8, 5 * 60_000);
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
    const days =
      typeof body.days === "number" && Number.isFinite(body.days)
        ? Math.floor(body.days)
        : undefined;
    const goal =
      typeof body.goal === "string" ? body.goal.trim().slice(0, 500) : undefined;
    const documentIds = Array.isArray(body.documentIds)
      ? body.documentIds.filter((id): id is string => typeof id === "string")
      : undefined;

    const plan = await generateStudyPlan(user.id, {
      days,
      goal: goal || undefined,
      documentIds,
    });
    return Response.json(plan);
  } catch (error) {
    if (error instanceof StudyPlanNotConfiguredError) {
      return jsonError(new ApiError(503, error.message, "not_configured"), reqId);
    }
    if (error instanceof StudyPlanNoContentError) {
      return jsonError(new ApiError(422, error.message, "no_content"), reqId);
    }
    return jsonError(error, reqId);
  }
}
