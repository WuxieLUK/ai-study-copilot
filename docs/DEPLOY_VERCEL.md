# Deploying AI Study Copilot to Vercel

Production hosting guide. Requires a GitHub repo, a Vercel account, your
Supabase project (already set up), and a chat API key.

## ⚠️ Read this first: embeddings on serverless

The app's **default embeddings run locally** (transformers.js). That is great
for local demos, but a bad fit for Vercel's serverless functions:

- `@huggingface/transformers` + `onnxruntime-node` + `sharp` inflate the
  function bundle (Vercel limit ~250 MB unpacked).
- The model (~30–60 MB) would be downloaded into `/tmp` on **every cold
  start**, adding tens of seconds to the first request and risking timeouts.

**Recommended for production:** use a hosted, OpenAI-compatible embeddings
API instead (e.g. SiliconFlow `BAAI/bge-m3`, 1024-dim, has a free tier) and
tell the app about it via env:

```bash
AI_EMBEDDING_API_KEY=sk-...
AI_EMBEDDING_BASE_URL=https://api.siliconflow.cn/v1
AI_EMBEDDING_MODEL=BAAI/bge-m3
AI_EMBEDDING_DIM=1024
```

> ⚠️ `AI_EMBEDDING_DIM` must match the `vector(...)` dimension in the
> migrations. The shipped schema uses **384** (local model). To switch to a
> hosted 1024-dim model, run in Supabase SQL editor (for a fresh database; an
> existing one needs `drop table document_chunks;` first, then re-run the
> migrations):

```sql
-- only if you already created tables with 384-dim vectors
drop table if exists public.document_chunks cascade;
```

then re-apply `supabase/setup.sql` (its `vector(384)` → change to `vector(1024)`
before running if you go the 1024-dim route).

If you accept slow cold starts, you can keep local embeddings on Vercel
(`HF_ENDPOINT=https://hf-mirror.com`), but the hosted option is far more
reliable.

## Environment variables (set for Build + Runtime)

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key |
| `AI_CHAT_API_KEY` | DeepSeek key (`sk-...`) |
| `AI_CHAT_BASE_URL` | `https://api.deepseek.com` |
| `AI_CHAT_MODEL` | `deepseek-flash` |
| `AI_EMBEDDING_API_KEY` | only if using a hosted embeddings API |
| `AI_EMBEDDING_BASE_URL` | only if using a hosted embeddings API |
| `AI_EMBEDDING_MODEL` | e.g. `BAAI/bge-m3` (hosted) or `Xenova/multilingual-e5-small` (local) |
| `AI_EMBEDDING_DIM` | must match the `vector(...)` in the DB (384 default) |
| `HF_ENDPOINT` | `https://hf-mirror.com` when keeping local embeddings |
| `APP_URL` | your Vercel domain, e.g. `https://yourapp.vercel.app` |

## Steps

1. Push the repo to GitHub (remember: `.env.local` is git-ignored — never push
   secrets).
2. **Vercel → Add New Project → Import** the repo (Framework preset: Next.js).
3. Add the environment variables above (both **Build** and **Runtime**).
4. **Deploy.** `next build` is already verified to succeed with
   `serverExternalPackages` (pdf-parse, pdfjs-dist, transformers, …).
5. In **Supabase → Authentication → URL Configuration**:
   - add your Vercel domain to the redirect allowlist
   - for a demo, keep **Confirm email** OFF (built-in mailer only reaches
     project members)
6. Verify: open the deployed URL, log in with a fresh account, upload a
   sample from `samples/`, watch it become **Ready**, then try the tutor and
   quiz.
7. Sanity-check the pipeline remotely (needs a deployed URL):
   `BASE_URL=https://yourapp.vercel.app node scripts/e2e-smoke.mjs --tutor --quiz`

## Troubleshooting

- **`pdf.worker.mjs` errors** — already handled via `serverExternalPackages`;
  do not remove it.
- **Slow first tutor request** — embeddings are (re)downloading on a cold
  start; use the hosted embeddings API for production.
- **`vector(384)` mismatch** — run-time error when storing vectors; align
  `AI_EMBEDDING_DIM` with the migration used.
- **Uploads > 10 MB** — client cap; larger files need a queue/worker
  (see README → Future improvements).
