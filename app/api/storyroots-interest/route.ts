import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { sendStoryRootsInterestNotification } from '@/lib/storyroots-notifications';

const interestSchema = z.object({ email: z.string().trim().email().max(255) });

function getSupabasePublic() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && publishableKey ? createClient(url, publishableKey, { auth: { autoRefreshToken: false, persistSession: false } }) : null;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = interestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 });

  const supabase = getSupabasePublic();
  let alreadyRegistered = false;

  if (supabase) {
    const { error } = await supabase.from('storyroots_interest_signups').insert({ email: parsed.data.email });
    alreadyRegistered = error?.code === '23505';
    if (error && !alreadyRegistered) {
      return NextResponse.json({ error: 'We could not save that just now. Please try again.' }, { status: 500 });
    }
  }

  const notification = await sendStoryRootsInterestNotification(parsed.data.email);
  if (notification.configured && !notification.sent) {
    console.error('StoryRoots signup notification failed:', notification.error);
    return NextResponse.json({ error: 'We could not send your request just now. Please try again.' }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    alreadyRegistered,
    notificationSent: notification.sent,
    developmentFallback: !notification.sent,
    storageConnected: Boolean(supabase),
  });
}
