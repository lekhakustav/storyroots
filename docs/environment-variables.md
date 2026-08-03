# Environment variables

Required for hosted Supabase: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or the legacy anon key). The StoryRoots interest form uses only that public key and the insert-only table policy. `SUPABASE_SERVICE_ROLE_KEY` is only for unrelated privileged server work and must never be exposed to browser or Worker code.

Interest notifications require secret `RESEND_API_KEY`, `STORYROOTS_NOTIFICATION_EMAIL=lekhakutsav@gmail.com`, and an optional verified `STORYROOTS_FROM_EMAIL`. Missing or incorrect notification settings make new requests fail with retry copy instead of a success message.

Provider selection uses `AI_PROVIDER`, `TRANSCRIPTION_PROVIDER`, and `TEXT_TO_SPEECH_PROVIDER`. Use `mock`, `mock`, and `disabled` for local development. Never put a service-role key or provider secret in a `NEXT_PUBLIC_` variable.
