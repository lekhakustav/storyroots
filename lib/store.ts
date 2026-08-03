import { translate, type Language, type LocaleKey } from './i18n';
import type { AppUser, BiographyProject, Chapter, ConversationPhase, ExportJob, InterviewSession, PersonMention, Recording, StoryType, TimelineEvent } from './types';

export type TranscriptRecord = {
  id: string;
  recordingId: string;
  rawText: string;
  correctedText: string;
  language: Language;
  processingStatus: 'completed';
  provider: string;
};

type Store = { projects: Map<string, BiographyProject>; transcripts: Map<string, TranscriptRecord> };
const globalStore = globalThis as typeof globalThis & { __keepsakeStore?: Store };

const defaultTitleKeys: Record<StoryType, LocaleKey> = {
  autobiography: 'defaultAutobiographyTitle',
  comic: 'defaultComicTitle',
  audiobook: 'defaultAudiobookTitle',
  diary: 'defaultDiaryTitle',
};

const questionKeys: Record<StoryType, LocaleKey> = {
  autobiography: 'questionAutobiography',
  comic: 'questionComic',
  audiobook: 'questionAudiobook',
  diary: 'questionDiary',
};

function createId(prefix: string) { return `${prefix}_${crypto.randomUUID()}`; }
function now() { return new Date().toISOString(); }

function normalizeProject(project: BiographyProject) {
  project.storyType ||= 'autobiography';
  project.conversationProgress ||= {
    phase: project.chapters.length ? 'review' : 'ready',
    currentQuestion: 0,
    transcriptText: '',
    uncertainDetails: [],
    savedAt: project.updatedAt,
  };
  project.narration ||= { status: 'not_generated', provider: null, voiceGender: null, storagePath: null, generatedAt: null };
  return project;
}

function seedProject(): BiographyProject {
  const createdAt = now();
  return {
    id: 'project_maya',
    ownerId: 'demo-user',
    title: "Maya's Story",
    storytellerName: 'Maya Sharma',
    storytellerRelationship: 'Grandmother',
    preferredLanguage: 'en',
    storyType: 'autobiography',
    status: 'in_progress',
    coverImageUrl: null,
    createdAt,
    updatedAt: createdAt,
    consent: { storytellerName: 'Maya Sharma', recordingConsent: true, aiProcessingConsent: true, voiceGenerationConsent: false, consentedAt: createdAt },
    interviews: [{
      id: 'session_first',
      title: 'First conversation',
      status: 'complete',
      startedAt: createdAt,
      completedAt: createdAt,
      createdAt,
      questions: [{ id: 'q1', questionText: 'What was home like when you were growing up?', questionOrder: 1, answeredAt: createdAt }],
      recordings: [{ id: 'recording_sample', originalFilename: 'maya-story-sample.webm', mimeType: 'audio/webm', durationSeconds: 126, fileSize: 248000, processingStatus: 'completed', transcriptId: 'transcript_sample' }],
    }],
    timelineEvents: [{ id: 'event_kathmandu', eventTitle: 'A childhood shaped by community', eventDescription: 'Maya remembers growing up surrounded by cousins, neighbors, and shared afternoon tea.', eventDate: null, approximateDateText: 'When she was a child', location: 'Kathmandu', confidence: .86, confirmationStatus: 'confirmed', evidenceText: 'Our house was always full of cousins and neighbors. Someone was always bringing tea.' }],
    peopleMentions: [{ id: 'person_daju', fullName: 'Daju', relationship: 'Older brother', description: 'Remembered as a protective older brother.', confidence: .74, confirmationStatus: 'unconfirmed' }],
    chapters: [{ id: 'chapter_first', title: 'The House That Was Always Full', chapterOrder: 1, content: 'Maya remembers a home shaped less by quiet rooms than by the people who filled them. Cousins arrived without much notice, neighbors shared tea, and afternoons had a way of becoming small gatherings. Looking back, she describes those days as ordinary in the best sense: a life held together by community.', status: 'approved', generatedAt: createdAt, approvedAt: createdAt, updatedAt: createdAt }],
    exports: [],
    conversationProgress: { phase: 'review', currentQuestion: 0, transcriptText: 'Our house was always full of cousins and neighbors. Someone was always bringing tea.', uncertainDetails: [], savedAt: createdAt },
    narration: { status: 'not_generated', provider: null, voiceGender: null, storagePath: null, generatedAt: null },
  };
}

