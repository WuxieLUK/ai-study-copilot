import { describe, expect, it } from "vitest";

import {
  EMAIL_INVALID,
  EMAIL_REQUIRED,
  PASSWORD_REQUIRED,
  PASSWORD_TOO_SHORT,
  hasErrors,
  resolveSafeRedirect,
  validateCredentials,
  validateEmail,
  validatePassword,
} from "@/lib/auth/validators";

describe("validateEmail", () => {
  it("rejects empty input", () => {
    expect(validateEmail("")).toBe(EMAIL_REQUIRED);
    expect(validateEmail("   ")).toBe(EMAIL_REQUIRED);
  });

  it("rejects malformed addresses", () => {
    expect(validateEmail("not-an-email")).toBe(EMAIL_INVALID);
    expect(validateEmail("a@b")).toBe(EMAIL_INVALID);
    expect(validateEmail("a b@c.com")).toBe(EMAIL_INVALID);
  });

  it("accepts valid addresses and trims whitespace", () => {
    expect(validateEmail("  student@example.com  ")).toBeNull();
    expect(validateEmail("first.last+tag@uni.edu")).toBeNull();
  });
});

describe("validatePassword", () => {
  it("rejects empty password", () => {
    expect(validatePassword("")).toBe(PASSWORD_REQUIRED);
  });

  it("rejects short passwords", () => {
    expect(validatePassword("1234567")).toBe(PASSWORD_TOO_SHORT);
  });

  it("accepts passwords of 8+ characters", () => {
    expect(validatePassword("12345678")).toBeNull();
    expect(validatePassword("correct-horse-battery")).toBeNull();
  });
});

describe("validateCredentials", () => {
  it("collects per-field errors", () => {
    const errors = validateCredentials("", "");
    expect(errors.email).toBe(EMAIL_REQUIRED);
    expect(errors.password).toBe(PASSWORD_REQUIRED);
    expect(hasErrors(errors)).toBe(true);
  });

  it("returns no errors for valid input", () => {
    const errors = validateCredentials("a@b.co", "password123");
    expect(errors).toEqual({});
    expect(hasErrors(errors)).toBe(false);
  });
});

describe("resolveSafeRedirect", () => {
  it("passes through same-origin paths", () => {
    expect(resolveSafeRedirect("/dashboard")).toBe("/dashboard");
    expect(resolveSafeRedirect("/documents/abc?tab=notes")).toBe(
      "/documents/abc?tab=notes",
    );
  });

  it("falls back on missing value", () => {
    expect(resolveSafeRedirect(null)).toBe("/dashboard");
    expect(resolveSafeRedirect(undefined)).toBe("/dashboard");
    expect(resolveSafeRedirect("")).toBe("/dashboard");
  });

  it("blocks open redirects and protocol-relative URLs", () => {
    expect(resolveSafeRedirect("https://evil.example")).toBe("/dashboard");
    expect(resolveSafeRedirect("//evil.example")).toBe("/dashboard");
    expect(resolveSafeRedirect("javascript:alert(1)")).toBe("/dashboard");
  });

  it("honours a custom fallback", () => {
    expect(resolveSafeRedirect(null, "/")).toBe("/");
  });
});
