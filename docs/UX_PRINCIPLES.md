# Ask Genie Bhai — UX Principles

Status: Canonical
Repository: `oxiomindia/askgeniebhai`
Phase: Documentation-only foundation

> Every screen, flow, and component must be evaluated against this
> document before it ships. If a design decision conflicts with these
> principles, the principles win — not the design.
>
> If anything in this document conflicts with the Master Blueprint, the
> Master Blueprint is the canonical source and this document must be
> updated accordingly.

---

## Core Philosophy

Ask Genie Bhai's UX exists to serve one goal: **get the traveler from
intent to completed transaction as fast as possible.** Every principle
below is a specialization of that single goal.

| Principle | What it means in practice |
|---|---|
| **Mobile-first** | Every screen is designed for a single hand, on the move, often with poor connectivity. There is no desktop-first or web-first design pass. |
| **Minimal clicks** | Every screen removed from a flow is a win. The target is booking completion in the fewest taps physically possible for that transaction. |
| **Fast loading** | Perceived speed is a feature. Screens must render meaningful content immediately, with data loading progressively rather than blocking on a spinner. |
| **Large touch targets** | Travelers are often distracted, walking, or in poor lighting. Tap targets are sized for reliability, not visual density. |
| **Transaction-first** | Every screen exists to move a booking forward. Informational or browsing-only screens are the exception, not the default. |
| **Minimal forms** | Ask for the least information required to complete the transaction. Defer optional information collection until after the core transaction is secured. |

---

## Mobile-First

- Design for one-handed use, thumb-reachable primary actions, and portrait
  orientation as the default.
- Assume variable network quality (airports, train stations, basements)
  and design for graceful degradation, not just the happy path.
- Avoid desktop UX patterns: no hover states, no dense multi-column
  tables, no small click targets meant for a mouse cursor.
- Text must be legible at a glance, in bright sunlight or a dim terminal,
  without zooming.

## Minimal Clicks

- Every additional screen or step in a booking flow must justify its
  existence against the [Business Filter](./00_ASK_GENIE_BHAI_BLUEPRINT.md#business-filter).
- Prefer smart defaults (nearest location, soonest availability) over
  asking the traveler to choose from an unfiltered list.
- Collapse confirmation steps where the cost of a mistake is low; expand
  them only where the cost of a mistake (e.g. payment, cancellation) is
  high enough to warrant the friction.
- One primary action per screen. Secondary actions must be visually
  subordinate.

## Fast Loading

- Show structure immediately (skeleton states), then populate with data
  — never a blank screen while waiting on a network round trip.
- Cache aggressively for anything that does not need to be real-time
  (partner details, quality standards copy); keep only truly live data
  (availability, booking status) fresh from the source.
- Treat any screen that takes more than roughly one second to become
  interactive as a defect, not a tradeoff.

## Large Touch Targets

- Primary actions (Book, Confirm, Cancel) must be sized and spaced for
  reliable thumb interaction, not minimum platform guidelines.
- Avoid stacking multiple small tap targets close together in any flow
  that is time-pressured (e.g. selecting a cab pickup point while
  walking).
- Destructive or hard-to-reverse actions (cancel a booking) should be
  reachable but not accidentally triggerable — larger targets do not mean
  every action is equally easy to trigger.

## Transaction-First

- Every screen should be answerable with: "which stage of the
  [Booking Lifecycle](./00_ASK_GENIE_BHAI_BLUEPRINT.md#booking-lifecycle)
  does this screen serve?" If the answer is unclear, the screen likely
  does not belong.
- Discovery screens exist to narrow choice, not to showcase inventory —
  show the smallest sufficient set of trustworthy options, not an
  exhaustive catalog.
- Avoid features that encourage browsing without a path back to
  completing the current transaction.

## Minimal Forms

- Collect only the information required to complete the current step of
  the booking lifecycle.
- Prefer selection (tap a preset option) over free-text entry wherever
  possible.
- Pre-fill anything already known from the user's profile, prior
  bookings, or device context (with consent).
- Defer optional or "nice to have" data collection (preferences,
  marketing opt-ins) to after the transaction is secured — never let it
  block the booking.

---

## Anti-Patterns (explicitly rejected)

- Infinite-scroll browsing of partner listings.
- Multi-step comparison shopping UIs (side-by-side partner comparison
  grids).
- Desktop-style dashboards, dense tables, or hover-dependent interactions.
- Long onboarding forms before a traveler can see or book anything.
- Any flow that requires more taps than the fastest competing option
  (including simply calling the partner directly) — if Genie Bhai isn't
  faster, it has failed its core purpose.

This document should be read alongside
[00_ASK_GENIE_BHAI_BLUEPRINT.md](./00_ASK_GENIE_BHAI_BLUEPRINT.md) for
product context and
[PARTNER_QUALITY_STANDARDS.md](./PARTNER_QUALITY_STANDARDS.md) for how
trust signals are surfaced in the UI.
