/**
 * End-to-end smoke test against a RUNNING server + a real Supabase project.
 *
 * Signs in with email/password, uploads a sample document to Supabase Storage,
 * inserts the `documents` row, triggers the RAG pipeline through
 * `POST /api/documents/:id/process` (authenticated with the same session
 * cookies the browser would send), then waits for the document to become
 * `ready`. With --tutor it additionally asks the grounded tutor a question,
 * with --quiz it generates a small quiz, submits answers and grades it.
 * Cleans up after itself unless --keep is passed.
 *
 *   node scripts/e2e-smoke.mjs
 *   node scripts/e2e-smoke.mjs --tutor --quiz
 *   EMAIL=you@example.com PASSWORD=... node scripts/e2e-smoke.mjs --keep
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

function readEnvFile(file) {
  const env = {};
  if (!fs.existsSync(file)) return env;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (match && !line.trimStart().startsWith("#")) env[match[1]] = match[2].trim();
  }
  return env;
}

const env = readEnvFile(path.join(root, ".env.local"));
const supabaseUrl = (process.env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const anonKey = process.env.SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const baseUrl = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const email = process.env.EMAIL || "demo.studycopilot@gmail.com";
const password = process.env.PASSWORD || "DemoPass123!";
const keep = process.argv.includes("--keep");
const samplePath =
  process.env.SAMPLE || path.join(root, "samples", "neural-networks-lecture-notes.pdf");

if (!supabaseUrl || !anonKey) {
  console.error("[e2e] missing NEXT_PUBLIC_SUPABASE_URL / ANON_KEY (check .env.local)");
  process.exit(1);
}

const log = (...args) => console.log("[e2e]", ...args);

/** Mirrors @supabase/ssr's base64url cookie encoding (incl. chunking). */
function sessionCookie(session) {
  const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
  const key = `sb-${projectRef}-auth-token`;
  const encoded = "base64-" + Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
  const MAX_CHUNK = 3180;
  if (encodeURIComponent(encoded).length <= MAX_CHUNK) {
    return `${key}=${encodeURIComponent(encoded)}`;
  }
  const parts = [];
  let rest = encoded;
  let index = 0;
  while (rest.length > 0) {
    let head = rest.slice(0, MAX_CHUNK);
    if (head.length === MAX_CHUNK && head.includes("%")) {
      const cut = head.lastIndexOf("%");
      if (cut > MAX_CHUNK - 3) head = head.slice(0, cut);
    }
    parts.push(`${key}.${index}=${encodeURIComponent(head)}`);
    rest = rest.slice(head.length);
    index += 1;
  }
  return parts.join("; ");
}

