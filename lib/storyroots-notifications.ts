import { createHash } from 'node:crypto';

const DEFAULT_FROM_EMAIL = 'StoryRoots <onboarding@resend.dev>';
export const STORYROOTS_NOTIFICATION_EMAIL = 'lekhakutsav@gmail.com';

type NotificationOptions = {
  apiKey?: string;
  fetchImpl?: typeof fetch;
  from?: string;
  now?: () => Date;
  to?: string;
};

export type StoryRootsNotificationResult = {
  configured: boolean;
  error?: string;
  messageId?: string;
  sent: boolean;
};

function envValue(value: string | undefined, fallback: string) {
  return value?.trim() || fallback;
}

function optionalEnvValue(value: string | undefined) {
  return value?.trim() || undefined;
}

export async function sendStoryRootsInterestNotification(
  visitorEmail: string,
  options: NotificationOptions = {},
): Promise<StoryRootsNotificationResult> {
  const apiKey = options.apiKey === undefined
    ? process.env.RESEND_API_KEY?.trim()
    : options.apiKey.trim();

  if (!apiKey) return { configured: false, sent: false };

  const normalizedEmail = visitorEmail.trim().toLowerCase();
  const recipient = optionalEnvValue(options.to ?? process.env.STORYROOTS_NOTIFICATION_EMAIL);
  if (!recipient) {
    return { configured: true, sent: false, error: 'Notification recipient is not configured.' };
  }
  if (recipient.toLowerCase() !== STORYROOTS_NOTIFICATION_EMAIL) {
    return { configured: true, sent: false, error: 'Notification recipient is not the StoryRoots inbox.' };
  }

  const sender = envValue(options.from ?? process.env.STORYROOTS_FROM_EMAIL, DEFAULT_FROM_EMAIL);
  const receivedAt = (options.now ?? (() => new Date()))().toISOString();
  const idempotencyKey = createHash('sha256').update(normalizedEmail).digest('hex');

  try {
    const response = await (options.fetchImpl ?? fetch)('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `storyroots-interest-${idempotencyKey}`,
      },
      body: JSON.stringify({
        from: sender,
        to: [STORYROOTS_NOTIFICATION_EMAIL],
        subject: 'New StoryRoots signup',
        text: [
          'A visitor wants to try StoryRoots.',
          '',
          `Visitor email: ${normalizedEmail}`,
          `Received: ${receivedAt}`,
        ].join('\n'),
      }),
    });

    const data = await response.json().catch(() => null) as { id?: string; message?: string } | null;
    if (!response.ok) {
      return { configured: true, sent: false, error: data?.message || `Email service returned ${response.status}.` };
    }

    return { configured: true, sent: true, messageId: data?.id };
  } catch (error) {
    return {
      configured: true,
      sent: false,
      error: error instanceof Error ? error.message : 'Email service could not be reached.',
    };
  }
}
