import { chapterSchema } from '@/lib/schemas';
import { currentUser, bad, ok } from '@/lib/api';
import { updateChapter } from '@/lib/store';

export async function PATCH(request: Request, context: { params: Promise<{ chapterId: string }> }) { const parsed = chapterSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return bad('Chapter text cannot be empty.'); const chapter = updateChapter(await currentUser(), (await context.params).chapterId, parsed.data.content); return chapter ? ok({ chapter }) : bad('Chapter not found.', 404); }
