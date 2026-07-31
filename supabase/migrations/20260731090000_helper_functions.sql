-- Shared helper: keeps `updated_at` current on any table that has one.
-- Referenced by every subsequent migration that defines an updated_at column.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
