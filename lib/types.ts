export type ProjectStatus = 'draft' | 'in_progress' | 'complete';
export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';
export type ChapterStatus = 'draft' | 'needs_review' | 'approved';

export type TimelineEvent = {
  id: string;
  eventTitle: string;
  eventDescription: string;
  eventDate: string | null;
  approximateDateText: string | null;
  location: string | null;
  confidence: number;
  confirmationStatus: 'unconfirmed' | 'confirmed' | 'corrected' | 'rejected';
  evidenceText: string;
};

export type PersonMention = {
  id: string;
  fullName: string;
  relationship: string | null;
  description: string | null;
  confidence: number;
  confirmationStatus: TimelineEvent['confirmationStatus'];
};

export type Chapter = {
  id: string;
  title: string;
  chapterOrder: number;
  content: string;
  status: ChapterStatus;
  generatedAt: string | null;
  approvedAt: string | null;
  updatedAt: string;
};

export type InterviewSession = {
  id: string;
  title: string;
  status: 'planned' | 'recording' | 'processing' | 'complete';
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  questions: { id: string; questionText: string; questionOrder: number; answeredAt: string | null }[];
  recordings: Recording[];
};

export type Recording = {
  id: string;
  originalFilename: string;
  mimeType: string;
  durationSeconds: number | null;
  fileSize: number | null;
  processingStatus: JobStatus;
  transcriptId: string | null;
};

export type BiographyProject = {
  id: string;
  ownerId: string;
  title: string;
  storytellerName: string;
  storytellerRelationship: string;
  preferredLanguage: 'en' | 'ne' | 'en-ne';
  status: ProjectStatus;
  coverImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  consent: { storytellerName: string; recordingConsent: boolean; aiProcessingConsent: boolean; voiceGenerationConsent: boolean; consentedAt: string | null } | null;
  interviews: InterviewSession[];
  timelineEvents: TimelineEvent[];
  peopleMentions: PersonMention[];
  chapters: Chapter[];
  exports: ExportJob[];
};

export type ExportJob = { id: string; exportType: 'pdf' | 'epub' | 'audiobook'; status: JobStatus; storagePath: string | null; errorMessage: string | null; createdAt: string; completedAt: string | null };

export type AppUser = { id: string; fullName: string; email: string };
