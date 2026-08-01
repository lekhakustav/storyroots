create table if not exists public.storyroots_interest_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.storyroots_interest_signups enable row level security;
revoke all on public.storyroots_interest_signups from anon, authenticated;

create index if not exists storyroots_interest_signups_created_at_idx
  on public.storyroots_interest_signups (created_at desc);
