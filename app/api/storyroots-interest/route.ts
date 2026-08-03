import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { sendStoryRootsInterestNotification } from '../../../lib/storyroots-notifications';

const interestSchema = z.object({ email: z.string().trim().email().max(255) });

function getSupabasePublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && publishableKey
    ? createClient(url, publishableKey, { auth: { autoRefreshToken: false, persistSession: false } })
    : null;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = interestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 });

  const email = parsed.data.email.toLowerCase();
  const supabase = getSupabasePublicClient();
  if (!supabase) {
    return NextResponse.json({ error: 'We could not save that just now. Please try again.' }, { status: 503 });
  }

  let insertError: { code?: string } | null;
  try {
    ({ error: insertError } = await supabase.from('storyroots_interest_signups').insert({ email }));
  } catch (error) {
    console.error('StoryRoots signup insert failed:', error);
    return NextResponse.json({ error: 'We could not save that just now. Please try again.' }, { status: 500 });
  }

  if (insertError?.code === '23505') {
    return NextResponse.json({ ok: true, alreadyRegistered: true, notificationSent: false });
  }
  if (insertError) {
    return NextResponse.json({ error: 'We could not save that just now. Please try again.' }, { status: 500 });
  }

  const notification = await sendStoryRootsInterestNotification(email);
  if (!notification.sent) {
    console.error('StoryRoots signup notification failed:', notification.error);
    return NextResponse.json({ error: 'We could not send your request just now. Please try again.' }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    alreadyRegistered: false,
    notificationSent: true,
  });
}
