-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'user'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  plan text DEFAULT 'free'::text,
  plan_expires_at timestamp with time zone,
  agent_status text DEFAULT 'none'::text,
  agent_name text,
  agent_phone text,
  agent_company text,
  agent_verified_at timestamp with time zone,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.listings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind = ANY (ARRAY['project'::text, 'property'::text])),
  title text NOT NULL CHECK (char_length(title) >= 2 AND char_length(title) <= 120),
  subtitle text,
  city text,
  description text,
  price numeric CHECK (price IS NULL OR price >= 0::numeric),
  image_url text,
  hue integer DEFAULT 350,
  status text NOT NULL DEFAULT 'published'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  images ARRAY NOT NULL DEFAULT '{}'::text[] CHECK (cardinality(images) <= 10),
  bedrooms integer CHECK (bedrooms IS NULL OR bedrooms >= 0 AND bedrooms <= 50),
  purpose text NOT NULL DEFAULT 'sale'::text CHECK (purpose = ANY (ARRAY['sale'::text, 'rent'::text])),
  bathrooms integer CHECK (bathrooms IS NULL OR bathrooms >= 0 AND bathrooms <= 50),
  area_size numeric CHECK (area_size IS NULL OR area_size > 0::numeric),
  area_unit text NOT NULL DEFAULT 'marla'::text CHECK (area_unit = ANY (ARRAY['marla'::text, 'kanal'::text, 'sqft'::text, 'sqyd'::text])),
  category text,
  property_type text,
  address text,
  lat double precision,
  lng double precision,
  features ARRAY DEFAULT '{}'::text[],
  floors integer,
  year_built integer,
  expires_at timestamp with time zone,
  listed_days integer DEFAULT 30,
  relisted_count integer DEFAULT 0,
  owner_id uuid DEFAULT auth.uid(),
  CONSTRAINT listings_pkey PRIMARY KEY (id),
  CONSTRAINT listings_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id)
);
CREATE TABLE public.favorites (
  user_id uuid NOT NULL DEFAULT auth.uid(),
  listing_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT favorites_pkey PRIMARY KEY (user_id, listing_id),
  CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT favorites_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id)
);
CREATE TABLE public.inquiries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT auth.uid(),
  listing_id uuid,
  type text NOT NULL,
  name text NOT NULL CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
  phone text NOT NULL CHECK (char_length(phone) >= 6 AND char_length(phone) <= 20),
  area text CHECK (area IS NULL OR char_length(area) <= 100),
  message text CHECK (message IS NULL OR char_length(message) <= 1000),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'new'::text,
  CONSTRAINT inquiries_pkey PRIMARY KEY (id),
  CONSTRAINT inquiries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT inquiries_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id)
);
CREATE TABLE public.offers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL,
  buyer_id uuid,
  buyer_role text NOT NULL DEFAULT 'buyer'::text CHECK (buyer_role = ANY (ARRAY['buyer'::text, 'agent'::text])),
  name text NOT NULL,
  phone text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0::numeric),
  valid_until timestamp with time zone NOT NULL,
  advance_amount numeric NOT NULL CHECK (advance_amount >= 0::numeric),
  advance_due_days integer NOT NULL CHECK (advance_due_days >= 0 AND advance_due_days <= 60),
  final_amount numeric NOT NULL CHECK (final_amount >= 0::numeric),
  final_due_days integer NOT NULL CHECK (final_due_days >= 1 AND final_due_days <= 120),
  note text,
  terms_version text NOT NULL,
  terms_accepted_at timestamp with time zone NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'expired'::text, 'withdrawn'::text, 'disputed'::text, 'completed'::text])),
  accepted_at timestamp with time zone,
  seller_note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT offers_pkey PRIMARY KEY (id),
  CONSTRAINT offers_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id),
  CONSTRAINT offers_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES auth.users(id)
);
CREATE TABLE public.disputes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL,
  filed_by uuid,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'open'::text CHECK (status = ANY (ARRAY['open'::text, 'in_review'::text, 'resolved'::text])),
  admin_note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  resolved_at timestamp with time zone,
  CONSTRAINT disputes_pkey PRIMARY KEY (id),
  CONSTRAINT disputes_offer_id_fkey FOREIGN KEY (offer_id) REFERENCES public.offers(id),
  CONSTRAINT disputes_filed_by_fkey FOREIGN KEY (filed_by) REFERENCES auth.users(id)
);
CREATE TABLE public.app_settings (
  key text NOT NULL,
  value text NOT NULL,
  CONSTRAINT app_settings_pkey PRIMARY KEY (key)
);