# FlutterFlow + Supabase Foundation

Status: Proposed for review  
Repository: `oxiomindia/askgeniebhai`  
Product: Ask Genie Bhai  
Phase: Development foundation only

## Foundation Decisions

FlutterFlow is the primary frontend for Ask Genie Bhai v1.0.

Supabase is the primary backend for Ask Genie Bhai v1.0.

This document does not approve application screens, database tables, mock data, generated FlutterFlow pages, exported Flutter code, package installation, or application implementation. It only defines the required foundation for connecting FlutterFlow and Supabase cleanly before development begins.

## Blueprint Alignment Gate

Before any implementation task starts, confirm that the work aligns with:

- The approved Product Blueprint.
- MVP scope.
- Mobile-first strategy for Android and iOS.
- The approved five core intents once they are formally documented in this repository.
- Transaction-first philosophy.
- Repository isolation rules.

If a request conflicts with any of these, stop and report the conflict before implementation.

## Supabase Project Creation

Create one Supabase project for Ask Genie Bhai under the correct Oxiom India ownership context.

Recommended setup:

1. Open the Supabase dashboard.
2. Create a new project named `askgeniebhai` or an approved environment-specific variant such as `askgeniebhai-prod`.
3. Generate and store a strong database password in the approved password manager.
4. Do not commit the database password, service role key, connection string, or any secret to GitHub.
5. Confirm the project is healthy before connecting FlutterFlow.

Supabase projects provide a dedicated Postgres database, auto-generated APIs, Auth, Edge Functions, Realtime, and Storage. Only enable product features that are required for the approved MVP.

Reference: https://supabase.com/docs/guides/platform

## Region Selection

Choose the Supabase region closest to the primary expected users.

For Ask Genie Bhai, use APAC as the default selection unless product ownership approves another region. If an exact region is required, prefer `ap-south-1` Mumbai for India-first latency, or `ap-southeast-1` Singapore if the audience is broader across Southeast Asia.

Important rule: a Supabase project region is infrastructure-bound. Changing region later requires creating a new project and migrating data/configuration, so region selection must be approved before application development starts.

References:

- https://supabase.com/docs/guides/platform/regions
- https://supabase.com/docs/guides/troubleshooting/change-project-region-eWJo5Z

## Authentication Configuration

Use Supabase Auth as the authentication system.

Initial configuration checklist:

- Enable only approved authentication providers.
- Keep email authentication enabled for the foundation.
- Require email confirmation unless product ownership explicitly approves a lower-friction alternative.
- Configure application redirect URLs only after FlutterFlow package names, bundle IDs, and deep-link strategy are approved.
- Keep anonymous sign-ins disabled unless a specific MVP intent requires them and receives approval.
- Do not enable social login providers until they are approved for MVP.

Supabase Auth issues JWTs that work with Row Level Security, so future data access must be designed around authenticated users and RLS policies.

References:

- https://supabase.com/docs/guides/auth
- https://supabase.com/docs/guides/auth/general-configuration

## Email Authentication

Email authentication is the approved baseline for foundation setup.

Production requirements:

- Configure custom SMTP before public testing or production use.
- Use a dedicated authentication sending domain, such as `auth.askgeniebhai.com`, if approved.
- Configure SPF, DKIM, and DMARC with the email provider.
- Keep authentication emails separate from marketing emails.
- Customize Supabase Auth email templates only after product copy is approved.

Do not rely on Supabase's default SMTP service for production. Supabase documents the default service as limited and intended for exploration or non-production testing.

Reference: https://supabase.com/docs/guides/auth/auth-smtp

## Storage Configuration

Use Supabase Storage only for approved user or operational files.

Foundation rules:

- Do not create storage buckets in this phase.
- Prefer private buckets by default.
- Use public buckets only for explicitly public, non-sensitive assets.
- Define file size and MIME type restrictions at the bucket level when buckets are approved.
- Control private file access with Storage RLS policies and signed URLs where needed.
- Never expose the service role key in FlutterFlow or client-side code.

Storage objects are not restored by database backup restores; storage backup must be planned separately before production use.

References:

- https://supabase.com/docs/guides/storage
- https://supabase.com/docs/guides/storage/buckets/fundamentals
- https://supabase.com/docs/guides/storage/security/access-control
- https://supabase.com/docs/guides/storage/schema/design

## Database Connection

Supabase exposes Postgres plus auto-generated APIs. FlutterFlow should connect through Supabase's supported integration, not through direct database credentials.

Connection rules:

