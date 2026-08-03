import { bad, currentUser, ok } from '@/lib/api';
import { storyProgressSchema } from '@/lib/schemas';
import { setNarration, updateConversationProgress } from '@/lib/store';

export async function PATCH(request: Request, context: { params: Promise<{ projectId: string }> }) {
  const parsed = storyProgressSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return bad('The saved progress is not valid.');
  const user = await currentUser();
  const { projectId } = await context.params;
  const { narrationStatus, narrationProvider, narrationVoice, ...progress } = parsed.data;
  let project = updateConversationProgress(user, projectId, progress);
  if (!project) return bad('Story not found.', 404);
  if (narrationStatus) project = setNarration(user, projectId, { status: narrationStatus, provider: narrationProvider ?? null, voiceGender: narrationVoice ?? null }) ?? project;
  return ok({ project });
}
