import { describe, expect, it } from "vitest";

import {
  ALLOWED_EXTENSIONS,
  MAX_UPLOAD_BYTES,
  UPLOAD_ERRORS,
  detectFileType,
  sanitizeStorageName,
  validateUploadFile,
} from "@/lib/upload/validate";

describe("detectFileType", () => {
  it("detects supported extensions case-insensitively", () => {
    expect(detectFileType("notes.pdf")).toBe("pdf");
    expect(detectFileType("SLIDES.PDF")).toBe("pdf");
    expect(detectFileType("chapter.md")).toBe("md");
    expect(detectFileType("script.txt")).toBe("txt");
  });

  it("returns null for unsupported or missing extensions", () => {
    expect(detectFileType("notes.docx")).toBeNull();
    expect(detectFileType("notes")).toBeNull();
    expect(detectFileType("notes.")).toBeNull();
    expect(detectFileType(".hidden")).toBeNull();
  });

  it("keeps allowed extensions in sync with the whitelist", () => {
    expect(ALLOWED_EXTENSIONS).toEqual(["pdf", "md", "txt"]);
  });
});

describe("validateUploadFile", () => {
  it("rejects empty / unnamed files", () => {
    expect(validateUploadFile("", 100)).toBe(UPLOAD_ERRORS.NAME);
    expect(validateUploadFile("   ", 100)).toBe(UPLOAD_ERRORS.NAME);
  });

  it("rejects unsupported types", () => {
    expect(validateUploadFile("virus.exe", 100)).toBe(UPLOAD_ERRORS.BAD_TYPE);
    expect(validateUploadFile("notes.docx", 100)).toBe(UPLOAD_ERRORS.BAD_TYPE);
  });

  it("rejects zero-byte files", () => {
    expect(validateUploadFile("empty.pdf", 0)).toBe(UPLOAD_ERRORS.EMPTY);
  });

  it("rejects oversized files at the boundary", () => {
    expect(validateUploadFile("big.pdf", MAX_UPLOAD_BYTES + 1)).toBe(
      UPLOAD_ERRORS.TOO_LARGE,
    );
  });

  it("accepts valid files (at exactly the limit too)", () => {
    expect(validateUploadFile("notes.pdf", 100)).toBeNull();
    expect(validateUploadFile("chapter.md", MAX_UPLOAD_BYTES)).toBeNull();
    expect(validateUploadFile("todo.txt", 42)).toBeNull();
  });
});

describe("sanitizeStorageName", () => {
  it("strips directory components", () => {
    expect(sanitizeStorageName("../../etc/passwd")).toBe("passwd");
    expect(sanitizeStorageName("C:\\Users\\me\\notes.pdf")).toBe("notes.pdf");
    expect(sanitizeStorageName("a/b/c.txt")).toBe("c.txt");
  });

  it("removes control characters", () => {
    expect(sanitizeStorageName("bad\u0000name.pdf")).toBe("badname.pdf");
    expect(sanitizeStorageName("a\nb.txt")).toBe("ab.txt");
  });

  it("falls back when nothing remains", () => {
    expect(sanitizeStorageName("")).toBe("document");
    expect(sanitizeStorageName("/")).toBe("document");
  });

  it("keeps ordinary names intact", () => {
    expect(sanitizeStorageName("Lecture 4 – Neural Nets.pdf")).toBe(
      "Lecture 4 – Neural Nets.pdf",
    );
  });
});
