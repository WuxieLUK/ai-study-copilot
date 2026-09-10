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
