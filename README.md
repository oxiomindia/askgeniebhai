# middleware-runtime-test

Isolated reproduction case for `ReferenceError: __dirname is not defined` /
`500 MIDDLEWARE_INVOCATION_FAILED` observed on Vercel Edge Middleware in
another project (`askgeniebhai`), using the exact same dependency versions
(`next@15.5.22`, `react@19.2.8`, `@supabase/ssr@0.12.4`).

This is an **orphan branch** of the `askgeniebhai` repository
(`isolated-test/middleware-runtime-test`) with no shared history or code —
import it into Vercel as a **new, separate project** tracking this branch to
get full platform-level isolation.

## Staged plan

Each stage is one commit. Deploy after each and record the result before
moving to the next — stop as soon as the failure first appears.

1. **Stage 1** (this commit): bare Next.js app, no middleware at all.
2. **Stage 2**: add `middleware.ts` with only `NextResponse.next()` — no
   Supabase, no logic.
3. **Stage 3**: add `@supabase/ssr` and the minimal official session-refresh
   middleware pattern.

## Expected results if the hypothesis is correct

- If Stage 1 fails: the problem is Next.js 15.5.22 itself on this Vercel
  account/team, unrelated to middleware or Supabase.
- If Stage 2 fails (Stage 1 passed): the problem is Next.js Edge Middleware
  specifically, unrelated to Supabase.
- If Stage 3 fails (Stages 1–2 passed): the problem is specific to
  `@supabase/ssr@0.12.4` combined with this Edge Runtime.
- If all three pass: the problem is specific to the `askgeniebhai` Vercel
  project's configuration or state, not these dependency versions.
