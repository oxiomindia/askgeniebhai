# Ask Genie Bhai — Infrastructure Status

Status: Provisioning plan ready — nothing created yet
Repository: `oxiomindia/askgeniebhai`
Phase: Infrastructure provisioning preparation (no application code,
schema, credentials, API keys, or cloud resources created)

> This document tracks the connectivity and provisioning status of the
> canonical technology stack defined in
> [00_ASK_GENIE_BHAI_BLUEPRINT.md](./00_ASK_GENIE_BHAI_BLUEPRINT.md#canonical-technology-stack).
> It records what has been verified, the recommended infrastructure to
> provision, and a checklist the account owner can follow manually. No
> FlutterFlow screens, database tables, authentication flows, business
> logic, APIs, cloud resources, or API keys have been created as part of
> this document.
>
> If anything in this document conflicts with the Master Blueprint, the
> Master Blueprint is the canonical source and this document must be
> updated accordingly.

---

## Recommended Infrastructure

| Service | Item | Recommended value |
|---|---|---|
| FlutterFlow | Project name | **Ask Genie Bhai** |
| Supabase | Organization | **Ask Genie Bhai** |
| Supabase | Project name | **askgeniebhai** |
| Supabase | Region | **ap-south-1** (Mumbai) |
| Cloudflare | R2 bucket | **askgeniebhai-assets** |
| Vercel | Deployment target | Future — not provisioned yet |

**Note on Supabase organization:** the only Supabase organization
currently visible to this environment is "Opportunity OS," which is not
Ask Genie Bhai-specific. The recommendation above is a **dedicated**
"Ask Genie Bhai" organization, separate from "Opportunity OS," so
billing, membership, and access stay scoped to this product. This must
be created (or confirmed) by the account owner before the `askgeniebhai`
project is created inside it.

---

## Required Services

- **FlutterFlow** — no-code app builder, produces the Flutter client and
  exports source to this repository.
- **Supabase** — Postgres database, authentication, and (if needed)
  storage/edge functions for the backend.
- **Cloudflare R2** — S3-compatible object storage for user-uploaded and
  app media assets.
- **Vercel** — future deployment target for any server-side API layer
  that brokers signed R2 access; not required for the initial phase.
- **GitHub** — source control for FlutterFlow code export and any
  server-side code (already in place: `oxiomindia/askgeniebhai`).

## Required Accounts

- A FlutterFlow account/workspace with permission to create projects
  under the Oxiom organization.
- A Supabase account with permission to create a new organization (or
  access to an existing Oxiom-owned organization designated for Ask
  Genie Bhai).
- A Cloudflare account with R2 enabled and permission to create buckets.
- A Vercel account/team (only needed when the deployment phase begins).
- GitHub access to `oxiomindia/askgeniebhai` with push permission for
  whichever account will hold FlutterFlow's Git integration credentials.

## Required Manual Steps

These steps must be performed by the account owner outside this
environment; no tool access exists here for FlutterFlow or Cloudflare,
and Supabase project/organization creation is a billable action that
requires explicit owner approval and is intentionally not performed as
part of this document.

1. Create (or confirm) a dedicated Supabase organization named **Ask
   Genie Bhai**.
2. Create the Supabase project **askgeniebhai** inside that organization,
   region **ap-south-1**.
3. Create a FlutterFlow project named **Ask Genie Bhai** under the
   correct Oxiom-owned FlutterFlow account.
4. Enable FlutterFlow's Git integration for that project, pointing at
   `oxiomindia/askgeniebhai`, per the branching strategy in
   [FLUTTERFLOW_SUPABASE_FOUNDATION.md](./FLUTTERFLOW_SUPABASE_FOUNDATION.md#recommended-repository-branching-strategy).
5. Connect FlutterFlow to the `askgeniebhai` Supabase project using
   FlutterFlow's native Supabase integration.
6. Create a Cloudflare R2 bucket named **askgeniebhai-assets**.
7. Set the bucket's access policy to **private by default** (no public
   access) until a signed-upload/delivery flow is designed.
8. Record the client-safe Supabase values (project URL, anon/publishable
   key) and the FlutterFlow project link back into this document once
   created.
9. Defer Vercel project creation until the server-side API layer
   (signed R2 URLs) is actually being built.

---

## Recommended Naming Conventions

- **Product-scoped names everywhere:** every resource name includes
  `askgeniebhai` (lowercase, no spaces) or the human-readable "Ask Genie
  Bhai" label, never a generic or shared-project name.
- **FlutterFlow project:** `Ask Genie Bhai` (display name as shown in
  FlutterFlow's UI).
- **Supabase organization:** `Ask Genie Bhai` — kept separate from other
  Oxiom products' organizations (e.g. "Opportunity OS") so billing and
  membership don't cross products.
- **Supabase project:** `askgeniebhai` (lowercase, matches the GitHub
  repo name).
- **Cloudflare R2 bucket:** `askgeniebhai-assets` — the `-assets` suffix
  reserves the base name `askgeniebhai` for any future bucket
  (e.g. `askgeniebhai-backups`) without collision.
- **Environment variables:** `SCREAMING_SNAKE_CASE`, prefixed by service
  (`SUPABASE_...`, `R2_...`), matching the canonical list in
  [FLUTTERFLOW_SUPABASE_FOUNDATION.md § Environment Variables](./FLUTTERFLOW_SUPABASE_FOUNDATION.md#environment-variables).
- **Git branches:** `docs/...` for documentation-only changes,
  `feature/...` for FlutterFlow export or backend code, matching the
  repository's existing branch naming.

---

## Required Secrets (names only)

No values are recorded anywhere in this repository or this document.
These are the secret names that will need to exist in a secrets manager
or hosting platform's environment configuration once resources are
created:

- `SUPABASE_SERVICE_ROLE_KEY` — server-only, full-privilege Supabase key.
- `SUPABASE_DB_PASSWORD` — server-only database password.
- `SUPABASE_DB_URL` — server-only database connection string.
- `R2_ACCESS_KEY_ID` — server-only Cloudflare R2 access key ID.
- `R2_SECRET_ACCESS_KEY` — server-only Cloudflare R2 secret access key.

## Environment Variables (names only)

Client-safe values (usable inside FlutterFlow) and server-only values
(usable only in a future Vercel/API layer), per
[FLUTTERFLOW_SUPABASE_FOUNDATION.md § Environment Variables](./FLUTTERFLOW_SUPABASE_FOUNDATION.md#environment-variables):

| Variable | Scope |
|---|---|
| `SUPABASE_URL` | Client-safe (FlutterFlow) |
| `SUPABASE_ANON_KEY` | Client-safe (FlutterFlow) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only |
| `SUPABASE_DB_PASSWORD` | Server-only |
| `SUPABASE_DB_URL` | Server-only |
| `R2_ACCOUNT_ID` | Server-only |
| `R2_BUCKET_NAME` | Server-only |
| `R2_ACCESS_KEY_ID` | Server-only |
| `R2_SECRET_ACCESS_KEY` | Server-only |
| `R2_PUBLIC_BASE_URL` | Server-only, only if/when public delivery is approved |

No API keys have been generated. No values for any of the above exist
yet.

---

## Provisioning Checklist

Designed to be completed in under 15 minutes by the account owner. Every
manual step is followed by its own verification step.

- [ ] **1. Create Supabase organization "Ask Genie Bhai."**
      *Verify:* the organization appears in the Supabase dashboard
      organization switcher, separate from "Opportunity OS."
- [ ] **2. Create Supabase project `askgeniebhai` in region
      `ap-south-1`, inside that organization.**
      *Verify:* project status shows `ACTIVE_HEALTHY` in the Supabase
      dashboard.
- [ ] **3. Note the project's URL and anon/publishable key location
      (do not paste the values anywhere) from Project Settings → API.**
      *Verify:* both values are visible in the dashboard without
      needing to regenerate anything.
- [ ] **4. Create FlutterFlow project "Ask Genie Bhai."**
      *Verify:* the project appears in the FlutterFlow workspace with
      the correct owner account.
- [ ] **5. Enable FlutterFlow Git integration, pointing at
      `oxiomindia/askgeniebhai`.**
      *Verify:* FlutterFlow's Git settings show a successful connection
      to the repository (no push required yet).
- [ ] **6. Connect FlutterFlow to the `askgeniebhai` Supabase project
      via FlutterFlow's native Supabase integration.**
      *Verify:* FlutterFlow's Supabase integration panel shows
      "Connected" with the correct project name.
- [ ] **7. Create Cloudflare R2 bucket `askgeniebhai-assets`.**
      *Verify:* the bucket appears in the Cloudflare R2 dashboard.
- [ ] **8. Set the bucket's public access to disabled (private).**
      *Verify:* the Cloudflare dashboard shows "Public access: Not
      allowed" for the bucket.
- [ ] **9. Update this document's status fields with what now exists
      (organization name, project name, bucket name) — no keys or
      secrets.**
      *Verify:* a reviewer can read this file and confirm every item
      above is checked without needing dashboard access.

---

## Verification Checklist

Run this after the Provisioning Checklist to confirm the environment is
ready for the next phase of work:

- [ ] Supabase organization "Ask Genie Bhai" exists and is distinct from
      "Opportunity OS."
- [ ] Supabase project `askgeniebhai` exists, region `ap-south-1`,
      status `ACTIVE_HEALTHY`.
- [ ] No tables, schemas, or migrations exist yet in `askgeniebhai`
      (expected — out of scope for this phase).
- [ ] FlutterFlow project "Ask Genie Bhai" exists under the correct
      account.
- [ ] FlutterFlow Git integration points at `oxiomindia/askgeniebhai`.
- [ ] FlutterFlow's Supabase integration shows a successful connection
      to the `askgeniebhai` project.
- [ ] Cloudflare R2 bucket `askgeniebhai-assets` exists.
- [ ] The bucket's public access is disabled.
- [ ] No secrets, keys, or credentials have been committed to this
      repository (spot-check: `git log -p -- docs/` shows no key-shaped
      strings).
- [ ] This document has been updated to reflect what now exists, with
      no values — only names/status — recorded.

---

## Integration Readiness

| Integration | Feasibility | Notes |
|---|---|---|
| FlutterFlow ↔ Supabase | Feasible once both exist | FlutterFlow's native Supabase integration (OAuth or manual API key) is the supported connection path; see [FLUTTERFLOW_SUPABASE_FOUNDATION.md](./FLUTTERFLOW_SUPABASE_FOUNDATION.md#flutterflow-connection). Cannot be exercised until both the FlutterFlow project and the Supabase project exist. |
| FlutterFlow / Vercel ↔ Cloudflare R2 | Feasible in principle | R2 access must go through Vercel-hosted signed-URL endpoints, never a raw credential in FlutterFlow, per [ARCHITECTURE.md](./ARCHITECTURE.md#cloudflare-r2). Cannot be verified until the bucket and Vercel project both exist. |

Full list and handling rules for secrets/environment variables: see
[FLUTTERFLOW_SUPABASE_FOUNDATION.md § Environment Variables](./FLUTTERFLOW_SUPABASE_FOUNDATION.md#environment-variables).

---

## Current Verified State

Verified via the connected Supabase account (read-only, this session):

| Item | Finding |
|---|---|
| Organizations visible to this session | One: "Opportunity OS" (`kcsjyjasdpksyxjcjxuw`) |
| Projects visible to this session | One: `opportunity-os` (region `ap-south-1`, status `ACTIVE_HEALTHY`, Postgres 17) |
| A project named `askgeniebhai` / "Ask Genie Bhai" | Does not exist |
| FlutterFlow project "Ask Genie Bhai" | Not verifiable — no FlutterFlow connector available in this session |
| Cloudflare bucket `askgeniebhai-assets` | Not verifiable — no Cloudflare connector available in this session |

**No resources have been created.** No API keys have been generated. No
pull request has been opened for this document.

## Recommended Next Steps

1. Follow the Provisioning Checklist above (account owner, ~15 minutes).
2. Run the Verification Checklist to confirm everything is reachable
   and correctly scoped.
3. Update this document's "Current Verified State" table with the
   result (names/status only, no secrets).
4. Once verified, hand off to implementation: FlutterFlow schema/UI
   work and any server-side API layer for signed R2 access.
