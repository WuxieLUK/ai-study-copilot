import { describe, expect, it } from "vitest";

import { formatBytes, formatRelativeTime } from "@/lib/utils/format";

const NOW = new Date("2026-09-09T12:00:00Z");

describe("formatRelativeTime", () => {
  it("formats sub-minute as just now", () => {
    expect(formatRelativeTime("2026-09-09T11:59:40Z", NOW)).toBe("just now");
  });

  it("formats minutes and hours", () => {
    expect(formatRelativeTime("2026-09-09T11:55:00Z", NOW)).toBe("5m ago");
    expect(formatRelativeTime("2026-09-09T10:00:00Z", NOW)).toBe("2h ago");
  });

  it("formats days under a week", () => {
    expect(formatRelativeTime("2026-09-07T12:00:00Z", NOW)).toBe("2d ago");
  });

  it("falls back to a short date beyond a week", () => {
    expect(formatRelativeTime("2026-08-20T12:00:00Z", NOW)).toBe("Aug 20");
  });

  it("includes the year when the date is in a different year", () => {
    expect(formatRelativeTime("2025-12-31T12:00:00Z", NOW)).toBe(
      "Dec 31, 2025",
    );
  });

  it("returns empty string for invalid input", () => {
    expect(formatRelativeTime("not-a-date", NOW)).toBe("");
  });
});

describe("formatBytes", () => {
  it("handles bytes and units", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(1_048_576)).toBe("1 MB");
    expect(formatBytes(5_368_709_120)).toBe("5 GB");
  });

  it("handles invalid input", () => {
    expect(formatBytes(Number.NaN)).toBe("0 B");
    expect(formatBytes(-10)).toBe("0 B");
  });
});
