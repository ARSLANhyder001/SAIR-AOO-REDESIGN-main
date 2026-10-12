# SAIR Construction & Real Estate – final redesigned app

## Run it
1. `npm install --legacy-peer-deps`
2. Copy `.env.example` to `.env` and add your Supabase URL + anon key.
3. **Supabase → SQL Editor:** run these once, in order: `migration_03_property_details.sql`, then `migration_04_offers_disputes_plans.sql` (offers, disputes, listing expiry, paid plans, contact unlock).
4. `npx expo start -c` and open in Expo Go (iOS / Android).

## What is inside
- Theme: `src/theme` (crimson/black/gold, dark + light + system, Plus Jakarta Sans)
- Tabs: floating glass bar (Home, Search, Saved, Account, More)
- Home: animated hero, services, coverflow carousel, latest properties, map, count-up stats, CTA
- Search: type pills (All, Residential, Commercial, Plot, Flat, House, Farm House, Agriculture Land, Office Space), filter sheet, list/map switch
- Property details: full details, features, location map (full screen), nearby places, instalment estimate, services, sticky action bar
- "Place Your Offer First": every property → saved in `inquiries` (type `offer`) → Admin > Offers
- Admin (role = admin): Dashboard, Add property (4-step form), My listings, Offers & messages inbox, Notifications
- Account: login / signup / Google / reset password, profile, dark-light toggle

## Admin map locations
In Add property → Location, paste `lat, lng` copied from Google Maps. Without it, the pin is approximate (city centre).

## Offers, expiry, disputes, plans (migration_04)
- Offer = amount + validity (24h-15d) + advance/final payment schedule (days after acceptance) + accepted terms (`src/lib/terms.js`, have your advocate review).
- Listings live 15-30 days, then hide automatically; admin relists from My listings.
- Accepted offer → buyer can "Report a dispute"; a DB trigger freezes the offer and admin handles it in Admin > Disputes.
- Contact details unlock only for Pro plan (checked on the server via `unlock_contact`). Free accounts see 3 lead notifications.
- Admin activates Pro in Admin > Subscribers after receiving payment. Set the price text in `src/lib/plans.js`.
- Enable pg_cron (Database > Extensions) so expiry runs even when nobody opens the app.
