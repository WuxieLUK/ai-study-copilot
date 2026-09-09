-- 0004: pgvector similarity search function for the AI tutor
-- Security-invoker so RLS on document_chunks / documents applies to the
-- caller automatically (users can only ever retrieve their own material).

create or replace function public.match_documents (
  query_embedding vector(1536),
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