- FlutterFlow may use the Supabase Project URL and anon key or the Supabase OAuth connection path.
- Direct Postgres connection strings are for trusted development, migration, or backend tooling only.
- The database password and service role key must never be stored in FlutterFlow client settings.
- Do not create app tables until the data model is approved.
- Do not disable RLS for production-bound tables.

Reference: https://supabase.com/docs/guides/database/overview

## FlutterFlow Connection

Use FlutterFlow's Supabase integration as the primary connection path.

Preferred connection method:

1. In FlutterFlow, open Settings & Integrations.
2. Go to Integrations > Supabase.
3. Use Supabase OAuth where available.
4. Authorize access to the correct Supabase organization.
5. Select the `askgeniebhai` Supabase project.
6. Save the generated database password securely if FlutterFlow creates the project through OAuth.
7. After future table creation, use Get Schema in FlutterFlow to sync the latest Supabase schema.

Manual API-key connection should be used only if OAuth is unavailable or not approved. FlutterFlow documents manual API-key connection as intended for self-hosted Supabase setups.

Reference: https://docs.flutterflow.io/integrations/supabase/setup/

## API Keys Required

Allowed in FlutterFlow:

- Supabase Project URL.
- Supabase anon key or publishable client key intended for browser/mobile client access.

Not allowed in FlutterFlow client configuration:

- Supabase service role key.
- Database password.
- Direct Postgres connection string.
- SMTP password.
- Third-party API secrets.

Server-only secrets belong in Supabase Edge Function secrets or another approved backend secret store.

## Environment Variables

Recommended naming for future environments:

- `SUPABASE_URL`: Supabase project URL.
- `SUPABASE_ANON_KEY`: client-safe Supabase anon/publishable key.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only, never exposed to FlutterFlow client code.
- `SUPABASE_DB_PASSWORD`: server-only database password.
- `SUPABASE_DB_URL`: server-only database connection string.
- `SMTP_HOST`: server-only SMTP host.
- `SMTP_PORT`: server-only SMTP port.
- `SMTP_USER`: server-only SMTP user.
- `SMTP_PASS`: server-only SMTP password.

FlutterFlow should store only client-safe values needed for mobile runtime. Supabase secrets and operational credentials must stay outside the client.

## Row Level Security

RLS is mandatory for client-accessible tables.

Foundation policy:

- New application tables must have RLS enabled before mobile client access.
- Policies must be written per approved intent and per role.
- The anon key is acceptable only because RLS controls what each user can access.
- Policies must be reviewed before release.
- Temporary development shortcuts must not be promoted to production.

Supabase Auth integrates with RLS through JWTs, allowing database access to be scoped per authenticated user.

References:

- https://supabase.com/docs/guides/auth
- https://supabase.com/docs/guides/database/overview

## Initial Database Setup

Do not create application tables in this phase.

Approved foundation-only setup:

- Confirm the Supabase project exists.
- Confirm Auth settings are configured.
- Confirm Storage is available but has no approved buckets yet.
- Confirm RLS policy standards are documented before schema work begins.
- Confirm future schema changes are reviewed through pull requests or approved Supabase migration workflow.

When database design is approved later, create tables from an approved schema plan only.

## Recommended Extensions

Do not enable extensions until there is an approved need.

Baseline guidance:

- `uuid-ossp`: available for UUID support; Supabase documents it as enabled by default.
- `pgcrypto`: useful for cryptographic helpers if future schema or functions require them.
- `pg_trgm`: only if approved search behavior requires fuzzy text search.
- `postgis`: only if approved location workflows require geospatial queries.
- `vector`: only if approved AI or semantic matching workflows require embeddings.
- `pg_cron`: only if approved scheduled backend tasks are required.

Avoid extension sprawl. Each extension must have a documented product or operational reason.

References:

- https://supabase.com/docs/guides/database/extensions
- https://supabase.com/docs/guides/database/extensions/uuid-ossp

## Backup Strategy

Minimum strategy before public release:

- Use a paid Supabase plan appropriate for production backups before launch.
- Confirm daily database backups are available in the Supabase dashboard.
- Evaluate Point-in-Time Recovery before handling important production transactions.
- Schedule manual logical exports for major release milestones.
- Maintain off-platform backup records for critical operational configuration.
- Plan Storage object backup separately; database backups include Storage metadata, not the actual stored objects.
- Restrict project deletion permissions to trusted owners only.

References:

- https://supabase.com/docs/guides/platform/backups
- https://supabase.com/docs/guides/platform/delete-project

## Pre-Development Connection Checklist

FlutterFlow frontend:

