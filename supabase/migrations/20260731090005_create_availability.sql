-- Entity: availability (docs/DATABASE_BLUEPRINT.md § Entities)
-- "Time-windowed capacity for a partner_service — what can be booked, and
-- when."
--
-- Per docs/DATABASE_BLUEPRINT.md § Scalability Recommendations,
-- availability is on the highest-read path (discovery); index accordingly.
create table public.availability (
  id uuid primary key default gen_random_uuid(),
  partner_service_id uuid not null references public.partner_services (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  capacity integer not null default 1 check (capacity > 0),
  booked_count integer not null default 0 check (booked_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint availability_window_valid check (ends_at > starts_at),
  constraint availability_capacity_not_exceeded check (booked_count <= capacity)
);

create index availability_partner_service_id_idx on public.availability (partner_service_id);
create index availability_starts_at_idx on public.availability (starts_at);

create trigger set_updated_at
  before update on public.availability
  for each row
  execute function public.set_updated_at();

alter table public.availability enable row level security;

create policy "availability_select_authenticated"
  on public.availability for select
  to authenticated
  using (true);