async function main() {
  log("server:", baseUrl, "| supabase:", supabaseUrl);

  // 1. sign in
  const signInRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const session = await signInRes.json();
  if (!signInRes.ok || !session.access_token) {
    console.error("[e2e] sign-in failed:", signInRes.status, JSON.stringify(session).slice(0, 200));
    process.exit(1);
  }
  const userId = session.user.id;
  log(`signed in as ${email} (uid ${userId})`);

  const authHeaders = {
    apikey: anonKey,
    Authorization: `Bearer ${session.access_token}`,
  };
  const cookie = sessionCookie(session);

  // 2. upload the sample file
  const bytes = fs.readFileSync(samplePath);
  const storagePath = `${userId}/${Date.now()}-${path.basename(samplePath)}`;
  const uploadRes = await fetch(
    `${supabaseUrl}/storage/v1/object/documents/${storagePath}`,
    {
      method: "POST",
      headers: {
        ...authHeaders,
        "Content-Type": "application/octet-stream",
        "x-upsert": "true",
      },
      body: bytes,
    },
  );
  if (!uploadRes.ok) {
    console.error("[e2e] storage upload failed:", uploadRes.status, await uploadRes.text());
    process.exit(1);
  }
  log(`uploaded ${path.basename(samplePath)} (${bytes.length} bytes)`);

  // 3. insert the documents row
  const insertRes = await fetch(`${supabaseUrl}/rest/v1/documents`, {
    method: "POST",
    headers: { ...authHeaders, "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify({
      user_id: userId,
      filename: path.basename(samplePath),
      storage_path: storagePath,
      file_type: "pdf",
      size_bytes: bytes.length,
      status: "pending",
    }),
  });
  const inserted = await insertRes.json();
  const documentId = Array.isArray(inserted) ? inserted[0]?.id : inserted?.id;
  if (!insertRes.ok || !documentId) {
    console.error("[e2e] insert failed:", insertRes.status, JSON.stringify(inserted).slice(0, 300));
    process.exit(1);
  }
  log("created document", documentId);

  // 4. trigger the RAG pipeline through the app's API (cookie-authenticated)
  const startedAt = Date.now();
  const processRes = await fetch(`${baseUrl}/api/documents/${documentId}/process`, {
    method: "POST",
    headers: { Cookie: cookie },
  });
  const outcome = await processRes.json().catch(() => ({}));
  log(
    `process → HTTP ${processRes.status} in ${Date.now() - startedAt} ms:`,
    JSON.stringify(outcome),
  );

  // 5. read the stored status
  const statusRes = await fetch(
    `${supabaseUrl}/rest/v1/documents?id=eq.${documentId}&select=status,error`,
    { headers: authHeaders },
  );
  const rows = await statusRes.json();
  log("document row:", JSON.stringify(rows?.[0] ?? null));

  // 5b. optional: verify the grounded tutor (retrieval + chat provider)
  let tutorOk = true;
  if (process.argv.includes("--tutor")) {
    const tutorRes = await fetch(`${baseUrl}/api/tutor`, {
      method: "POST",
      headers: { Cookie: cookie, "Content-Type": "application/json" },
      body: JSON.stringify({ question: "What is backpropagation?" }),
    });
    const tutor = await tutorRes.json().catch(() => ({}));
    const sourceCount = Array.isArray(tutor.sources) ? tutor.sources.length : 0;
    tutorOk = tutorRes.ok && sourceCount > 0;
    log(
      `tutor → HTTP ${tutorRes.status} | grounded=${tutor.grounded} | sources=${sourceCount}`,
    );
    log(
      "tutor answer:",
      String(tutor.answer ?? tutor.message ?? "")
        .replace(/\s+/g, " ")
        .slice(0, 240),
    );
  }

  // 5c. optional: verify quiz generation + grading
  let quizOk = true;
  let quizSessionId = "";
  if (process.argv.includes("--quiz")) {
    const genRes = await fetch(`${baseUrl}/api/quiz/generate`, {
      method: "POST",
      headers: { Cookie: cookie, "Content-Type": "application/json" },
      body: JSON.stringify({ documentIds: [documentId], questionCount: 3 }),
    });
    const draft = await genRes.json().catch(() => ({}));
    const questions = Array.isArray(draft.questions) ? draft.questions : [];
    log(`quiz generate → HTTP ${genRes.status} | questions=${questions.length}`);

    if (genRes.ok && questions.length > 0) {
      const answers = questions.map((q) => ({
        questionId: q.id,
        selectedIndex: q.type === "multiple_choice" ? 0 : null,
        selectedBool: q.type === "true_false" ? true : null,
        text: q.type === "short_answer" ? "Gradients are computed with the chain rule." : null,
      }));
      const gradeRes = await fetch(`${baseUrl}/api/quiz/grade`, {
        method: "POST",
        headers: { Cookie: cookie, "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draft.title,
          documentIds: [documentId],
          questions,
          answers,
        }),
      });
      const result = await gradeRes.json().catch(() => ({}));
      quizSessionId = result.sessionId ?? "";
      quizOk = gradeRes.ok && typeof result.scorePct === "number";
      log(
        `quiz grade → HTTP ${gradeRes.status} | score=${result.scorePct}% | correct=${result.correctCount}/${result.questionCount} | weak=${JSON.stringify(result.weakTopics ?? [])}`,
      );
    } else {
      quizOk = false;
    }
  }

  if (!keep) {
    await fetch(`${supabaseUrl}/rest/v1/documents?id=eq.${documentId}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    await fetch(`${supabaseUrl}/storage/v1/object/documents/${storagePath}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    if (quizSessionId) {
      await fetch(`${supabaseUrl}/rest/v1/quiz_sessions?id=eq.${quizSessionId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
    }
    log("cleaned up (row + object + quiz session)");
  }

  const ok = processRes.ok && rows?.[0]?.status === "ready" && tutorOk && quizOk;
  log(ok ? "RESULT: PASS ✅" : "RESULT: FAIL ❌");
  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error("[e2e] unexpected error:", err);
  process.exit(1);
});
