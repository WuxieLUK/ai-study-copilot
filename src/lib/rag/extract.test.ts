import { describe, expect, it } from "vitest";

import { ExtractError, extractText } from "@/lib/rag/extract";

const encode = (text: string) => new TextEncoder().encode(text);

/** Builds a tiny but structurally valid single-page PDF with correct xref. */
function buildMinimalPdf(line: string): Buffer {
  const content = `BT /F1 18 Tf 72 720 Td (${line.replace(/[\\()]/g, "\\$&")}) Tj ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  objects.forEach((body, i) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, "latin1");
}

describe("extractText (markdown / plain text)", () => {
  it("decodes UTF-8 text", async () => {
    const text = "# Neural Networks\n\nBackpropagation is key.";
    await expect(extractText(encode(text), "md")).resolves.toContain(
      "Backpropagation",
    );
    await expect(extractText(encode("plain 笔记 txt"), "txt")).resolves.toBe(
      "plain 笔记 txt",
    );
  });

  it("throws on empty files", async () => {
    await expect(extractText(encode("   \n"), "txt")).rejects.toThrow(
      ExtractError,
    );
  });
});

describe("extractText (pdf)", () => {
  it("extracts text from a valid PDF", async () => {
    const pdf = buildMinimalPdf("Hello RAG World");
    const text = await extractText(new Uint8Array(pdf), "pdf");
    expect(text).toContain("Hello RAG World");
  });

  it("fails cleanly on garbage bytes", async () => {
    await expect(
      extractText(encode("this is not a pdf at all"), "pdf"),
    ).rejects.toThrow();
  });
});
