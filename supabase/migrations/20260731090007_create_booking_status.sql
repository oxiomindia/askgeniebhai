-- Entity: booking_status (docs/DATABASE_BLUEPRINT.md § Entities)
-- "The lifecycle state history of a booking (e.g. requested, confirmed,
-- in-progress, completed, cancelled)."
--
-- Modeled as an append-only history, not a mutable column on bookings, per
-- docs/DATABASE_BLUEPRINT.md § Design Principles ("Status as history, not
-- state"), so the full lifecycle timeline stays queryable and auditable.
-- Values match the stages in docs/00_ASK_GENIE_BHAI_BLUEPRINT.md
-- § Booking Lifecycle.
create type public.booking_status_value as enum (
  'requested',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled'
);

create table public.booking_status (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  status public.booking_status_value not null,
  note text,
  changed_at timestamptz not null default now()
);

create index booking_status_booking_id_idx on public.booking_status (booking_id);

alter table public.booking_status enable row level security;

-- A traveler can read the status history of their own bookings. Status is
-- written by trusted server-side logic (service role), not the client.
create policy "booking_status_select_own"
  on public.booking_status for select
  to authenticated
  using (
    exists (
      select 1
      from public.bookings b
      where b.id = booking_status.booking_id
        and b.user_id = auth.uid()
    )
  );
