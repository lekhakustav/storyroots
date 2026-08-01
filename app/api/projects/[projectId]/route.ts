import { currentUser, bad, ok } from '@/lib/api';
import { deleteProject, getProject, updateProject } from '@/lib/store';

export async function GET(_: Request, context: { params: Promise<{ projectId: string }> }) { const { projectId } = await context.params; const project = getProject(await currentUser(), projectId); return project ? ok({ project }) : bad('Project not found.', 404); }
export async function PATCH(request: Request, context: { params: Promise<{ projectId: string }> }) { const { projectId } = await context.params; const patch = await request.json().catch(() => null); const project = updateProject(await currentUser(), projectId, patch ?? {}); return project ? ok({ project }) : bad('Project not found.', 404); }
export async function DELETE(_: Request, context: { params: Promise<{ projectId: string }> }) { const { projectId } = await context.params; const deleted = deleteProject(await currentUser(), projectId); return deleted ? ok({ deleted: true }) : bad('Project not found.', 404); }
