# Ask Genie Bhai — Infrastructure Status

Status: Draft — pending decisions, nothing provisioned yet
Repository: `oxiomindia/askgeniebhai`
Phase: Infrastructure readiness audit (no application code, schema, or
credentials introduced)

> This document tracks the connectivity and provisioning status of the
> canonical technology stack defined in
> [00_ASK_GENIE_BHAI_BLUEPRINT.md](./00_ASK_GENIE_BHAI_BLUEPRINT.md#canonical-technology-stack).
> It records what has been verified, what remains a manual/owner action,
> and what decisions are blocking further progress. No FlutterFlow
> screens, database tables, authentication flows, business logic, or
> APIs have been created as part of this audit.
>
> If anything in this document conflicts with the Master Blueprint, the
> Master Blueprint is the canonical source and this document must be
> updated accordingly.

---

## FlutterFlow

**Status: Not verified — no tool access available in this environment.**

- No FlutterFlow API or integration is connected to this session. There
  is no way to check whether a FlutterFlow project named "Ask Genie
  Bhai" already exists, nor to create one, from here.
- FlutterFlow project creation and configuration (workspace access,
  owner permissions, export capability, Git integration) are performed
  through the FlutterFlow web app and require a human to log in.

**Action required (manual, owner):**

1. Confirm whether a FlutterFlow project for Ask Genie Bhai already
   exists.
2. If not, create one named **Ask Genie Bhai** under the correct
   Oxiom-owned FlutterFlow account.
3. Confirm and record:
   - Workspace is accessible to the intended project owners.
   - Owner/admin permissions are assigned correctly.
   - Export capability (code export / Git push) is available on the
     current plan.
   - Git integration is enabled and points at
     `oxiomindia/askgeniebhai`, per the branching strategy in
     [FLUTTERFLOW_SUPABASE_FOUNDATION.md](./FLUTTERFLOW_SUPABASE_FOUNDATION.md#recommended-repository-branching-strategy).

---

## Supabase

**Status: Read-only check completed. No "Ask Genie Bhai" project exists.
A blocking decision is needed before any project is created.**

Verified via the connected Supabase account:

| Item | Finding |
|---|---|
| Organizations visible to this session | One: **"Opportunity OS"** (`kcsjyjasdpksyxjcjxuw`) |
| Projects visible to this session | One: **`opportunity-os`** (region `ap-south-1`, status `ACTIVE_HEALTHY`, Postgres 17) |
| A project named `askgeniebhai` / "Ask Genie Bhai" | **Does not exist** |

**Blocker — needs your decision before proceeding:**

The only Supabase organization currently connected to this environment is
**"Opportunity OS,"** which does not appear to be an Ask Genie Bhai /
Oxiom-branded organization. Creating a new `askgeniebhai` project would
currently only be possible inside that organization. Per the
[Repository Guard](./REPOSITORY_GUARD.md) and
[Project Isolation](./00_ASK_GENIE_BHAI_BLUEPRINT.md) principles already
established for this repository, this needs explicit confirmation before
any project is created:

- Is "Opportunity OS" the correct organization to hold the Ask Genie
  Bhai Supabase project (e.g. a shared Oxiom billing organization)?
- Or does a separate Supabase organization for Ask Genie Bhai need to be
  created or connected first?

Supabase project creation is also a real, billable action (it requires
an explicit cost confirmation step) — it will not be performed without
your explicit go-ahead on both the organization and the plan/cost.

**Once approved, the following remain to be verified/configured** (per
[FLUTTERFLOW_SUPABASE_FOUNDATION.md](./FLUTTERFLOW_SUPABASE_FOUNDATION.md)):

- [ ] Project created and healthy.
- [ ] Region selected — `ap-south-1` (Mumbai) recommended for India-first
      latency, matching the existing `opportunity-os` project's region.
- [ ] PostgreSQL available (automatic on project creation).
- [ ] Email authentication enabled (default Supabase Auth baseline).
- [ ] Client-safe API keys (Project URL, anon/publishable key) recorded.
- [ ] Service role key and database password stored server-side only,
      outside GitHub.
- [ ] No tables, schemas, or migrations created — explicitly out of
      scope for this phase.

---

## Cloudflare

**Status: Not verified — no Cloudflare connector is available in this
session.**

- No Cloudflare API, MCP tool, or integration is connected to this
  environment. There is no way to check R2 account access or bucket
  existence, nor to create a bucket, from here.

**Action required (manual, owner):**

1. Confirm Cloudflare account access for Ask Genie Bhai / Oxiom.
2. Create the R2 bucket, recommended name: **`askgeniebhai-assets`**
   (once account access is confirmed).
3. Confirm and record:
   - Bucket exists and is reachable.
   - Read/write credentials (access key ID / secret) are generated and
     stored server-side only (never in FlutterFlow or GitHub), per
     [FLUTTERFLOW_SUPABASE_FOUNDATION.md](./FLUTTERFLOW_SUPABASE_FOUNDATION.md#file-and-media-storage-configuration).
   - Public/private access strategy: **private by default**, per the
     canonical storage policy — public access only for explicitly
     non-sensitive, public-facing assets.
   - CORS requirements: none identified yet, since no upload flow has
     been designed. CORS configuration should be revisited once the
     signed-upload flow (via Vercel) is designed, not before.

If a Cloudflare connector can be added to this session, re-run this
verification; otherwise these steps must be completed manually and the
resulting connection details recorded in this document.

---

## Integration Readiness

| Integration | Feasibility | Notes |
|---|---|---|
| FlutterFlow ↔ Supabase | Feasible once both exist | FlutterFlow's native Supabase integration (OAuth or manual API key) is the supported connection path; see [FLUTTERFLOW_SUPABASE_FOUNDATION.md](./FLUTTERFLOW_SUPABASE_FOUNDATION.md#flutterflow-connection). Cannot be exercised until both the FlutterFlow project and the Supabase project exist. |
| FlutterFlow / Vercel ↔ Cloudflare R2 | Feasible in principle | R2 access must go through Vercel-hosted signed-URL endpoints, never a raw credential in FlutterFlow, per [ARCHITECTURE.md](./ARCHITECTURE.md#cloudflare-r2). Cannot be verified until the bucket and Vercel project both exist. |

**Required secrets/configuration values identified** (names only — no
values recorded here, per the canonical rule that secrets never live in
documentation or GitHub):

- `SUPABASE_URL`, `SUPABASE_ANON_KEY` — client-safe, for FlutterFlow.
- `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_PASSWORD` — server-only.
- `R2_ACCOUNT_ID`, `R2_BUCKET_NAME`, `R2_ACCESS_KEY_ID`,
  `R2_SECRET_ACCESS_KEY` — server-only.
- `R2_PUBLIC_BASE_URL` — only if/when public delivery is approved.

Full list and handling rules: see
[FLUTTERFLOW_SUPABASE_FOUNDATION.md § Environment Variables](./FLUTTERFLOW_SUPABASE_FOUNDATION.md#environment-variables).

---

## Pending Items

- [ ] Decide which Supabase organization hosts the Ask Genie Bhai
      project (see Blocker above).
- [ ] Create the FlutterFlow project (manual, owner action).
- [ ] Confirm Cloudflare account access and create the R2 bucket
      (manual, owner action, or via a connected Cloudflare integration).
- [ ] Record client-safe connection values (Supabase URL/anon key,
      FlutterFlow project link) once created.

## Blockers

1. **FlutterFlow:** no programmatic access from this environment at
   all. Requires the account owner to create and configure the project
   manually in the FlutterFlow web app.
2. **Supabase:** organization ambiguity — the only connected
   organization ("Opportunity OS") is not clearly Ask Genie Bhai's own,
   and project creation is a billable action. Requires your explicit
   decision and approval before a project is created.
3. **Cloudflare:** no connector available in this environment at all.
   Requires either connecting a Cloudflare integration to this session,
   or the account owner completing bucket creation manually.

## Recommended Next Steps

1. Answer the Supabase organization question above so project creation
   (once approved) can proceed correctly the first time.
2. Create the FlutterFlow project manually and share back the workspace
   name/owner so this document can be updated to "verified."
3. Either connect a Cloudflare integration to this environment, or
   create the `askgeniebhai-assets` R2 bucket manually and share back
   confirmation so this document can be updated.
4. Once all three exist, re-run this audit to verify integration
   readiness (FlutterFlow ↔ Supabase connection test, R2 signed-URL
   feasibility) before any implementation work begins.
