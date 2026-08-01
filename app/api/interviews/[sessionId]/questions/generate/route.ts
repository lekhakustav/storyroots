import { currentUser, bad, guardRateLimit, ok } from '@/lib/api';
import { addQuestions, getInterview } from '@/lib/store';

export async function POST(_: Request, context: { params: Promise<{ sessionId: string }> }) { const user = await currentUser(); if (!guardRateLimit(user.id, 'questions', 10)) return bad('Please wait before trying again.', 429); const { sessionId } = await context.params; const found = getInterview(user, sessionId); if (!found) return bad('Interview not found.', 404); const interview = addQuestions(user, sessionId); return ok({ interview, provider: process.env.AI_PROVIDER || 'mock' }); }
