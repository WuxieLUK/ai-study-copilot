-- 0005: quiz sessions & answers for scoring / analytics
-- The full question set and the student's answers are stored as JSONB
-- (`responses`) so weak-topic analytics (Phase 8) never need to re-derive
-- what was asked; `weak_topics` is the denormalized aggregate.

create table public.quiz_sessions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  document_ids      uuid[] not null default '{}',
  title             text not null default 'Untitled quiz',
  question_count    integer not null check (question_count >= 1),
  correct_count     integer not null check (correct_count >= 0),
  score_pct         real not null check (score_pct between 0 and 100),
  weak_topics       jsonb not null default '[]',
  responses         jsonb not null,
  created_at        timestamptz not null default now()
);

create index quiz_sessions_user_created_idx
  on public.quiz_sessions (user_id, created_at desc);

alter table public.quiz_sessions enable row level security;

create policy "Users can view their own quiz sessions"
  on public.quiz_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own quiz sessions"
  on public.quiz_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own quiz sessions"
  on public.quiz_sessions for delete
  using (auth.uid() = user_id);
