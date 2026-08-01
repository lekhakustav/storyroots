import { ok } from '@/lib/api';
export async function GET() { return ok({ status: 'ok', service: 'keepsake', aiProvider: process.env.AI_PROVIDER || 'mock', transcriptionProvider: process.env.TRANSCRIPTION_PROVIDER || 'mock', timestamp: new Date().toISOString() }); }
