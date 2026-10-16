# App loopholes, security risks, and production-readiness guide

**Review date:** 2026-10-16  
**Scope:** Read-only review of this repository's Expo/React Native client and the Supabase SQL/deployment artifacts included with it. No application code was changed as part of this review.

## Executive summary

The mobile app calls Supabase directly; this repository does not include a separately deployable backend service. The principal verified security issue is that a buyer can create an offer already marked as accepted. The documented database setup is also incomplete for a clean deployment: it omits required schema/migrations and agent RPC definitions used by the app. Finally, listing reads and realtime events reload the entire listing table, which will not scale reliably as inventory grows.

The repository alone is not enough to verify the deployed Supabase Row Level Security (RLS) policies, storage policies, production environment values, or the behavior of any externally provisioned RPCs. Those items must be checked in the actual Supabase and EAS environments before release.

## Findings

| ID | Severity | Finding | Evidence and impact |
|---|---|---|---|
| F-01 | MEDIUM | Buyers can insert already-accepted offers | [`migration_04_offers_disputes_plans.sql`](./migration_04_offers_disputes_plans.sql) around lines 36 and 44 permits an authenticated buyer's offer insert based on buyer ownership, while the allowed status values include `accepted`. A buyer can supply `status='accepted'` and a forged `accepted_at`. This can pollute accepted-deal records and allow a false dispute to be opened against the offer. Admin-only commission payment checks reduce, but do not eliminate, downstream risk. |
| F-02 | MEDIUM | Backend setup is incomplete and frontend/backend contracts disagree | [`README-SETUP.md`](./README-SETUP.md) documents only migrations 03 and 04, while migration 03 assumes existing tables. The context schema in [`whole/.all tables.sql`](./whole/.all%20tables.sql) is not an executable deployment baseline. Agent screens call `request_agent`, `admin_list_agents`, `admin_set_agent`, `agent_list_offers`, and `agent_respond_offer`, but their migration/definitions are absent; migration 06 depends on migration 05. The commissions UI and functions require migration 07, omitted from setup. The README says offers are stored in `inquiries`, but [`src/components/OfferSheet.js`](./src/components/OfferSheet.js) writes to `offers`. A fresh deployment following the README can therefore be incomplete or fail on features whose required tables/RPCs are missing. |
| F-03 | LOW | Listing reads and realtime updates reload the full table | [`src/store.js`](./src/store.js) around lines 12 and 32 selects all listing columns/rows without pagination and triggers another full reload for listing-table realtime events. This increases database and network load, may hit the configured Supabase row limit, and can leave clients with incomplete inventory if responses are capped. |

## Risks that need deployed-environment verification

These are not confirmed exploitable from the repository alone. Treat them as release blockers until the corresponding deployed configuration has been inspected and tested.

1. **RLS and storage authorization are unknown.** There is no backend server or Edge Function source here, and the included context schema does not provide a complete set of policies. UI role checks cannot enforce authorization. Verify row and storage access for anonymous users, ordinary users, agents, and admins using direct authenticated requests.
2. **Agent verification fields may be writable by listing owners.** [`migration_06_verified_agent.sql`](./migration_06_verified_agent.sql) runs its trigger on insert or changes to `owner_id`, not changes to `agent_name` or `agent_verified`. Whether this is exploitable depends on deployed RLS policies and column grants. Test direct updates as an authenticated agent; if allowed, clients must not control verification fields.
3. **Production Supabase configuration is not visible in this repository.** [`eas.json`](./eas.json) has a production profile without visible environment entries, while `.env` is ignored by Git. EAS may inject remote values, which this review could not inspect. Confirm the production URL and publishable/anon key are configured. Never embed a Supabase service-role key in the client app.
4. **Authentication flows require release verification.** Exercise Google OAuth redirects, password recovery, session refresh/expiry, and sign-out on each supported platform against the actual production Supabase configuration.

## Step-by-step guide to production readiness

Complete these steps in order. Do not expose the app publicly until the authorization and clean-deployment checks pass.

### 1. Prevent client-forged offer state

1. Inspect the offer table grants and RLS policies in the deployed Supabase project.
2. Restrict buyer inserts to allowed business fields and enforce on the database side that a buyer-created offer starts as `pending`, with `accepted_at` and `seller_note` unset.
3. Make accept/reject transitions available only through an authorized server-side function or equivalent database operation that verifies the actor and current state.
4. Add database tests proving that a buyer cannot create an accepted offer, forge timestamps, change another user's offer, or transition an offer into a state reserved for an admin/seller.
5. Re-check dispute creation, offer freezing, and commission eligibility after those changes.

### 2. Make backend provisioning reproducible

