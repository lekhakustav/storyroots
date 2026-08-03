import { currentUser, bad, guardRateLimit, ok } from '@/lib/api';
import { transcribeWithElevenLabs } from '@/lib/elevenlabs';
import { normalizeLanguage } from '@/lib/i18n';
import { addRecording, getInterview, saveTranscript } from '@/lib/store';

const allowed = new Set(['audio/webm', 'audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a', 'audio/wav', 'audio/x-wav']);
export async function POST(request: Request, context: { params: Promise<{ sessionId: string }> }) {
  const user = await currentUser();
  if (!guardRateLimit(user.id, 'upload', 20)) return bad('Please wait before uploading again.', 429);
  const found = getInterview(user, (await context.params).sessionId);
  if (!found) return bad('Interview not found.', 404);
  if (!found.project.consent?.recordingConsent) return bad('Recording consent is required before uploading audio.', 403);
  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return bad('Please choose an audio file.');
  if (file.size > 50 * 1024 * 1024) return bad('Audio files must be smaller than 50 MB.');
  if (file.type && !allowed.has(file.type)) return bad('Use a webm, mp3, m4a, or wav file.');
  const recording = addRecording(user, found.interview.id, { originalFilename: file.name || 'story-recording', mimeType: file.type || 'audio/webm', durationSeconds: Number(form.get('durationSeconds') || 0) || null, fileSize: file.size });
  if (!recording) return bad('Could not save recording.', 500);
  const language = normalizeLanguage(String(form.get('language') || found.project.preferredLanguage));
  try {
    const result = await transcribeWithElevenLabs(file, language);
    if (result) {
      const transcript = saveTranscript(user, recording.id, result.text, language, result.provider);
      return ok({ recording: { ...recording, processingStatus: 'completed', transcriptId: transcript?.id ?? null }, transcript, provider: result.provider }, { status: 201 });
    }
  } catch {
    // Keep the recording and let the explicit transcription route use the development fallback.
  }
  return ok({ recording, provider: 'development-storage', transcriptionPending: true }, { status: 201 });
}
