-- Entity: partners (docs/DATABASE_BLUEPRINT.md § Entities)
-- "A business entity that provides one or more of the five MVP services."
create table public.partners (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  contact_email text,
  contact_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.partners
  for each row
  execute function public.set_updated_at();

alter table public.partners enable row level security;

-- Partner records are discovery-relevant business info. Self-service
-- partner management is Phase 2 (docs/ROADMAP.md); until then, writes are
-- performed with the service role only, and any authenticated traveler can
-- read partner info as part of discovery.
create policy "partners_select_authenticated"
  on public.partners for select
  to authenticated
  using (true);
