-- Build 009: Partner / Hotel Onboarding Platform — additive schema only.
-- No existing table, column, or relationship is renamed or removed.

-- 1. Coordinates: manual-entry foundation only, for a future *approved*
--    Maps integration. No geocoding, no map UI, no third-party map
--    dependency — see docs/00_ASK_GENIE_BHAI_BLUEPRINT.md § Non-Goals
--    ("No maps, geocoding, or location-based discovery"). These two
--    columns store plain numbers a human types in; nothing here queries,
--    renders, or calls out to any mapping service.
alter table public.partner_locations
  add column latitude numeric(9, 6),
  add column longitude numeric(9, 6);

alter table public.partner_locations
  add constraint partner_locations_latitude_range
    check (latitude is null or latitude between -90 and 90),
  add constraint partner_locations_longitude_range
    check (longitude is null or longitude between -180 and 180);

-- 2. Onboarding lifecycle: distinct from `verification`, which tracks
--    ongoing quality-check history per docs/DATABASE_BLUEPRINT.md's
--    "status as history, not state" principle. This tracks the
--    *onboarding application* itself (draft -> submitted -> under_review
--    -> approved/rejected) — a linear, single-current-state workflow, not
--    an audit trail — so a column (matching the existing
--    partner_services.is_active pattern) is the minimal fit, not a new
--    history table.
create type public.partner_onboarding_status as enum (
  'draft',
  'submitted',
  'under_review',
  'approved',
  'rejected'
);

alter table public.partner_locations
  add column onboarding_status public.partner_onboarding_status
    not null default 'draft';

-- 3. Business KYC fields (GST/PAN/Bank): required by Build 009's Partner
--    Registration module. Business-entity-level, not location-level —
--    GST/PAN registration and bank accounts belong to the partner
--    business, not a specific site. "Bank Details (structure only)" per
--    the build spec: plain columns capturing the data, no payment/payout
--    processing wired to them (Razorpay remains deferred per Non-Goals).
alter table public.partners
  add column gst_number text,
  add column pan_number text,
  add column bank_account_holder_name text,
  add column bank_account_number text,
  add column bank_ifsc_code text;

-- 4. Business-level media: the existing `media` table only supports
--    location- and service-scoped rows. GST certificates, PAN cards, and
--    business registration documents belong to the partner business
--    itself, not a specific location — extend the existing "owner" check
--    rather than create a parallel table.
alter table public.media
  add column partner_id uuid references public.partners (id) on delete cascade;

create index media_partner_id_idx on public.media (partner_id);

alter table public.media
  drop constraint media_has_an_owner;

alter table public.media
  add constraint media_has_an_owner check (
    partner_id is not null
    or partner_location_id is not null
    or partner_service_id is not null
  );

-- 5. Media label: distinguishes a hotel photo from a specific required
--    document type — needed for Build 009's document/photo completeness
--    validation ("Required documents", "Required photos"). Metadata only,
--    matching the existing "media is metadata-only" design principle.
create type public.media_label as enum (
  'hotel_photo',
  'gst_certificate',
  'pan_card',
  'business_registration_certificate',
  'bank_proof',
  'other'
);

alter table public.media
  add column label public.media_label;

-- 6. Storage bucket for the actual document/photo binaries. Private
--    (public = false): all reads/writes go through the admin console's
--    service-role client (server-side only), the same access pattern
--    already used for every other admin write in this schema. No new
--    storage.objects policies are added — service role bypasses RLS, and
--    no other role has any reason to read or write these objects yet.
insert into storage.buckets (id, name, public)
values ('partner-documents', 'partner-documents', false)
on conflict (id) do nothing;

-- RLS: no new policies needed on partners/partner_locations/media — all
-- new columns live on tables whose existing RLS policies (traveler-read,
-- service-role-write) already cover them in full.
