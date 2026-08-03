import { bad, currentUser, guardRateLimit, ok } from '@/lib/api';
import { storySessionSchema } from '@/lib/schemas';
import { createStorySession } from '@/lib/store';

export async function POST(request: Request) {
  const user = await currentUser();
  if (!guardRateLimit(user.id, 'new-story', 12)) return bad('Please wait before starting another story.', 429);
  const parsed = storySessionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return bad('Please choose a story type and language.');
  const project = createStorySession(user, parsed.data.storyType, parsed.data.language);
  return ok({ project }, { status: 201 });
}