function getStore(): Store {
  if (!globalStore.__keepsakeStore) {
    globalStore.__keepsakeStore = {
      projects: new Map([['project_maya', seedProject()]]),
      transcripts: new Map([['transcript_sample', { id: 'transcript_sample', recordingId: 'recording_sample', rawText: 'Our house was always full of cousins and neighbors. Someone was always bringing tea.', correctedText: 'Our house was always full of cousins and neighbors. Someone was always bringing tea.', language: 'en', processingStatus: 'completed', provider: 'seed' }]]),
    };
  }
  return globalStore.__keepsakeStore;
}

export function listProjects(user: AppUser) {
  return [...getStore().projects.values()].filter((project) => project.ownerId === user.id).map(normalizeProject);
}

export function getProject(user: AppUser, id: string) {
  const project = getStore().projects.get(id);
  if (!project || project.ownerId !== user.id) return null;
  return normalizeProject(project);
}

export function createProject(user: AppUser, input: Pick<BiographyProject, 'title' | 'storytellerName' | 'storytellerRelationship' | 'preferredLanguage'> & { storyType?: StoryType }) {
  const createdAt = now();
  const project: BiographyProject = {
    ...input,
    storyType: input.storyType ?? 'autobiography',
    id: createId('project'),
    ownerId: user.id,
    status: 'draft',
    coverImageUrl: null,
    createdAt,
    updatedAt: createdAt,
    consent: null,
    interviews: [],
    timelineEvents: [],
    peopleMentions: [],
    chapters: [],
    exports: [],
    conversationProgress: { phase: 'ready', currentQuestion: 0, transcriptText: '', uncertainDetails: [], savedAt: createdAt },
    narration: { status: 'not_generated', provider: null, voiceGender: null, storagePath: null, generatedAt: null },
  };
  getStore().projects.set(project.id, project);
  return project;
}

export function createStorySession(user: AppUser, storyType: StoryType, language: Language) {
  const project = createProject(user, {
    title: translate(language, defaultTitleKeys[storyType]),
    storytellerName: user.fullName,
    storytellerRelationship: translate(language, 'selfRelationship'),
    preferredLanguage: language,
    storyType,
  });
  const interview = addInterview(user, project.id, translate(language, 'firstConversation'))!;
  interview.questions = [{ id: createId('question'), questionText: translate(language, questionKeys[storyType]), questionOrder: 1, answeredAt: null }];
  return project;
}

export function updateProject(user: AppUser, id: string, patch: Partial<BiographyProject>) {
  const project = getProject(user, id);
  if (!project) return null;
  Object.assign(project, patch, { updatedAt: now() });
  return normalizeProject(project);
}

export function updateConversationProgress(user: AppUser, id: string, patch: Partial<BiographyProject['conversationProgress']>) {
  const project = getProject(user, id);
  if (!project) return null;
  project.conversationProgress = { ...project.conversationProgress, ...patch, savedAt: now() };
  project.updatedAt = now();
  return project;
}

export function setNarration(user: AppUser, id: string, input: Partial<BiographyProject['narration']>) {
  const project = getProject(user, id);
  if (!project) return null;
  project.narration = { ...project.narration, ...input, generatedAt: input.status === 'ready' || input.status === 'fallback' ? now() : project.narration.generatedAt };
  project.updatedAt = now();
  return project;
}

export function deleteProject(user: AppUser, id: string) {
  const project = getProject(user, id);
  if (!project) return false;
  getStore().projects.delete(id);
  return true;
}

export function addConsent(user: AppUser, id: string, consent: NonNullable<BiographyProject['consent']>) {
  const project = getProject(user, id);
  if (!project) return null;
  project.consent = consent;
  project.updatedAt = now();
  return project;
}

export function addInterview(user: AppUser, id: string, title: string) {
  const project = getProject(user, id);
  if (!project) return null;
  const interview: InterviewSession = { id: createId('session'), title, status: 'planned', startedAt: null, completedAt: null, createdAt: now(), questions: [], recordings: [] };
  project.interviews.unshift(interview);
  project.updatedAt = now();
  return interview;
}

