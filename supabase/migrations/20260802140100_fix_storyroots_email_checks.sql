-- Keep the public email checks strict enough to reject malformed input while
-- allowing ordinary addresses such as person@example.com.
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

alter table public.appointments
  drop constraint if exists appointments_customer_email_format;
alter table public.appointments
  add constraint appointments_customer_email_format
  check (customer_email is null or customer_email ~ '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$');
