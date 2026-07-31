-- Entity: media (docs/DATABASE_BLUEPRINT.md § Entities)
-- "Metadata describing a binary asset stored in Cloudflare R2 (photos,
-- verification documents), referenced by the entity it belongs to."
--
-- Per docs/DATABASE_BLUEPRINT.md § Design Principles ("Media is
-- metadata-only in Postgres"), this table stores only a reference to the
-- object in R2 (storage_path) — never binary content. Cloudflare R2 itself
-- is intentionally deferred (see docs/FLUTTERFLOW_SUPABASE_FOUNDATION.md),
-- so no rows exist here until that phase begins; the table exists now so
-- the schema matches the approved blueprint in full.
create table public.media (
  id uuid primary key default gen_random_uuid(),
  partner_location_id uuid references public.partner_locations (id) on delete cascade,
  partner_service_id uuid references public.partner_services (id) on delete cascade,
  storage_path text not null,
  content_type text,
  created_at timestamptz not null default now(),
  constraint media_has_an_owner check (
    partner_location_id is not null or partner_service_id is not null
  )
);

create index media_partner_location_id_idx on public.media (partner_location_id);
create index media_partner_service_id_idx on public.media (partner_service_id);

alter table public.media enable row level security;

-- Media (partner/location photos) is shown to travelers during discovery.
-- Uploads are written server-side (service role) once R2 signed URLs
-- exist — never directly from the client.
create policy "media_select_authenticated"
  on public.media for select
  to authenticated
  using (true);
