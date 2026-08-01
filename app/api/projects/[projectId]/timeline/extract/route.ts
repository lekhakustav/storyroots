import { currentUser, bad, guardRateLimit, ok } from '@/lib/api';
import { extractTimeline, getProject } from '@/lib/store';

export async function POST(_: Request, context: { params: Promise<{ projectId: string }> }) { const user = await currentUser(); if (!guardRateLimit(user.id, 'timeline', 10)) return bad('Please wait a moment before trying again.', 429); const { projectId } = await context.params; const project = getProject(user, projectId); if (!project) return bad('Project not found.', 404); if (!project.interviews.some((i) => i.recordings.some((r) => r.processingStatus === 'completed'))) return bad('Finish one recording first.'); return ok({ project: extractTimeline(user, projectId), provider: process.env.AI_PROVIDER || 'mock' }); }
