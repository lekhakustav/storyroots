# Security review

- Project routes enforce ownership using the signed-in app user; the Supabase migration applies RLS to every public table.
- Recordings, photos, and exports are private buckets. Hosted downloads should use expiring signed URLs; the local demo returns a private response from the server.
- Uploads accept only webm, mp3, m4a, and wav metadata and reject files over 50 MB.
- Expensive timeline, chapter, transcription, and PDF endpoints have an in-process rate limit.
- Consent is required for recordings. Voice-generation consent defaults to false and narration is disabled in the first milestone.
- AI providers receive transcript content as untrusted text. The deterministic development service does not execute transcript instructions or invent facts.
- The local demo auth cookie is for development only. Hosted authentication must use Supabase Auth with server-side `getClaims()`/`getUser()` validation before production launch.
