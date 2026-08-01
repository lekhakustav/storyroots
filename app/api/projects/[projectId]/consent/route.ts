import { consentSchema } from '@/lib/schemas';
import { currentUser, bad, ok } from '@/lib/api';
import { addConsent } from '@/lib/store';

export async function POST(request: Request, context: { params: Promise<{ projectId: string }> }) { const parsed = consentSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return bad('Both recording and AI processing consent are required.'); const { projectId } = await context.params; const project = addConsent(await currentUser(), projectId, { ...parsed.data, consentedAt: new Date().toISOString() }); return project ? ok({ project }) : bad('Project not found.', 404); }
