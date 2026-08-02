'use client';

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { ArrowRight, BookOpen, Check, Pause, Play, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import storyRootsDawn from '@/public/images/storyroots-himalayan-dawn.png';
import storyRootsLogo from '@/public/images/storyroots-tree-logo.png';

type InterestFormValues = { email: string };

type StoryFormat = {
  label: string;
  title: string;
  description: string;
  kind: 'autobiography' | 'story' | 'comic' | 'diary';
};

type StoryMoment = {
  headline: string;
  supporting?: string;
  points?: readonly string[];
  preview?: 'keepsake';
  phoneChapter?: { label: string; title: string };
  audioExample?: boolean;
  formats?: readonly StoryFormat[];
};

const easeOut = [0.22, 1, 0.36, 1] as const;
const temporaryAudiobookSampleSrc = 'data:audio/wav;base64,UklGRqQHAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YYAHAAAAAEYABgEHAgADrgPlA6AD+wIoAlkBqgASAGj/aP7Z/KH63/f39H7yJPGB8e7zYfhl/igFpwvjEBkU8RSOE3sQiAyJCB8FigKgANz+kvw0+Yr03O736AvkYeEP4qPm8O4M+m0GQBLGG7YhgiNqIWIcyBUEDy4JwwSZAff+3vtv9z/xlel04WraOdZf1q/bCOZI9HoEPRRCIcop/ywXKzQlCB1mFMQM5ga9Aoj/Hfxi97rwTOgY38vWXNGI0FzV3d/y7osAGBIFIUwr3S/ILiMpsyBwFwQPZwi3A0kA/Pyl+ITylOqp4U3ZYNOh0TXVR97z62L8Kw3ZG2gmsyugKxMnoR8cFyIPuggmBO0AH/6t+tn1fO8n6AvhsduR2bHbUeLT7Mz5VAdtE2scTyHsIeEeYBnVEo4Mage1AysBKv/s/N35z/UQ8V/st+gP5xTo8utH8jD6egLpCXoPkhIbE3gRYw6wCiMHPAQpAswA1//r/sX9Ufyx+jH5Kvjn94r4APoD/C/+GgB1ARkCDAKBAbsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=';
const storyFormats: readonly StoryFormat[] = [
  {
    label: 'Autobiography',
    title: 'A life in their own words',
    description: 'A family book built from their voice, language, and the moments that made home.',
    kind: 'autobiography',
  },
  {
    label: 'Story',
    title: 'A story they can pass on',
    description: 'A warm narrative that lets the next generation hear the heart behind each memory.',
    kind: 'story',
  },
  {
    label: 'Comic',
    title: 'Their life, frame by frame',
    description: 'A visual retelling that turns family memories into scenes everyone can revisit.',
    kind: 'comic',
  },
  {
    label: 'Diary',
    title: 'Notes from a life well lived',
    description: 'A personal diary-style keepsake for the sayings, details, and feelings only family knows.',
    kind: 'diary',
  },
];

const storyMoments: readonly StoryMoment[] = [
  {
    headline: 'Keep every voice close.',
    supporting: 'Connecting you to your roots, one voice and story at a time.',
    audioExample: true,
  },
  {
    headline: 'Their lives, kept in their own words.',
    points: [
      'Keep their voice, language, and everyday stories close.',
      'Turn many conversations into one book for generations.',
    ],
    preview: 'keepsake',
    phoneChapter: { label: 'Chapter 03', title: 'Marriage to Dad' },
  },
  {
    headline: 'Preserve more than a memory.',
    points: [
      'Keep their real voice, laughter, and way of speaking.',
      'Keep a living link to their roots.',
      'Create a keepsake your family can hold, hear, and pass on.',
    ],
    preview: 'keepsake',
  },
  {
    headline: 'Made to hold. Made to hear.',
    formats: storyFormats,
  },
] as const;

const storyCardPhoneChapter = storyMoments[1].phoneChapter;


function storyMomentFor(progress: number) {
  if (progress < 0.22) return 0;
  if (progress < 0.49) return 1;
  if (progress < 0.76) return 2;
  return 3;
}

function BrandMark() {
  return (
    <span className="cinematic-brand" aria-label="StoryRoots">
      <Image
        className="cinematic-brand-logo"
        src={storyRootsLogo}
        alt=""
        width={56}
        height={54}
        sizes="56px"
        priority
        unoptimized
        aria-hidden="true"
      />
      <span>StoryRoots</span>
    </span>
  );
}

function PhonePreview({ chapter }: { chapter?: StoryMoment['phoneChapter'] }) {
  const phoneChapter = chapter ?? { label: 'Chapter 06', title: 'Home in the hills' };

  return (
    <div
      className="story-phone-preview is-keepsake"
      role="img"
      aria-label={`StoryRoots phone preview showing ${phoneChapter.label}: ${phoneChapter.title}`}
    >
      <span className="story-phone-speaker" aria-hidden="true" />
      <div className="story-phone-screen" aria-hidden="true">
        <div className="story-phone-topline">
          <span>9:41</span>
          <span>StoryRoots</span>
        </div>

        <>
            <div className="story-phone-cover">
              <Image src={storyRootsDawn} alt="" fill sizes="180px" unoptimized />
              <span>
                <small>Family keepsake</small>
                <strong>Aama&apos;s Story</strong>
              </span>
            </div>
            <div className="story-phone-chapter">
              <small>{phoneChapter.label}</small>
              <strong>{phoneChapter.title}</strong>
              <div className="story-phone-player">
                <span><Play size={11} fill="currentColor" strokeWidth={1.8} /></span>
                <div className="story-phone-miniwave">
                  {[8, 14, 10, 18, 12, 16, 9, 13].map((height, index) => (
                    <i key={`${height}-${index}`} style={{ height }} />
                  ))}
                </div>
              </div>
              <p>Original voice · 04:32</p>
            </div>
            <div className="story-phone-ready">
              <BookOpen size={12} strokeWidth={1.8} />
              <span>Ready for family</span>
            </div>
        </>
      </div>
    </div>
  );
}

function FormatPreviewArt({ format }: { format: StoryFormat }) {
  return (
    <div className={`cinematic-format-preview-art is-${format.kind}`} aria-hidden="true">
      {format.kind === 'autobiography' ? (
        <div className="cinematic-format-cover">
          <span className="cinematic-format-cover-kicker">A StoryRoots keepsake</span>
          <strong>Aama&apos;s Story</strong>
          <em>A life in their own words</em>
          <span className="cinematic-format-cover-line">Family voices / home, held close</span>
          <i className="cinematic-format-cover-kite" />
        </div>
      ) : format.kind === 'story' ? (
        <div className="cinematic-format-story-sheet">
          <span>Chapter 01</span>
          <strong>The morning she left home</strong>
          <p>&ldquo;We carried our home in one small bag.&rdquo;</p>
          <i />
        </div>
      ) : format.kind === 'comic' ? (
        <div className="cinematic-format-comic-panels">
          <span className="cinematic-format-comic-panel panel-one">
            <i className="cinematic-format-comic-sun" />
            <i className="cinematic-format-comic-house" />
            <i className="cinematic-format-comic-figure" />
          </span>
          <span className="cinematic-format-comic-panel panel-two">
            <i className="cinematic-format-comic-mountain" />
            <i className="cinematic-format-comic-figure is-walking" />
          </span>
          <span className="cinematic-format-comic-panel panel-three">
            <i className="cinematic-format-comic-tree" />
            <i className="cinematic-format-comic-figure is-together" />
          </span>
          <i className="cinematic-format-comic-bubble" aria-hidden="true">
            <b />
            <b />
            <b />
          </i>
        </div>
      ) : (
        <div className="cinematic-format-diary-page">
          <small>June 12, 1998</small>
          <strong>Notes from home</strong>
          <p>Today, Aama laughed at the old story again.</p>
          <i />
        </div>
      )}
    </div>
  );
}

function InterestFlow({ onClose }: { onClose: () => void }) {
  const shouldReduceMotion = useReducedMotion();
  const [page, setPage] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [developmentFallback, setDevelopmentFallback] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [storageConnected, setStorageConnected] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<InterestFormValues>({ mode: 'onSubmit' });

  useEffect(() => {
    headingRef.current?.focus();
  }, [page]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  async function submitInterest({ email }: InterestFormValues) {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/storyroots-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) throw new Error(data?.error || 'Please try again.');

      setAlreadyRegistered(Boolean(data?.alreadyRegistered));
      setStorageConnected(Boolean(data?.storageConnected));
      setDevelopmentFallback(Boolean(data?.developmentFallback));
      setPage(2);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const transition = { duration: shouldReduceMotion ? 0 : 0.7, ease: easeOut };

  return (
    <motion.div
      className="interest-experience"
      role="dialog"
      aria-modal="true"
      aria-label="Try StoryRoots"
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={shouldReduceMotion ? undefined : { opacity: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
    >
      <div className="interest-background" aria-hidden="true">
        <Image src={storyRootsDawn} alt="" fill sizes="100vw" quality={95} placeholder="blur" priority unoptimized />
      </div>
      <div className="interest-shade" aria-hidden="true" />

      <header className="interest-header">
        <BrandMark />
        <button className="cinematic-icon-button" type="button" aria-label="Close" onClick={onClose}>
          <X size={20} strokeWidth={1.8} />
        </button>
      </header>

      <div className="interest-progress" aria-label={`Step ${page} of 2`}>
        <span className="active" />
        <span className={page === 2 ? 'active' : ''} />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {page === 1 ? (
          <motion.main
            className="interest-content"
            key="email"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 28, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -24, filter: 'blur(8px)' }}
            transition={transition}
          >
            <h1 ref={headingRef} tabIndex={-1}>Where can we reach you?</h1>
            <form className="interest-form" onSubmit={handleSubmit(submitInterest)} noValidate>
              <label>
                <span className="sr-only">Email</span>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="Email address"
                  autoFocus
                  {...register('email', {
                    required: 'Enter your email.',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email.' },
                  })}
                />
              </label>
              {errors.email && <p className="interest-error" role="alert">{errors.email.message}</p>}
              {submitError && <p className="interest-error" role="alert">{submitError}</p>}
              <button className="cinematic-primary-button form-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending…' : 'Continue'}
                {!isSubmitting && <ArrowRight size={18} strokeWidth={1.8} />}
              </button>
            </form>
          </motion.main>
        ) : (
          <motion.main
            className="interest-content interest-success"
            key="success"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 28, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={transition}
          >
            <span className="success-mark" aria-hidden="true"><Check size={26} strokeWidth={1.8} /></span>
            <h1 ref={headingRef} tabIndex={-1}>{alreadyRegistered ? 'That email is already saved.' : 'You’re on the list.'}</h1>
            <p>{alreadyRegistered ? 'We already have this address for StoryRoots.' : storageConnected ? 'We’ll be in touch.' : developmentFallback ? 'Preview only.' : 'We’ll be in touch.'}</p>
            <button className="cinematic-primary-button form-button" type="button" onClick={onClose}>
              Return <ArrowRight size={18} strokeWidth={1.8} />
            </button>
          </motion.main>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function StoryRootsSite() {
  const shouldReduceMotion = useReducedMotion();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [activeMoment, setActiveMoment] = useState(0);
  const [selectedFormatLabel, setSelectedFormatLabel] = useState(storyFormats[0].label);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const scrollStopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealDelay = shouldReduceMotion ? 0 : 1.9;
  const { scrollYProgress } = useScroll({
    target: storyRef,
    offset: ['start start', 'end end'],
  });
  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1, 1.07]);
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -18]);
  const currentMoment = storyMoments[activeMoment];
  const selectedFormat = storyFormats.find((format) => format.label === selectedFormatLabel) ?? storyFormats[0];

  function handleAudioPreview() {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      const playRequest = audio.play();
      playRequest.catch(() => setIsAudioPlaying(false));
    }
    setIsAudioPlaying(true);
  }

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    const nextMoment = storyMomentFor(progress);
    setActiveMoment((currentMoment) => currentMoment === nextMoment ? currentMoment : nextMoment);

    if (shouldReduceMotion) return;

    setIsScrolling(true);
    if (scrollStopTimer.current) clearTimeout(scrollStopTimer.current);
    scrollStopTimer.current = setTimeout(() => setIsScrolling(false), 320);
  });

  useEffect(() => () => {
    if (scrollStopTimer.current) clearTimeout(scrollStopTimer.current);
    audioRef.current?.pause();
  }, []);

  useEffect(() => {
    if (activeMoment !== 0) {
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.currentTime = 0;
      setIsAudioPlaying(false);
    }
  }, [activeMoment]);

  return (
    <div className="cinematic-site">
      <div className="cinematic-scroll-story" ref={storyRef}>
        <main className="cinematic-hero">
          <motion.div
            className="cinematic-image"
            style={{ scale: backgroundScale, y: backgroundY }}
            aria-hidden="true"
          >
            <motion.div
              className="cinematic-image-reveal"
              initial={shouldReduceMotion ? false : { opacity: 0.82, scale: 1.045 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: shouldReduceMotion ? 0 : 1.8, ease: easeOut }}
            >
              <Image
                src={storyRootsDawn}
                alt=""
                fill
                sizes="100vw"
                quality={95}
                placeholder="blur"
                priority
                unoptimized
              />
            </motion.div>
          </motion.div>
          <div className="cinematic-vignette" aria-hidden="true" />

          <motion.header
            className="cinematic-header"
            initial={shouldReduceMotion ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: revealDelay, duration: shouldReduceMotion ? 0 : 0.8, ease: easeOut }}
          >
            <BrandMark />
          </motion.header>

          <motion.div
            className={`cinematic-copy ${activeMoment === 0 ? 'is-opening' : 'is-detail'} ${activeMoment === 3 ? 'is-ending' : ''} ${currentMoment.points?.length ? 'is-card' : ''}`}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 54, filter: 'blur(14px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: revealDelay + 0.25, duration: shouldReduceMotion ? 0 : 1.15, ease: easeOut }}
          >
            <AnimatePresence mode="sync" initial={false}>
              <motion.div
                className={`cinematic-moment ${currentMoment.points?.length ? 'cinematic-story-card' : ''}`}
                key={currentMoment.points?.length ? 'story-card' : currentMoment.headline}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 28, filter: 'blur(9px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -22, filter: 'blur(7px)' }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.58, ease: easeOut }}
              >
                {currentMoment.points?.length ? (
                  <div className="cinematic-story-layout">
                    <div className="cinematic-story-copy">
                      <h1>{currentMoment.headline}</h1>
                      <ul className="cinematic-story-points">
                        {currentMoment.points.map((point) => (
                          <li key={point}>
                            <p>{point}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {currentMoment.preview ? (
                      <PhonePreview chapter={storyCardPhoneChapter} />
                    ) : null}
                  </div>
                ) : (
                  <>
                    <h1>{currentMoment.headline}</h1>
                    {currentMoment.supporting ? (
                      <p className="cinematic-opening-line">{currentMoment.supporting}</p>
                    ) : null}
                    {currentMoment.audioExample ? (
                      <>
                        <motion.button
                          className={`cinematic-audio-float ${isAudioPlaying ? 'is-playing' : ''}`}
                          type="button"
                          aria-label={isAudioPlaying ? 'Playing sample audio' : 'Play audio'}
                          aria-pressed={isAudioPlaying}
                          onClick={handleAudioPreview}
                          whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.015 }}
                          whileTap={shouldReduceMotion ? undefined : { scale: .985 }}
                        >
                          <span className="cinematic-audio-play" aria-hidden="true">
                            {isAudioPlaying ? (
                              <Pause size={13} fill="currentColor" strokeWidth={1.7} />
                            ) : (
                              <Play size={13} fill="currentColor" strokeWidth={1.7} />
                            )}
                          </span>
                          <span className="cinematic-audio-copy">
                            <strong>{isAudioPlaying ? 'Playing audio' : 'Play audio'}</strong>
                          </span>
                        </motion.button>
                        <audio
                          ref={audioRef}
                          className="cinematic-audio-element"
                          src="/audio/sample-audio.wav"
                          preload="auto"
                          aria-hidden="true"
                          onEnded={() => setIsAudioPlaying(false)}
                          onError={() => setIsAudioPlaying(false)}
                          onLoadedMetadata={(event) => { event.currentTarget.volume = 0.8; }}
                        />
                      </>
                    ) : null}
                    {currentMoment.formats?.length ? (
                      <ul className="cinematic-formats" aria-label="Available StoryRoots formats">
                        {currentMoment.formats.map((format) => (
                          <li key={format.label}>
                            <motion.button
                              className={`cinematic-format-option ${selectedFormat.label === format.label ? 'is-selected' : ''}`}
                              type="button"
                              aria-pressed={selectedFormat.label === format.label}
                              onClick={() => setSelectedFormatLabel(format.label)}
                              whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.02 }}
                              whileTap={shouldReduceMotion ? undefined : { scale: .985 }}
                            >
                              {format.label}
                              <ArrowRight size={13} strokeWidth={1.8} />
                            </motion.button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {currentMoment.formats?.length ? (
                      <div className="cinematic-format-preview" aria-live="polite">
                        <FormatPreviewArt format={selectedFormat} />
                        <div className="cinematic-format-preview-copy">
                          <small>Example keepsake</small>
                          <strong>{selectedFormat.title}</strong>
                          <p>{selectedFormat.description}</p>
                        </div>
                      </div>
                    ) : null}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <motion.div
            className={`cinematic-action-dock ${isScrolling ? 'is-scrolling' : ''}`}
            data-scroll-state={isScrolling ? 'moving' : 'settled'}
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: revealDelay + 0.9, duration: shouldReduceMotion ? 0 : 0.8, ease: easeOut }}
          >
            <motion.button
              className="cinematic-primary-button"
              type="button"
              onClick={() => setBookingOpen(true)}
              whileHover={shouldReduceMotion ? undefined : { scale: 1.025 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
            >
              I want to try <ArrowRight size={19} strokeWidth={1.8} />
            </motion.button>
          </motion.div>

          <motion.span
            className="cinematic-loading-line"
            aria-hidden="true"
            initial={shouldReduceMotion ? false : { scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: [0, 0.9, 0] }}
            transition={{ delay: shouldReduceMotion ? 0 : 0.35, duration: shouldReduceMotion ? 0 : 1.35, ease: easeOut }}
          />
        </main>
      </div>

      <AnimatePresence>{bookingOpen && <InterestFlow onClose={() => setBookingOpen(false)} />}</AnimatePresence>
    </div>
  );
}
