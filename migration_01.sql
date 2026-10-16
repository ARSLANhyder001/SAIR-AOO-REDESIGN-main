-- SAIR update 1. Supabase > SQL Editor mein EK BAAR run karein. schema.sql dobara run NA karein.
alter table public.listings add column if not exists images text[] not null default '{}' check (cardinality(images) <= 10);
alter table public.listings add column if not exists bedrooms int check (bedrooms is null or bedrooms between 0 and 50);
alter table public.inquiries add column if not exists status text not null default 'new' check (status in ('new','contacted','closed'));

-- public form se koi apna status khud set na kar sake
revoke insert on public.inquiries from anon, authenticated;
grant insert (user_id, listing_id, type, name, phone, area, message) on public.inquiries to anon, authenticated;
