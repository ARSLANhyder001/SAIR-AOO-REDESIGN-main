-- Run ONCE in Supabase > SQL Editor (after migration_05). Safe to re-run.
-- Shows "Verified agent" + agent name on listings. No phone/email is exposed here.

alter table public.listings add column if not exists agent_name text;
alter table public.listings add column if not exists agent_verified boolean default false;

-- fills agent_name / agent_verified from the owner's profile (agents cannot fake it)
create or replace function public.set_listing_agent() returns trigger
language plpgsql security definer set search_path=public as $$
declare r text; s text; n text;
begin
  if new.owner_id is null then return new; end if;
  select role, agent_status, agent_name into r, s, n from public.profiles where id=new.owner_id;
  if not found then new.agent_name:=null; new.agent_verified:=false; return new; end if;
  if r='admin' then new.agent_name:='SAIR Construction'; new.agent_verified:=true;
  elsif r='agent' and s='approved' then new.agent_name:=n; new.agent_verified:=true;
  else new.agent_name:=null; new.agent_verified:=false; end if;
  return new;
end $$;

drop trigger if exists trg_listing_agent on public.listings;
create trigger trg_listing_agent before insert or update of owner_id on public.listings
  for each row execute function public.set_listing_agent();

-- when admin approves / removes an agent (or the agent edits their name), refresh their listings
create or replace function public.sync_agent_listings() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  update public.listings l set
    agent_name = case when new.role='admin' then 'SAIR Construction' when new.role='agent' and new.agent_status='approved' then new.agent_name else null end,
    agent_verified = (new.role='admin' or (new.role='agent' and new.agent_status='approved'))
  where l.owner_id=new.id;
  return new;
end $$;

drop trigger if exists trg_sync_agent_listings on public.profiles;
create trigger trg_sync_agent_listings after update of role, agent_status, agent_name on public.profiles
  for each row execute function public.sync_agent_listings();

-- older listings with no owner were added by SAIR itself
update public.listings set agent_name='SAIR Construction', agent_verified=true where owner_id is null and agent_name is null;
-- listings owned by already-approved agents / admin
update public.listings l set
  agent_name = case when p.role='admin' then 'SAIR Construction' else p.agent_name end,
  agent_verified = true
from public.profiles p
where l.owner_id=p.id and (p.role='admin' or (p.role='agent' and p.agent_status='approved'));