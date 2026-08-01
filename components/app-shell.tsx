'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Home, Settings, UsersRound } from 'lucide-react';
import type { AppUser } from '@/lib/types';

const nav = [{ href: '/dashboard', label: 'Home', icon: Home }, { href: '/dashboard', label: 'Stories', icon: BookOpen }, { href: '/dashboard', label: 'People', icon: UsersRound }, { href: '/settings', label: 'Settings', icon: Settings }];

export function AppShell({ children, user, title = 'Keepsake' }: { children: React.ReactNode; user: AppUser; title?: string }) {
  const pathname = usePathname();
  const isActive = (label: string, href: string) => label === 'Stories' ? pathname.startsWith('/projects') : label === 'People' ? false : pathname === href;
  return <div className="app-layout"><aside className="sidebar"><Link className="wordmark" href="/dashboard"><span className="wordmark-mark">K</span>Keepsake</Link><nav className="sidebar-nav">{nav.map(({ href, label, icon: Icon }) => <Link key={label} className={`nav-link ${isActive(label, href) ? 'active' : ''}`} href={href}><Icon size={18} />{label}</Link>)}</nav><div className="sidebar-footer"><strong>{user.fullName}</strong><br />Your family stories stay yours.</div></aside><div className="main-column"><header className="topbar"><span className="topbar-title">{title}</span><div className="topbar-actions"><span className="muted">Local demo mode</span><span className="avatar">{user.fullName.slice(0, 1).toUpperCase()}</span></div></header><main>{children}</main></div><nav className="mobile-bottom-nav">{nav.map(({ href, label, icon: Icon }) => <Link key={label} className={isActive(label, href) ? 'active' : ''} href={href}><Icon size={18} /><span>{label}</span></Link>)}</nav></div>;
}
