'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, Headphones, Mic, Pause, Play, Save, Square, Upload, Volume2 } from 'lucide-react';
import { useI18n } from '@/components/language-provider';
import type { BiographyProject, Chapter, ConversationPhase, Recording } from '@/lib/types';

async function requestJson(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error ?? 'request-failed');
  return body;
}

function formatTime(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function LoadingStory({ title, hint }: { title: string; hint: string }) {
  return <section className="voice-screen processing-screen" aria-live="polite">
    <div className="processing-mark"><Mic size={52} strokeWidth={1.5} aria-hidden="true" /></div>
    <h1>{title}</h1>
    <p>{hint}</p>
    <div className="processing-line" aria-hidden="true"><span /><span /><span /><span /><span /></div>
  </section>;
}

export function StoryFlow({ initialProject }: { initialProject: BiographyProject }) {
  const { language, setLanguage, t, voiceGender } = useI18n();
  const [project, setProject] = useState(initialProject);
  const [phase, setPhase] = useState<ConversationPhase>(initialProject.conversationProgress?.phase ?? (initialProject.chapters.length ? 'review' : 'ready'));
  const [recording, setRecording] = useState<Recording | null>(initialProject.interviews.flatMap((session) => session.recordings)[0] ?? null);
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [questionPlaying, setQuestionPlaying] = useState(false);
  const [voiceFallback, setVoiceFallback] = useState(false);
  const [narrationUrl, setNarrationUrl] = useState<string | null>(null);
  const [fallbackNarrationPlaying, setFallbackNarrationPlaying] = useState(false);
  const [narrationBusy, setNarrationBusy] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const questionAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chapter = project.chapters.at(-1) ?? null;
  const [draft, setDraft] = useState(chapter?.content ?? '');
  const lastSavedDraft = useRef(chapter?.content ?? '');
  const storyLanguage = project.preferredLanguage === 'ne' ? 'ne' : 'en';
  const question = project.interviews[0]?.questions[0]?.questionText ?? t('questionAutobiography');

  useEffect(() => {
    if (!isRecording) return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [isRecording]);

  useEffect(() => () => {
    mediaRef.current?.stream.getTracks().forEach((track) => track.stop());
    questionAudioRef.current?.pause();
    window.speechSynthesis?.cancel();
    if (narrationUrl) URL.revokeObjectURL(narrationUrl);
  }, [narrationUrl]);

  useEffect(() => {
    if (!chapter || draft === lastSavedDraft.current || phase !== 'review') return;
    const timer = window.setTimeout(() => { void saveDraft(false); }, 900);
    return () => window.clearTimeout(timer);
  // saveDraft intentionally reads the latest draft after the debounce.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, chapter?.id, phase]);

  async function saveProgress(nextPhase: ConversationPhase, extra?: Record<string, unknown>) {
    setPhase(nextPhase);
    await fetch(`/api/projects/${project.id}/progress`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ phase: nextPhase, ...extra }),
    }).catch(() => undefined);
  }

  function browserSpeak(text: string, purpose: 'question' | 'narration') {
    if (!('speechSynthesis' in window)) throw new Error('speech-not-supported');
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'ne' ? 'ne-NP' : 'en-US';
    utterance.rate = .88;
    utterance.onstart = () => purpose === 'question' ? setQuestionPlaying(true) : setFallbackNarrationPlaying(true);
    utterance.onend = () => purpose === 'question' ? setQuestionPlaying(false) : setFallbackNarrationPlaying(false);
    utterance.onerror = () => purpose === 'question' ? setQuestionPlaying(false) : setFallbackNarrationPlaying(false);
    setVoiceFallback(true);
    window.speechSynthesis.speak(utterance);
  }

  function stopSpeech() {
    questionAudioRef.current?.pause();
    questionAudioRef.current = null;
    window.speechSynthesis?.cancel();
    setQuestionPlaying(false);
    setFallbackNarrationPlaying(false);
  }

  async function speakQuestion() {
    if (questionPlaying) { stopSpeech(); return; }
    setError('');
    try {
      const response = await fetch('/api/voice/speak', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: question, language, voiceGender, purpose: 'question' }),
      });
      if (!response.ok) { browserSpeak(question, 'question'); return; }
      const url = URL.createObjectURL(await response.blob());
      const audio = new Audio(url);
      questionAudioRef.current = audio;
      audio.onplay = () => setQuestionPlaying(true);
      audio.onended = () => { setQuestionPlaying(false); URL.revokeObjectURL(url); questionAudioRef.current = null; };
      audio.onerror = () => { URL.revokeObjectURL(url); browserSpeak(question, 'question'); };
      await audio.play();
    } catch {
      try { browserSpeak(question, 'question'); } catch { setError(t('narrationError')); }
    }
  }

  async function ensureConsentAndSession() {
    let nextProject = project;
    if (!nextProject.consent?.recordingConsent) {
      const body = await requestJson(`/api/projects/${project.id}/consent`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ storytellerName: project.storytellerName, recordingConsent: true, aiProcessingConsent: true, voiceGenerationConsent: false }),
      });
      nextProject = body.project;
    }
    if (!nextProject.interviews.length) {
      const body = await requestJson(`/api/projects/${project.id}/interviews`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title: t('firstConversation') }),
      });
      nextProject = { ...nextProject, interviews: [body.interview] };
    }
    setProject(nextProject);
    return nextProject;
  }

  async function startRecording() {
    setError('');
    stopSpeech();
    try {
      const nextProject = await ensureConsentAndSession();
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') throw new Error('microphone-unavailable');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const mimeType = recorder.mimeType || 'audio/webm';
        const file = new File([new Blob(chunksRef.current, { type: mimeType })], 'storyroots-recording.webm', { type: mimeType });
        void processAudio(file, seconds, nextProject);
      };
      mediaRef.current = recorder;
      recorder.start();
      setSeconds(0);
      setIsRecording(true);
      await saveProgress('recording');
    } catch {
      setError(t('microphoneUnavailable'));
      fileInputRef.current?.focus();
    }
  }

  function stopRecording() {
    if (mediaRef.current?.state !== 'inactive') mediaRef.current?.stop();
    setIsRecording(false);
  }

  async function processAudio(file: File, durationSeconds = 0, projectSnapshot = project) {
    setError('');
    setIsRecording(false);
    await saveProgress('processing');
    try {
      const activeProject = projectSnapshot.interviews.length ? projectSnapshot : await ensureConsentAndSession();
      const session = activeProject.interviews[0];
      if (!session) throw new Error('missing-session');
      const form = new FormData();
      form.append('file', file);
      form.append('durationSeconds', String(durationSeconds));
      form.append('language', language);
      const upload = await requestJson(`/api/interviews/${session.id}/recordings/upload`, { method: 'POST', body: form });
      setRecording(upload.recording);
      await requestJson(`/api/recordings/${upload.recording.id}/transcribe`, { method: 'POST' });
      const composed = await requestJson(`/api/projects/${project.id}/compose`, { method: 'POST' });
      setProject(composed.project);
      const nextChapter = composed.project.chapters.at(-1) as Chapter;
      setDraft(nextChapter.content);
      lastSavedDraft.current = nextChapter.content;
      await saveProgress('review');
    } catch {
      setError(t('composeError'));
      await saveProgress('ready');
    }
  }

  async function saveDraft(showConfirmation = true) {
    if (!chapter || draft === lastSavedDraft.current) return;
    try {
      const body = await requestJson(`/api/chapters/${chapter.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ content: draft }),
      });
      lastSavedDraft.current = body.chapter.content;
      setProject((current) => ({ ...current, chapters: current.chapters.map((item) => item.id === chapter.id ? body.chapter : item) }));
      if (showConfirmation) { setSaved(true); window.setTimeout(() => setSaved(false), 1800); }
    } catch { setError(t('audioUploadError')); }
  }

  async function generateNarration() {
    if (!draft.trim()) return;
    setNarrationBusy(true);
    setError('');
    stopSpeech();
    await saveDraft(false);
    try {
      if (!project.consent?.voiceGenerationConsent) {
        const body = await requestJson(`/api/projects/${project.id}/consent`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ storytellerName: project.storytellerName, recordingConsent: true, aiProcessingConsent: true, voiceGenerationConsent: true }),
        });
        setProject(body.project);
      }
      const response = await fetch('/api/voice/speak', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: draft, language, voiceGender, purpose: 'narration' }),
      });
      if (!response.ok) {
        browserSpeak(draft, 'narration');
        await saveProgress('narration', { narrationStatus: 'fallback', narrationProvider: 'browser', narrationVoice: voiceGender });
        setProject((current) => ({ ...current, narration: { status: 'fallback', provider: 'browser', voiceGender, storagePath: null, generatedAt: new Date().toISOString() } }));
        return;
      }
      const nextUrl = URL.createObjectURL(await response.blob());
      if (narrationUrl) URL.revokeObjectURL(narrationUrl);
      setNarrationUrl(nextUrl);
      setVoiceFallback(false);
      await saveProgress('narration', { narrationStatus: 'ready', narrationProvider: 'elevenlabs', narrationVoice: voiceGender });
      setProject((current) => ({ ...current, narration: { status: 'ready', provider: 'elevenlabs', voiceGender, storagePath: null, generatedAt: new Date().toISOString() } }));
    } catch {
      try {
        browserSpeak(draft, 'narration');
        await saveProgress('narration', { narrationStatus: 'fallback', narrationProvider: 'browser', narrationVoice: voiceGender });
      } catch { setError(t('narrationError')); }
    } finally { setNarrationBusy(false); }
  }

  if (language !== storyLanguage) return <section className="language-gate">
    <Headphones size={56} strokeWidth={1.4} aria-hidden="true" />
    <h1>{t(storyLanguage === 'ne' ? 'storyRecordedInNepali' : 'storyRecordedInEnglish')}</h1>
    <button className="story-button primary" type="button" onClick={() => setLanguage(storyLanguage)}>{t('openStoryLanguage')}</button>
  </section>;

  if (phase === 'processing') return <LoadingStory title={t('processingAudio')} hint={t('processingHint')} />;

  if (phase === 'ready' || phase === 'recording') return <section className="voice-screen">
    <h1>{question}</h1>
    <button className={`microphone-button ${isRecording ? 'recording' : ''}`} type="button" onClick={isRecording ? stopRecording : startRecording} aria-label={isRecording ? t('finishSpeaking') : t('startSpeaking')}>
      {isRecording ? <Square size={58} fill="currentColor" strokeWidth={1.4} aria-hidden="true" /> : <Mic size={72} strokeWidth={1.5} aria-hidden="true" />}
    </button>
    <strong className="listening-label">{isRecording ? t('listening') : t('startSpeaking')}</strong>
    {isRecording ? <div className="recording-time">{formatTime(seconds)}</div> : null}
    {isRecording ? <button className="story-button primary wide" type="button" onClick={stopRecording}><Square size={24} fill="currentColor" aria-hidden="true" />{t('finishSpeaking')}</button> : <button className="story-button secondary wide" type="button" onClick={speakQuestion}>{questionPlaying ? <Pause size={25} aria-hidden="true" /> : <Volume2 size={25} aria-hidden="true" />}{questionPlaying ? t('stopQuestion') : t('hearQuestion')}</button>}
    {!isRecording ? <label className="story-button text-upload"><Upload size={24} aria-hidden="true" />{t('chooseAudio')}<input ref={fileInputRef} type="file" accept="audio/*" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) void processAudio(file); }} /></label> : null}
    {!isRecording ? <p className="consent-note">{t('consentNote')}</p> : null}
    {voiceFallback ? <p className="fallback-note">{t('developmentFallback')}</p> : null}
    {error ? <p className="story-error" role="alert">{error}</p> : null}
  </section>;

  return <section className="review-screen">
    <Link className="back-link" href="/stories"><ArrowLeft size={23} aria-hidden="true" />{t('backToStories')}</Link>
    <h1>{t('reviewStory')}</h1>
    <div className="review-title"><h2>{project.title}</h2><p><Check size={20} aria-hidden="true" />{t('automaticTitleNote')}</p></div>
    <p className="fact-note">{t('reviewFacts')}</p>
    {project.conversationProgress?.uncertainDetails?.map((detail) => <div className="uncertain-note" key={detail}><strong>{t('uncertainDetail')}</strong><p>{detail}</p><div><button type="button" className="story-button secondary">{t('detailCorrect')}</button><button type="button" className="story-button secondary">{t('detailNeedsEdit')}</button></div></div>)}
    <label className="story-editor"><span>{t('storyTextLabel')}</span><textarea value={draft} onChange={(event) => { setDraft(event.target.value); setSaved(false); }} onBlur={() => void saveDraft(false)} /></label>
    <div className="review-actions">
      <button className="story-button secondary" type="button" onClick={() => void saveDraft(true)}><Save size={24} aria-hidden="true" />{saved ? t('changesSaved') : t('saveChanges')}</button>
      <button className="story-button primary" type="button" onClick={generateNarration} disabled={narrationBusy}>{narrationBusy ? t('generatingNarration') : t('generateNarration')}</button>
    </div>
    {narrationUrl ? <div className="narration-player"><h2>{t('listenNarration')}</h2><audio src={narrationUrl} controls preload="metadata" /></div> : null}
    {project.narration?.status === 'fallback' || fallbackNarrationPlaying ? <div className="narration-player"><h2>{t('listenNarration')}</h2><p className="fallback-note">{t('developmentFallback')}</p><button className="story-button primary wide" type="button" onClick={() => fallbackNarrationPlaying ? stopSpeech() : browserSpeak(draft, 'narration')}>{fallbackNarrationPlaying ? <Pause size={25} aria-hidden="true" /> : <Play size={25} fill="currentColor" aria-hidden="true" />}{fallbackNarrationPlaying ? t('stopNarration') : t('playNarration')}</button></div> : null}
    {error ? <p className="story-error" role="alert">{error}</p> : null}
  </section>;
}
