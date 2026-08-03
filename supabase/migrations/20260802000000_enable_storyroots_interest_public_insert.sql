revoke all on public.storyroots_interest_signups from anon, authenticated;

grant insert on public.storyroots_interest_signups to anon, authenticated;

drop policy if exists "public can insert StoryRoots interest" on public.storyroots_interest_signups;
create policy "public can insert StoryRoots interest"
  on public.storyroots_interest_signups
  for insert
  to anon, authenticated
  with check (
    email = lower(btrim(email))
    and length(email) between 3 and 255
    and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  );
