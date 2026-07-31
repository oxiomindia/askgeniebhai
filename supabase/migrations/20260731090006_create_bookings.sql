-- Entity: bookings (docs/DATABASE_BLUEPRINT.md § Entities)
-- "A traveler's transaction against a partner_service for a specific time
-- window."
--
-- A booking always references exactly one user, one partner_service, and
-- the specific availability window it was booked against.
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete restrict,
  partner_service_id uuid not null references public.partner_services (id) on delete restrict,
  availability_id uuid not null references public.availability (id) on delete restrict,
  total_price numeric(10, 2) not null check (total_price >= 0),
  currency text not null default 'INR',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bookings_user_id_idx on public.bookings (user_id);
create index bookings_partner_service_id_idx on public.bookings (partner_service_id);
create index bookings_availability_id_idx on public.bookings (availability_id);

create trigger set_updated_at
  before update on public.bookings
  for each row
  execute function public.set_updated_at();

alter table public.bookings enable row level security;

-- A traveler can see and create only their own bookings. Status transitions
-- happen through booking_status and are not client-writable here.
create policy "bookings_select_own"
  on public.bookings for select
  to authenticated
  using (user_id = auth.uid());

create policy "bookings_insert_own"
  on public.bookings for insert
  to authenticated
  with check (user_id = auth.uid());
