import { interviewSchema } from '@/lib/schemas';
import { currentUser, bad, ok } from '@/lib/api';
import { addInterview, getProject } from '@/lib/store';

export async function GET(_: Request, context: { params: Promise<{ projectId: string }> }) { const { projectId } = await context.params; const project = getProject(await currentUser(), projectId); return project ? ok({ interviews: project.interviews }) : bad('Project not found.', 404); }
export async function POST(request: Request, context: { params: Promise<{ projectId: string }> }) { const parsed = interviewSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return bad('Please add a name for this interview.'); const { projectId } = await context.params; const interview = addInterview(await currentUser(), projectId, parsed.data.title); return interview ? ok({ interview }, { status: 201 }) : bad('Project not found.', 404); }
