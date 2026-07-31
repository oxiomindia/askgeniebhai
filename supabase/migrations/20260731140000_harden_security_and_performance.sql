-- Hardening pass following Supabase's automated advisor findings on the
-- schema applied in the implementation foundation. No tables, columns, or
-- relationships change — this only tightens function/policy definitions.

-- Security: pin search_path on set_updated_at (advisor: function_search_path_mutable).
alter function public.set_updated_at() set search_path = public;

-- Security: handle_new_auth_user is SECURITY DEFINER and is only meant to run
-- via the on_auth_user_created trigger on auth.users, never called directly
-- by a client. Revoking EXECUTE from anon/authenticated/public does not
-- affect the trigger, which runs regardless of grants (advisor:
-- anon_security_definer_function_executable,
-- authenticated_security_definer_function_executable).
revoke execute on function public.handle_new_auth_user() from public, anon, authenticated;

-- Performance: wrap auth.uid() in a scalar subselect so Postgres evaluates it
-- once per statement instead of once per row (advisor: auth_rls_initplan).
-- Same policy logic, no change in who can access what.
drop policy "users_select_own" on public.users;
create policy "users_select_own"
  on public.users for select
  to authenticated
  using (id = (select auth.uid()));

drop policy "users_update_own" on public.users;
create policy "users_update_own"
  on public.users for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy "bookings_select_own" on public.bookings;
create policy "bookings_select_own"
  on public.bookings for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy "bookings_insert_own" on public.bookings;
create policy "bookings_insert_own"
  on public.bookings for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy "booking_status_select_own" on public.booking_status;
create policy "booking_status_select_own"
  on public.booking_status for select
  to authenticated
  using (
    exists (
      select 1
      from public.bookings b
      where b.id = booking_status.booking_id
        and b.user_id = (select auth.uid())
    )
  );

drop policy "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own"
  on public.reviews for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.bookings b
      where b.id = reviews.booking_id
        and b.user_id = (select auth.uid())
    )
  );
