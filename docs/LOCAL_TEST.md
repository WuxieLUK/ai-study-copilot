# Local QA Checklist — AI Study Copilot

Run the checks in order. Two modes: **no keys** (works out of the box) and
**full** (requires Supabase + OpenAI credentials, see README → Local
Development).

## 0 · Baseline (no keys)

```bash
npm test          # expect: 10 files / 76 tests passed
npm run lint      # expect: no errors / warnings
npx tsc --noEmit  # expect: clean
npm run dev       # http://localhost:3000
```

| Route | Expected |
|---|---|
| `/` | Landing: hero, features, how-it-works, demo, CTA; theme toggle top-right |
| `/login` `/signup` | Auth cards render |
| `/dashboard` `/documents` `/tutor` `/quiz` `/insights` | Rendered with a "Supabase is not configured" notice (graceful) |

API degraded states (unauthenticated / no keys):

| Request | Expected |
|---|---|
| `POST /api/tutor` | `503` + JSON `{"message":"Supabase is not configured."}` |
| `POST /api/quiz/generate` | `401` `{"message":"Authentication required."}` |
| `POST /api/documents/:id/process` | `503` |

## 1 · Interaction checks (no keys)

1. **Theme toggle** — click 🌙/☀️ on the landing header; page flips; reload keeps choice.
2. **Auth form validation** — on `/signup` submit a short password → inline red
   "at least 8 characters"; an invalid email → red email error. No crash.
3. **Graceful auth** — submit valid-looking credentials → friendly
   "Supabase is not configured" alert (no runtime error).
4. **Upload validation** (client-side) — on `/documents`, dropping/choosing a
   `.docx` or a >10 MB file shows the matching validation error without
   calling the network.
5. **Responsive** — narrow the window: nav scrolls, cards stack.

## 2 · Full flow (keys configured)

Use the bundled `samples/` files (`.md`, `.txt`, `.pdf`) as test material.

> Tip: for local/demo use, turn **Authentication → Email → Confirm email** OFF
> in Supabase — otherwise sign-up waits for a confirmation mail that the
> built-in mailer only delivers to project members.

1. **Sign up** on `/signup` → lands on `/dashboard`.
2. **Upload** `samples/neural-networks-lecture-notes.pdf` (or the `.md`/`.txt`)
   on `/documents` → row appears
   `Queued` → `Processing` → `Ready` (upload triggers indexing automatically).
3. **Delete/retry** — delete the file (row + storage object gone); re-upload an
   intentionally broken file to see `Failed` + reason, then retry.
4. **Tutor** — `/tutor`, ask about the document content → answer cites
   `[n]` sources; open a source chip (filename + % match + excerpt).
   Ask an off-topic question → honest "not in your materials" reply.
5. **Quiz** — `/quiz` → pick the ready document → generate → answer all
   questions (radio / True-False / text) → submit → score %, weak topics,
   per-question explanations & feedback.
6. **Insights** — `/insights` shows quiz count, average/best/latest, strong vs
   weak topics; dashboard widgets reflect real data.
7. **Sign out** → protected routes redirect to `/login`; sign back in → data
   still there (RLS/ownership).

## 3 · Production build

```bash
npm run build && npm run start   # repeat spot checks 0 & 1 against the prod server
```

> Add real screenshots of the full flow to `docs/screenshots/` and link them
> from the README before publishing to GitHub.
