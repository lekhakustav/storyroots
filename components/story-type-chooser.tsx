'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpenText, Headphones, NotebookPen, PanelsTopLeft, UserRound } from 'lucide-react';
import { useI18n } from '@/components/language-provider';
import type { LocaleKey } from '@/lib/i18n';
import type { StoryType } from '@/lib/types';

const options: { type: StoryType; label: LocaleKey; icon: typeof UserRound }[] = [
  { type: 'autobiography', label: 'typeAutobiography', icon: UserRound },
  { type: 'comic', label: 'typeComic', icon: PanelsTopLeft },
  { type: 'audiobook', label: 'typeAudiobook', icon: Headphones },
  { type: 'diary', label: 'typeDiary', icon: NotebookPen },
];

export function StoryTypeChooser() {
  const router = useRouter();
  const { language, t } = useI18n();
  const [selected, setSelected] = useState<StoryType | null>(null);
  const [error, setError] = useState('');

  async function choose(type: StoryType) {
    setSelected(type);
    setError('');
    try {
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ storyType: type, language }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error);
      router.push(`/projects/${body.project.id}`);
      router.refresh();
    } catch {
      setSelected(null);
      setError(t('createStoryError'));
    }
  }

  return <section className="type-screen" aria-labelledby="create-heading">
    <BookOpenText className="type-screen-book" size={42} strokeWidth={1.5} aria-hidden="true" />
    <h1 id="create-heading">{t('homeQuestion')}</h1>
    <div className="type-options">
      {options.map(({ type, label, icon: Icon }) => <button key={type} type="button" onClick={() => choose(type)} disabled={selected !== null} aria-busy={selected === type}>
        <span className="type-icon"><Icon size={36} strokeWidth={1.7} aria-hidden="true" /></span>
        <span>{selected === type ? t('creatingStory') : t(label)}</span>
      </button>)}
    </div>
    {error ? <p className="story-error" role="alert">{error}</p> : null}
  </section>;
}
