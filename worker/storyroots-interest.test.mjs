import { describe, expect, it, vi } from 'vitest';
import { handleStoryRootsInterest } from './storyroots-interest.mjs';

const baseEnv = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://storyroots.supabase.co',
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test',
  RESEND_API_KEY: 're_test',
  STORYROOTS_NOTIFICATION_EMAIL: 'lekhakutsav@gmail.com',
};

function request(email) {
  return new Request('https://storyroots.example/api/storyroots-interest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
}

describe('StoryRoots public Worker signup', () => {
  it('normalizes, inserts, and notifies a new address once', async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'email_123' }), { status: 200 }));

    const response = await handleStoryRootsInterest(request(' Family@Example.com '), baseEnv, {
      fetchImpl,
      now: () => new Date('2026-08-02T12:00:00.000Z'),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      alreadyRegistered: false,
      notificationSent: true,
    });
    expect(fetchImpl).toHaveBeenCalledTimes(2);

    const [supabaseUrl, supabaseRequest] = fetchImpl.mock.calls[0];
    expect(supabaseUrl).toBe('https://storyroots.supabase.co/rest/v1/storyroots_interest_signups');
    expect(JSON.parse(supabaseRequest.body)).toEqual({ email: 'family@example.com' });
    expect(supabaseRequest.headers.Authorization).toBe('Bearer sb_publishable_test');

    const [resendUrl, resendRequest] = fetchImpl.mock.calls[1];
    expect(resendUrl).toBe('https://api.resend.com/emails');
    expect(JSON.parse(resendRequest.body).to).toEqual(['lekhakutsav@gmail.com']);
  });

  it('returns duplicate copy state without notifying again', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ code: '23505' }), {
      status: 409,
      headers: { 'Content-Type': 'application/json' },
    }));

    const response = await handleStoryRootsInterest(request('family@example.com'), baseEnv, { fetchImpl });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      alreadyRegistered: true,
      notificationSent: false,
    });
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it('rejects malformed email without inserting or notifying', async () => {
    const fetchImpl = vi.fn();
    const response = await handleStoryRootsInterest(request('not-an-email'), baseEnv, { fetchImpl });

    expect(response.status).toBe(400);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('returns retry copy when Resend fails after a new insert', async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: 'Unavailable' }), { status: 503 }));

    const response = await handleStoryRootsInterest(request('family@example.com'), baseEnv, { fetchImpl });

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: 'We could not send your request just now. Please try again.',
    });
  });
});
