
-- The public landing form may add an email, but it must never be able to
-- read, edit, or delete the list. The API normalizes the value before insert;
-- this policy enforces the same rule for direct Data API requests.
drop policy if exists "public can join StoryRoots interest list" on public.storyroots_interest_signups;
create policy "public can join StoryRoots interest list"
  on public.storyroots_interest_signups
  for insert
  to anon, authenticated
  with check (
    email = lower(btrim(email))
    and length(email) <= 255
    and email ~ '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$'
  );

-- Guest booking is intentional, but signed-in users do not need a second
-- execution path. Keep the public guest path and remove the extra grant.
revoke execute on function public.book_storyroots_appointment(uuid, jsonb) from authenticated;

-- Direct RPC callers still have to pass a correctly shaped email when one is
-- supplied; the application performs the same check before calling the RPC.
alter table public.appointments
  drop constraint if exists appointments_customer_email_format;
alter table public.appointments
  add constraint appointments_customer_email_format
  check (customer_email is null or customer_email ~ '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$');
