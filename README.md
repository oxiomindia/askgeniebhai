# Ask Genie Bhai

A transaction-first travel assistance platform for Oxiom. Ask Genie Bhai
helps travelers complete five high-value tasks quickly and reliably:
Freshen Up, Keep My Bags, Rest, Book a Cab, Book a Room.

This is not Oxiom One. This is not Opportunity OS. `oxiomindia/askgeniebhai`
is a fully independent repository — see
[docs/REPOSITORY_GUARD.md](./docs/REPOSITORY_GUARD.md).

## Start here

The canonical product and engineering documentation lives in
[`docs/`](./docs). Read it before making any change:

- [`docs/00_ASK_GENIE_BHAI_BLUEPRINT.md`](./docs/00_ASK_GENIE_BHAI_BLUEPRINT.md) — the Master Blueprint; single source of truth.
- [`docs/adr/0002_FRONTEND_MIGRATION_NEXTJS.md`](./docs/adr/0002_FRONTEND_MIGRATION_NEXTJS.md) — canonical frontend is Next.js (React, TypeScript, Tailwind CSS, shadcn/ui), replacing FlutterFlow.
- [`docs/FLUTTERFLOW_SUPABASE_FOUNDATION.md`](./docs/FLUTTERFLOW_SUPABASE_FOUNDATION.md) — superseded for frontend guidance; its RLS/env-var/auth-config guidance still applies.
- [`docs/REPOSITORY_GUARD.md`](./docs/REPOSITORY_GUARD.md) — repository isolation policy, enforced in CI.

`ARCHITECTURE.md`, `DATABASE_BLUEPRINT.md`, `ENGINEERING_GUIDELINES.md`,
`ROADMAP.md`, `UX_PRINCIPLES.md`, `PARTNER_QUALITY_STANDARDS.md`, and
`docs/adr/` are the rest of the canonical documentation set. If anything
in this repository conflicts with the Master Blueprint, the Master
Blueprint wins.

## Repository structure

```text
.github/workflows/   Repository Guard CI (enforces repo isolation)
docs/                 Canonical product and engineering documentation
supabase/
  config.toml         Supabase CLI local development configuration
  migrations/         SQL migrations — schema, RLS policies (source of truth for the database)
  seed.sql            Local dev seed file — intentionally empty, no fixtures committed
.env.example          Names of every environment variable this project uses (no values)
```

The frontend is Next.js, built directly in this repository (see
[docs/adr/0002_FRONTEND_MIGRATION_NEXTJS.md](./docs/adr/0002_FRONTEND_MIGRATION_NEXTJS.md)) —
not FlutterFlow's GitHub export. `.gitignore` still excludes Flutter/Dart
build artifacts for historical reasons but no Flutter code is expected in
this repository going forward.

## Database

The schema in `supabase/migrations/` implements the logical entities
described in `DATABASE_BLUEPRINT.md` exactly — no invented tables, no
renamed tables, no changed relationships. One migration per entity, in
dependency order:

`users` → `partners` → `partner_locations` → `partner_services` →
`availability` → `bookings` → `booking_status` → `verification` →
`reviews` → `media`

`payments` is intentionally not implemented — it is documented as a future
entity that attaches to `bookings` once Razorpay is integrated (Phase 2),
and payments are out of scope for this foundation.

Every table has Row Level Security enabled, per the mandatory RLS policy
described in `docs/FLUTTERFLOW_SUPABASE_FOUNDATION.md` (still applicable —
see [ADR 0002](./docs/adr/0002_FRONTEND_MIGRATION_NEXTJS.md)). Discovery-relevant tables
(`partners`, `partner_locations`, `partner_services`, `availability`,
`verification`, `reviews`, `media`) are readable by any authenticated
user; `users`, `bookings`, `booking_status`, and `reviews` writes are
scoped to the owning traveler (`auth.uid()`), with all other writes
reserved for the service role until a Partner Dashboard (Phase 2) exists.

## Development setup

1. Install the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started).
2. Copy `.env.example` to `.env` and fill in values from your own Supabase
   project settings — never commit `.env`.
3. Link this checkout to the `askgeniebhai` Supabase project:
   ```sh
   supabase link --project-ref <askgeniebhai-project-ref>
   ```
4. Apply migrations to your linked project:
   ```sh
   supabase db push
   ```
   Or run a fully local stack with `supabase start` first.
5. The Next.js application (frontend) lives directly in this repository —
   see [docs/adr/0002_FRONTEND_MIGRATION_NEXTJS.md](./docs/adr/0002_FRONTEND_MIGRATION_NEXTJS.md)
   for the current canonical stack.

No table has been created directly against the live `askgeniebhai`
Supabase project by this scaffold — migrations here are reviewed through
this pull request and applied via `supabase db push` (or CI) once merged.

## Contributing

All changes land through pull requests — no direct pushes to `main`.
Repository Guard must pass on every push and pull request. See
`docs/ENGINEERING_GUIDELINES.md` for branch naming, commit conventions,
and the documentation-first governance rule.
