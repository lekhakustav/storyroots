'use client';

import { LockKeyhole, Volume2 } from 'lucide-react';
import { LanguageSwitch, useI18n } from '@/components/language-provider';

export function SettingsView() {
  const { t, voiceGender, setVoiceGender } = useI18n();
  return <section className="settings-screen">
    <h1>{t('settingsTitle')}</h1>
    <div className="setting-block">
      <h2>{t('settingsLanguage')}</h2>
      <p>{t('settingsLanguageHelp')}</p>
      <LanguageSwitch />
    </div>
    <div className="setting-block">
      <div className="setting-title"><Volume2 size={30} strokeWidth={1.7} aria-hidden="true" /><h2>{t('settingsVoice')}</h2></div>
      <p>{t('settingsVoiceHelp')}</p>
      <div className="large-choice" role="group" aria-label={t('settingsVoice')}>
        <button type="button" className={voiceGender === 'female' ? 'active' : ''} aria-pressed={voiceGender === 'female'} onClick={() => setVoiceGender('female')}>{t('voiceFemale')}</button>
        <button type="button" className={voiceGender === 'male' ? 'active' : ''} aria-pressed={voiceGender === 'male'} onClick={() => setVoiceGender('male')}>{t('voiceMale')}</button>
      </div>
    </div>
    <div className="setting-block privacy-block">
      <LockKeyhole size={34} strokeWidth={1.6} aria-hidden="true" />
      <div><h2>{t('settingsPrivacy')}</h2><p>{t('settingsPrivacyText')}</p></div>
    </div>
    <form action="/api/auth/logout" method="post"><button className="story-button secondary" type="submit">{t('signOut')}</button></form>
  </section>;
}
