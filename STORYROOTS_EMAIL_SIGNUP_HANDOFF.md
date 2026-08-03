# StoryRoots email signup handoff

This is the exact signup behavior StoryRoots needs. Keep this file with the
project so another Codex collaborator can continue the work without guessing.

## The problem

The public form must not tell every new or random email address that it is
already on the StoryRoots list. That message is only correct when the address
already exists in the public.storyroots_interest_signups table.

Every genuinely new email must also notify:

lekhakutsav@gmail.com

## Required behavior

1. Reject malformed email addresses.
2. Normalize valid addresses to lowercase and save them in Supabase.
3. If the insert reports a duplicate:
   - show: You're already on the list.
   - show: We already have this address for StoryRoots.
   - do not send a duplicate notification.
4. If the address is new:
   - save it,
   - do not say: You're on the list,
   - show: Thanks - we received your request.
   - show: We'll review this email and get back to you.
   - send a notification to lekhakutsav@gmail.com through Resend.
5. If the notification service is missing or fails, do not claim the request
   succeeded; show a retry message instead.

## Where the behavior lives

- components/storyroots-booking.tsx — the two success messages.
- app/api/storyroots-interest/route.ts — local/Next request handling.
- worker/sites-entry.mjs — public StoryRoots request handling.
- lib/storyroots-notifications.ts — Resend email delivery.
- supabase/migrations/ — signup table, RLS, and insert-only permission.
- tests/flow.spec.ts — browser checks for new versus existing copy.

## Safety rules

- Keep the Supabase publishable key public; never put a service-role key in
  browser code or the public Worker.
- Public roles may insert into the signup table only. They must not read,
  update, or delete the list.
- Keep STORYROOTS_NOTIFICATION_EMAIL set to lekhakutsav@gmail.com in hosted
  runtime settings. Keep RESEND_API_KEY secret.
- A new signup is a request for review, not an approval. If manual approval is
  added later, add it as a separate status and keep the copy above accurate.

## Acceptance check

- New address: request copy and one email to lekhakutsav@gmail.com.
- Same address again: already-on-list copy and no second email.
- Bad address: validation error and no database row.
- Notification failure: retry error, not a success message.
