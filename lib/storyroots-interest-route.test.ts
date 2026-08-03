import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClientMock, insertMock, notificationMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  insertMock: vi.fn(),
  notificationMock: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({ createClient: createClientMock }));
vi.mock('./storyroots-notifications', () => ({
  sendStoryRootsInterestNotification: notificationMock,
}));

import { POST } from '../app/api/storyroots-interest/route';

function request(email: unknown) {
  return new Request('http://localhost/api/storyroots-interest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
}

describe('StoryRoots Next signup route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://storyroots.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');
    createClientMock.mockReturnValue({
      from: vi.fn().mockReturnValue({ insert: insertMock }),
    });
  });

  it('normalizes, saves, and notifies a new address', async () => {
    insertMock.mockResolvedValue({ error: null });
    notificationMock.mockResolvedValue({ configured: true, sent: true, messageId: 'email_123' });

    const response = await POST(request(' Family@Example.com '));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      alreadyRegistered: false,
      notificationSent: true,
    });
    expect(insertMock).toHaveBeenCalledWith({ email: 'family@example.com' });
    expect(notificationMock).toHaveBeenCalledWith('family@example.com');
    expect(createClientMock).toHaveBeenCalledWith(
      'https://storyroots.supabase.co',
      'sb_publishable_test',
      expect.any(Object),
    );
  });

  it('does not notify when Supabase reports a duplicate', async () => {
    insertMock.mockResolvedValue({ error: { code: '23505' } });

    const response = await POST(request('family@example.com'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      alreadyRegistered: true,
      notificationSent: false,
    });
    expect(notificationMock).not.toHaveBeenCalled();
  });

  it('rejects malformed email before accessing Supabase', async () => {
    const response = await POST(request('not-an-email'));

    expect(response.status).toBe(400);
    expect(createClientMock).not.toHaveBeenCalled();
    expect(notificationMock).not.toHaveBeenCalled();
  });

  it('returns retry copy when notification delivery is unavailable', async () => {
    insertMock.mockResolvedValue({ error: null });
    notificationMock.mockResolvedValue({ configured: false, sent: false });

    const response = await POST(request('family@example.com'));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: 'We could not send your request just now. Please try again.',
    });
  });
});
