-- Entity: partner_services (docs/DATABASE_BLUEPRINT.md § Entities)
-- "A specific bookable service offered at a location, mapped to exactly
-- one of the five MVP intents."
--
-- partner_category values are the five internal Partner Category labels
-- from docs/00_ASK_GENIE_BHAI_BLUEPRINT.md § Naming Convention: Intent vs.
-- Partner Category, mapped 1:1 to the traveler-facing intents:
--   freshen_up   -> Freshen Up
--   bag_storage  -> Keep My Bags
--   rest         -> Rest
--   cab          -> Book a Cab
--   room         -> Book a Room
-- This set is exhaustive for the MVP; adding a sixth value requires a
-- Master Blueprint update and approval first (see Governance).
create type public.partner_category as enum (
  'freshen_up',
  'bag_storage',
  'rest',
  'cab',
  'room'
);

create table public.partner_services (
  id uuid primary key default gen_random_uuid(),
  partner_location_id uuid not null references public.partner_locations (id) on delete cascade,
  category public.partner_category not null,
  name text not null,
  description text,
  base_price numeric(10, 2) not null check (base_price >= 0),
  currency text not null default 'INR',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index partner_services_partner_location_id_idx on public.partner_services (partner_location_id);
create index partner_services_category_idx on public.partner_services (category);

create trigger set_updated_at
  before update on public.partner_services
  for each row
  execute function public.set_updated_at();

alter table public.partner_services enable row level security;

create policy "partner_services_select_authenticated"
  on public.partner_services for select
  to authenticated
  using (true);
