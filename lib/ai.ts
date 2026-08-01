import type { Chapter, TimelineEvent } from './types';

export interface TranscriptionService { transcribe(input: { filename: string; mimeType: string }): Promise<{ text: string; language: string; provider: string }>; }
export interface InterviewService { generateQuestions(input: { storytellerName: string; title: string }): Promise<string[]>; }
export interface TimelineExtractionService { extract(input: { transcript: string }): Promise<Pick<TimelineEvent, 'eventTitle' | 'eventDescription' | 'approximateDateText' | 'location' | 'confidence' | 'evidenceText'>[]>; }
export interface ChapterGenerationService { generate(input: { storytellerName: string; event: TimelineEvent }): Promise<Pick<Chapter, 'title' | 'content'>>; }
export interface NarrationService { generate(input: { text: string }): Promise<{ status: 'disabled' | 'ready'; provider: string }>; }

const mock = { provider: 'mock' };
export const mockTranscription: TranscriptionService = { async transcribe() { return { ...mock, text: 'When I was a child, our home in Kathmandu was always full of cousins and neighbors. My brother Daju taught me to be brave and kind.', language: 'en' }; } };
export const mockInterview: InterviewService = { async generateQuestions() { return ['What was home like when you were growing up?', 'Who made you feel safe and loved?', 'What is one lesson you want your family to carry forward?']; } };
export const mockTimeline: TimelineExtractionService = { async extract({ transcript }) { return [{ eventTitle: 'Learning courage at home', eventDescription: 'Maya remembers her older brother teaching her to be brave and kind.', approximateDateText: 'When she was a child', location: 'Kathmandu', confidence: 0.82, evidenceText: transcript.slice(0, 140) }]; } };
export const mockChapter: ChapterGenerationService = { async generate({ event }) { return { title: event.eventTitle, content: `${event.eventDescription}\n\nThe memory is grounded in Maya's own words: “${event.evidenceText}”` }; } };
export const disabledNarration: NarrationService = { async generate() { return { status: 'disabled', provider: 'disabled' }; } };
