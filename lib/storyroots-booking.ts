import { z } from 'zod';

export const appointmentPayloadSchema = z.object({
  slotId: z.string().min(1), storyFor: z.string().min(1), storytellerName: z.string().trim().min(2).max(120),
  slotStartsAt: z.string().optional().nullable(), slotEndsAt: z.string().optional().nullable(),
  customerRelationship: z.string().min(1), isGift: z.boolean(), giftType: z.string().optional().nullable(),
  preferredLanguage: z.string().min(1), otherLanguage: z.string().optional().nullable(), sharingMethod: z.string().min(1),
  storyInterests: z.array(z.string()).min(1), keepsakeInterest: z.string().min(1), occasion: z.string().min(1),
  occasionDate: z.string().optional().nullable(), country: z.string().trim().min(2).max(80), city: z.string().trim().min(2).max(100),
  timezone: z.string().trim().min(1).max(80), consultationDate: z.string().min(1), consultationTime: z.string().min(1),
  customerName: z.string().trim().min(2).max(120), customerEmail: z.string().trim().email().optional().or(z.literal('')),
  customerPhone: z.string().trim().max(40).optional().or(z.literal('')), contactMethod: z.enum(['email', 'phone', 'whatsapp']),
  notes: z.string().max(2000).optional().nullable(), termsAccepted: z.literal(true), privacyAccepted: z.literal(true), contactPermission: z.literal(true),
}).superRefine((value, ctx) => {
  if (!value.customerEmail && !value.customerPhone) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['customerEmail'], message: 'Add an email or phone number.' });
  }
});

export type AppointmentPayload = z.infer<typeof appointmentPayloadSchema>;

export type AvailabilitySlot = {
  id: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  label: string;
  dateLabel: string;
  dateValue: string;
};

const pad = (value: number) => String(value).padStart(2, '0');

export function fallbackAvailability(timezone: string): AvailabilitySlot[] {
  const slots: AvailabilitySlot[] = [];
  const now = new Date();
  let cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0, 0);
  let dayCount = 0;
  while (slots.length < 24 && dayCount < 45) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) {
      for (const hour of [10, 14, 18]) {
        const start = new Date(cursor); start.setHours(hour, 0, 0, 0);
        const end = new Date(start); end.setMinutes(45);
        const dateValue = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
        slots.push({
          id: `development-${dateValue}-${hour}`, startsAt: start.toISOString(), endsAt: end.toISOString(), timezone,
          label: new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(start),
          dateLabel: new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(start), dateValue,
        });
      }
    }
    cursor.setDate(cursor.getDate() + 1); dayCount += 1;
  }
  return slots;
}

export function formatSlot(slot: { starts_at?: string; ends_at?: string; timezone?: string; id?: string }): AvailabilitySlot {
  const start = new Date(slot.starts_at || new Date().toISOString());
  const end = new Date(slot.ends_at || start.getTime() + 45 * 60 * 1000);
  const timezone = slot.timezone || 'Asia/Kathmandu';
  const dateValue = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(start);
  return {
    id: slot.id || `slot-${start.getTime()}`, startsAt: start.toISOString(), endsAt: end.toISOString(), timezone,
    label: new Intl.DateTimeFormat('en', { timeZone: timezone, hour: 'numeric', minute: '2-digit' }).format(start),
    dateLabel: new Intl.DateTimeFormat('en', { timeZone: timezone, weekday: 'short', month: 'short', day: 'numeric' }).format(start), dateValue,
  };
}

export function makeBookingReference() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(6);
  if (typeof crypto !== 'undefined') crypto.getRandomValues(bytes);
  return `SR-${Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('')}`;
}

export function buildCalendarEvent(input: { reference: string; storytellerName: string; startsAt: string; endsAt: string; timezone: string; contactMethod: string }) {
  const localPart = (iso: string) => {
    const date = new Date(iso);
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: input.timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(date);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}${values.month}${values.day}T${values.hour}${values.minute}${values.second}`;
  };
  const escape = (value: string) => value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//StoryRoots//Story Consultation//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT', `UID:${input.reference}@storyroots`, `DTSTAMP:${localPart(new Date().toISOString())}Z`,
    `DTSTART;TZID=${input.timezone}:${localPart(input.startsAt)}`, `DTEND;TZID=${input.timezone}:${localPart(input.endsAt)}`,
    `SUMMARY:${escape('StoryRoots Story Consultation')}`, `DESCRIPTION:${escape(`A gentle first conversation about ${input.storytellerName}'s story. Booking ${input.reference}. Contact by ${input.contactMethod}.`)}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
}
