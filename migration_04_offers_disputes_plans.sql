-- Run ONCE in Supabase > SQL Editor (after migration_03). Safe to re-run.
-- Adds: structured offers (validity + payment schedule + T&C), disputes, listing auto-expiry (15-30 days),
--       paid plans with server-side contact unlock.

------------------------------------------------------------------ helpers
alter table public.profiles add column if not exists plan text default 'free';
alter table public.profiles add column if not exists plan_expires_at timestamptz;

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles where id=auth.uid() and role='admin') $$;
create or replace function public.is_paid() returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles where id=auth.uid() and plan='paid' and (plan_expires_at is null or plan_expires_at>now())) $$;

------------------------------------------------------------------ listing expiry
alter table public.listings add column if not exists expires_at timestamptz;
alter table public.listings add column if not exists listed_days int default 30;
alter table public.listings add column if not exists relisted_count int default 0;
alter table public.listings drop constraint if exists listings_status_check;      -- allows status 'expired'
update public.listings set expires_at = now() + interval '30 days' where status='published' and expires_at is null;  -- existing live listings get 30 days

------------------------------------------------------------------ offers
create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_id uuid references auth.users(id) on delete set null,
  buyer_role text not null default 'buyer' check (buyer_role in ('buyer','agent')),
  name text not null, phone text not null,
  amount numeric not null check (amount>0),
  valid_until timestamptz not null,
  advance_amount numeric not null check (advance_amount>=0),
  advance_due_days int not null check (advance_due_days between 0 and 60),   -- days after acceptance
  final_amount numeric not null check (final_amount>=0),
  final_due_days int not null check (final_due_days between 1 and 120),      -- days after acceptance (deal close)
  note text,
  terms_version text not null, terms_accepted_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending','accepted','rejected','expired','withdrawn','disputed','completed')),
  accepted_at timestamptz, seller_note text,
  created_at timestamptz not null default now(),
  check (advance_amount+final_amount=amount)
);
alter table public.offers enable row level security;
drop policy if exists offers_insert on public.offers; drop policy if exists offers_select on public.offers;
drop policy if exists offers_admin_update on public.offers; drop policy if exists offers_buyer_withdraw on public.offers; drop policy if exists offers_admin_delete on public.offers;
create policy offers_insert on public.offers for insert to authenticated with check (buyer_id=auth.uid());
create policy offers_select on public.offers for select to authenticated using (buyer_id=auth.uid() or public.is_admin());
create policy offers_admin_update on public.offers for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy offers_buyer_withdraw on public.offers for update to authenticated using (buyer_id=auth.uid() and status='pending') with check (buyer_id=auth.uid() and status='withdrawn');
create policy offers_admin_delete on public.offers for delete to authenticated using (public.is_admin());

------------------------------------------------------------------ disputes
create table if not exists public.disputes (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers(id) on delete cascade,
  filed_by uuid references auth.users(id) on delete set null,
  reason text not null, details text,
  status text not null default 'open' check (status in ('open','in_review','resolved')),
  admin_note text, created_at timestamptz not null default now(), resolved_at timestamptz
);
alter table public.disputes enable row level security;
drop policy if exists disputes_insert on public.disputes; drop policy if exists disputes_select on public.disputes; drop policy if exists disputes_admin_update on public.disputes;
create policy disputes_insert on public.disputes for insert to authenticated with check (
  filed_by=auth.uid() and exists(select 1 from public.offers o where o.id=offer_id and o.buyer_id=auth.uid() and o.status='accepted'));
create policy disputes_select on public.disputes for select to authenticated using (filed_by=auth.uid() or public.is_admin());
create policy disputes_admin_update on public.disputes for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- "System" side of a dispute: the moment it is filed, the offer is frozen as 'disputed' automatically.
create or replace function public.on_dispute_filed() returns trigger language plpgsql security definer set search_path=public as $$
begin update public.offers set status='disputed' where id=new.offer_id; return new; end $$;
drop trigger if exists trg_dispute_filed on public.disputes;
create trigger trg_dispute_filed after insert on public.disputes for each row execute function public.on_dispute_filed();

------------------------------------------------------------------ contact unlock (server-side, cannot be bypassed from the app)
create table if not exists public.app_settings (key text primary key, value text not null);
alter table public.app_settings enable row level security;   -- no policies: only the functions below can read it
insert into public.app_settings(key,value) values ('sair_phone','+923342204328'),('sair_whatsapp','923342204328') on conflict (key) do nothing;

create or replace function public.unlock_contact(p_listing uuid) returns json language plpgsql security definer set search_path=public as $$
declare ph text; wa text;
begin
  if auth.uid() is null then raise exception 'login_required'; end if;
  if not (public.is_admin() or public.is_paid()) then raise exception 'plan_required'; end if;
  select value into ph from public.app_settings where key='sair_phone';
  select value into wa from public.app_settings where key='sair_whatsapp';
  return json_build_object('phone',ph,'whatsapp',wa);
end $$;

create or replace function public.admin_set_plan(p_email text, p_days int) returns text language plpgsql security definer set search_path=public,auth as $$
declare uid uuid; n int;
begin
  if not public.is_admin() then raise exception 'admin_only'; end if;
  select id into uid from auth.users where lower(email)=lower(trim(p_email));
  if uid is null then return 'not_found'; end if;
  update public.profiles set plan=case when p_days>0 then 'paid' else 'free' end,
         plan_expires_at=case when p_days>0 then now()+make_interval(days=>p_days) else null end where id=uid;
  get diagnostics n = row_count;
  return case when n>0 then 'ok' else 'no_profile' end;
end $$;

create or replace function public.admin_list_paid() returns table(email text, plan_expires_at timestamptz) language plpgsql security definer set search_path=public,auth as $$
begin
  if not public.is_admin() then raise exception 'admin_only'; end if;
  return query select u.email::text, p.plan_expires_at from public.profiles p join auth.users u on u.id=p.id where p.plan='paid' order by p.plan_expires_at nulls last;
end $$;

------------------------------------------------------------------ auto-expiry job
create or replace function public.expire_stale() returns void language sql security definer set search_path=public as $$
  update public.listings set status='expired' where status='published' and expires_at is not null and expires_at<now();
  update public.offers set status='expired' where status='pending' and valid_until<now();
$$;
do $$ begin
  create extension if not exists pg_cron;
  perform cron.schedule('sair-expire-stale','*/30 * * * *','select public.expire_stale()');
exception when others then raise notice 'pg_cron not enabled: enable it in Database > Extensions, or the app still hides expired listings by itself.'; end $$;

grant execute on function public.unlock_contact(uuid), public.admin_set_plan(text,int), public.admin_list_paid(), public.is_admin(), public.is_paid() to authenticated;
