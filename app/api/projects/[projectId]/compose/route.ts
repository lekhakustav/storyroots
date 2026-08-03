import { bad, currentUser, guardRateLimit, ok } from '@/lib/api';
import { composeStory } from '@/lib/store';

export async function POST(_: Request, context: { params: Promise<{ projectId: string }> }) {
  const user = await currentUser();
  if (!guardRateLimit(user.id, 'compose-story', 12)) return bad('Please wait before creating the story again.', 429);
  const { projectId } = await context.params;
  const result = composeStory(user, projectId);
  return result ? ok(result, { status: 201 }) : bad('A completed transcript is required before creating the story.');
}
