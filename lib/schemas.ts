import { z } from 'zod';

export const projectSchema = z.object({
  title: z.string().trim().min(2).max(100),
  storytellerName: z.string().trim().min(2).max(100),
  storytellerRelationship: z.string().trim().min(2).max(80),
  preferredLanguage: z.enum(['en', 'ne', 'en-ne']).default('en')
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
