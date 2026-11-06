# Supabase production schema inventory

This folder contains a read-only catalog snapshot from the linked production
project and the SQL query used to collect it. The snapshot contains schema
metadata, policies, grants, public function definitions, triggers, indexes,
and storage bucket settings. It does not contain application table rows.

## Snapshot status

- Project: `SAIR REACT EXPO APP` (`qchbatxgoeqgsjizayay`)
- PostgreSQL: 17.11
- Public tables: 8; all have RLS enabled
- Policies: 27 in `public`, 6 in `storage`
- Public functions: 20
- Public triggers: 4
- Storage bucket: `listing-images`, public-read, 5 MiB limit, JPEG/PNG/WebP
- Supabase CLI migration history: no entries were returned

`production_schema_snapshot.json` is an inventory for review, not a
restorable `pg_dump`. Historical migration SQL cannot be recovered from an
empty migration history. The deployed schema can be recreated as a new
baseline once a full schema dump is generated.

## Refresh the metadata snapshot

From the repository root, run:

```powershell
powershell -ExecutionPolicy Bypass -File .\supabase\export-schema-snapshot.ps1
```

Keep the query read-only; do not use `db pull` against production as part of
this audit because it can update migration history.

## RLS and API review

- Anonymous listings are limited by policy to published, unexpired listings.
- Authenticated listing reads allow published listings and authorized
  administrative/owner access. Agent writes are constrained by ownership and
  the approved-agent check.
- Profiles are readable only by the owner or admin; regular users can update
  their own display name, but cannot update role, paid-plan, or agent-approval
  fields through the table API.
- Offer inserts are constrained to the authenticated buyer, pending status,
  null acceptance/seller fields, and a published listing the buyer does not
  own. Offer acceptance is handled by a definer RPC that checks approved-agent
  status, listing ownership, pending state, and offer validity.
- Dispute insertion is limited to the buyer's accepted offer; a trigger marks
  the offer disputed.
- All eight public tables have RLS enabled, and `anon`/`authenticated` do not
  have `BYPASSRLS`.
- `app_settings`, `commissions`, `disputes`, and `offers` currently have broad
  table ACLs for `anon`, but their policies do not grant anonymous row access.
  This is not a demonstrated RLS bypass, but those unnecessary grants should
  be revoked as defense-in-depth after checking the production API contract.
- `listing-images` is public-read. Uploads require an approved agent or admin;
  enforce per-user storage quotas if unbounded uploads are not intended.
- `unlock_contact(p_listing)` currently returns the global SAIR phone and
  WhatsApp values from `app_settings`; it does not use the listing ID. Confirm
  whether paid users should receive SAIR's contact details or the specific
  listing owner's contact details.

## Full SQL backup

Docker is not required for the read-only catalog snapshot above. The CLI's
`db dump` command does require Docker/Podman to run its bundled `pg_dump`.
That exact SQL dump has not been generated. If Docker Desktop is available,
generate a schema-only SQL dump (no production rows) from the repository root:

```powershell
npx.cmd --yes supabase@latest db dump --remote --schema public,auth,storage --file supabase/schema.sql
```

Review the resulting SQL before using it as a baseline. Do not apply a schema
dump directly to production. Test restoration in a separate Supabase project
first.
