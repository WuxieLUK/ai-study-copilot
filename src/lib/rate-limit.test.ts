import { describe, expect, it, vi } from "vitest";

import {
  checkRateLimit,
  clientKeyFromRequest,
  pruneExpiredRateLimitBuckets,
} from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  it("allows requests up to the limit", () => {
    const key = `key-a-${Math.random()}`;
    for (let i = 0; i < 3; i += 1) {
      const decision = checkRateLimit(key, 3, 10_000);
      expect(decision.allowed).toBe(true);
      expect(decision.remaining).toBe(2 - i);
    }
  });

  it("rejects requests beyond the limit", () => {
    const key = `key-b-${Math.random()}`;
    checkRateLimit(key, 1, 10_000);
    const decision = checkRateLimit(key, 1, 10_000);
    expect(decision.allowed).toBe(false);
    expect(decision.retryAfterSec).toBeGreaterThan(0);
  });

  it("resets after the window elapses", () => {
    const key = `key-c-${Math.random()}`;
    vi.useFakeTimers();
    try {
      vi.setSystemTime(1_000);
      expect(checkRateLimit(key, 1, 10_000).allowed).toBe(true);
      vi.setSystemTime(12_000);
      expect(checkRateLimit(key, 1, 10_000).allowed).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("clientKeyFromRequest", () => {
  it("uses the first forwarded IP", () => {
    const request = {
      headers: new Headers({ "x-forwarded-for": "203.0.113.5, 10.0.0.1" }),
    };
    expect(clientKeyFromRequest(request)).toBe("203.0.113.5");
  });

  it("falls back when no IP is present", () => {
    expect(clientKeyFromRequest({ headers: new Headers() }, "local")).toBe(
      "local",
    );
  });
});

describe("pruneExpiredRateLimitBuckets", () => {
  it("removes expired buckets", () => {
    const key = `key-d-${Math.random()}`;
    checkRateLimit(key, 1, 10);
    expect(pruneExpiredRateLimitBuckets(Date.now() + 100)).toBeGreaterThan(0);
  });
});
