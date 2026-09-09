<div align="center">

# 🎓 AI Study Copilot

**A study companion that turns your course materials into a personal learning system — summaries, quizzes, a RAG-powered tutor, and progress analytics.**

Upload your lecture PDFs / Markdown / notes once. The app extracts and embeds the content into a vector database, then everything else — summaries, an AI tutor that answers **only from your documents with cited sources**, auto-generated quizzes, mistake analysis, and weak-topic recommendations — runs against *your* material.

Not a chat wrapper: a real learning loop (**read → understand → practice → diagnose → improve**).

</div>

---

## ✨ Features

| | |
|---|---|
| 🏠 **Landing page** | Modern SaaS marketing site (hero, features, how-it-works, product demo, CTA), light/dark theme, fully responsive |
| 🔐 **Authentication** | Supabase Auth email/password — sign up, log in, log out, email confirmation, session guard (Next 16 `proxy`) |
| 📊 **Dashboard** | Recent documents, knowledge-base readiness, quiz scores + average, personalized weak-topic review queue, quick actions |
| 📄 **Document upload** | Drag & drop PDF / Markdown / TXT (≤ 10 MB), private storage, per-file processing status (`Queued → Processing → Ready/Failed`) with retry |
| 🧠 **RAG pipeline** | `PDF → text → chunks → embeddings → pgvector`; chunking is paragraph-aware with overlap; HNSW cosine index; idempotent re-indexing |
| 💬 **AI Tutor** | Ask questions in natural language; answers are grounded in your documents via semantic search and **every claim cites the source passage** (`[1]`, `[2]`, … with similarity % and expandable excerpts) |
| 📝 **Quiz generator** | MCQ / True-False / Short-Answer generated from your documents; deterministic grading + AI-graded short answers; per-question explanations |
| 📈 **Study Insights** | Cross-quiz topic analytics — strong vs. weak topics with accuracy bars, score history, and a personalized "review these" queue |

## 🏗️ Architecture

```
Browser (Next.js App Router)
 ├─ Marketing  (marketing)     ── landing, public
 ├─ Auth       (auth)          ── /login /signup /auth/callback
 ├─ App        (dashboard)     ── /dashboard /documents /tutor /quiz /insights
 └─ Proxy (src/proxy.ts)       ── session guard + token refresh

Server (Next.js route handlers / server actions)
 ├─ POST /api/documents/[id]/process   RAG pipeline
 ├─ POST /api/tutor                    grounded Q&A
 ├─ POST /api/quiz/generate | /grade   quiz generation & grading
 └─ lib/*                              pure logic, fully unit-tested

Supabase (Postgres + pgvector + Storage + Auth)
 └─ RLS everywhere: users can only touch their own rows/objects
```

### Data flow

```
 Upload → Storage (private bucket, key = <user_id>/<uuid>-<name>)
        → documents row (status: pending)
        → POST /process:
             download → extract text (pdf-parse / UTF-8)
                      → chunk (paragraph-aware, ~1400 chars, 150 overlap)
                      → embed (text-embedding-3-small, 1536-d)
                      → upsert document_chunks (HNSW) → status ready

 Ask tutor / generate quiz
        → embed question → match_documents (cosine top-k, RLS-scoped)
        → LLM answer strictly from excerpts, [n] citations
        → quiz answers graded → quiz_sessions (jsonb responses) → insights
```

## 🧰 Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js **16** (App Router, Turbopack), React 19, TypeScript **strict** |
| Styling | Tailwind CSS **v4** (CSS-first tokens, semantic color system, class-driven dark mode) |
| Auth & DB | Supabase Auth, Postgres, pgvector, Storage |
| AI | OpenAI (`text-embedding-3-small`, chat model) |
| PDF | `pdf-parse` v2 (pure TS, ESM) |
| Icons | lucide-react |
| Tests | Vitest 5 (73 unit tests), ESLint flat config |
| Deploy target | Vercel + hosted Supabase |

## 🧪 RAG Pipeline (detail)

1. **Extraction** — `src/lib/rag/extract.ts` turns PDF bytes into plain text (`pdf-parse` `PDFParse.getText`, lazily imported so it never reaches client bundles) or UTF-8 text for Markdown/TXT.
2. **Chunking** — `src/lib/rag/chunk.ts` is a pure, unit-tested function: greedy paragraph packing; oversized paragraphs are hard-cut with a sliding window that keeps 150 chars of overlap between pieces (default ~1400 chars each).
3. **Embedding** — `src/lib/rag/embed.ts` (server-only) calls OpenAI embeddings.
4. **Storage & search** — chunks live in `document_chunks` with an **HNSW cosine index**; the `match_documents` SQL function (`security invoker` + RLS) returns only the caller's most similar chunks.
5. **Tutor** — the question is embedded, top chunks retrieved (similarity ≥ 0.68), and a system prompt instructs the model to answer *only* from the excerpts, cite `[n]`, and refuse to follow instructions found inside document text (prompt-injection guard). No context → honest fallback instead of hallucination.

## 🗄️ Database Schema (`supabase/migrations/`)

| Migration | Purpose |
|---|---|
| `0001_documents.sql` | `documents` (user-owned, file metadata, storage path, status machine) + RLS |
| `0002_storage_documents.sql` | private `documents` bucket; policies lock every object key to its owner's `<uid>/` folder |
| `0003_document_chunks.sql` | `pgvector` extension, `document_chunks` (embedding `vector(1536)`, HNSW index), RLS via owning document |
| `0004_match_documents.sql` | `match_documents(query_embedding, match_count)` — cosine similarity search |
| `0005_quiz_sessions.sql` | `quiz_sessions` (score, weak_topics, full `responses` jsonb for analytics) + RLS |

