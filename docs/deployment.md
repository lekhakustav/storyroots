# Deployment

1. Copy `.env.example` to `.env.local` and fill in the Supabase URL and publishable/anon key.
2. Apply the SQL migration with the Supabase CLI after linking the project: `supabase login`, `supabase link --project-ref "$SUPABASE_PROJECT_REF"`, `supabase db push`.
3. Check the RLS policies with a member and a non-member before sharing the app.
4. Link Vercel with `vercel link`, add the environment variables, and deploy with `vercel --prod`.

Local demo mode works without those accounts. It uses the deterministic mock transcription and text-generation providers and keeps data in memory for the running process.
