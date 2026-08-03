-- The landing form uses the public Supabase key. Allow it to add a signup,
-- while keeping reads, updates, and deletes unavailable to public roles.
grant insert on table public.storyroots_interest_signups to anon, authenticated;
