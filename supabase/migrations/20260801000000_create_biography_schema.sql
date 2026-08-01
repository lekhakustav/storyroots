create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.biography_projects (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null, storyteller_name text not null, storyteller_relationship text not null,
  preferred_language text not null default 'en' check (preferred_language in ('en','ne','en-ne')),
  status text not null default 'draft' check (status in ('draft','in_progress','complete')),
  cover_image_url text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.biography_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, role text not null check (role in ('owner','editor','storyteller','viewer')),
  invitation_email text, invitation_status text not null default 'pending', created_at timestamptz not null default now(), unique(project_id, user_id)
);
create table if not exists public.consent_records (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.biography_projects(id) on delete cascade,
  storyteller_name text not null, recording_consent boolean not null default false, ai_processing_consent boolean not null default false,
  voice_generation_consent boolean not null default false, consented_at timestamptz
);
create table if not exists public.interview_sessions (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.biography_projects(id) on delete cascade,
  title text not null, status text not null default 'planned', started_at timestamptz, completed_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.interview_questions (
  id uuid primary key default gen_random_uuid(), session_id uuid not null references public.interview_sessions(id) on delete cascade,
  question_text text not null, question_order integer not null, question_type text not null default 'open', generated_from_context boolean not null default false, answered_at timestamptz
);
create table if not exists public.recordings (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.biography_projects(id) on delete cascade, session_id uuid references public.interview_sessions(id) on delete cascade,
  storage_path text not null, original_filename text not null, mime_type text not null, duration_seconds numeric, file_size bigint, processing_status text not null default 'queued', created_at timestamptz not null default now()
);
create table if not exists public.transcripts (
  id uuid primary key default gen_random_uuid(), recording_id uuid not null references public.recordings(id) on delete cascade,
  raw_text text not null, corrected_text text, language text, processing_status text not null default 'queued', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.timeline_events (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.biography_projects(id) on delete cascade, transcript_id uuid references public.transcripts(id) on delete set null,
  event_title text not null, event_description text not null, event_date date, approximate_date_text text, location text, confidence numeric check (confidence >= 0 and confidence <= 1),
  confirmation_status text not null default 'unconfirmed' check (confirmation_status in ('unconfirmed','confirmed','corrected','rejected')), evidence_text text not null, created_at timestamptz not null default now()
);
create table if not exists public.people_mentions (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.biography_projects(id) on delete cascade, transcript_id uuid references public.transcripts(id) on delete set null,
  full_name text not null, relationship text, description text, confidence numeric check (confidence >= 0 and confidence <= 1), confirmation_status text not null default 'unconfirmed', created_at timestamptz not null default now()
);
create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.biography_projects(id) on delete cascade, title text not null, chapter_order integer not null,
  content text not null, status text not null default 'draft' check (status in ('draft','needs_review','approved')), generated_at timestamptz, approved_at timestamptz, updated_at timestamptz not null default now()
);
create table if not exists public.chapter_versions (
  id uuid primary key default gen_random_uuid(), chapter_id uuid not null references public.chapters(id) on delete cascade, version_number integer not null, content text not null,
  created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), unique(chapter_id, version_number)
);
create table if not exists public.export_jobs (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.biography_projects(id) on delete cascade, export_type text not null check (export_type in ('pdf','epub','audiobook')),
  status text not null default 'queued', storage_path text, error_message text, created_at timestamptz not null default now(), completed_at timestamptz
);

insert into storage.buckets (id, name, public) values ('biography-recordings','biography-recordings',false), ('biography-photos','biography-photos',false), ('biography-exports','biography-exports',false) on conflict (id) do update set public = false;

alter table public.profiles enable row level security;
alter table public.biography_projects enable row level security;
alter table public.project_members enable row level security;
alter table public.consent_records enable row level security;
alter table public.interview_sessions enable row level security;
alter table public.interview_questions enable row level security;
alter table public.recordings enable row level security;
alter table public.transcripts enable row level security;
alter table public.timeline_events enable row level security;
alter table public.people_mentions enable row level security;
alter table public.chapters enable row level security;
alter table public.chapter_versions enable row level security;
alter table public.export_jobs enable row level security;

