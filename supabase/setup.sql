-- 0000: schema & table grants
--
-- RLS controls which ROWS a user may touch; GRANT controls whether a role may
-- touch the TABLE at all. Supabase usually pre-configures default privileges,
-- but on some projects tables created through the SQL editor do not inherit
-- them — and then every PostgREST request fails with
--   {"code":"42501","message":"permission denied for table documents"}
--
-- Run this FIRST (it is idempotent). `alter default privileges` makes future
-- tables created by this role inherit the same grants automatically.

grant usage on schema public to anon, authenticated;

grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
grant execute on all functions in schema public to anon, authenticated;

alter default privileges in schema public
  grant all on tables to anon, authenticated;
alter default privileges in schema public
  grant all on sequences to anon, authenticated;
alter default privileges in schema public
  grant execute on functions to anon, authenticated;
-- 0001: documents table
-- Applied with `supabase db push` / the Supabase SQL editor.

create table public.documents (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  filename      text not null,
  -- Object key inside the private `documents` storage bucket, e.g. <uid>/<uuid>-<name>
  storage_path  text not null,
  file_type     text not null check (file_type in ('pdf', 'md', 'txt')),
  size_bytes    integer not null default 0,
  status        text not null default 'pending'
                check (status in ('pending', 'processing', 'ready', 'error')),
  error         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create unique index documents_user_storage_path_idx
  on public.documents (user_id, storage_path);

create index documents_user_created_idx
  on public.documents (user_id, created_at desc);

alter table public.documents enable row level security;

create policy "Users can view their own documents"
  on public.documents for select
  using (auth.uid() = user_id);

create policy "Users can insert their own documents"
  on public.documents for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own documents"
  on public.documents for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own documents"
  on public.documents for delete
  using (auth.uid() = user_id);
-- 0002: private storage bucket for user documents
-- Bucket: `documents` (private — files are served via signed URLs / service role)
-- Object keys are enforced to start with <auth.uid()>/ so users can only ever
-- touch their own files. The matching `storage_path` column lives on
-- public.documents (see 0001).

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "Users can upload their own documents"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can read their own documents"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own documents"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
-- 0003: document chunks (pgvector) for retrieval
-- Requires Supabase with the `vector` extension available (enabled by default
-- on hosted projects). Embedding dimension 384 matches the default local model
-- (Xenova/multilingual-e5-small). If you switch to a hosted embeddings API,
-- change the dimension here AND in 0004 + AI_EMBEDDING_DIM.

create extension if not exists vector;

create table public.document_chunks (
  id           uuid primary key default gen_random_uuid(),
  document_id  uuid not null references public.documents (id) on delete cascade,
  chunk_index  integer not null check (chunk_index >= 0),
  content      text not null,
  token_count  integer not null default 0,
  embedding    vector(384) not null,
  created_at   timestamptz not null default now(),
  unique (document_id, chunk_index)
);

-- Cosine similarity via HNSW (fast approximate nearest neighbour).
create index document_chunks_embedding_idx
  on public.document_chunks
  using hnsw (embedding vector_cosine_ops);

create index document_chunks_document_idx
  on public.document_chunks (document_id);

alter table public.document_chunks enable row level security;

-- Users may access chunks only through documents they own.
create policy "Users can view chunks of their documents"
  on public.document_chunks for select
  using (
    exists (
      select 1 from public.documents d
      where d.id = document_id and d.user_id = auth.uid()
    )
  );

create policy "Users can insert chunks of their documents"
  on public.document_chunks for insert
  with check (
    exists (
      select 1 from public.documents d
      where d.id = document_id and d.user_id = auth.uid()
    )
  );

create policy "Users can delete chunks of their documents"
  on public.document_chunks for delete
  using (
    exists (
      select 1 from public.documents d
      where d.id = document_id and d.user_id = auth.uid()
    )
  );
-- 0004: pgvector similarity search function for the AI tutor
-- Security-invoker so RLS on document_chunks / documents applies to the
-- caller automatically (users can only ever retrieve their own material).

create or replace function public.match_documents (
  query_embedding vector(384),
  match_count integer default 5
) returns table (
  document_id uuid,
  filename text,
  chunk_index integer,
  content text,
  similarity real
)
language sql
stable
as $$
  select
    d.id,
    d.filename,
    c.chunk_index,
    c.content,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.document_chunks c
  join public.documents d on d.id = c.document_id
  order by c.embedding <=> query_embedding
  limit match_count;
$$;
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
