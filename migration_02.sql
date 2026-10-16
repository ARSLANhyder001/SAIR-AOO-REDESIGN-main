-- SAIR update 2. Supabase > SQL Editor mein EK BAAR run karein (migration_01 ke baad).
-- 1) Faster queries for the home/list screens and the admin inbox
create index if not exists listings_status_created_idx on public.listings (status, created_at desc);
create index if not exists listings_kind_idx on public.listings (kind);
create index if not exists inquiries_status_created_idx on public.inquiries (status, created_at desc);

-- 2) Live updates: app refreshes automatically when admin edits a listing
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='listings') then
    alter publication supabase_realtime add table public.listings;
  end if;
end $$;