create policy "profiles own row" on public.profiles for all to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "projects owner" on public.biography_projects for all to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "members see their membership" on public.project_members for select to authenticated using (user_id = (select auth.uid()) or exists (select 1 from public.biography_projects p where p.id = project_id and p.owner_id = (select auth.uid())));
create policy "owners add members" on public.project_members for insert to authenticated with check (exists (select 1 from public.biography_projects p where p.id = project_id and p.owner_id = (select auth.uid())));
create policy "members access child data" on public.consent_records for all to authenticated using (exists (select 1 from public.project_members m where m.project_id = consent_records.project_id and m.user_id = (select auth.uid())) or exists (select 1 from public.biography_projects p where p.id = project_id and p.owner_id = (select auth.uid()))) with check (exists (select 1 from public.project_members m where m.project_id = consent_records.project_id and m.user_id = (select auth.uid())) or exists (select 1 from public.biography_projects p where p.id = project_id and p.owner_id = (select auth.uid())));
create policy "members access sessions" on public.interview_sessions for all to authenticated using (exists (select 1 from public.project_members m where m.project_id = interview_sessions.project_id and m.user_id = (select auth.uid())) or exists (select 1 from public.biography_projects p where p.id = project_id and p.owner_id = (select auth.uid()))) with check (exists (select 1 from public.project_members m where m.project_id = interview_sessions.project_id and m.user_id = (select auth.uid())) or exists (select 1 from public.biography_projects p where p.id = project_id and p.owner_id = (select auth.uid())));
create policy "members access interview questions" on public.interview_questions for all to authenticated using (exists (select 1 from public.interview_sessions s join public.project_members m on m.project_id = s.project_id where s.id = session_id and m.user_id = (select auth.uid())) or exists (select 1 from public.interview_sessions s join public.biography_projects p on p.id = s.project_id where s.id = session_id and p.owner_id = (select auth.uid()))) with check (exists (select 1 from public.interview_sessions s join public.project_members m on m.project_id = s.project_id where s.id = session_id and m.user_id = (select auth.uid())) or exists (select 1 from public.interview_sessions s join public.biography_projects p on p.id = s.project_id where s.id = session_id and p.owner_id = (select auth.uid())));
create policy "members access project data" on public.recordings for all to authenticated using (exists (select 1 from public.project_members m where m.project_id = recordings.project_id and m.user_id = (select auth.uid())) or exists (select 1 from public.biography_projects p where p.id = project_id and p.owner_id = (select auth.uid()))) with check (exists (select 1 from public.project_members m where m.project_id = recordings.project_id and m.user_id = (select auth.uid())) or exists (select 1 from public.biography_projects p where p.id = project_id and p.owner_id = (select auth.uid())));
create policy "members access transcripts" on public.transcripts for all to authenticated using (exists (select 1 from public.recordings r where r.id = recording_id and (exists (select 1 from public.project_members m where m.project_id = r.project_id and m.user_id = (select auth.uid())) or exists (select 1 from public.biography_projects p where p.id = r.project_id and p.owner_id = (select auth.uid()))))) with check (exists (select 1 from public.recordings r where r.id = recording_id and (exists (select 1 from public.project_members m where m.project_id = r.project_id and m.user_id = (select auth.uid())) or exists (select 1 from public.biography_projects p where p.id = r.project_id and p.owner_id = (select auth.uid())))));
create policy "members access timeline" on public.timeline_events for all to authenticated using (exists (select 1 from public.project_members m where m.project_id = timeline_events.project_id and m.user_id = (select auth.uid())) or exists (select 1 from public.biography_projects p where p.id = project_id and p.owner_id = (select auth.uid()))) with check (exists (select 1 from public.project_members m where m.project_id = timeline_events.project_id and m.user_id = (select auth.uid())) or exists (select 1 from public.biography_projects p where p.id = project_id and p.owner_id = (select auth.uid())));
create policy "members access people" on public.people_mentions for all to authenticated using (exists (select 1 from public.project_members m where m.project_id = people_mentions.project_id and m.user_id = (select auth.uid())) or exists (select 1 from public.biography_projects p where p.id = project_id and p.owner_id = (select auth.uid()))) with check (exists (select 1 from public.project_members m where m.project_id = people_mentions.project_id and m.user_id = (select auth.uid())) or exists (select 1 from public.biography_projects p where p.id = project_id and p.owner_id = (select auth.uid())));
create policy "members access chapters" on public.chapters for all to authenticated using (exists (select 1 from public.project_members m where m.project_id = chapters.project_id and m.user_id = (select auth.uid())) or exists (select 1 from public.biography_projects p where p.id = project_id and p.owner_id = (select auth.uid()))) with check (exists (select 1 from public.project_members m where m.project_id = chapters.project_id and m.user_id = (select auth.uid())) or exists (select 1 from public.biography_projects p where p.id = project_id and p.owner_id = (select auth.uid())));
create policy "members access chapter versions" on public.chapter_versions for all to authenticated using (exists (select 1 from public.chapters c where c.id = chapter_id and (exists (select 1 from public.project_members m where m.project_id = c.project_id and m.user_id = (select auth.uid())) or exists (select 1 from public.biography_projects p where p.id = c.project_id and p.owner_id = (select auth.uid()))))) with check (exists (select 1 from public.chapters c where c.id = chapter_id and (exists (select 1 from public.project_members m where m.project_id = c.project_id and m.user_id = (select auth.uid())) or exists (select 1 from public.biography_projects p where p.id = c.project_id and p.owner_id = (select auth.uid())))));
create policy "members access exports" on public.export_jobs for all to authenticated using (exists (select 1 from public.project_members m where m.project_id = export_jobs.project_id and m.user_id = (select auth.uid())) or exists (select 1 from public.biography_projects p where p.id = project_id and p.owner_id = (select auth.uid()))) with check (exists (select 1 from public.project_members m where m.project_id = export_jobs.project_id and m.user_id = (select auth.uid())) or exists (select 1 from public.biography_projects p where p.id = project_id and p.owner_id = (select auth.uid())));

create policy "members read private files" on storage.objects for select to authenticated using (bucket_id in ('biography-recordings','biography-photos','biography-exports') and (exists (select 1 from public.project_members m where m.project_id = (storage.foldername(name))[1]::uuid and m.user_id = (select auth.uid())) or exists (select 1 from public.biography_projects p where p.id = (storage.foldername(name))[1]::uuid and p.owner_id = (select auth.uid()))));
create policy "members upload private files" on storage.objects for insert to authenticated with check (bucket_id in ('biography-recordings','biography-photos','biography-exports') and (exists (select 1 from public.project_members m where m.project_id = (storage.foldername(name))[1]::uuid and m.user_id = (select auth.uid())) or exists (select 1 from public.biography_projects p where p.id = (storage.foldername(name))[1]::uuid and p.owner_id = (select auth.uid()))));
create policy "members delete private files" on storage.objects for delete to authenticated using (bucket_id in ('biography-recordings','biography-photos','biography-exports') and (exists (select 1 from public.project_members m where m.project_id = (storage.foldername(name))[1]::uuid and m.user_id = (select auth.uid())) or exists (select 1 from public.biography_projects p where p.id = (storage.foldername(name))[1]::uuid and p.owner_id = (select auth.uid()))));
