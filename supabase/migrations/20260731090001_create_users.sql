-- Entity: users (docs/DATABASE_BLUEPRINT.md § Entities)
-- "A traveler with an authenticated identity (via Supabase Auth). The
-- subject of every booking."
--
-- public.users is a 1:1 profile row for each Supabase Auth identity
-- (auth.users), holding only the application-level profile fields the
-- product needs. Authentication itself stays entirely owned by Supabase
-- Auth, per docs/FLUTTERFLOW_SUPABASE_FOUNDATION.md.
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.users
  for each row
  execute function public.set_updated_at();

-- A new Supabase Auth identity automatically gets a matching profile row.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_auth_user();

alter table public.users enable row level security;

-- A traveler can read and update only their own profile.
create policy "users_select_own"
  on public.users for select
  to authenticated
  using (id = auth.uid());

create policy "users_update_own"
  on public.users for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());
