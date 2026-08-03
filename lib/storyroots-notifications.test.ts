import { describe, expect, it, vi } from 'vitest';
import { sendStoryRootsInterestNotification } from './storyroots-notifications';

describe('StoryRoots interest notifications', () => {
  it('stays in preview mode when no mail key is configured', async () => {
    await expect(sendStoryRootsInterestNotification('family@example.com', { apiKey: '' }))
      .resolves.toEqual({ configured: false, sent: false });
  });

  it('sends each signup to the StoryRoots inbox', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'email_123' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));

    const result = await sendStoryRootsInterestNotification(' Family@Example.com ', {
      apiKey: 're_test',
      fetchImpl,
      now: () => new Date('2026-08-01T08:00:00.000Z'),
      to: 'lekhakutsav@gmail.com',
    });

    expect(result).toEqual({ configured: true, sent: true, messageId: 'email_123' });
    expect(fetchImpl).toHaveBeenCalledOnce();

    const [, request] = fetchImpl.mock.calls[0] as [string, RequestInit];
    const payload = JSON.parse(String(request.body));
    expect(payload.to).toEqual(['lekhakutsav@gmail.com']);
    expect(payload.subject).toBe('New StoryRoots signup');
    expect(payload.text).toContain('family@example.com');
    expect(request.headers).toMatchObject({ Authorization: 'Bearer re_test' });
  });

  it('reports a mail-service failure without exposing the key', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: 'Sender is not verified.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    }));

    await expect(sendStoryRootsInterestNotification('family@example.com', {
      apiKey: 're_private_key',
      fetchImpl,
      to: 'lekhakutsav@gmail.com',
    })).resolves.toEqual({ configured: true, sent: false, error: 'Sender is not verified.' });
  });

  it('reports a missing notification recipient', async () => {
    await expect(sendStoryRootsInterestNotification('family@example.com', {
      apiKey: 're_test',
      to: '',
    })).resolves.toEqual({
      configured: true,
      sent: false,
      error: 'Notification recipient is not configured.',
    });
  });

  it('refuses to send StoryRoots signups to another recipient', async () => {
    await expect(sendStoryRootsInterestNotification('family@example.com', {
      apiKey: 're_test',
      to: 'someone-else@example.com',
    })).resolves.toEqual({
      configured: true,
      sent: false,
      error: 'Notification recipient is not the StoryRoots inbox.',
    });
  });
});
