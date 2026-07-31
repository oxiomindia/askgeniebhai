# Ask Genie Bhai — Architecture

Status: Canonical
Repository: `oxiomindia/askgeniebhai`
Phase: Documentation-only foundation

> This document expands the system architecture summarized in
> [00_ASK_GENIE_BHAI_BLUEPRINT.md](./00_ASK_GENIE_BHAI_BLUEPRINT.md#system-architecture).
> If anything here conflicts with the Master Blueprint, the Master
> Blueprint wins and this document must be corrected.

---

## Overview

Ask Genie Bhai is a transaction-first web application (see
[ADR 0002](./adr/0002_FRONTEND_MIGRATION_NEXTJS.md)) built on a small
number of managed platforms rather than a custom, self-hosted backend. The
architecture is deliberately narrow: every component exists because a
specific responsibility needs a home, not because it might be useful
later.

```text
┌───────────┐      ┌──────────────┐      ┌────────────┐      ┌───────────────┐      ┌───────────┐
│   User    │ ───▶ │   Next.js    │ ───▶ │  Supabase  │ ───▶ │ Cloudflare R2 │ ───▶ │ Razorpay  │
│(traveler) │      │  (web UI)    │      │(DB + Auth) │      │   (storage)   │      │ (payments,│
└───────────┘      └──────┬───────┘      └─────┬──────┘      └───────┬───────┘      │  future)  │
                           │                     │                     │             └───────────┘
                           │                     │                     │
                           ▼                     ▼                     ▼
                    ┌─────────────────────────────────────────────────────┐
                    │                       Vercel                        │
                    │  Hosts the Next.js app itself, plus any             │
                    │  server-side logic needing a secret: signed URLs,   │
                    │  webhook verification, payment order creation       │
                    └─────────────────────────────────────────────────────┘
```

The diagram above is directional for the *primary* data path (a traveler
action flowing through the stack), not a strict call graph — Next.js
(client-side) and its own server-side code both talk to Supabase and R2
directly where appropriate; server-side Next.js code (running on Vercel)
exists specifically for the calls that require a secret the browser must
never hold.

---

## Component Responsibilities

### Next.js

**Owns:** the entire traveler-facing web experience, and (via its
server-side code, hosted on Vercel) any privileged operation that needs a
secret.

- Presents the five MVP intents and drives the traveler through the
  booking lifecycle (Intent → Discovery → Partner → Booking →
  Confirmation → Completion → Feedback).
- Client-side (browser) code talks to Supabase directly for reads/writes
  that are safe under Row Level Security, using the anon/publishable key
  via a browser Supabase client.
- Server-side code (API routes / Server Actions / Route Handlers) uses a
  server Supabase client and handles any operation that needs a
  server-side secret (payment order creation, R2 signed uploads).
- Browser-exposed code holds **only** client-safe credentials: the
  Supabase project URL and anon key. No service role keys, no R2 secrets,
  no Razorpay secret key ever reach the browser.

### Supabase (PostgreSQL + Auth)

**Owns:** structured application data and identity.

- PostgreSQL is the system of record for users, partners, bookings,
  availability, verification, and reviews (see
  [DATABASE_BLUEPRINT.md](./DATABASE_BLUEPRINT.md)).
- Supabase Auth issues JWTs used both for session management in Next.js
  (browser and server) and for scoping database access through Row Level
  Security.
- Every client-accessible table must have RLS enabled; there is no
  table that a browser client can read or write without an explicit
  policy.
- Supabase is not used as the media/file storage layer — that
  responsibility belongs entirely to Cloudflare R2.

### Cloudflare R2

**Owns:** media and binary file storage.

- Stores partner photos, verification documents, and any other binary
  asset referenced by the `media` entity.
- Supabase PostgreSQL stores only metadata (path, owner, content type)
  about a file; the file bytes themselves live in R2.
- Default access is private. Public access is granted only to
  explicitly non-sensitive, public-facing assets.
- Upload and signed-URL issuance is a privileged operation and must go
  through Next.js server-side code (hosted on Vercel) — never directly
  from the browser with a raw R2 credential.

### Vercel

**Owns:** hosting the Next.js application — frontend and server-side
logic in one deployable codebase.

- Hosts the customer-facing Next.js web application (the MVP surface
  itself, not a preview).
- Hosts server-side logic responsible for:
  - Generating signed R2 upload/download URLs.
  - Creating Razorpay orders and verifying Razorpay webhooks (once
    payments are introduced).
  - Any other operation that must not execute on-device because it
    requires a secret or must be atomic/trusted.
- Vercel is the only place server-side secrets (`SUPABASE_SERVICE_ROLE_KEY`,
  R2 secret keys, `RAZORPAY_KEY_SECRET`) may live.

### Razorpay (future)

**Owns:** payment collection and payment lifecycle, once introduced.

- Deferred until the launch phase (see
  [ROADMAP.md](./ROADMAP.md)).
- Order creation and webhook verification happen server-side, on
  Vercel — never in browser-side Next.js code.
- Payment state is reflected back into Supabase via the (future)
  `payments` entity, linked to a `bookings` row.

### Maps (deferred)

No mapping, geocoding, or routing provider is part of the current
architecture. None of the five MVP intents strictly require one. A
mapping provider will be added — and this document updated — only when an
approved roadmap item requires it.

---

## Future Integrations

Any future integration (a mapping provider, a notification/push service, an
analytics platform, an AI/LLM provider for assistance features) follows the
same pattern established above:

1. It is proposed and documented here (or in a dedicated companion
   document) **before** implementation, per the
   [Governance](./00_ASK_GENIE_BHAI_BLUEPRINT.md#governance) rule in the
   Master Blueprint.
2. Its responsibility boundary is defined explicitly — what it owns, and
   what it must not own.
3. If it requires a secret, it is integrated through Next.js server-side
   code (hosted on Vercel), never directly from the browser.
4. If it stores data, the logical entity it introduces is added to
   [DATABASE_BLUEPRINT.md](./DATABASE_BLUEPRINT.md) before any table is
   created.

This keeps the architecture legible as the product grows: at any point,
this document should describe the complete set of external systems the
product depends on, and why.
