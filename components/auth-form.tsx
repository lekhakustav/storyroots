'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { StoryRootsMark } from '@/components/app-shell';
import { LanguageSwitch, useI18n } from '@/components/language-provider';

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter();
  const { t } = useI18n();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/auth/${mode}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ fullName, email, password }) });
      if (!response.ok) throw new Error('auth-failed');
      router.push('/');
      router.refresh();
    } catch { setError(t('authError')); setBusy(false); }
  }

  return <div className="auth-page">
    <header className="auth-header"><Link className="story-brand" href="/"><StoryRootsMark /><span>{t('brandName')}</span></Link><LanguageSwitch /></header>
    <div className="auth-card">
      <h1>{mode === 'login' ? t('authWelcomeBack') : t('authStart')}</h1>
      <p>{mode === 'login' ? t('authLoginHelp') : t('authSignupHelp')}</p>
      <form onSubmit={submit}>
        {mode === 'signup' ? <label><span>{t('authName')}</span><input value={fullName} onChange={(event) => setFullName(event.target.value)} required autoComplete="name" /></label> : null}
        <label><span>{t('authEmail')}</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label>
        <label><span>{t('authPassword')}</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
        {error ? <p className="story-error" role="alert">{error}</p> : null}
        <button className="story-button primary wide" disabled={busy}>{busy ? t('authWorking') : mode === 'login' ? t('authLogin') : t('authSignup')}<ArrowRight size={24} aria-hidden="true" /></button>
      </form>
      <p>{mode === 'login' ? t('authNew') : t('authExisting')} <Link href={mode === 'login' ? '/signup' : '/login'}><u>{mode === 'login' ? t('authCreateLink') : t('authLoginLink')}</u></Link></p>
    </div>
  </div>;
}
