import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { appointmentPayloadSchema, fallbackAvailability, formatSlot, makeBookingReference } from '@/lib/storyroots-booking';

const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

function adminClient() {
  if (!hasSupabase) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function GET(request: NextRequest) {
  const timezone = request.nextUrl.searchParams.get('timezone') || 'Asia/Kathmandu';
  const client = adminClient();
  if (!client) return NextResponse.json({ source: 'development availability', slots: fallbackAvailability(timezone) });
  const { data, error } = await client.from('appointment_slots').select('id, starts_at, ends_at, timezone').eq('status', 'available').gt('starts_at', new Date().toISOString()).order('starts_at').limit(40);
  if (error) return NextResponse.json({ source: 'development availability', slots: fallbackAvailability(timezone), notice: 'Live availability is not connected yet.' });
  return NextResponse.json({ source: 'StoryRoots availability', slots: (data || []).map(formatSlot) });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = appointmentPayloadSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Please check the highlighted details and try again.', fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  const client = adminClient();
  if (!client) {
    return NextResponse.json({
      developmentFallback: true, bookingReference: makeBookingReference(), storytellerName: parsed.data.storytellerName,
      consultationDate: parsed.data.consultationDate, consultationTime: parsed.data.consultationTime, timezone: parsed.data.timezone,
      contactMethod: parsed.data.contactMethod, startsAt: parsed.data.slotStartsAt || new Date(`${parsed.data.consultationDate}T10:00:00`).toISOString(),
      endsAt: parsed.data.slotEndsAt || new Date(`${parsed.data.consultationDate}T10:45:00`).toISOString(),
    });
  }
  const { data, error } = await client.rpc('book_storyroots_appointment', { p_slot_id: parsed.data.slotId, p_appointment: parsed.data });
  if (error) {
    const message = /unavailable|full|capacity/i.test(error.message) ? 'That time was just taken. Please choose another available time.' : 'We could not hold that time right now. Please try again.';
    return NextResponse.json({ error: message }, { status: 409 });
  }
  return NextResponse.json(data);
}
