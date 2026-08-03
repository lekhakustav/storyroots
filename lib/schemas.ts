import { z } from 'zod';

export const projectSchema = z.object({
  title: z.string().trim().min(2).max(100),
  storytellerName: z.string().trim().min(2).max(100),
  storytellerRelationship: z.string().trim().min(2).max(80),
  preferredLanguage: z.enum(['en', 'ne', 'en-ne']).default('en')
});

export const storySessionSchema = z.object({
  storyType: z.enum(['autobiography', 'comic', 'audiobook', 'diary']),
  language: z.enum(['en', 'ne'])
});

export const consentSchema = z.object({
  storytellerName: z.string().trim().min(2).max(100),
  recordingConsent: z.literal(true),
  aiProcessingConsent: z.literal(true),
  voiceGenerationConsent: z.boolean().default(false)
});

export const chapterSchema = z.object({ content: z.string().min(1).max(30000) });
export const timelineConfirmSchema = z.object({ confirmationStatus: z.enum(['unconfirmed', 'confirmed', 'corrected', 'rejected']) });
export const interviewSchema = z.object({ title: z.string().trim().min(2).max(120) });

export const voiceRequestSchema = z.object({
  text: z.string().trim().min(1).max(5000),
  language: z.enum(['en', 'ne']),
  voiceGender: z.enum(['female', 'male']).default('female'),
  purpose: z.enum(['question', 'narration'])
});

export const storyProgressSchema = z.object({
  phase: z.enum(['ready', 'recording', 'processing', 'review', 'narration']),
  currentQuestion: z.number().int().min(0).max(100).optional(),
  transcriptText: z.string().max(30000).optional(),
  uncertainDetails: z.array(z.string().max(500)).max(10).optional(),
  narrationStatus: z.enum(['not_generated', 'generating', 'ready', 'fallback', 'failed']).optional(),
  narrationProvider: z.enum(['elevenlabs', 'browser']).optional(),
  narrationVoice: z.enum(['female', 'male']).optional()
});
