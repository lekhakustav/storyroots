# Keepsake architecture

Keepsake is a single Next.js application so the first milestone stays easy to run and deploy. The UI is mobile-first and calls server route handlers. The route handlers validate requests with Zod, check the current user against the project owner, and use provider-independent AI interfaces.

`lib/store.ts` is the local development store. It is intentionally labelled as demo mode and is replaced by Supabase queries when the hosted data layer is connected. `supabase/migrations/20260801000000_create_biography_schema.sql` is the production schema for Auth, project membership, private Storage, interview data, evidence, chapters, and export jobs.

Flow: browser → Next route handler → auth/access check → project data → mock or configured AI service → job/result → browser polling or download.
