# Ask Genie Bhai — Engineering Guidelines

Status: Canonical
Repository: `oxiomindia/askgeniebhai`
Phase: Documentation-only foundation

> These guidelines apply to every future implementation PR, regardless of
> which layer of the stack it touches (Next.js frontend code, Next.js
> server-side code on Vercel, or any other approved surface).
>
> If anything in this document conflicts with the Master Blueprint, the
> Master Blueprint is the canonical source and this document must be
> updated accordingly.

---

## Coding Philosophy

- **Keep it simple.** Prefer the simplest implementation that correctly
  solves the approved requirement. Do not build for hypothetical future
  requirements — extend when the requirement actually arrives.
- **Strong TypeScript.** All TypeScript code (Next.js frontend and
  server-side code) uses strict typing. No `any` without a documented
  reason; prefer explicit types over inference where it aids readability
  at a public boundary.
- **Business logic outside UI.** UI components (React components) render
  state and dispatch actions — they do not
  contain booking rules, pricing logic, or verification logic. That logic
  lives in `features/` or `services/` (see
  [Folder Strategy](#folder-strategy)) so it is testable independent of
  any UI framework.
- **Reusable components.** A UI pattern used more than once becomes a
  shared component before a third copy is written. Copy-paste is
  acceptable for the second instance; it is a defect by the third.
- **Document architecture first.** No new architectural, product, or
  technology decision is implemented before it is documented and
  approved in the [Master Blueprint](./00_ASK_GENIE_BHAI_BLUEPRINT.md)
  (see [Governance](./00_ASK_GENIE_BHAI_BLUEPRINT.md#governance)).
- **Avoid duplication.** One logical concept, one implementation. If two
  features need the same capability, extract it to a shared `hook`,
  `service`, or `util` rather than reimplementing it.
- **Feature-first organization.** Code is organized around what the
  product does (an intent, a booking step) rather than around technical
  layers spread across the whole codebase.

---

## Branch Strategy

Ask Genie Bhai follows a standard feature-branch workflow:

| Branch pattern | Purpose |
|---|---|
| `main` | Always deployable/reviewable. Protected. No direct commits after the foundation phase. |
| `docs/*` | Documentation-only changes (e.g. this PR's `docs/master-blueprint-foundation`). |
| `feature/*` | New product functionality, scoped to a single feature or intent. |
| `fix/*` | Bug fixes. |
| `chore/*` | Tooling, dependency, or non-product-behavior changes. |
| `agent/*` | Agent-authored branches for planning or documentation work, consistent with existing repository convention. |

Rules:

- All changes enter `main` through a pull request — no direct pushes.
- Every PR must state which companion document(s) it aligns with, or (for
  documentation PRs) which document(s) it is updating.
- **Draft PRs** are used whenever work is in progress or multi-step, so
  review can begin before the PR is marked ready.
- **Squash merge** is the default merge strategy — it keeps `main`'s
  history as one clean, reviewable commit per PR, which matters
  especially for agent-driven branches that accumulate many small
  intermediate commits.
- Rebase merge is reserved for the rare case where a linear,
  commit-by-commit history must be preserved; it is not the default.
- Feature branches are deleted after merge to keep the branch list
  representative of active work.
- Repository Guard must continue to pass on every push and pull request;
  no engineering workflow may bypass it.

---

## Naming Conventions

| Scope | Convention | Example |
|---|---|---|
| Branches | `type/short-kebab-description` | `feature/book-a-cab-flow` |
| Files (docs) | `UPPER_SNAKE_CASE.md` for canonical/root-level docs, numbered prefix for ordered docs | `00_ASK_GENIE_BHAI_BLUEPRINT.md`, `ARCHITECTURE.md` |
| Files (code, future) | `kebab-case` for files, `PascalCase` for components/types, `camelCase` for functions/variables | `booking-summary-card.tsx`, `BookingSummaryCard`, `getAvailability()` |
| Database entities | `snake_case`, plural nouns for tables | `partner_locations`, `booking_status` |
| Environment variables | `UPPER_SNAKE_CASE`, prefixed by system | `SUPABASE_SERVICE_ROLE_KEY`, `R2_ACCESS_KEY_ID` |
| ADRs | `NNNN_TITLE_CASE.md`, sequential, never renumbered | `0001_PROJECT_FOUNDATION.md` |

Consistency matters more than any individual convention — once a
convention is set here, deviating from it requires updating this document
first.

---

## Folder Strategy

See
[00_ASK_GENIE_BHAI_BLUEPRINT.md#folder-strategy](./00_ASK_GENIE_BHAI_BLUEPRINT.md#folder-strategy)
for the canonical folder layout and the rationale behind each folder.
Summary of the governing rule: **organize by feature first, by technical
layer second.** A new engineer should be able to find everything related
to "Book a Cab" inside `features/book-a-cab/`, not scattered across
generic technical folders.

---

## Reusable Components

- A component belongs in `components/` only if it has no feature-specific
  logic and could plausibly be reused by a different feature.
- A component that encodes a specific business rule (e.g. how a booking
  status maps to a color) belongs in the owning `features/` module, with
  only its presentation extracted to `components/` if reused.
- Props and types for shared components live in `types/`, not duplicated
  per consuming feature.

---

## Documentation-First Development

The order of operations for any non-trivial change is:

1. **Check the Master Blueprint and companion documents.** Confirm the
   change is consistent with what is already documented.
2. **If it introduces a new decision**, document it first — as an update
   to the relevant companion document, or as a new
   [ADR](./adr/0001_PROJECT_FOUNDATION.md)-style record if it is a
   significant architectural choice.
3. **Get the documentation change reviewed and approved.**
4. **Only then implement.**

This is not bureaucracy for its own sake — it is what keeps the
Master Blueprint true. A blueprint that code silently diverges from stops
being a source of truth.

---

## Testing Expectations (forward-looking)

Once implementation begins:

- Business logic in `features/` and `services/` must be unit-testable
  independent of UI rendering.
- `utils/` functions are pure and require no mocking to test.
- Tests live in `tests/`, mirroring the structure of the code under test.
- No implementation PR merges without tests for new business logic;
  documentation-only PRs (like this one) are exempt by definition.

This section is forward-looking guidance for when implementation begins —
it does not apply to the current documentation-only phase.
