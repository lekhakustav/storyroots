import { ok } from '@/lib/api';
import { getElevenLabsStatus } from '@/lib/elevenlabs';

export async function GET() {
  const elevenLabs = getElevenLabsStatus();
  return ok({
    status: 'ok',
    service: 'story-roots',
    aiProvider: process.env.AI_PROVIDER || 'evidence-only-local',
    transcriptionProvider: elevenLabs.apiKey ? 'elevenlabs-scribe-v2' : 'development-mock',
    voiceProvider: elevenLabs.apiKey ? 'elevenlabs' : 'browser-fallback',
    elevenLabs,
    timestamp: new Date().toISOString()
  });
}
