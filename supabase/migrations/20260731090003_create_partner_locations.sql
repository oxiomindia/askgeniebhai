-- Entity: partner_locations (docs/DATABASE_BLUEPRINT.md § Entities)
-- "A physical location operated by a partner. A partner may have multiple
-- locations."
--
-- Address fields are plain text only — no latitude/longitude or geospatial
-- columns. Maps and location-based discovery are explicitly deferred (see
-- docs/00_ASK_GENIE_BHAI_BLUEPRINT.md § Non-Goals).
create table public.partner_locations (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners (id) on delete cascade,
  name text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text,
  postal_code text,
  country text not null default 'IN',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index partner_locations_partner_id_idx on public.partner_locations (partner_id);

create trigger set_updated_at
  before update on public.partner_locations
  for each row
  execute function public.set_updated_at();

alter table public.partner_locations enable row level security;

create policy "partner_locations_select_authenticated"
  on public.partner_locations for select
  to authenticated
  using (true);
