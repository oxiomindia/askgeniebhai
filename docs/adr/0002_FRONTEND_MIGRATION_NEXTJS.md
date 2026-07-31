# ADR 0002 — Frontend Migration: FlutterFlow to Next.js

Status: Accepted
Date: 2026-07-31
Repository: `oxiomindia/askgeniebhai`

## Context

[ADR 0001](./0001_PROJECT_FOUNDATION.md) recorded FlutterFlow as the
canonical frontend for Ask Genie Bhai. Following that decision, this
repository's Supabase project (`askgeniebhai`) was connected to a
FlutterFlow project, its schema was synced into FlutterFlow via Get
Schema, Authentication was enabled and set to the Supabase provider, and
an initial Sign In / Sign Up page was scaffolded from a FlutterFlow
template.

Product ownership has since decided to replace FlutterFlow with a
custom-coded web frontend. Per the Master Blueprint's
[Governance](../00_ASK_GENIE_BHAI_BLUEPRINT.md#governance) rule, this ADR
records that decision before any frontend implementation begins.

## Decision

**FlutterFlow is deprecated as the canonical frontend for Ask Genie Bhai.**

The new canonical frontend is:

- Next.js 15
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

The following are explicitly unchanged by this decision:

- The existing Supabase project, database schema, migrations, RLS
  policies, and Supabase Auth configuration.
- The existing Vercel project — it now hosts the Next.js application
  directly (frontend and server-side logic) rather than only future
  backend services.
- The existing GitHub repository (`oxiomindia/askgeniebhai`) — no new
  repository is created.
- Repository Guard and the repository isolation policy.

## Consequences

- The FlutterFlow project ("Ask Genie Bhai" on app.flutterflow.io) is no
  longer under active development. The Supabase connection audit, schema
  sync, Authentication toggle, and Auth1 page scaffold performed there are
  superseded and are not carried forward into the Next.js frontend.
- [FLUTTERFLOW_SUPABASE_FOUNDATION.md](../FLUTTERFLOW_SUPABASE_FOUNDATION.md)
  is marked superseded. Its FlutterFlow-specific instructions no longer
  apply; its Supabase-specific guidance (RLS policy, environment variable
  naming, authentication configuration, backup strategy) is
  frontend-agnostic and still applies to the Next.js frontend.
- The Master Blueprint's prior Non-Goal — no web-first customer
  experience, mobile as the only MVP surface — is superseded. The Next.js
  web application is now the sole canonical MVP surface; no native mobile
  app (iOS/Android) is in scope for this phase.
- The architecture's prior split between a FlutterFlow client and
  separate Vercel backend services collapses: Next.js running on Vercel
  provides both the traveler-facing UI and the server-side code that
  needs secrets (signed R2 URLs, Razorpay order creation/webhooks), in one
  deployable codebase.
- [00_ASK_GENIE_BHAI_BLUEPRINT.md](../00_ASK_GENIE_BHAI_BLUEPRINT.md),
  [ARCHITECTURE.md](../ARCHITECTURE.md),
  [UX_PRINCIPLES.md](../UX_PRINCIPLES.md),
  [ROADMAP.md](../ROADMAP.md), and
  [ENGINEERING_GUIDELINES.md](../ENGINEERING_GUIDELINES.md) are updated in
  the same pull request as this ADR to remove FlutterFlow-as-canonical
  references and replace them with Next.js.
- Per [ADR 0001](./0001_PROJECT_FOUNDATION.md)'s own rule, that record is
  not edited or renumbered — this ADR supersedes its frontend decision
  while leaving the historical record intact.
- Frontend implementation (the Next.js application scaffold) begins only
  after this documentation PR is reviewed and merged, per the
  Documentation-First Development order of operations in
  [ENGINEERING_GUIDELINES.md](../ENGINEERING_GUIDELINES.md#documentation-first-development).
