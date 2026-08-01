# Environment variables

Required for hosted Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or the legacy anon key), and `SUPABASE_SERVICE_ROLE_KEY` only on the server when privileged background work is added.

Provider selection uses `AI_PROVIDER`, `TRANSCRIPTION_PROVIDER`, and `TEXT_TO_SPEECH_PROVIDER`. Use `mock`, `mock`, and `disabled` for local development. Never put a service-role key or provider secret in a `NEXT_PUBLIC_` variable.
