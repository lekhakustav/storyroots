# StoryRoots email signup handoff

This is the exact signup behavior StoryRoots needs. Keep this file with the project so another Codex collaborator can continue the work without guessing.

## Required behavior

1. Reject malformed email addresses.
2. Normalize valid addresses to lowercase and save them in `public.storyroots_interest_signups` in Supabase.
3. If the insert reports a duplicate:
   - Show `You're already on the list.`
   - Show `We already have this address for StoryRoots.`
   - Do not send a duplicate notification.
4. If the address is new:
   - Save it.
   - Do not say `You're on the list.`
   - Show `Thanks - we received your request.`
   - Show `We'll review this email and get back to you.`
   - Send one notification to `lekhakutsav@gmail.com` through Resend.
5. If the notification service is missing or fails, do not claim the request succeeded. Show a retry message instead.

## Where the behavior lives

- `components/storyroots-booking.tsx` - success and duplicate messages.
- `app/api/storyroots-interest/route.ts` - local and Next request handling.
- `worker/storyroots-interest.mjs` and `worker/sites-entry.mjs` - public StoryRoots request handling.
- `lib/storyroots-notifications.ts` - Resend email delivery.
- `supabase/migrations/` - signup table, row-level security, and insert-only permission.
- `tests/flow.spec.ts` - browser checks for new versus existing copy.

## Safety rules

- Keep the Supabase publishable key public; never put a service-role key in browser code or the public Worker.
- Public roles may insert into the signup table only. They must not read, update, or delete the list.
- Keep `STORYROOTS_NOTIFICATION_EMAIL` set to `lekhakutsav@gmail.com` in hosted runtime settings. Keep `RESEND_API_KEY` secret.
- A new signup is a request for review, not an approval. If manual approval is added later, add it as a separate status and keep the copy above accurate.

## Acceptance check

- New address: request copy and one email to `lekhakutsav@gmail.com`.
- Same address again: already-on-list copy and no second email.
- Bad address: validation error and no database row.
- Notification failure: retry error, not a success message.