1. Identify and version the actual base schema, extensions, grants, RLS policies, storage buckets/policies, triggers, and RPCs required by every screen.
2. Add the missing agent RPC migration or document and version the external dependency so it can be installed deterministically.
3. Publish one ordered, complete migration sequence, including required prerequisites and migrations 01–07 where applicable. Update setup instructions so they match the sequence.
4. Correct the offer-table contract in the README: document the actual table and lifecycle used by the client, including whether `inquiries` is still used for a separate purpose.
5. Ensure the intended release includes all migrations and screens it depends on. The review worktree showed migrations 01, 02, and 07 and the commissions screen as untracked; verify their inclusion before release.
6. Deploy the sequence to a new, empty Supabase project in CI or a repeatable staging release. Verify each screen's reads/writes and every RPC, not just successful SQL execution.

### 3. Audit authorization at the database boundary

1. Export and review deployed RLS policies and table/column grants for profiles, listings, favorites, inquiries/offers, disputes, plans, commissions, agents, and storage.
2. Define an access matrix for anonymous, buyer, seller/listing owner, agent, and admin roles.
3. Test both allowed and denied operations using direct Supabase/PostgREST requests; do not rely on hiding screens or buttons in the app.
4. Verify that admin-only RPCs validate the caller's role inside the database/function and that `SECURITY DEFINER` functions, if any, pin a safe `search_path` and expose only necessary operations.
5. Verify the agent badge concern by attempting to update `agent_name` and `agent_verified` as an agent. Ensure those values are derived or overwritten by trusted database logic and cannot be forged by client writes.
6. Add regression tests for cross-user reads/writes, role escalation, offer/dispute state transitions, commission changes, and storage upload/download access.

### 4. Align client contracts with backend behavior

1. Create a compact contract inventory for each screen: table/RPC, request fields, response shape, authorization requirement, and expected error states.
2. Compare every Supabase call in the client against the deployed schema, migration definitions, and RLS behavior; resolve naming and lifecycle mismatches such as `inquiries` versus `offers`.
3. Ensure the UI handles permission-denied, missing-function/schema, expired-session, network, and validation errors explicitly rather than presenting success or empty data.
4. For critical actions (offer acceptance, dispute creation, contact unlock, commissions, agent status), show the persisted server result and avoid treating a client-side state change as authoritative.
5. Add integration tests that exercise those screen-to-RPC/table contracts against a clean staging database.

### 5. Make listing data efficient and correct at scale

1. Replace unbounded listing reads with server-side pagination and filters, and select only columns required by each view.
2. Debounce or coalesce realtime-triggered reloads so a burst of changes does not cause a burst of full-table queries.
3. Handle realtime disconnect/reconnect and refresh failures visibly; distinguish loading, stale, and current availability in the UI.
4. Test with inventory larger than the deployed Supabase API row limit and verify that all pages can be reached without duplicates or gaps.
5. Measure query count, payload size, and screen responsiveness under realistic inventory and concurrent-client load.

### 6. Lock down release configuration and auth

1. Configure Supabase URL and publishable/anon key in the EAS production environment using the project's approved secret/configuration mechanism.
2. Confirm no service-role key or other privileged backend secret is present in the JavaScript bundle, app config, source history, or build logs.
3. Validate OAuth redirect URIs, password reset links, deep links, and session refresh/expiry in production-like iOS, Android, and web builds (where supported).
4. Verify that a missing or invalid configuration fails clearly and that production builds cannot silently point at a development database.
5. Review release permissions, signing credentials, and EAS update channels before distributing builds.

### 7. Add release gates, observability, and operational recovery

1. Add automated lint, type-check, unit, database authorization, migration, and client/backend integration checks to CI. The reviewed `package.json` exposes platform/start scripts but no test, lint, or type-check scripts.
2. Add staging smoke tests for sign-in, listing browse/search/detail, offer creation and state transitions, disputes, admin/agent functions, and commissions.
3. Record actionable client/backend errors without logging passwords, access tokens, personal contact details, or other sensitive values.
4. Monitor Supabase errors, slow queries, realtime disconnects, failed RPCs, and auth failures; define an owner and response process.
5. Document backup/restore, database migration rollback/forward-fix, and incident procedures. Verify recovery in a non-production environment.
6. Release gradually, monitor the above signals, and retain a tested rollback path for both app builds and database changes.

## Release acceptance checklist

- [ ] A buyer cannot create or edit an offer into a trusted/accepted state.
- [ ] A clean Supabase project can be provisioned using only the versioned, documented migration sequence.
- [ ] All client-called RPCs and tables exist, and frontend/backend request and response contracts match.
- [ ] RLS, grants, storage policies, and admin/agent operations pass positive and negative role-based tests.
- [ ] Agent verification fields cannot be client-forged.
- [ ] Listing pagination and realtime behavior work above the deployed row limit and recover from disconnects.
- [ ] Production EAS builds use the intended Supabase environment and contain no privileged service credentials.
- [ ] Auth, OAuth, reset-password, and session lifecycle flows pass on supported platforms.
- [ ] CI has release gates and staging smoke tests; monitoring and recovery procedures have been exercised.

**Review limitation:** This report is based on repository artifacts only. It is not a penetration test and does not certify a deployed Supabase project, EAS environment, or third-party service configuration.
