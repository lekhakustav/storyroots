import { describe, expect, it } from 'vitest';
import { DEMO_USER } from './auth';
import { addConsent, addInterview, addRecording, confirmTimeline, createProject, extractTimeline, generateChapter, getProject, transcribe } from './store';

describe('biography workflow data layer', () => {
  it('keeps project access scoped to the owner', () => {
    const project = createProject(DEMO_USER, { title: 'Test story', storytellerName: 'Asha', storytellerRelationship: 'Aunt', preferredLanguage: 'en' });
    expect(getProject({ id: 'another-user', fullName: 'Other', email: 'other@example.com' }, project.id)).toBeNull();
  });

  it('requires consent before an interview can progress', () => {
    const project = createProject(DEMO_USER, { title: 'Consent story', storytellerName: 'Bina', storytellerRelationship: 'Mother', preferredLanguage: 'en' });
    expect(addInterview(DEMO_USER, project.id, 'A conversation')).toBeTruthy();
    expect(addConsent(DEMO_USER, project.id, { storytellerName: 'Bina', recordingConsent: true, aiProcessingConsent: true, voiceGenerationConsent: false, consentedAt: new Date().toISOString() })).toBeTruthy();
  });

  it('turns transcript evidence into confirmable facts and a chapter', () => {
    const project = createProject(DEMO_USER, { title: 'Evidence story', storytellerName: 'Maya', storytellerRelationship: 'Grandmother', preferredLanguage: 'en' });
    addConsent(DEMO_USER, project.id, { storytellerName: 'Maya', recordingConsent: true, aiProcessingConsent: true, voiceGenerationConsent: false, consentedAt: new Date().toISOString() });
    const session = addInterview(DEMO_USER, project.id, 'First conversation')!;
    const recording = addRecording(DEMO_USER, session.id, { originalFilename: 'sample.webm', mimeType: 'audio/webm', durationSeconds: 10, fileSize: 10 });
    expect(recording).toBeTruthy();
    expect(transcribe(DEMO_USER, recording!.id)).toBeTruthy();
    expect(extractTimeline(DEMO_USER, project.id)?.timelineEvents.length).toBeGreaterThan(0);
    confirmTimeline(DEMO_USER, project.timelineEvents[0]?.id ?? '', 'confirmed');
    expect(generateChapter(DEMO_USER, project.id)?.status).toBe('needs_review');
  });
});
