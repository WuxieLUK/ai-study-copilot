/**
 * Dependency-free sliding-window rate limiter.
 *
 * Deliberately in-memory: it bounds abuse within a single running instance,
 * which is the right first layer for a serverless app (a shared store such
 * as Redis/Upstash should be added for multi-instance production traffic).
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitDecision = {
  allowed: boolean;
  retryAfterSec: number;
  remaining: number;
};

export function checkRateLimit(
  key: string,
  limit = 20,
  windowMs = 60_000,
): RateLimitDecision {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || now >= current.resetAt) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, retryAfterSec: 0, remaining: limit - 1 };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
      remaining: 0,
    };
  }

  current.count += 1;
  return {
    allowed: true,
    retryAfterSec: 0,
    remaining: limit - current.count,
  };
}

/** Bounded cleanup so a long-lived process does not grow forever. */
export function pruneExpiredRateLimitBuckets(now = Date.now()): number {
  let pruned = 0;
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) {
      buckets.delete(key);
      pruned += 1;
    }
  }
  return pruned;
}

export function clientKeyFromRequest(
  request: { headers: Headers },
  fallback = "anonymous",
): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim();
  return ip && ip.length > 0 ? ip : fallback;
}
