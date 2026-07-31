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

**Rationale:** The product is mobile-first from day one and needs fast
iteration on native-feeling Android and iOS experiences. FlutterFlow
provides that speed while still allowing custom code where a required
behavior cannot be modeled visually.

### 2. Supabase selected for database and authentication

**Decision:** Supabase PostgreSQL is the canonical database; Supabase Auth
is the canonical authentication system.

**Rationale:** The product is fundamentally relational and transactional.
Supabase provides managed Postgres with Row Level Security and
auto-generated APIs, and Supabase Auth integrates directly with that RLS
layer via JWTs — letting data access be scoped to the authenticated user
without a custom identity system.

### 3. Cloudflare R2 selected for storage

**Decision:** Cloudflare R2 is the canonical file and media storage
platform. Supabase Storage is explicitly not used as the primary storage
layer.

**Rationale:** Separating binary media from transactional data keeps
Supabase focused on structured data and auth, while letting object
storage scale independently with a clear path to CDN-backed delivery.

### 4. Vercel selected for hosting and future backend services

**Decision:** Vercel hosts the web surface and any future backend
services requiring server-side secrets.

**Rationale:** Some operations (R2 signed URLs, Razorpay order creation
and webhook verification) require secrets that must never live in the
FlutterFlow client. Vercel provides that server-side home without
requiring a separate, self-hosted backend.

### 5. Razorpay deferred until launch

**Decision:** Razorpay is the selected payments platform, but its
integration is deferred to the launch phase (Phase 2 of the
[Roadmap](../ROADMAP.md)) rather than built during MVP.

**Rationale:** The five MVP intents can be validated without a live
payment integration. Deferring payments keeps the MVP scope smaller and
avoids building payment infrastructure before the core transaction flow
is proven.

### 6. Maps deferred

**Decision:** No mapping, geocoding, or routing provider is included in
the current architecture.

**Rationale:** None of the five MVP intents strictly require a map.
Location features add permissions overhead, API cost, and UX weight that
is not justified until a specific approved workflow needs it (see Phase 3
of the [Roadmap](../ROADMAP.md)).

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
