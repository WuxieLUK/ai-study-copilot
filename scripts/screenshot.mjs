/**
 * Captures UI screenshots for the README using a headless browser.
 * Logs into the demo account via the real Supabase session (cookie injection,
 * same encoding @supabase/ssr uses), then screenshots the key pages.
 *
 * Requires a running dev server (npm run dev) and Playwright installed
 * (npm install --no-save playwright && npx playwright install chromium).
 *
 *   node scripts/screenshot.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "docs", "screenshots");

function readEnvFile(file) {
  const env = {};
  if (!fs.existsSync(file)) return env;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (match && !line.trimStart().startsWith("#")) env[match[1]] = match[2].trim();
  }
  return env;
}

function sessionCookie(session, supabaseUrl) {
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

const env = readEnvFile(path.join(root, ".env.local"));
const supabaseUrl = (process.env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const anonKey = process.env.SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const baseUrl = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const email = process.env.EMAIL || "demo.studycopilot@gmail.com";
const password = process.env.PASSWORD || "DemoPass123!";

const log = (...args) => console.log("[shots]", ...args);

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  log("base:", baseUrl, "out:", outDir);

  // Sign in and encode the session as cookies (mirrors @supabase/ssr).
  const signInRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const session = await signInRes.json();
  if (!signInRes.ok || !session.access_token) {
    console.error("[shots] sign-in failed:", signInRes.status, JSON.stringify(session).slice(0, 200));
    process.exit(1);
  }
  const cookies = sessionCookie(session, supabaseUrl).split("; ").map((pair) => {
    const sep = pair.indexOf("=");
    return {
      name: pair.slice(0, sep),
      value: decodeURIComponent(pair.slice(sep + 1)),
      domain: new URL(baseUrl).hostname,
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    };
  });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  await context.addCookies(cookies);
  const page = await context.newPage();

  async function shot(name, url, settleMs) {
    await page.goto(`${baseUrl}${url}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(settleMs);
    const file = path.join(outDir, name);
    await page.screenshot({ path: file });
    log("saved", name);
  }

  await shot("01-landing.png", "/", 1200);
  await shot("02-dashboard.png", "/dashboard", 1500);
  await shot("03-documents.png", "/documents", 1200);
  await shot("04-insights.png", "/insights", 1200);

  // Tutor: ask a real question and wait for the grounded, cited answer.
  await page.goto(`${baseUrl}/tutor`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.fill('textarea[aria-label="Question for the tutor"]', "What is backpropagation?");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(20000); // DeepSeek reasoning + retrieval
  await page.screenshot({ path: path.join(outDir, "05-tutor.png") });
  log("saved 05-tutor.png");

  await shot("06-quiz.png", "/quiz", 1200);

  await browser.close();
  log("DONE");
}

main().catch((err) => {
  console.error("[shots] unexpected error:", err);
  process.exit(1);
});
