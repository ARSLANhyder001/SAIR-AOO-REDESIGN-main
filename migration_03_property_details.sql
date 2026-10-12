-- Run once in Supabase > SQL Editor. Safe to re-run.
alter table public.listings
  add column if not exists category      text,              -- residential | commercial | agricultural
  add column if not exists property_type text,              -- house | flat | plot | farm_house | agri_land | office
  add column if not exists address       text,
  add column if not exists lat           double precision,  -- exact map position (optional; city centre is used if empty)
  add column if not exists lng           double precision,
  add column if not exists features      text[] default '{}',
  add column if not exists floors        int,
  add column if not exists year_built    int;

-- Offers are saved in the existing `inquiries` table with type = 'offer' and show up in Admin > Inquiries > Offers.
-- If your inquiries.type column has a CHECK constraint, this lets 'offer' through (harmless if there is none).
alter table public.inquiries drop constraint if exists inquiries_type_check;

-- Offer statuses used by the admin Offers inbox: new (Pending) / accepted / rejected.
-- Only needed if your inquiries.status column has a CHECK constraint (harmless otherwise).
alter table public.inquiries drop constraint if exists inquiries_status_check;
