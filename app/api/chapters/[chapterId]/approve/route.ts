import { currentUser, bad, ok } from '@/lib/api';
import { approveChapter } from '@/lib/store';

export async function POST(_: Request, context: { params: Promise<{ chapterId: string }> }) { const chapter = approveChapter(await currentUser(), (await context.params).chapterId); return chapter ? ok({ chapter }) : bad('Chapter not found.', 404); }
