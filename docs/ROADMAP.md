# Ask Genie Bhai — Roadmap

Status: Canonical
Repository: `oxiomindia/askgeniebhai`
Phase: Documentation-only foundation

> This roadmap sequences work against the [Master
> Blueprint](./00_ASK_GENIE_BHAI_BLUEPRINT.md). Nothing on this roadmap
> may be pulled forward out of sequence without updating this document
> and getting it reviewed — sequencing itself is a decision, not just a
> scheduling detail.
>
> If anything in this document conflicts with the Master Blueprint, the
> Master Blueprint is the canonical source and this document must be
> updated accordingly.

---

## Phase Overview

| Phase | Focus |
|---|---|
| **Phase 1** | MVP — the five core intents, end to end |
| **Phase 2** | Payments, Partner Dashboard, Notifications |
| **Phase 3** | Maps, Analytics, Dynamic Pricing, AI Assistance |

---

## Phase 1 — MVP

**Goal:** prove that Ask Genie Bhai can reliably execute all five core
intents end to end, with a verified partner network and a mobile-first
experience.

- Freshen Up, Keep My Bags, Rest, Book a Cab, Book a Room — all five
  intents live, each completing the full
  [Booking Lifecycle](./00_ASK_GENIE_BHAI_BLUEPRINT.md#booking-lifecycle).
- Next.js web client connected to Supabase (PostgreSQL + Auth) per
  [ADR 0002](./adr/0002_FRONTEND_MIGRATION_NEXTJS.md).
- Partner verification pipeline operating against
  [PARTNER_QUALITY_STANDARDS.md](./PARTNER_QUALITY_STANDARDS.md).
- Cloudflare R2 storing partner and verification media.
- No live payments — bookings are confirmed without an integrated payment
  step (manual/offline settlement acceptable for MVP validation).
- No maps, no partner dashboard, no push notifications (see
  [Non-Goals](./00_ASK_GENIE_BHAI_BLUEPRINT.md#non-goals)).

**Exit criteria:** all five intents can be booked end to end by a real
traveler against a real, verified partner, with the core success metrics
(see below) instrumented and reporting.

---

## Phase 2 — Payments, Partner Dashboard, Notifications

**Goal:** move from a manually-operated MVP to a self-sustaining
marketplace loop.

- **Payments:** Razorpay integrated via Vercel-hosted order creation and
  webhook verification; `payments` entity introduced in
  [DATABASE_BLUEPRINT.md](./DATABASE_BLUEPRINT.md); bookings transition
  to requiring payment confirmation before Confirmation stage.
- **Partner Dashboard:** self-service tooling for partners to manage
  their `partner_locations`, `partner_services`, and `availability`
  directly, reducing manual operational overhead.
- **Notifications:** push/SMS/email notifications covering booking
  confirmation, reminders, and status changes across the booking
  lifecycle.

Each of these is a new architectural surface and must be documented
(companion document update or new ADR) before implementation begins, per
[Governance](./00_ASK_GENIE_BHAI_BLUEPRINT.md#governance).

---

## Phase 3 — Maps, Analytics, Dynamic Pricing, AI Assistance

**Goal:** optimize an already-working marketplace, not bootstrap a new
one.

- **Maps:** introduced only once a specific approved workflow requires
  location/routing (e.g. live cab tracking); scope and provider
  documented in [ARCHITECTURE.md](./ARCHITECTURE.md) before
  implementation.
- **Analytics:** deeper instrumentation beyond the core
  [Success Metrics](./00_ASK_GENIE_BHAI_BLUEPRINT.md#success-metrics),
  supporting partner-level and cohort-level reporting.
- **Dynamic Pricing:** pricing that responds to demand/availability
  signals, introduced only after the core transaction flow and partner
  network are stable.
- **AI Assistance:** any AI/LLM-driven assistance features (e.g. smarter
  discovery ranking, conversational booking help) are explicitly Phase 3
  and must not be pulled forward to accelerate MVP — they are an
  optimization layer on top of a working execution engine, not a
  replacement for it.

---

## Technical Roadmap

| Phase | Technical milestones |
|---|---|
| Phase 1 | Supabase schema for core entities; RLS policies per entity; Next.js ↔ Supabase connection; R2 bucket and access strategy; Next.js app deployed on the existing Vercel project. |
| Phase 2 | Vercel backend endpoints for Razorpay order creation/webhooks; partner-facing auth roles and RLS policies; notification delivery infrastructure. |
| Phase 3 | Maps/geocoding provider integration; analytics pipeline; pricing engine; AI/LLM integration point (subject to a dedicated architecture document before implementation). |

## Product Roadmap

| Phase | Product milestones |
|---|---|
| Phase 1 | Five intents live; verified partner network at launch-city scale; core success metrics instrumented. |
| Phase 2 | Payments live; partners self-manage listings; travelers receive proactive status updates. |
| Phase 3 | Location-aware discovery where justified; pricing that reflects real-time demand; assistance features that speed up (never replace) transaction completion. |

---

## Sequencing Discipline

- A Phase 2 or Phase 3 item may not be implemented before its Phase 1
  prerequisites are complete, except with explicit, documented approval
  updating this roadmap.
- Every roadmap item, when it comes up for implementation, must first
  pass the [Business Filter](./00_ASK_GENIE_BHAI_BLUEPRINT.md#business-filter).
- This roadmap is a living document — it should be updated as phases
  complete or as priorities are explicitly re-approved, not silently
  reinterpreted.
