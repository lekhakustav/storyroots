'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Languages } from 'lucide-react';
import { normalizeLanguage, translate, type Language, type LocaleKey } from '@/lib/i18n';

type VoiceGender = 'female' | 'male';
type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  voiceGender: VoiceGender;
  setVoiceGender: (voice: VoiceGender) => void;
  t: (key: LocaleKey, values?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function LanguageProvider({ children, initialLanguage = 'en' }: { children: React.ReactNode; initialLanguage?: Language }) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);
  const [voiceGender, setVoiceGenderState] = useState<VoiceGender>('female');
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    setLanguageState(normalizeLanguage(window.localStorage.getItem('storyroots-language') ?? initialLanguage));
    setVoiceGenderState(window.localStorage.getItem('storyroots-voice') === 'male' ? 'male' : 'female');
    setStorageReady(true);
  }, [initialLanguage]);

  useEffect(() => {
    document.documentElement.lang = language === 'ne' ? 'ne' : 'en';
    document.documentElement.dataset.language = language;
    if (!storageReady) return;
    window.localStorage.setItem('storyroots-language', language);
    document.cookie = `storyroots_language=${language}; path=/; max-age=31536000; samesite=lax`;
  }, [language, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    window.localStorage.setItem('storyroots-voice', voiceGender);
  }, [storageReady, voiceGender]);

  const setLanguage = useCallback((nextLanguage: Language) => setLanguageState(nextLanguage), []);
  const setVoiceGender = useCallback((voice: VoiceGender) => setVoiceGenderState(voice), []);
  const t = useCallback((key: LocaleKey, values?: Record<string, string | number>) => translate(language, key, values), [language]);
  const value = useMemo(() => ({ language, setLanguage, voiceGender, setVoiceGender, t }), [language, setLanguage, setVoiceGender, t, voiceGender]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n must be used inside LanguageProvider');
  return value;
}

export function LanguageSwitch() {
  const { language, setLanguage, t } = useI18n();
  return <div className="language-switch" role="group" aria-label={t('languageLabel')}>
    <Languages aria-hidden="true" size={22} />
    <button type="button" className={language === 'en' ? 'active' : ''} aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>{t('languageEnglish')}</button>
    <span aria-hidden="true">|</span>
    <button type="button" className={language === 'ne' ? 'active' : ''} aria-pressed={language === 'ne'} onClick={() => setLanguage('ne')}>{t('languageNepali')}</button>
  </div>;
}