export function getInterview(user: AppUser, sessionId: string) {
  return listProjects(user).flatMap((project) => project.interviews.map((interview) => ({ project, interview }))).find((item) => item.interview.id === sessionId) ?? null;
}

export function addQuestions(user: AppUser, sessionId: string) {
  const found = getInterview(user, sessionId);
  if (!found) return null;
  const language: Language = found.project.preferredLanguage === 'ne' ? 'ne' : 'en';
  found.interview.questions = [{ id: createId('question'), questionText: translate(language, questionKeys[found.project.storyType]), questionOrder: 1, answeredAt: null }];
  return found.interview;
}

export function addRecording(user: AppUser, sessionId: string, input: Omit<Recording, 'id' | 'processingStatus' | 'transcriptId'>) {
  const found = getInterview(user, sessionId);
  if (!found || !found.project.consent?.recordingConsent) return null;
  const recording: Recording = { ...input, id: createId('recording'), processingStatus: 'queued', transcriptId: null };
  found.interview.recordings.unshift(recording);
  found.interview.status = 'processing';
  found.project.conversationProgress.phase = 'processing';
  found.project.updatedAt = now();
  return recording;
}

function recordingContext(user: AppUser, recordingId: string) {
  return listProjects(user).flatMap((project) => project.interviews.flatMap((interview) => interview.recordings.map((recording) => ({ project, interview, recording })))).find((item) => item.recording.id === recordingId) ?? null;
}

export function getTranscriptByRecording(recordingId: string) {
  return [...getStore().transcripts.values()].find((transcript) => transcript.recordingId === recordingId) ?? null;
}

export function saveTranscript(user: AppUser, recordingId: string, text: string, language: Language, provider: string) {
  const found = recordingContext(user, recordingId);
  if (!found || !text.trim()) return null;
  const existing = getTranscriptByRecording(recordingId);
  const transcript: TranscriptRecord = existing ? { ...existing, rawText: text.trim(), correctedText: text.trim(), language, provider } : { id: createId('transcript'), recordingId, rawText: text.trim(), correctedText: text.trim(), language, processingStatus: 'completed', provider };
  getStore().transcripts.set(transcript.id, transcript);
  found.recording.processingStatus = 'completed';
  found.recording.transcriptId = transcript.id;
  found.interview.status = 'complete';
  found.interview.completedAt = now();
  found.project.conversationProgress = { ...found.project.conversationProgress, phase: 'processing', transcriptText: transcript.correctedText, savedAt: now() };
  found.project.updatedAt = now();
  return transcript;
}

export function transcribe(user: AppUser, recordingId: string, input?: { text?: string; language?: Language; provider?: string }) {
  const found = recordingContext(user, recordingId);
  if (!found) return null;
  const existing = getTranscriptByRecording(recordingId);
  if (existing) return existing;
  const language: Language = input?.language ?? (found.project.preferredLanguage === 'ne' ? 'ne' : 'en');
  return saveTranscript(user, recordingId, input?.text ?? translate(language, 'mockTranscript'), language, input?.provider ?? 'development-mock');
}

