-- Entity: verification (docs/DATABASE_BLUEPRINT.md § Entities)
-- "A record documenting that a partner_location (or a specific
-- partner_service) has passed the quality/verification checks defined in
-- docs/PARTNER_QUALITY_STANDARDS.md."
--
-- verified_by is a plain identifier (not a foreign key) because
-- verification is performed by internal Oxiom staff, an entity not defined
-- in docs/DATABASE_BLUEPRINT.md — adding one is out of scope here.
create type public.verification_status as enum (
  'pending',
  'passed',
  'failed'
);

create table public.verification (
  id uuid primary key default gen_random_uuid(),
  partner_location_id uuid not null references public.partner_locations (id) on delete cascade,
  partner_service_id uuid references public.partner_services (id) on delete cascade,
  status public.verification_status not null default 'pending',
  verified_by text,
  notes text,
  verified_at timestamptz not null default now()
);

create index verification_partner_location_id_idx on public.verification (partner_location_id);
create index verification_partner_service_id_idx on public.verification (partner_service_id);

alter table public.verification enable row level security;

-- Verification records are a trust signal shown to travelers during
-- discovery; writes are service-role only (verification SOP is operated
-- internally, not by clients).
create policy "verification_select_authenticated"
  on public.verification for select
  to authenticated
  using (true);
