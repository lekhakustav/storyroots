const STORYROOTS_NOTIFICATION_EMAIL = 'lekhakutsav@gmail.com';
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function insertInterestSignup(email, env, fetchImpl) {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
    || env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !publishableKey) return { saved: false };

  let response;
  try {
    response = await fetchImpl(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/storyroots_interest_signups`, {
      method: 'POST',
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${publishableKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ email }),
    });
  } catch {
    return { saved: false };
  }

  if (response.ok) return { saved: true, duplicate: false };

  const data = await response.json().catch(() => null);
  if (data?.code === '23505') return { saved: true, duplicate: true };
  return { saved: false };
}

export async function handleStoryRootsInterest(request, env, options = {}) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (!email || email.length > 255 || !emailPattern.test(email)) {
    return json({ error: 'Please enter a valid email.' }, 400);
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const signup = await insertInterestSignup(email, env, fetchImpl);
  if (!signup.saved) {
    return json({ error: 'We could not save that just now. Please try again.' }, 500);
  }
  if (signup.duplicate) {
    return json({ ok: true, alreadyRegistered: true, notificationSent: false });
  }

  const apiKey = env.RESEND_API_KEY?.trim();
  const recipient = env.STORYROOTS_NOTIFICATION_EMAIL?.trim().toLowerCase();
  const sender = env.STORYROOTS_FROM_EMAIL?.trim() || 'StoryRoots <onboarding@resend.dev>';

  if (!apiKey || recipient !== STORYROOTS_NOTIFICATION_EMAIL) {
    return json({ error: 'We could not send your request just now. Please try again.' }, 502);
  }

  let response;
  try {
    response = await fetchImpl('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `storyroots-interest-${await sha256(email)}`,
      },
      body: JSON.stringify({
        from: sender,
        to: [STORYROOTS_NOTIFICATION_EMAIL],
        subject: 'New StoryRoots signup',
        text: [
          'A visitor wants to try StoryRoots.',
          '',
          `Visitor email: ${email}`,
          `Received: ${(options.now?.() ?? new Date()).toISOString()}`,
        ].join('\n'),
      }),
    });
  } catch {
    return json({ error: 'We could not send your request just now. Please try again.' }, 502);
  }

  if (!response.ok) {
    return json({ error: 'We could not send your request just now. Please try again.' }, 502);
  }

  return json({ ok: true, alreadyRegistered: false, notificationSent: true });
}
