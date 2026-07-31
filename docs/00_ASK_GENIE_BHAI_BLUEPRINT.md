# Ask Genie Bhai — Master Blueprint

Status: Canonical — single source of truth
Repository: `oxiomindia/askgeniebhai`
Document Owner: Product & Engineering (Oxiom)
Phase: Pre-development, documentation-only

> This document is the permanent source of truth for Ask Genie Bhai. Every
> future product decision, architecture decision, and engineering decision
> must be consistent with what is written here. If a future change requires
> deviating from this document, this document must be updated and approved
> first — the code must never silently diverge from the blueprint.

---

## Table of Contents

1. [Vision](#vision)
2. [Product Philosophy](#product-philosophy)
3. [MVP](#mvp)
4. [Business Filter](#business-filter)
5. [Product Differentiation](#product-differentiation)
6. [User Personas](#user-personas)
7. [Canonical Technology Stack](#canonical-technology-stack)
8. [System Architecture](#system-architecture)
9. [Booking Lifecycle](#booking-lifecycle)
10. [Database Blueprint](#database-blueprint)
11. [Partner Standards](#partner-standards)
12. [UX Principles](#ux-principles)
13. [Engineering Principles](#engineering-principles)
14. [Folder Strategy](#folder-strategy)
15. [Roadmap](#roadmap)
16. [Non-Goals](#non-goals)
17. [Success Metrics](#success-metrics)
18. [Governance](#governance)

---

## Vision

**Company:** Oxiom

**Consumer Brand:** Ask Genie Bhai

**Mission:**
Build a transaction-first travel assistance platform that helps travelers
complete high-value travel tasks quickly and reliably.

Ask Genie Bhai exists for the moment a traveler needs something done — not
researched, not compared, not browsed — *done*. A shower before a meeting. A
place to leave bags. A quiet room to rest between flights. A cab that shows
up. A room that's ready. The product's job is to make that happen in as few
taps as possible, with a partner network the traveler can trust.

---

## Product Philosophy

**Google excels at SEARCH.**
**Ask Genie Bhai excels at EXECUTION.**

Search-first products optimize for showing the traveler options. Ask Genie
Bhai optimizes for closing the transaction. Every feature decision should be
evaluated against one question:

> Does this reduce friction and move the traveler closer to completing a
> transaction?

If a feature adds browsing, comparison shopping, or decision paralysis
without shortening the path to completion, it does not belong in the
product — regardless of how "useful" it looks in isolation. Ask Genie Bhai
is not trying to be a better directory. It is trying to be the fastest way
to get a real travel task done.

---

## MVP

The MVP is exactly **five intents**. Nothing else belongs on the home
screen.

| # | Intent | Traveler need |
|---|---|---|
| 1 | **Freshen Up** | Shower, change, and freshen up between transit legs or before a meeting |
| 2 | **Keep My Bags** | Secure, short-term bag storage near a station, airport, or venue |
| 3 | **Rest** | A clean, quiet space to rest for a few hours |
| 4 | **Book a Cab** | Reliable point-to-point transport, on demand |
| 5 | **Book a Room** | A verified room for the night, booked in minutes |

These five intents are the entire MVP surface. No sixth intent, no
secondary home-screen tile, and no "explore more" section may be added
without amending this document first (see [Governance](#governance)).

### Naming Convention: Intent vs. Partner Category

Two related but distinct naming conventions are used across this document
set:

| Term | Definition | Where it's used |
|---|---|---|
| **Traveler-facing Intent** | The full name shown to the traveler on the home screen: Freshen Up, Keep My Bags, Rest, Book a Cab, Book a Room. | Product copy, UX flows, roadmap, ADR. |
| **Internal Partner Category** | The shorter operational label used when referring to the partner/service side of the same intent: Freshen Up, Bag Storage, Rest, Cab, Room. | Partner Standards, `PARTNER_QUALITY_STANDARDS.md`, `partner_services` entity in `DATABASE_BLUEPRINT.md`. |

Every internal Partner Category maps to exactly one traveler-facing
Intent, one-to-one, in the order above. Freshen Up and Rest use the same
label in both conventions; Keep My Bags / Bag Storage, Book a Cab / Cab,
and Book a Room / Room are the same underlying intent referred to by its
shorter internal label. Wherever the internal label is used, it must be
stated alongside the traveler-facing intent name at first use in that
document (e.g. "Bag Storage (Keep My Bags)") so the mapping is never
ambiguous.

---

## Business Filter

Every proposed feature must answer **YES** to all four questions before it
is considered for the roadmap:

| # | Question | Purpose |
|---|---|---|
| 1 | Is this a common traveler need? | Filters out niche or speculative use cases |
| 2 | Can Genie Bhai complete the transaction? | Filters out features that only inform, without executing |
| 3 | Is there a revenue opportunity? | Filters out features with no path to sustaining the business |
| 4 | Is this better than Google? | Filters out features that just re-implement search |

A feature that fails any one of these questions is rejected or deferred,
regardless of how compelling it looks in isolation.

---

## Product Differentiation

**Compete on:**

- Trust
- Verification
- Reliability
- Cleanliness
- Speed
- Simplicity
- Transaction completion

**Do NOT compete on:**

- Largest inventory
- Cheapest price
- Number of listings

Ask Genie Bhai deliberately does not try to win an inventory or price war
against aggregators. A smaller network of verified, high-quality partners
that reliably completes transactions beats a large, unverified catalog that
merely lists options. Every partner-facing and traveler-facing decision
should reinforce trust and reliability over breadth or discount.

---

## User Personas

| Persona | Urgent need |
|---|---|
| **Airport transit traveler** | Has a short layover and needs to freshen up, store bags, or rest between flights without missing a connection. Speed and proximity to the terminal matter more than price. |
| **Railway traveler** | Arrives at a station hours before or after a train, often overnight, and needs a safe place to store bags, rest, or freshen up near the platform. Trust and physical safety are the primary concerns. |
| **Business traveler** | Needs to look presentable for a meeting shortly after landing, or needs a reliable cab booked without friction. Time pressure is high; convenience and predictability outweigh cost. |
| **Family traveler** | Traveling with children or elderly relatives and needs a clean, safe room or rest space quickly, without navigating a complex booking flow. Simplicity and cleanliness verification matter most. |
| **Backpacker** | Budget-conscious but still needs reliable, verified basics — a bed, a shower, a place to store a backpack — without falling back to unreliable, unverified listings. Value matters, but not at the cost of trust. |

Every one of these personas shares the same underlying pattern: an urgent,
time-boxed need where searching and comparing is itself a cost. This is
why execution speed is the product's core differentiator.

---

## Canonical Technology Stack

| Layer | Technology | Status |
|---|---|---|
| Frontend | FlutterFlow | Canonical |
| Database | Supabase PostgreSQL | Canonical |
| Authentication | Supabase Auth | Canonical |
| File Storage | Cloudflare R2 | Canonical |
| Hosting | Vercel | Canonical |
| Payments | Razorpay | Future — deferred to launch phase |
| Maps | — | Deferred until required |

### Why each technology was selected

**FlutterFlow (Frontend)**
Ask Genie Bhai is mobile-first from day one. FlutterFlow allows rapid
iteration on native-feeling Android and iOS experiences without the
overhead of a fully custom mobile codebase, while still allowing custom
code escape hatches when a required behavior cannot be modeled visually.
Speed of iteration matters more at this stage than pixel-level control.

**Supabase PostgreSQL (Database)**
The product is fundamentally transactional and relational (users, partners,
bookings, availability). A managed Postgres database gives strong
relational modeling, real transactional guarantees, and an ecosystem
(Row Level Security, auto-generated APIs) that maps directly onto a
mobile-first client without requiring a custom backend for basic data
access.

**Supabase Auth (Authentication)**
Supabase Auth is selected because it is native to the same platform as the
database and integrates directly with Row Level Security through JWTs.
This lets data access be scoped to the authenticated user without
exposing privileged credentials to the mobile client, and without
standing up a separate identity system.

**Cloudflare R2 (Storage)**
Media and binary assets (partner photos, verification documents, proof of
service) are deliberately separated from transactional data. R2 keeps
Supabase focused on structured data and auth while providing object
storage that scales independently, with a clear future path to CDN-backed
delivery. Supabase Storage is explicitly not the canonical storage layer
for this product.

**Vercel (Hosting)**
Vercel hosts the web surface (internal tooling, previews) and — more
importantly — any future backend services that require server-side
secrets: signed URL generation for R2, Razorpay order creation and webhook
verification, and other privileged operations that must never live in the
FlutterFlow client.

**Razorpay (Payments, future)**
Razorpay is deferred until launch because the MVP intents can be validated
without a live payment integration. When payments are introduced, Razorpay
is selected as an India-ready payment platform appropriate for the
product's initial market.

**Maps (Deferred)**
Location, geocoding, and routing add permissions overhead, API cost, and
UX weight. None of the five MVP intents strictly require a map. Maps are
introduced only when an approved intent explicitly needs them (see
[Roadmap](#roadmap)).

---

## System Architecture

```text
                    ┌──────────────┐
                    │     User     │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  FlutterFlow │   Mobile-first client (Android / iOS)
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Supabase   │   PostgreSQL + Auth + RLS
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Cloudflare R2│   Media & file storage
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Razorpay   │   Payments (future)
                    └──────────────┘

                    ┌──────────────┐
                    │    Vercel    │   Backend services & server-side
                    │              │   secrets (signed URLs, webhooks,
                    │              │   payment callbacks)
                    └──────────────┘
```

### Responsibilities

| Component | Responsibility |
|---|---|
| **FlutterFlow** | Mobile-first UI. Presents the five MVP intents, drives the booking lifecycle, and holds only client-safe credentials. |
| **Supabase** | System of record for structured data (users, partners, bookings, availability). Owns authentication and enforces access control through Row Level Security. |
| **Cloudflare R2** | Canonical store for media and binary assets — partner photos, verification documents, proof-of-service files — kept separate from transactional data. |
| **Vercel** | Hosts any service that needs a server-side secret: R2 signed URLs, Razorpay order creation and webhook verification, and other privileged orchestration that cannot run in the mobile client. |
| **Razorpay** | Payment collection and payment lifecycle once payments are introduced (post-MVP). |

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the expanded architecture
document.

---

## Booking Lifecycle

```text
Intent → Discovery → Partner → Booking → Confirmation → Completion → Feedback
```

| Stage | Description |
|---|---|
| **Intent** | The traveler selects one of the five MVP intents from the home screen. |
| **Discovery** | Genie Bhai surfaces the smallest sufficient set of verified partners that can fulfill the intent — not an exhaustive catalog. |
| **Partner** | The traveler selects (or is matched to) a specific partner location/service. |
| **Booking** | The traveler commits to a transaction: a specific service, time window, and price. |
| **Confirmation** | The booking is confirmed with the partner and the traveler receives a clear, unambiguous confirmation. |
| **Completion** | The service is delivered and marked complete, either by the partner, the traveler, or both. |
| **Feedback** | The traveler rates the experience, feeding the partner quality score (see [PARTNER_QUALITY_STANDARDS.md](./PARTNER_QUALITY_STANDARDS.md)). |

Every screen and every feature in the product maps to exactly one stage of
this lifecycle. A feature that does not clearly belong to a lifecycle
stage should be questioned against the [Business Filter](#business-filter).

---

## Database Blueprint

Logical entities only — no SQL, no schema-level detail. Full detail lives
in [DATABASE_BLUEPRINT.md](./DATABASE_BLUEPRINT.md).

| Entity | Purpose |
|---|---|
| `users` | Travelers and their authenticated identity. |
| `partners` | Businesses that provide one or more of the five services. |
| `partner_locations` | Physical locations belonging to a partner. |
| `partner_services` | Specific services a partner location offers, mapped to an intent. |
| `availability` | Time-windowed capacity for a partner service. |
| `bookings` | A traveler's transaction against a partner service. |
| `booking_status` | The lifecycle state of a booking. |
| `verification` | Verification records proving a partner/location meets quality standards. |
| `reviews` | Traveler feedback tied to a completed booking. |
| `media` | Files and images stored in Cloudflare R2, referenced by metadata. |
| `payments` (future) | Payment transactions tied to a booking, introduced with Razorpay. |

### Relationships (logical)

```text
users ──< bookings >── partner_services ──< partner_locations >── partners
                │                                  │
                │                                  └──< verification
                └──< reviews                       └──< media
bookings ──< booking_status (history)
partner_services ──< availability
bookings ──< payments (future)
```

- A **user** can have many **bookings**.
- A **partner** can have many **partner_locations**.
- A **partner_location** can offer many **partner_services**.
- A **partner_service** has time-based **availability**.
- A **booking** references exactly one **partner_service** and one **user**,
  and moves through a history of **booking_status** values.
- A **partner_location** accumulates **verification** records and **media**.
- A completed **booking** can produce one **review**.
- A **booking** will reference a **payment** once payments are introduced.

---

## Partner Standards

The five MVP intents map directly to five partner categories, each with its
own quality bar (see
[Naming Convention: Intent vs. Partner Category](#naming-convention-intent-vs-partner-category)).
Full detail lives in
[PARTNER_QUALITY_STANDARDS.md](./PARTNER_QUALITY_STANDARDS.md).

| Intent | Partner Category | Core quality expectation |
|---|---|---|
| **Freshen Up** | Freshen Up | Clean, private, functioning shower/washroom facilities with towels and basic amenities |
| **Keep My Bags** | Bag Storage | Secure, monitored storage with tamper-evident handling and clear liability terms |
| **Rest** | Rest | A clean, quiet, private or semi-private space suitable for short-duration rest |
| **Book a Cab** | Cab | Verified driver, well-maintained vehicle, on-time pickup |
| **Book a Room** | Room | Verified cleanliness, safety, and accurate representation of the room offered |

---

## UX Principles

Full detail lives in [UX_PRINCIPLES.md](./UX_PRINCIPLES.md). Summary:

- Mobile-first
- Minimal clicks
- Fast loading
- Large touch targets
- Transaction-first
- Minimal forms

---

## Engineering Principles

Full detail lives in [ENGINEERING_GUIDELINES.md](./ENGINEERING_GUIDELINES.md).
Summary:

- Keep it simple
- Strong TypeScript
- Business logic outside UI
- Reusable components
- Document architecture first
- Avoid duplication
- Feature-first organization

---

## Folder Strategy

Full rationale lives in
[ENGINEERING_GUIDELINES.md](./ENGINEERING_GUIDELINES.md#folder-strategy).
Recommended top-level structure for any future codebase (e.g. the Vercel
backend services project):

```text
app/          Route-level entry points and screen/page composition
components/   Small, reusable, presentation-focused UI building blocks
features/     Feature-first modules: intent-specific logic, UI, and state
services/     External integrations (Supabase, R2, Razorpay clients)
hooks/        Reusable stateful logic shared across features
lib/          Framework-agnostic core utilities and shared clients
types/        Shared TypeScript types and interfaces
utils/        Small, pure, stateless helper functions
public/       Static assets served as-is
docs/         Canonical documentation (this blueprint and its companions)
tests/        Automated tests, mirroring the source tree structure
```

| Folder | Explanation |
|---|---|
| `app/` | Owns routing and page/screen composition only. No business logic. |
| `components/` | Purely presentational, reusable across features. No feature-specific logic. |
| `features/` | One folder per product feature/intent. Owns that feature's logic, local components, and state. This is where most product code lives. |
| `services/` | Thin clients wrapping external systems (Supabase, R2, Razorpay). No business logic — only integration plumbing. |
| `hooks/` | Cross-feature reusable stateful logic (e.g. `useBookingStatus`). |
| `lib/` | Framework-agnostic core building blocks — e.g. a configured Supabase client singleton. |
| `types/` | Shared types/interfaces used across more than one feature. |
| `utils/` | Small, pure, stateless helpers (formatting, validation primitives). No side effects. |
| `public/` | Static, unprocessed assets. |
| `docs/` | The canonical documentation set — this blueprint and its companion documents. |
| `tests/` | Automated tests, organized to mirror the structure they test. |

---

## Roadmap

Full detail lives in [ROADMAP.md](./ROADMAP.md). Summary:

| Phase | Focus |
|---|---|
| **Phase 1** | MVP — the five core intents, end to end |
| **Phase 2** | Payments, Partner Dashboard, Notifications |
| **Phase 3** | Maps, Analytics, Dynamic Pricing, AI Assistance |

---

## Non-Goals

The following must **NOT** be built during MVP:

- No sixth intent or additional home-screen tile beyond the five approved
  intents.
- No general search or browse/discovery experience competing with Google.
- No large, unverified partner catalog optimized for inventory size.
- No price-comparison or lowest-price-guarantee features.
- No live payments integration (Razorpay is deferred to launch phase).
- No maps, geocoding, or location-based discovery.
- No partner-facing dashboard or self-service partner tooling (Phase 2).
- No push-notification infrastructure (Phase 2).
- No AI-driven recommendation, chat, or assistance features (Phase 3).
- No web-first or desktop-first customer experience — mobile is the only
  MVP surface.
- No custom backend service beyond what is required to support Supabase,
  R2, and (later) Razorpay integrations.

---

## Success Metrics

| Metric | Why it matters |
|---|---|
| **Booking completion rate** | Directly measures whether Genie Bhai executes, not just displays options. |
| **Conversion rate** | Measures how efficiently intent turns into a completed transaction. |
| **Repeat users** | Measures whether trust and reliability are actually being delivered. |
| **Partner acceptance rate** | Measures partner-side reliability and network health. |
| **Average booking time** | Directly measures execution speed — the product's core differentiator. |
| **Customer satisfaction** | Captures the qualitative trust and quality signal behind the numbers. |

---

## Governance

> **No implementation PR may introduce a new architectural, product, or
> technology decision unless it is first documented and approved in the
> Master Blueprint.**

This rule is permanent. Any engineer, agent, or automated process
proposing a change that is not already covered by this document (or one of
its companion documents) must:

1. Stop before implementing.
2. Propose the change as a documentation update to this blueprint or the
   relevant companion document.
3. Get that documentation change reviewed and approved.
4. Only then implement.

This applies equally to product scope (e.g. a sixth intent), architecture
(e.g. a new hosting provider), and technology choices (e.g. a new database
or storage system). The Master Blueprint is the contract; the code must
follow it, not the other way around.

### Companion documents

| Document | Purpose |
|---|---|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Expanded system architecture and component responsibilities |
| [DATABASE_BLUEPRINT.md](./DATABASE_BLUEPRINT.md) | Logical database design, relationships, scalability notes |
| [UX_PRINCIPLES.md](./UX_PRINCIPLES.md) | Complete UX philosophy |
| [PARTNER_QUALITY_STANDARDS.md](./PARTNER_QUALITY_STANDARDS.md) | Partner verification and quality SOP |
| [ENGINEERING_GUIDELINES.md](./ENGINEERING_GUIDELINES.md) | Coding philosophy, branch strategy, naming, organization |
| [ROADMAP.md](./ROADMAP.md) | Short, medium, and long-term product and technical roadmap |
| [adr/0001_PROJECT_FOUNDATION.md](./adr/0001_PROJECT_FOUNDATION.md) | Architecture Decision Record for the foundational decisions |
| [REPOSITORY_GUARD.md](./REPOSITORY_GUARD.md) | Repository isolation policy |
| [FLUTTERFLOW_SUPABASE_FOUNDATION.md](./FLUTTERFLOW_SUPABASE_FOUNDATION.md) | Detailed FlutterFlow + Supabase connection foundation |
