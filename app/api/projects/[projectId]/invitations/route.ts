import { currentUser, bad, ok } from '@/lib/api';
import { getProject } from '@/lib/store';
export async function POST(_: Request, context: { params: Promise<{ projectId: string }> }) { const { projectId } = await context.params; return getProject(await currentUser(), projectId) ? ok({ status: 'invitation_recorded', provider: 'mock' }, { status: 201 }) : bad('Project not found.', 404); }
