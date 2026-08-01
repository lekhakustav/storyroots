import { STATIC_ASSETS } from './static-assets.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const decodedAssets = new Map();

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

async function handleInterest(request, env) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (!email || email.length > 255 || !emailPattern.test(email)) {
    return json({ error: 'Please enter a valid email.' }, 400);
  }

  const apiKey = env.RESEND_API_KEY?.trim();
  const recipient = env.STORYROOTS_NOTIFICATION_EMAIL?.trim();
  const sender = env.STORYROOTS_FROM_EMAIL?.trim() || 'StoryRoots <onboarding@resend.dev>';

  if (!apiKey || !recipient) {
    return json({ error: 'We could not send your request just now. Please try again.' }, 502);
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `storyroots-interest-${await sha256(email)}`,
    },
    body: JSON.stringify({
      from: sender,
      to: [recipient],
      subject: 'New StoryRoots signup',
      text: [
        'A visitor wants to try StoryRoots.',
        '',
        `Visitor email: ${email}`,
        `Received: ${new Date().toISOString()}`,
      ].join('\n'),
    }),
  });

  if (!response.ok) {
    return json({ error: 'We could not send your request just now. Please try again.' }, 502);
  }

  return json({ ok: true, alreadyRegistered: false, notificationSent: true, developmentFallback: false });
}

function serveAsset(pathname, method) {
  const asset = STATIC_ASSETS[pathname];
  if (!asset) return null;

  let body = decodedAssets.get(pathname);
  if (!body) {
    const binary = atob(asset.body);
    body = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    decodedAssets.set(pathname, body);
  }

  return new Response(method === 'HEAD' ? null : body, {
    headers: {
      'Content-Type': asset.contentType,
      ...(pathname.startsWith('/_next/static/')
        ? { 'Cache-Control': 'public, max-age=31536000, immutable' }
        : { 'Cache-Control': 'no-cache' }),
    },
  });
}

const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/storyroots-interest') {
      if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
      return handleInterest(request, env);
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed.', { status: 405 });
    }

    const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
    const assetResponse = serveAsset(pathname, request.method);
    if (assetResponse) return assetResponse;

    const notFoundResponse = serveAsset('/404.html', request.method);
    return new Response(notFoundResponse?.body || 'Not found.', {
      status: 404,
      headers: notFoundResponse?.headers,
    });
  },
};

export default worker;
