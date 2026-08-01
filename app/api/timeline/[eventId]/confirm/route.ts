import { timelineConfirmSchema } from '@/lib/schemas';
import { currentUser, bad, ok } from '@/lib/api';
import { confirmTimeline } from '@/lib/store';

export async function PATCH(request: Request, context: { params: Promise<{ eventId: string }> }) { const parsed = timelineConfirmSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return bad('Choose a valid confirmation status.'); const event = confirmTimeline(await currentUser(), (await context.params).eventId, parsed.data.confirmationStatus); return event ? ok({ event }) : bad('Timeline event not found.', 404); }
