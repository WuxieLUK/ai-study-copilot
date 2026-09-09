-- 0003: document chunks (pgvector) for retrieval
-- Requires Supabase with the `vector` extension available (enabled by default
-- on hosted projects). Embedding dimension 1536 = text-embedding-3-small.

create extension if not exists vector;

create table public.document_chunks (
  id           uuid primary key default gen_random_uuid(),
  document_id  uuid not null references public.documents (id) on delete cascade,
  chunk_index  integer not null check (chunk_index >= 0),
  content      text not null,
  token_count  integer not null default 0,
  embedding    vector(1536) not null,
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