function titleFromTranscript(text: string, language: Language, storyType: StoryType) {
  const normalized = text.toLowerCase();
  if (normalized.includes('house') || normalized.includes('home') || normalized.includes('घर')) return translate(language, 'autoTitleHome');
  const words = text.replace(/[“”"'!?.,।]/g, ' ').split(/\s+/).filter(Boolean).slice(0, 7);
  if (words.length >= 3) {
    const title = words.join(' ');
    return language === 'en' ? title.charAt(0).toUpperCase() + title.slice(1) : title;
  }
  const fallback: Record<StoryType, LocaleKey> = { autobiography: 'defaultAutobiographyTitle', comic: 'autoTitleComic', audiobook: 'autoTitleAudiobook', diary: 'autoTitleDiary' };
  return translate(language, fallback[storyType]);
}

function findUncertainDetails(text: string) {
  const markers = /\b(maybe|perhaps|i think|not sure|cannot remember)\b|सायद|ठ्याक्कै याद छैन|जस्तो लाग्छ/i;
  return text.split(/(?<=[.!?।])\s+/).filter((sentence) => markers.test(sentence)).slice(0, 3);
}

export function composeStory(user: AppUser, id: string) {
  const project = getProject(user, id);
  if (!project) return null;
  const latestRecording = project.interviews.flatMap((session) => session.recordings).find((item) => item.transcriptId);
  if (!latestRecording) return null;
  const transcript = getTranscriptByRecording(latestRecording.id);
  if (!transcript) return null;
  const language: Language = project.preferredLanguage === 'ne' ? 'ne' : 'en';
  const title = titleFromTranscript(transcript.correctedText, language, project.storyType);
  const generatedAt = now();
  let chapter = project.chapters.at(-1);
  if (chapter) {
    chapter.title = title;
    chapter.content = transcript.correctedText;
    chapter.status = 'needs_review';
    chapter.generatedAt = generatedAt;
    chapter.approvedAt = null;
    chapter.updatedAt = generatedAt;
  } else {
    chapter = { id: createId('chapter'), title, chapterOrder: 1, content: transcript.correctedText, status: 'needs_review', generatedAt, approvedAt: null, updatedAt: generatedAt };
    project.chapters.push(chapter);
  }
  project.title = title;
  project.status = 'in_progress';
  project.conversationProgress = { phase: 'review', currentQuestion: 0, transcriptText: transcript.correctedText, uncertainDetails: findUncertainDetails(transcript.correctedText), savedAt: generatedAt };
  project.updatedAt = generatedAt;
  return { project, chapter, transcript };
}

export function extractTimeline(user: AppUser, id: string) {
  const project = getProject(user, id);
  if (!project) return null;
  const evidence = project.conversationProgress.transcriptText || project.interviews.flatMap((session) => session.recordings).map((recording) => getTranscriptByRecording(recording.id)?.correctedText).find(Boolean) || '';
  if (!project.timelineEvents.length && evidence) project.timelineEvents.push({ id: createId('event'), eventTitle: titleFromTranscript(evidence, project.preferredLanguage === 'ne' ? 'ne' : 'en', project.storyType), eventDescription: evidence, eventDate: null, approximateDateText: null, location: null, confidence: .75, confirmationStatus: 'unconfirmed', evidenceText: evidence });
  return project;
}

export function confirmTimeline(user: AppUser, eventId: string, status: TimelineEvent['confirmationStatus']) {
  const found = listProjects(user).flatMap((project) => project.timelineEvents.map((event) => ({ project, event }))).find((item) => item.event.id === eventId);
  if (!found) return null;
  found.event.confirmationStatus = status;
  found.project.updatedAt = now();
  return found.event;
}

export function generateChapter(user: AppUser, id: string) {
  const project = getProject(user, id);
  if (!project) return null;
  const event = project.timelineEvents.find((item) => item.confirmationStatus === 'confirmed') ?? project.timelineEvents[0];
  if (!event) return null;
  const chapter: Chapter = { id: createId('chapter'), title: event.eventTitle, chapterOrder: project.chapters.length + 1, content: event.evidenceText, status: 'needs_review', generatedAt: now(), approvedAt: null, updatedAt: now() };
  project.chapters.push(chapter);
  project.status = 'in_progress';
  project.updatedAt = now();
  return chapter;
}

export function updateChapter(user: AppUser, chapterId: string, content: string) {
  const found = listProjects(user).flatMap((project) => project.chapters.map((chapter) => ({ project, chapter }))).find((item) => item.chapter.id === chapterId);
  if (!found) return null;
  found.chapter.content = content;
  found.chapter.updatedAt = now();
  found.project.conversationProgress.transcriptText = content;
  found.project.conversationProgress.savedAt = now();
  found.project.updatedAt = now();
  return found.chapter;
}

export function approveChapter(user: AppUser, chapterId: string) {
  const found = listProjects(user).flatMap((project) => project.chapters.map((chapter) => ({ project, chapter }))).find((item) => item.chapter.id === chapterId);
  if (!found) return null;
  found.chapter.status = 'approved';
  found.chapter.approvedAt = now();
  found.project.updatedAt = now();
  return found.chapter;
}

export function addExport(user: AppUser, id: string, job: ExportJob) {
  const project = getProject(user, id);
  if (!project) return null;
  project.exports.unshift(job);
  project.updatedAt = now();
  return job;
}

export function getExport(user: AppUser, exportId: string) {
  return listProjects(user).flatMap((project) => project.exports.map((job) => ({ project, job }))).find((item) => item.job.id === exportId) ?? null;
}
