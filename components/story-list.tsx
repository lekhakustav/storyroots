'use client';

import Link from 'next/link';
import { ArrowRight, BookOpenText, Headphones, NotebookPen, PanelsTopLeft, UserRound } from 'lucide-react';
import { useI18n } from '@/components/language-provider';
import type { LocaleKey } from '@/lib/i18n';
import type { BiographyProject, StoryType } from '@/lib/types';

const storyTypes: Record<StoryType, { label: LocaleKey; icon: typeof UserRound }> = {
  autobiography: { label: 'typeAutobiography', icon: UserRound },
  comic: { label: 'typeComic', icon: PanelsTopLeft },
  audiobook: { label: 'typeAudiobook', icon: Headphones },
  diary: { label: 'typeDiary', icon: NotebookPen },
};

function statusKey(project: BiographyProject): LocaleKey {
  if (project.narration?.status === 'ready' || project.narration?.status === 'fallback') return 'storyReady';
  if (project.chapters.length || project.interviews.some((session) => session.recordings.length)) return 'storyInProgress';
  return 'storyJustStarted';
}

export function StoryList({ projects }: { projects: BiographyProject[] }) {
  const { language, t } = useI18n();
  return <section className="stories-screen">
    <h1>{t('storiesTitle')}</h1>
    {!projects.length ? <div className="empty-stories"><BookOpenText size={54} strokeWidth={1.4} aria-hidden="true" /><p>{t('storiesEmpty')}</p><Link className="story-button primary" href="/new">{t('storiesStart')}</Link></div> : <div className="story-list">
      {projects.map((project) => {
        const type = storyTypes[project.storyType ?? 'autobiography'];
        const TypeIcon = type.icon;
        const sameLanguage = project.preferredLanguage === language;
        const displayTitle = sameLanguage ? project.title : t(project.preferredLanguage === 'ne' ? 'storyRecordedInNepali' : 'storyRecordedInEnglish');
        return <article className="story-row" key={project.id}>
          <div className="story-row-icon"><TypeIcon size={34} strokeWidth={1.7} aria-hidden="true" /></div>
          <div className="story-row-copy"><span>{t(type.label)}</span><h2>{displayTitle}</h2><p>{t(statusKey(project))}</p></div>
          <Link href={`/projects/${project.id}`} aria-label={`${t('continueStory')}: ${displayTitle}`}><span>{t('continueStory')}</span><ArrowRight size={24} aria-hidden="true" /></Link>
        </article>;
      })}
    </div>}
  </section>;
}