- [ ] FlutterFlow project exists for Ask Genie Bhai.
- [ ] FlutterFlow project is configured as mobile-first.
- [ ] Android package name is approved.
- [ ] iOS bundle ID is approved.
- [ ] No customer-facing web product is configured for MVP.
- [ ] FlutterFlow Supabase integration is enabled.
- [ ] Supabase schema sync can run successfully after future schema approval.

Supabase backend:

- [ ] Supabase project exists under the approved owner.
- [ ] Region is approved before implementation starts.
- [ ] Database password is stored securely outside GitHub.
- [ ] Project URL is recorded in the approved secure location.
- [ ] Client-safe anon key is available for FlutterFlow.
- [ ] Service role key is stored server-side only.
- [ ] Email Auth is configured.
- [ ] Custom SMTP plan is approved before public testing.
- [ ] RLS is mandatory for future app tables.
- [ ] Storage bucket strategy is approved before bucket creation.
- [ ] Backup plan is approved before production data.

Repository and governance:

- [ ] Work occurs only in `oxiomindia/askgeniebhai`.
- [ ] Repository Guard passes.
- [ ] Documentation PR is reviewed before development starts.
- [ ] No application code exists before foundation approval.
- [ ] No database tables or mock data exist before schema approval.

## FlutterFlow Limitations and Escape Hatches

Use FlutterFlow native features first. Add custom code only when a required MVP behavior cannot be implemented clearly and safely in FlutterFlow.

Custom Functions may be appropriate for:

- Simple deterministic formatting.
- Lightweight validation.
- Small calculations used by widget or action properties.

Custom Actions may be appropriate for:

- Asynchronous operations that FlutterFlow cannot model cleanly.
- Client-side file handling that needs explicit mobile behavior.
- Calling an approved API when FlutterFlow's built-in actions are insufficient.

Supabase Edge Functions may be appropriate for:

- Operations requiring secret keys.
- Privileged writes that must bypass client permissions safely.
- Payment, booking, notification, or third-party service callbacks.
- Server-side rate limiting or abuse controls.
- Multi-step backend transactions that must be atomic.

Do not use custom code to work around unclear product decisions. If the requirement is ambiguous, stop and request approval.

References:

- https://docs.flutterflow.io/concepts/custom-code/
- https://docs.flutterflow.io/concepts/custom-code/custom-actions/
- https://docs.flutterflow.io/concepts/custom-code/common-examples/

## Recommended FlutterFlow Project Structure

Keep the FlutterFlow project organized around fast mobile tasks, not desktop-style modules.

Recommended structure:

- Pages: one clear mobile task per page.
- Components: reusable mobile UI blocks such as service cards, bottom sheets, confirmation blocks, empty states, and compact status indicators.
- Action Blocks: reusable transaction flows that are approved and tested.
- App State: only small session-level values needed across mobile flows.
- Data Types and Enums: approved shared models only after schema design.
- Assets: optimized mobile assets with strict size discipline.
- Custom Code: isolated by approved use case, with the smallest possible surface area.

Mobile UX rules:

- Large touch targets.
- Minimal typing.
- One primary action per screen.
- Bottom navigation only where it improves mobile task speed.
- Avoid desktop dashboards, hover behavior, dense tables, and multi-column layouts.

## Recommended Repository Branching Strategy

Repository branches:

- `main`: protected production-ready branch.
- `agent/*`: documentation, planning, and Codex-authored changes before app export.
- `flutterflow`: generated branch used by FlutterFlow when code export begins.
- `develop`: optional future branch for custom code only after FlutterFlow export is approved.

Rules:

- Do not make direct commits to `main` after this foundation phase.
- All changes after bootstrap should enter through pull requests.
- Keep Repository Guard required on pushes and pull requests.
- Do not edit the `flutterflow` branch manually after FlutterFlow starts pushing generated code.
- If custom code becomes necessary, branch from `flutterflow` into `develop`, then merge through reviewed PRs.
- Documentation-only work may use `agent/docs-*` or `agent/*-foundation` branches.

FlutterFlow notes that generated pushes go to a branch named `flutterflow`; manual changes there may be overwritten by future FlutterFlow pushes.

References:

- https://docs.flutterflow.io/exporting/push-to-github/
- https://docs.flutterflow.io/collaboration/branching/

## Completion Criteria for This Phase

This foundation phase is complete only when:

- FlutterFlow is confirmed as the primary frontend.
- Supabase is confirmed as the primary backend.
- This guide is reviewed and approved.
- Supabase project ownership and region are approved.
- FlutterFlow can connect to the approved Supabase project.
- Authentication, storage, RLS, environment variables, and backup expectations are understood before implementation.
- No app screens, code, database tables, mock data, or generated project files have been created.
