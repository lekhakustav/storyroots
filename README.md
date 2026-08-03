# StoryRoots

StoryRoots helps families preserve the voices and memories that matter most.

The public experience is intentionally simple: visitors explore the story, choose **I want to try**, and leave their email. Each request sends a private notification to the StoryRoots owner.

## Highlights

- Cinematic, responsive landing experience
- Minimal email-only interest flow
- Private signup notifications
- Keyboard, touch, and reduced-motion support
- Automated unit and browser-flow checks

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and add the private values you need.
3. Start the site with `npm run dev`.

The signup connection uses the Supabase URL plus publishable key. Email delivery uses secret `RESEND_API_KEY`, `STORYROOTS_NOTIFICATION_EMAIL=lekhakutsav@gmail.com`, and `STORYROOTS_FROM_EMAIL`. Never commit `.env.local` or a service-role key to public code.

## Checks

```text
npm run typecheck
npm test
npm run build
```
