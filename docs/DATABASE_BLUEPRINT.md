# Ask Genie Bhai — Database Blueprint

Status: Canonical — logical design only
Repository: `oxiomindia/askgeniebhai`
Phase: Documentation-only foundation

> This document describes the **logical** database design for Ask Genie
> Bhai: entities, relationships, and scalability considerations. It
> deliberately contains **no SQL, no column-level schema, and no migration
> scripts**. Physical schema design is a separate, future, implementation
> task that must be approved against this blueprint before any table is
> created.

---

## Entities

| Entity | Description |
|---|---|
| `users` | A traveler with an authenticated identity (via Supabase Auth). The subject of every booking. |
| `partners` | A business entity that provides one or more of the five MVP services. |
| `partner_locations` | A physical location operated by a partner. A partner may have multiple locations. |
| `partner_services` | A specific bookable service offered at a location, mapped to exactly one of the five MVP intents (Freshen Up, Keep My Bags, Rest, Cab, Room). |
| `availability` | Time-windowed capacity for a `partner_service` — what can be booked, and when. |
| `bookings` | A traveler's transaction against a `partner_service` for a specific time window. |
| `booking_status` | The lifecycle state history of a `booking` (e.g. requested, confirmed, in-progress, completed, cancelled). |
| `verification` | A record documenting that a `partner_location` (or a specific `partner_service`) has passed the quality/verification checks defined in [PARTNER_QUALITY_STANDARDS.md](./PARTNER_QUALITY_STANDARDS.md). |
| `reviews` | Traveler feedback tied to a completed `booking`. |
| `media` | Metadata describing a binary asset stored in Cloudflare R2 (photos, verification documents), referenced by the entity it belongs to. |
| `payments` (future) | A payment transaction tied to a `booking`, introduced when Razorpay is integrated. |

---

## Relationships

```text
users (1) ──────────────< (many) bookings
partners (1) ───────────< (many) partner_locations
partner_locations (1) ──< (many) partner_services
partner_services (1) ──< (many) availability
partner_services (1) ──< (many) bookings
bookings (1) ───────────< (many) booking_status        (status history)
bookings (1) ───────────── (0..1) reviews               (one review per completed booking)
bookings (1) ───────────── (0..1) payments (future)      (one payment per booking)
partner_locations (1) ──< (many) verification
partner_locations (1) ──< (many) media
partner_services (1) ──< (many) media
```

### Narrative relationships

- A **user** places many **bookings** over time; a booking always belongs
  to exactly one user.
- A **partner** is the business entity; it can operate many
  **partner_locations** (e.g. a partner running bag storage counters at
  three different stations).
- A **partner_location** offers one or more **partner_services** — each
  service maps to exactly one of the five MVP intents. A single location
  could in principle offer more than one service (e.g. a lounge offering
  both Freshen Up and Rest), but each service is tracked as its own
  entity so it can be booked, priced, and verified independently.
- A **partner_service** has **availability** — the time-windowed capacity
  that determines what can actually be booked.
- A **booking** always references exactly one **user** and exactly one
  **partner_service**, plus the specific time window drawn from
  **availability**.
- A **booking** moves through a history of **booking_status** values,
  following the lifecycle defined in the Master Blueprint (requested →
  confirmed → in-progress → completed, or cancelled at various points).
  This is modeled as a history, not a single mutable field, so the full
  lifecycle timeline is queryable for support and analytics.
- A completed **booking** may produce exactly one **review** from the
  traveler.
- A **partner_location** (and optionally a specific **partner_service**)
  accumulates **verification** records over time as it is re-checked
  against the quality SOP.
- **media** attaches to whichever entity it documents — most commonly a
  `partner_location` (storefront photos) or a `partner_service`
  (service-specific photos) — and stores only metadata; the binary
  content lives in Cloudflare R2.
- Once introduced, a **payment** will attach to exactly one **booking**.

---

## Design Principles

- **One entity, one responsibility.** `partners` and `partner_locations`
  are separate because a single partner business can operate multiple
  physical sites with independent availability, verification status, and
  quality scores.
- **Status as history, not state.** `booking_status` is modeled as an
  append-only history rather than a single mutable column, so the full
  lifecycle (including cancellations and edge cases) remains auditable.
- **Media is metadata-only in Postgres.** No binary content is ever
  stored in Supabase; `media` rows point at Cloudflare R2 objects. This
  keeps the transactional database small and fast regardless of how much
  media the partner network accumulates.
- **Verification is a first-class entity, not a boolean flag.** Trust is
  the product's core differentiator, so verification is tracked as a
  history of records (who verified, when, against which standard),
  not a single `is_verified` flag that loses that context.
- **Payments are additive, not foundational.** The MVP schema must work
  completely without a `payments` entity. When Razorpay is introduced,
  `payments` attaches to `bookings` without requiring changes to the
  existing entities.

---

## Scalability Recommendations

- **Partition by time where growth is unbounded.** `bookings`,
  `booking_status`, and `availability` will grow continuously; when
  physical schema design happens, plan for time-based partitioning or
  archival strategy rather than assuming a single ever-growing table is
  sufficient indefinitely.
- **Keep `media` out of the hot path.** Because media metadata is
  decoupled from R2 object storage, database load does not scale with
  media volume — only with metadata row count, which is much smaller.
- **Design `availability` for read-heavy access.** Discovery (matching a
  traveler's intent to available partner services) is the highest-read
  path in the product. Physical schema design should optimize
  `availability` and `partner_services` lookups for read performance,
  even if it costs some write-side complexity.
- **Isolate verification and review history from the booking hot path.**
  `verification` and `reviews` are read for trust signals but written
  relatively infrequently; they should not be joined into the
  performance-critical booking-creation path.
- **RLS scoping should follow the entity boundary.** Row Level Security
  policies (defined at implementation time) should be designed per
  entity — a traveler can read their own `bookings` and `reviews`, a
  partner can read bookings against their own `partner_locations` — so
  access control scales naturally as the partner and traveler base
  grows.
- **Plan for read replicas before plan for sharding.** At the scale this
  product expects through Phase 2, a managed Postgres read replica
  strategy is sufficient; sharding is out of scope until a specific,
  measured bottleneck justifies it.

No physical schema, index strategy, or migration plan is defined here —
that is deliberately deferred to an implementation-phase PR that
references this document.
