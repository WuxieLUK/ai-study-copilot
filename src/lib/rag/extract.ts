import type { DocumentFileType } from "@/lib/db/types";

/**
 * Raw document → plain text extraction.
 * Shared, side-effect-free module (no secrets) so unit tests can import it.
 * pdf-parse is loaded lazily to keep it out of client bundles.
 */

export class ExtractError extends Error {}

export async function extractText(
  content: Uint8Array,
  fileType: DocumentFileType,
): Promise<string> {
  if (fileType === "pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: content });
    try {
      const result = await parser.getText();
      const text = result.text ?? "";
      if (!text.trim()) {
        throw new ExtractError(
          "No text could be extracted — this may be a scanned PDF.",
        );
      }
      return text;
    } finally {
      await parser.destroy().catch(() => {
        /* best-effort worker teardown */
      });
    }
  }

  const text = new TextDecoder("utf-8", { fatal: false }).decode(content);
  if (!text.trim()) {
    throw new ExtractError("The file contains no text.");
  }
  return text;
}
