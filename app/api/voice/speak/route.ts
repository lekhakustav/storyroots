import { NextResponse } from 'next/server';
import { bad, currentUser, guardRateLimit } from '@/lib/api';
import { createElevenLabsSpeech, getElevenLabsStatus } from '@/lib/elevenlabs';
import { voiceRequestSchema } from '@/lib/schemas';

export async function GET() {
  const status = getElevenLabsStatus();
  return NextResponse.json({ provider: 'elevenlabs', configured: status.apiKey && status.englishVoice && (status.nepaliFemaleVoice || status.nepaliMaleVoice), voices: status });
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!guardRateLimit(user.id, 'voice', 24)) return bad('Please wait before generating more audio.', 429);
  const parsed = voiceRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return bad('The narration request is not valid.');
  try {
    const audio = await createElevenLabsSpeech(parsed.data);
    if (!audio) return NextResponse.json({ fallback: 'browser', reason: 'elevenlabs-not-configured' }, { status: 503 });
    return new NextResponse(audio, { status: 200, headers: { 'content-type': 'audio/mpeg', 'cache-control': 'private, no-store', 'x-voice-provider': 'elevenlabs' } });
  } catch {
    return NextResponse.json({ fallback: 'browser', reason: 'elevenlabs-unavailable' }, { status: 503 });
  }
}
