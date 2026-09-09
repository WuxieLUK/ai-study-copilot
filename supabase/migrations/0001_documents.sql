-- 0001: documents table
-- Applied with `supabase db push` / the Supabase SQL editor.

create table public.documents (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  filename    text not null,
  file_type   text not null check (file_type in ('pdf', 'md', 'txt')),
  size_bytes  integer not null default 0,
  status      text not null default 'pending'
              check (status in ('pending', 'processing', 'ready', 'error')),
  error       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

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
