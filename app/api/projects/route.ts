import { projectSchema } from '@/lib/schemas';
import { currentUser, bad, ok } from '@/lib/api';
import { createProject, listProjects } from '@/lib/store';

export async function GET() { const user = await currentUser(); return ok({ projects: listProjects(user) }); }
export async function POST(request: Request) { const parsed = projectSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return bad(parsed.error.issues[0]?.message ?? 'Please check the form.'); const project = createProject(await currentUser(), parsed.data); return ok({ project }, { status: 201 }); }
