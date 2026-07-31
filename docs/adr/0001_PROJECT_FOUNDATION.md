# ADR 0001 — Project Foundation

Status: Accepted
Date: 2026-07-31
Repository: `oxiomindia/askgeniebhai`

## Context

Ask Genie Bhai is a new product under Oxiom. Before any application code
is written, the foundational product and architecture decisions need to
be recorded in one place so that every future implementation PR can be
checked against them. This ADR captures the decisions already established
across [00_ASK_GENIE_BHAI_BLUEPRINT.md](../00_ASK_GENIE_BHAI_BLUEPRINT.md)
and its companion documents, in the standard ADR format, for durability
and quick reference.

## Decisions

### 1. FlutterFlow selected as frontend

**Decision:** FlutterFlow is the canonical frontend for Ask Genie Bhai.

**Rationale:** See
[Canonical Technology Stack](../00_ASK_GENIE_BHAI_BLUEPRINT.md#canonical-technology-stack)
in the Master Blueprint.

### 2. Supabase selected for database and authentication

**Decision:** Supabase PostgreSQL is the canonical database; Supabase Auth
is the canonical authentication system.

**Rationale:** See
[Canonical Technology Stack](../00_ASK_GENIE_BHAI_BLUEPRINT.md#canonical-technology-stack)
in the Master Blueprint.

### 3. Cloudflare R2 selected for storage

**Decision:** Cloudflare R2 is the canonical file and media storage
platform. Supabase Storage is explicitly not used as the primary storage
layer.

**Rationale:** See
[Canonical Technology Stack](../00_ASK_GENIE_BHAI_BLUEPRINT.md#canonical-technology-stack)
in the Master Blueprint.

### 4. Vercel selected for hosting and future backend services

**Decision:** Vercel hosts the web surface and any future backend
services requiring server-side secrets.

**Rationale:** See
[Canonical Technology Stack](../00_ASK_GENIE_BHAI_BLUEPRINT.md#canonical-technology-stack)
in the Master Blueprint.

### 5. Razorpay deferred until launch

**Decision:** Razorpay is the selected payments platform, but its
integration is deferred to the launch phase (Phase 2 of the
[Roadmap](../ROADMAP.md)) rather than built during MVP.

**Rationale:** See
[Canonical Technology Stack](../00_ASK_GENIE_BHAI_BLUEPRINT.md#canonical-technology-stack)
in the Master Blueprint.

### 6. Maps deferred

**Decision:** No mapping, geocoding, or routing provider is included in
the current architecture.

**Rationale:** See
[Canonical Technology Stack](../00_ASK_GENIE_BHAI_BLUEPRINT.md#canonical-technology-stack)
in the Master Blueprint.

### 7. Five-intent MVP

**Decision:** The MVP consists of exactly five intents — Freshen Up, Keep
My Bags, Rest, Book a Cab, Book a Room — and nothing else appears on the
home screen.

**Rationale:** A narrow, well-executed set of high-value traveler
transactions is easier to deliver reliably than a broad, shallow set. The
five intents were chosen as the most common, highest-friction traveler
needs that a transaction-first product can meaningfully complete (see
[Business Filter](../00_ASK_GENIE_BHAI_BLUEPRINT.md#business-filter)).

### 8. Execution-over-search philosophy

**Decision:** Ask Genie Bhai competes on completing transactions
(execution), not on search, browsing, or comparison shopping.

**Rationale:** Search is a solved, commoditized problem dominated by
Google. Execution — actually completing a booking reliably and quickly —
is the space where a focused, trust-driven product can differentiate.
This decision governs every subsequent product and UX decision (see
[Product Philosophy](../00_ASK_GENIE_BHAI_BLUEPRINT.md#product-philosophy)
and [UX_PRINCIPLES.md](../UX_PRINCIPLES.md)).

### 9. Repository isolation policy

**Decision:** `oxiomindia/askgeniebhai` is a fully independent repository.
No code, configuration, workflow, or documentation may reference or
depend on any other Oxiom project or unrelated repository, and this is
enforced in CI via Repository Guard.

**Rationale:** Keeping the repository boundary explicit and enforced
prevents accidental cross-project coupling as Oxiom's portfolio grows,
and keeps this repository's history and configuration fully
self-contained. See
[REPOSITORY_GUARD.md](../REPOSITORY_GUARD.md).

## Consequences

- Every future implementation PR is expected to be consistent with the
  nine decisions above. A PR that needs to deviate from one of them must
  first update the Master Blueprint (or file a new ADR) and get it
  approved — per the
  [Governance](../00_ASK_GENIE_BHAI_BLUEPRINT.md#governance) rule.
- This ADR does not itself authorize any implementation work — it is a
  record of decisions already made in the documentation-only foundation
  phase. Application code, database tables, storage buckets, and
  third-party integrations are all still pending future, separately
  approved PRs.
- Future ADRs should be added sequentially in `docs/adr/` (e.g.
  `0002_...md`) rather than editing this record, so the decision history
  stays intact.
