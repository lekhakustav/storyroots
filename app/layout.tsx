import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'Keepsake — Your family story, one memory at a time', description: 'A calm space for preserving family stories.' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
