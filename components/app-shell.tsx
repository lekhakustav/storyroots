'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookHeart, BookOpen, Home, Plus, Settings, TreePine } from 'lucide-react';
import { LanguageSwitch, useI18n } from '@/components/language-provider';
import type { LocaleKey } from '@/lib/i18n';

const nav: { href: string; label: LocaleKey; icon: typeof Home }[] = [
  { href: '/', label: 'navHome', icon: Home },
  { href: '/stories', label: 'navStories', icon: BookOpen },
  { href: '/new', label: 'navNewStory', icon: Plus },
  { href: '/settings', label: 'navSettings', icon: Settings },
];

export function StoryRootsMark() {
  return <span className="storyroots-mark" aria-hidden="true"><TreePine size={27} strokeWidth={1.8} /><BookHeart size={20} strokeWidth={1.8} /></span>;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const active = (href: string) => href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`) || (href === '/stories' && pathname.startsWith('/projects/'));

  return <div className="story-app">
    <header className="story-header">
      <Link className="story-brand" href="/"><StoryRootsMark /><span>{t('brandName')}</span></Link>
      <LanguageSwitch />
    </header>
    <main className="story-main">{children}</main>
    <nav className="story-nav" aria-label="Primary">
      {nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={active(href) ? 'active' : ''} aria-current={active(href) ? 'page' : undefined}>
        <Icon size={27} strokeWidth={1.8} aria-hidden="true" />
        <span>{t(label)}</span>
      </Link>)}
    </nav>
  </div>;
}
