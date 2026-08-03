import en from '@/locales/en';
import ne from '@/locales/ne';

export type Language = 'en' | 'ne';
export type LocaleKey = keyof typeof en;

export const locales = { en, ne } as const;

export function translate(language: Language, key: LocaleKey, values?: Record<string, string | number>) {
  let message: string = locales[language][key];
  if (!values) return message;
  for (const [name, value] of Object.entries(values)) message = message.replaceAll(`{${name}}`, String(value));
  return message;
}

export function normalizeLanguage(value: string | null | undefined): Language {
  return value === 'ne' ? 'ne' : 'en';
}
