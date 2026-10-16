-- Run ONCE in Supabase > SQL Editor (after migration_06). Safe to re-run.
-- Commission is tracked ONLY for accepted offers on SAIR's OWN listings
-- (listing has no owner, or the owner is an admin). Seller may be: owner / agent / builder.
-- Only the admin can see or change anything here.

create table if not exists public.commissions(
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null unique references public.offers(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete set null,
  seller_type text not null check (seller_type in ('owner','agent','builder')),
  seller_name text,
  seller_phone text,
  rate numeric(5,2) not null check (rate >= 0 and rate <= 100),
  amount numeric not null,
  status text not null default 'due' check (status in ('due','paid','waived')),
  paid_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.commissions enable row level security;
drop policy if exists commissions_admin on public.commissions;
create policy commissions_admin on public.commissions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- accepted offers on SAIR-owned listings + their commission (if set)
create or replace function public.admin_commission_list()
returns table(offer_id uuid, listing_id uuid, listing_title text, deal_amount numeric, buyer_name text, buyer_phone text,
              accepted_at timestamptz, seller_type text, seller_name text, seller_phone text, rate numeric,
              commission_amount numeric, status text)
language plpgsql security definer set search_path=public as $$
begin
  if not public.is_admin() then raise exception 'admin_only'; end if;
  return query
  select o.id, l.id, l.title::text, o.amount, o.name::text, o.phone::text, coalesce(o.accepted_at, o.created_at),
         c.seller_type, c.seller_name, c.seller_phone, c.rate, c.amount, c.status
  from public.offers o
  join public.listings l on l.id = o.listing_id
  left join public.profiles p on p.id = l.owner_id
  left join public.commissions c on c.offer_id = o.id
  where o.status = 'accepted' and (l.owner_id is null or p.role = 'admin')
  order by coalesce(o.accepted_at, o.created_at) desc
  limit 200;
end $$;

create or replace function public.admin_set_commission(p_offer uuid, p_seller_type text, p_seller_name text, p_seller_phone text, p_rate numeric)
returns text language plpgsql security definer set search_path=public as $$
declare o record; amt numeric; cur text;
begin
  if not public.is_admin() then raise exception 'admin_only'; end if;
  if p_seller_type not in ('owner','agent','builder') then return 'invalid'; end if;
  if p_rate is null or p_rate < 0 or p_rate > 100 then return 'invalid'; end if;
  select off.id, off.amount, off.listing_id into o
    from public.offers off
    join public.listings l on l.id = off.listing_id
    left join public.profiles p on p.id = l.owner_id
   where off.id = p_offer and off.status = 'accepted' and (l.owner_id is null or p.role = 'admin');
  if not found then return 'not_allowed'; end if;
  select status into cur from public.commissions where offer_id = p_offer;
  if cur = 'paid' then return 'already_paid'; end if;
  amt := round(o.amount * p_rate / 100);
  insert into public.commissions(offer_id, listing_id, seller_type, seller_name, seller_phone, rate, amount, status)
  values (p_offer, o.listing_id, p_seller_type, nullif(trim(coalesce(p_seller_name,'')),''), nullif(trim(coalesce(p_seller_phone,'')),''), p_rate, amt, 'due')
  on conflict (offer_id) do update set seller_type = excluded.seller_type, seller_name = excluded.seller_name,
    seller_phone = excluded.seller_phone, rate = excluded.rate, amount = excluded.amount, status = 'due', paid_at = null, updated_at = now();
  return 'ok';
end $$;

create or replace function public.admin_mark_commission(p_offer uuid, p_status text) returns text
language plpgsql security definer set search_path=public as $$
declare n int;
begin
  if not public.is_admin() then raise exception 'admin_only'; end if;
  if p_status not in ('due','paid','waived') then return 'invalid'; end if;
  update public.commissions set status = p_status, paid_at = case when p_status = 'paid' then now() else null end, updated_at = now()
   where offer_id = p_offer;
  get diagnostics n = row_count;
  return case when n > 0 then 'ok' else 'not_found' end;
end $$;

grant execute on function public.admin_commission_list(), public.admin_set_commission(uuid,text,text,text,numeric),
  public.admin_mark_commission(uuid,text) to authenticated;