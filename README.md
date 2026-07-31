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

- [`docs/FLUTTERFLOW_SUPABASE_FOUNDATION.md`](./docs/FLUTTERFLOW_SUPABASE_FOUNDATION.md) — canonical stack, connection rules, RLS policy, branching strategy.
- [`docs/REPOSITORY_GUARD.md`](./docs/REPOSITORY_GUARD.md) — repository isolation policy, enforced in CI.

The Master Blueprint (`00_ASK_GENIE_BHAI_BLUEPRINT.md`), `ARCHITECTURE.md`,
`DATABASE_BLUEPRINT.md`, `ENGINEERING_GUIDELINES.md`, `ROADMAP.md`,
`UX_PRINCIPLES.md`, `PARTNER_QUALITY_STANDARDS.md`, and `docs/adr/` are
proposed in PR #2 and are the source of truth this scaffold implements
against once merged. If anything in this repository conflicts with that
set, the Master Blueprint wins.

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

FlutterFlow's Flutter source is not committed to `main`. Per
[docs/FLUTTERFLOW_SUPABASE_FOUNDATION.md § Recommended Repository Branching Strategy](./docs/FLUTTERFLOW_SUPABASE_FOUNDATION.md#recommended-repository-branching-strategy),
FlutterFlow's GitHub export pushes to a `flutterflow` branch. `.gitignore`
already excludes Flutter/Dart build artifacts so that branch stays clean
regardless of what lands on it.

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
in `docs/FLUTTERFLOW_SUPABASE_FOUNDATION.md`. Discovery-relevant tables
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
5. FlutterFlow: connect the project's Supabase integration per
   [docs/FLUTTERFLOW_SUPABASE_FOUNDATION.md § FlutterFlow Connection](./docs/FLUTTERFLOW_SUPABASE_FOUNDATION.md#flutterflow-connection).
   Do not hand-edit generated FlutterFlow code in this repository.

No table has been created directly against the live `askgeniebhai`
Supabase project by this scaffold — migrations here are reviewed through
this pull request and applied via `supabase db push` (or CI) once merged.

## Contributing

All changes land through pull requests — no direct pushes to `main`.
Repository Guard must pass on every push and pull request. See
`docs/ENGINEERING_GUIDELINES.md` for branch naming, commit conventions,
and the documentation-first governance rule.
