/**
 * Generates `samples/neural-networks-lecture-notes.pdf` from the Markdown
 * notes in the same folder — a dependency-free multi-page PDF writer, so the
 * upload flow can be exercised with a real PDF. Self-checks the output with
 * pdf-parse before finishing.
 *
 *   node scripts/make-sample-pdf.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const sourcePath = path.join(root, "samples", "neural-networks-lecture-notes.md");
const outputPath = path.join(
  root,
  "samples",
  "neural-networks-lecture-notes.pdf",
);

const LINES_PER_PAGE = 46;
const TOP_Y = 742;
const LINE_HEIGHT = 14.5;
const FONT_SIZE = 11;

/** PDF text uses Latin-1 here, so fold exotic glyphs down to ASCII. */
function toAscii(text) {
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/[^\x20-\x7e]/g, "");
}

function escapePdf(text) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function toLines(markdown) {
  const lines = [];
  for (const raw of markdown.split(/\r?\n/)) {
    const cleaned = toAscii(
      raw.replace(/^#+\s*/, "").replace(/^ {4}/, "  "),
    ).trimEnd();
    if (cleaned.trim() === "") {
      if (lines.length > 0 && lines[lines.length - 1] !== "") lines.push("");
      continue;
    }
    lines.push(cleaned);
  }
  return lines;
}

function paginate(lines) {
  const pages = [];
  for (let i = 0; i < lines.length; i += LINES_PER_PAGE) {
    pages.push(lines.slice(i, i + LINES_PER_PAGE));
  }
  return pages.length > 0 ? pages : [["(empty)"]];
}

/** Builds a valid single-font, multi-page PDF (with a correct xref table). */
function buildPdf(pages) {
  const pageCount = pages.length;
  const pageObjNums = pages.map((_, i) => 3 + i * 2);
  const contentObjNums = pages.map((_, i) => 4 + i * 2);
  const fontObjNum = 3 + pageCount * 2;

  const objects = [];
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] =
    `<< /Type /Pages /Kids [${pageObjNums.map((n) => `${n} 0 R`).join(" ")}] ` +
    `/Count ${pageCount} >>`;

  pages.forEach((lines, index) => {
    const pageNum = pageObjNums[index];
    const contentNum = contentObjNums[index];
    objects[pageNum] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] ` +
      `/Contents ${contentNum} 0 R ` +
      `/Resources << /Font << /F1 ${fontObjNum} 0 R >> >> >>`;

    const stream = lines
      .map(
        (line, lineIndex) =>
          `BT /F1 ${FONT_SIZE} Tf 56 ${(TOP_Y - lineIndex * LINE_HEIGHT).toFixed(1)} Td (${escapePdf(line)}) Tj ET`,
      )
      .join("\n");
    objects[contentNum] =
      `<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n` +
      `${stream}\nendstream`;
  });

  objects[fontObjNum] =
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

  let pdf = "%PDF-1.4\n";
  const offsets = [];
  for (let n = 1; n <= fontObjNum; n += 1) {
    offsets[n] = Buffer.byteLength(pdf, "latin1");
    pdf += `${n} 0 obj\n${objects[n]}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${fontObjNum + 1}\n0000000000 65535 f \n`;
  for (let n = 1; n <= fontObjNum; n += 1) {
    pdf += `${String(offsets[n]).padStart(10, "0")} 00000 n \n`;
  }
  pdf +=
    `trailer\n<< /Size ${fontObjNum + 1} /Root 1 0 R >>\n` +
    `startxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "latin1");
}

const markdown = fs.readFileSync(sourcePath, "utf8");
const pages = paginate(toLines(markdown));
const pdfBuffer = buildPdf(pages);
fs.writeFileSync(outputPath, pdfBuffer);

const { PDFParse } = await import("pdf-parse");
const parser = new PDFParse({ data: new Uint8Array(pdfBuffer) });
const result = await parser.getText();
await parser.destroy();

const probe = ["backpropagation", "cross-entropy", "softmax"];
console.log(
  `[make-sample-pdf] wrote ${path.relative(root, outputPath)} ` +
    `(${pages.length} pages, ${pdfBuffer.length} bytes)`,
);
console.log(
  `[make-sample-pdf] extracted ${result.text.length} chars; ` +
    `probes: ${probe.map((word) => `${word}=${result.text.toLowerCase().includes(word)}`).join(" ")}`,
);
if (!probe.every((word) => result.text.toLowerCase().includes(word))) {
  console.error("[make-sample-pdf] FAILED: extracted text is missing expected terms");
  process.exit(1);
}
console.log("[make-sample-pdf] OK");
