export type StoryFor = 'mother' | 'father' | 'grandparent' | 'myself' | 'someone-else';
export type Relationship = 'child' | 'grandchild' | 'spouse' | 'relative' | 'friend' | 'other';
export type GiftType = 'surprise' | 'known-gift' | 'together' | 'self';
export type ContactMethod = 'email' | 'phone' | 'whatsapp';

export type BookingAnswers = {
  storyFor: StoryFor | '';
  storytellerName: string;
  customerRelationship: Relationship | '';
  isGift: boolean;
  giftType: GiftType | '';
  preferredLanguage: string;
  otherLanguage: string;
  sharingMethod: string;
  storyInterests: string[];
  keepsakeInterest: string;
  occasion: string;
  occasionDate: string;
  country: string;
  city: string;
  timezone: string;
  consultationDate: string;
  consultationTime: string;
  slotId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  contactMethod: ContactMethod | '';
  notes: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  contactPermission: boolean;
};

export const initialBookingAnswers = (timezone = 'Asia/Kathmandu'): BookingAnswers => ({
  storyFor: '', storytellerName: '', customerRelationship: '', isGift: false, giftType: '', preferredLanguage: '',
  otherLanguage: '', sharingMethod: '', storyInterests: [], keepsakeInterest: '', occasion: '', occasionDate: '',
  country: '', city: '', timezone, consultationDate: '', consultationTime: '', slotId: '', customerName: '',
  customerEmail: '', customerPhone: '', contactMethod: '', notes: '', termsAccepted: false, privacyAccepted: false,
  contactPermission: false,
});

export const storyForOptions = [
  { value: 'mother', label: 'My mother' }, { value: 'father', label: 'My father' },
  { value: 'grandparent', label: 'My grandparent' }, { value: 'myself', label: 'Myself' },
  { value: 'someone-else', label: 'Someone else' },
] as const;

export const relationshipOptions = [
  { value: 'child', label: 'Son or daughter' }, { value: 'grandchild', label: 'Grandchild' },
  { value: 'spouse', label: 'Spouse' }, { value: 'relative', label: 'Relative' },
  { value: 'friend', label: 'Friend' }, { value: 'other', label: 'Other' },
] as const;

export const giftOptions = [
  { value: 'surprise', label: 'Yes, it is a surprise gift' }, { value: 'known-gift', label: 'Yes, but they already know' },
  { value: 'together', label: 'No, we are planning it together' }, { value: 'self', label: 'I am booking for myself' },
] as const;

export const languageOptions = ['Nepali', 'English', 'Hindi', 'Bengali', 'Tamil', 'Other'];
export const sharingOptions = ['Phone conversation', 'WhatsApp call', 'Video call', 'Recorded voice messages', 'Not sure yet'];
export const interestOptions = ['Childhood memories', 'Family history', 'Career and achievements', 'Love and relationships', 'Challenges and sacrifices', 'Cultural traditions', 'Advice for future generations', 'Their complete life story'];
export const keepsakeOptions = ['Digital biography', 'Audiobook', 'Biography and audiobook', 'Complete family keepsake', 'Not sure yet'];
export const occasionOptions = ['Birthday', 'Anniversary', 'Retirement', 'Family reunion', 'Memorial or family archive', 'No special occasion', 'Other'];
export const contactOptions = ['email', 'phone', 'whatsapp'] as const;

export type BookingQuestion = { id: string; title: string; helper?: string; kind: string };

export const bookingQuestions: BookingQuestion[] = [
  { id: 'storyFor', title: 'Who is this story for?', kind: 'options' },
  { id: 'storytellerName', title: "What is the storyteller's name?", helper: 'Their full name is all we need for now.', kind: 'text' },
  { id: 'customerRelationship', title: 'What is your relationship with them?', kind: 'options' },
  { id: 'giftType', title: 'Is this a gift?', kind: 'options' },
  { id: 'preferredLanguage', title: 'Which language makes them most comfortable?', kind: 'language' },
  { id: 'sharingMethod', title: 'How would they prefer to share memories?', kind: 'options' },
  { id: 'storyInterests', title: 'What would you most like to preserve?', helper: 'Choose as many as feel right.', kind: 'multi' },
  { id: 'keepsakeInterest', title: 'What final keepsake interests you?', helper: 'We will talk through what fits during your consultation.', kind: 'options' },
  { id: 'occasion', title: 'Is there a special occasion?', kind: 'occasion' },
  { id: 'location', title: 'Where will the storyteller join from?', helper: 'We use this to show appointment times in the right local time.', kind: 'location' },
  { id: 'consultationDate', title: 'Choose a consultation date', helper: 'Choose any available future date.', kind: 'date' },
  { id: 'consultationTime', title: 'Choose a consultation time', helper: 'Times are shown in your selected time zone.', kind: 'time' },
  { id: 'contact', title: 'How should StoryRoots contact you?', helper: 'Add at least an email or phone number.', kind: 'contact' },
  { id: 'notes', title: 'Anything we should know?', helper: 'This is optional. You can skip this step.', kind: 'notes' },
  { id: 'review', title: 'Review your booking', helper: 'A final look before we hold your consultation time.', kind: 'review' },
];