Every table enforces **Row Level Security** — a signed-in user can never select/insert/update/delete another user's data, and storage policies mirror the same ownership at the object layer.

## 📁 Project structure

```
ai-study-copilot/
├─ src/
│  ├─ app/                    # routes (route groups: (marketing)/(auth)/(dashboard))
│  │  ├─ api/                 # route handlers (process, tutor, quiz)
│  │  └─ (dashboard)/…        # dashboard, documents, tutor, quiz, insights
│  ├─ components/             # feature + shared UI components
│  ├─ lib/
│  │  ├─ auth/  supabase/     # session helpers, env-split clients
│  │  ├─ rag/                 # extract / chunk / embed / search / process
│  │  ├─ tutor/  quiz/        # pure prompt & grading logic
│  │  ├─ analytics/           # insights aggregation (pure)
│  │  ├─ upload/  utils/      # validation rules, formatting helpers
│  │  └─ env/                 # client-safe vs server-only env access
│  ├─ proxy.ts                # Next 16 auth guard (formerly middleware)
├─ supabase/migrations/       # 0001–0005 (apply with `supabase db push`)
├─ public/                    # static assets (favicon in src/app)
└─ vitest.config.mts
```

## 📸 Screenshots

_To be added before publishing:_ capture the **landing page**, **dashboard**, **documents upload**, **tutor chat with cited sources**, and **quiz results** (local dev run with your own Supabase/OpenAI keys), drop them into e.g. `docs/screenshots/*.png`, and reference them here.

## 🚀 Local Development

### Prerequisites

- Node.js ≥ 20
- A [Supabase](https://supabase.com) project (free tier is fine)
- An [OpenAI](https://platform.openai.com) API key
- (Optional) [Supabase CLI](https://supabase.com/docs/guides/cli)

### 1. Install & configure

```bash
git clone <your-repo-url> && cd ai-study-copilot
npm install
cp .env.example .env.local   # then fill in real values (see below)
```

### 2. Set up the database & storage

**Option A — Supabase CLI (recommended):**

```bash
supabase link --project-ref <your-project-ref>
supabase db push             # runs migrations 0001–0005
```

**Option B — SQL editor:** open your Supabase project → SQL Editor and run the five files in `supabase/migrations/` in order.

Migrations also create the private `documents` bucket and its access policies (0002) automatically.

### 3. Run

```bash
npm run dev     # http://localhost:3000
```

Sign up, upload a PDF (or `.md`/`.txt`), wait for the **Ready** badge, then try the tutor or generate a quiz. Failures show the reason and can be retried from the documents list.

> **Without API keys the app still runs** — the landing page and auth screens render, and protected screens show a clear "not configured" state instead of crashing. Type-checking, linting and all unit tests pass with an empty `.env.local`.

## 🔑 Environment Variables

All values live server-side unless prefixed `NEXT_PUBLIC_` (browser-safe). Secrets never reach the client — importing `src/lib/env/server` from client code fails at build time (`server-only`).

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ (auth) | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ (auth) | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | optional | reserved for admin tasks (never in client) |
| `DATABASE_URL` | optional | direct Postgres URL (migrations/admin) |
| `OPENAI_API_KEY` | ✅ (AI) | embeddings + chat |
| `OPENAI_EMBEDDING_MODEL` | optional | default `text-embedding-3-small` |
| `OPENAI_CHAT_MODEL` | optional | default `gpt-4o-mini` |
| `APP_URL` | optional | canonical origin (auth redirects) |

## ✅ Testing & quality

```bash
npm test        # 73 unit tests (validators, upload rules, chunking, PDF extraction,
                # tutor formatting, quiz parsing/grading, analytics, time/bytes)
npm run lint    # ESLint (flat config, TS + react-hooks)
npx tsc --noEmit
npm run build
```

Highlights: pure business logic (validation, chunking, quiz JSON parsing, deterministic grading, weak-topic aggregation) lives in side-effect-free modules with unit tests; LLM output is parsed defensively before it reaches the DB.

## 🔒 Security notes

- **RLS end-to-end** — rows and storage objects are owner-scoped; the vector search function runs as the caller (`security invoker`).
- **Server-side secrets only** — `server-only` modules; the anon key is the only client credential.
- **Safe uploads** — extension whitelist, 10 MB cap, filename sanitization, unique storage keys; orphaned objects are rolled back on failure.
- **Open-redirect guard** — `next` params validated to same-origin paths only.
- **Prompt-injection guard** — document text is treated as untrusted data, never instructions.

## 🚢 Deployment (Vercel)

1. Push to GitHub → import in Vercel (framework preset Next.js).
2. Add the environment variables from the table above (build & runtime).
3. Run migrations against your hosted Supabase project (CLI `supabase db push` or SQL editor).
4. Whitelist your Vercel domain in Supabase Auth → URL configuration (redirect URLs).

## 🧭 Future improvements

- Background job/queue for processing large documents (longer than a serverless function run)
- Streaming tutor answers + persisted chat history per document
- More file types: DOCX, PPTX, images with OCR, EPUB
- Document-level summaries & spaced-repetition scheduling
- Richer analytics (trend sparkline, topic mastery over time)
- Rate limiting & team/shared workspaces

---

**AI Study Copilot** — built with Next.js 16, Supabase, pgvector and OpenAI.
