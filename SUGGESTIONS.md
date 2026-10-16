# Security and Production-Readiness Suggestions

This is a read-only review of the tracked application source, SQL migrations, and configuration. No application code was changed. The report distinguishes a confirmed issue from deployment checks and hardening suggestions; it is not a substitute for testing the live Supabase project.

## Confirmed finding

| Severity | File and lines | Finding | Suggested remediation |
|---|---|---|---|
| MEDIUM | `migration_04_offers_disputes_plans.sql:36,44,61-70` | Any authenticated buyer can insert an offer for themselves with a client-supplied status such as `accepted` or `completed`. The dispute policy then permits that buyer to dispute their fabricated accepted offer, and the trigger marks it disputed. This can create false transaction and dispute records in the admin workflow. Confidence: 9/10. | Restrict client-created offers to `pending` and prevent clients from setting acceptance-related fields. Perform status transitions only through trusted, authorization-checked server-side functions that enforce valid transitions. Add database tests for unauthorized status changes and forged disputes. |

## Backend access-control checks before release

- **Verify deployed row-level security (RLS) policies** for `profiles`, `listings`, `favorites`, and `inquiries`. Their baseline policies are not present in the tracked migrations reviewed, so their deployed access rules could not be confirmed here.
- **Review Supabase Storage policies** for the `listing-images` bucket, including upload, read, update, and delete permissions. Ensure users cannot overwrite or remove another user's objects and that public access is intentional.
- **Track and review all required database migrations.** The app references `migration_05_agents.sql` from `src/screens/AgentRequestScreen.js`, `src/screens/AgentsAdminScreen.js`, and `src/screens/AgentOffersScreen.js`, but that migration is not tracked in this repository. It also references `migration_02.sql` from `src/store.js`. Include the required migrations in version control and verify their function grants, RLS behavior, role checks, and input validation against the deployed database before release.
- **Test authorization at the database boundary.** Exercise each table policy, storage policy, and RPC using unauthenticated, ordinary-user, owner, and administrator identities. Do not rely on UI visibility or client-side role checks as authorization.

## Production-hardening suggestions

- **Protect persisted native auth sessions.** `src/lib/supabase.js` uses AsyncStorage for persisted sessions. For native builds, consider a platform-backed secure storage adapter and assess migration and session-restoration behavior before changing storage.
- **Add regression tests for the confirmed offer/dispute issue.** Verify a buyer can create only a pending offer, cannot self-accept or self-complete it, and cannot open a dispute unless a trusted workflow has accepted the offer.
- **Make deployment configuration auditable.** Document which migrations and Supabase policies are required for each release, and verify staging and production schemas are in sync.
- **Keep sensitive backend operations server-side.** Review RPCs and any privileged operations to ensure credentials with elevated database privileges are never shipped in the client and that all user-controlled inputs are validated and authorized server-side.

## Review limitations

- The review covered tracked application source, SQL files, and configuration; no live Supabase deployment was available for inspection or testing.
- RLS and Storage policies for the tables and bucket listed above could not be verified because their definitions were not present in the reviewed tracked migrations.
- The referenced agent and `migration_02.sql` definitions were unavailable in the repository, so their RPCs and authorization behavior remain unreviewed.
