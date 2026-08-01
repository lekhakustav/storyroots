'use client';

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { ArrowRight, Check, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import storyRootsDawn from '@/public/images/storyroots-himalayan-dawn.png';
import storyRootsLogo from '@/public/images/storyroots-tree-logo.png';

type InterestFormValues = { email: string };

const easeOut = [0.22, 1, 0.36, 1] as const;

const storyMoments = [
  { headline: 'Keep every voice close.', formats: [] },
  { headline: 'We guide every conversation.', formats: [] },
  { headline: 'Memories become their biography.', formats: [] },
  {
    headline: 'Made to hold. Made to hear.',
    formats: ['Hardcover novel', 'Short storybook', 'Diary-style keepsake', 'Audiobook'],
  },
] as const;

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
        width={44}
        height={47}
        sizes="44px"
        priority
        unoptimized
        aria-hidden="true"
      />
      <span>StoryRoots</span>
    </span>
  );
}

function InterestFlow({ onClose }: { onClose: () => void }) {
  const shouldReduceMotion = useReducedMotion();
  const [page, setPage] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [developmentFallback, setDevelopmentFallback] = useState(false);
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
            <h1 ref={headingRef} tabIndex={-1}>You’re on the list.</h1>
            <p>{developmentFallback ? 'Preview only.' : 'We’ll be in touch.'}</p>
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
  const [isScrolling, setIsScrolling] = useState(false);
  const storyRef = useRef<HTMLDivElement>(null);
  const scrollStopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealDelay = shouldReduceMotion ? 0 : 1.9;
  const { scrollYProgress } = useScroll({
    target: storyRef,
    offset: ['start start', 'end end'],
  });
  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1, 1.07]);
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -18]);

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
  }, []);

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
            className={`cinematic-copy ${activeMoment === 0 ? 'is-opening' : 'is-detail'}`}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 54, filter: 'blur(14px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: revealDelay + 0.25, duration: shouldReduceMotion ? 0 : 1.15, ease: easeOut }}
          >
            <AnimatePresence mode="sync" initial={false}>
              <motion.div
                className="cinematic-moment"
                key={storyMoments[activeMoment].headline}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 28, filter: 'blur(9px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -22, filter: 'blur(7px)' }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.58, ease: easeOut }}
              >
                <h1>{storyMoments[activeMoment].headline}</h1>
                {storyMoments[activeMoment].formats.length > 0 ? (
                  <ul className="cinematic-formats" aria-label="Available StoryRoots formats">
                    {storyMoments[activeMoment].formats.map((format) => <li key={format}>{format}</li>)}
                  </ul>
                ) : null}
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
