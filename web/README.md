# SAIR public website

This is a standalone Next.js App Router website for SAIR's public landing page and public property listings. It is intentionally separate from the Expo mobile app and reads listings using Supabase's anonymous key and database RLS.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Configure before deployment

Set the following in the ignored `web/.env.local` file. In this workspace, the Supabase URL and anon key have been copied from the root Expo `.env` without exposing or committing their values:

- `NEXT_PUBLIC_SITE_URL` to the final HTTPS website domain. This enables canonical metadata and the sitemap URL in `robots.txt`.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the Supabase project URL and anon/publishable key. Never use a `service_role` key in this app.
- `NEXT_PUBLIC_ANDROID_APP_URL` to SAIR's exact Uptodown listing URL after publication. Until then the page shows “Coming soon to Uptodown”.
- `NEXT_PUBLIC_IOS_APP_URL` to the actual App Store listing URL when available; the current value is a store search.

Run `migration_08_public_web.sql` in Supabase SQL Editor after the existing listing migrations. It adds the admin-managed featured flag, limits anonymous access to public listing columns, and excludes expired listings from public reads. Admins can feature or unfeature listings in the mobile app's My Listings screen.

The website serves published, unexpired property rows at `/properties`, with filters, and a search-indexable detail page at `/properties/[id]`. The home page shows listings manually marked as featured in the app.

For Vercel, add the Supabase variables, `NEXT_PUBLIC_SITE_URL` (the deployed HTTPS domain), and `NEXT_PUBLIC_ANDROID_APP_URL` (the exact Uptodown listing URL once it exists) under **Project Settings → Environment Variables**. Redeploy after changing these values; `NEXT_PUBLIC_*` values are incorporated during the build.

After the migration, check column-level grants rather than only table-level SELECT:

```sql
select
  has_column_privilege('anon', 'public.listings', 'status', 'SELECT') as anon_can_read_status,
  has_column_privilege('anon', 'public.listings', 'title', 'SELECT') as anon_can_read_title,
  has_column_privilege('anon', 'public.listings', 'owner_id', 'SELECT') as anon_can_read_owner_id,
  has_column_privilege('anon', 'public.listings', 'agent_phone', 'SELECT') as anon_can_read_agent_phone;
```

The expected results are `true`, `true`, `false`, `false`. The mobile app uses an explicit public-column projection when signed out and retains the full listing columns for authenticated listing managers.

## Verify and build

```bash
npm run lint
npm run build
```
