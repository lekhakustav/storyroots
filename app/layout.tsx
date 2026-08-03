import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'StoryRoots — Keep every voice close.',
  description: 'Preserve the voices your family never forgets.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><body>{children}</body></html>;
}
