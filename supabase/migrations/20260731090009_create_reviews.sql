-- Entity: reviews (docs/DATABASE_BLUEPRINT.md § Entities)
-- "Traveler feedback tied to a completed booking."
--
-- One review per booking, enforced with a unique constraint, per
-- docs/DATABASE_BLUEPRINT.md relationship: "bookings (1) ── (0..1) reviews".
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete restrict,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create index reviews_user_id_idx on public.reviews (user_id);

alter table public.reviews enable row level security;

-- Reviews are a public trust signal during discovery, so any authenticated
-- traveler can read them. A traveler may only leave a review for their own
-- booking.
create policy "reviews_select_authenticated"
  on public.reviews for select
  to authenticated
  using (true);

create policy "reviews_insert_own"
  on public.reviews for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.bookings b
      where b.id = reviews.booking_id
        and b.user_id = auth.uid()
    )
  );
