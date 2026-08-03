import type { Language } from './i18n';

export type VoiceGender = 'female' | 'male';

export function getElevenLabsStatus() {
  return {
    apiKey: Boolean(process.env.ELEVENLABS_API_KEY),
    englishVoice: Boolean(process.env.ELEVENLABS_VOICE_ID_EN),
    nepaliMaleVoice: Boolean(process.env.ELEVENLABS_VOICE_ID_NE_MALE),
    nepaliFemaleVoice: Boolean(process.env.ELEVENLABS_VOICE_ID_NE_FEMALE),
  };
}

function voiceId(language: Language, gender: VoiceGender) {
  if (language === 'en') return process.env.ELEVENLABS_VOICE_ID_EN;
  return gender === 'male' ? process.env.ELEVENLABS_VOICE_ID_NE_MALE : process.env.ELEVENLABS_VOICE_ID_NE_FEMALE;
}

export async function createElevenLabsSpeech(input: { text: string; language: Language; voiceGender: VoiceGender }) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const selectedVoice = voiceId(input.language, input.voiceGender);
  if (!apiKey || !selectedVoice) return null;
  const modelId = input.language === 'ne' ? 'eleven_v3' : 'eleven_multilingual_v2';
  const body: Record<string, unknown> = {
    text: input.text,
    model_id: modelId,
    voice_settings: { stability: .58, similarity_boost: .76, style: .08, speed: .9 },
  };
  if (input.language === 'ne') body.language_code = 'ne';
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(selectedVoice)}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'content-type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`ElevenLabs speech request failed with ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
}

export async function transcribeWithElevenLabs(file: File, language: Language) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return null;
  const form = new FormData();
  form.append('file', file, file.name || 'story-recording');
  form.append('model_id', 'scribe_v2');
  form.append('language_code', language === 'ne' ? 'nep' : 'eng');
  form.append('tag_audio_events', 'false');
  form.append('diarize', 'false');
  const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
    method: 'POST',
    headers: { 'xi-api-key': apiKey },
    body: form,
  });
  if (!response.ok) throw new Error(`ElevenLabs transcription request failed with ${response.status}`);
  const body = await response.json() as { text?: string; language_code?: string };
  if (!body.text?.trim()) throw new Error('ElevenLabs transcription returned no text');
  return { text: body.text.trim(), language, detectedLanguage: body.language_code ?? language, provider: 'elevenlabs-scribe-v2' };
}
