import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { LanguageProvider } from '@/components/language-provider';
import { normalizeLanguage } from '@/lib/i18n';
import './globals.css';

export const metadata: Metadata = {
  title: 'Story Roots',
  description: 'Create and listen to your stories, one conversation at a time.',
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const language = normalizeLanguage((await cookies()).get('storyroots_language')?.value);
  return <html lang={language === 'ne' ? 'ne' : 'en'} data-language={language}><body><LanguageProvider initialLanguage={language}>{children}</LanguageProvider></body></html>;
}
