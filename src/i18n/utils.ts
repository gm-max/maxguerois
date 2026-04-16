import en from './en.json';
import fr from './fr.json';

const translations: Record<string, Record<string, any>> = { en, fr };

export type Locale = 'en' | 'fr';

export function getLangFromUrl(url: URL): Locale {
  const [, lang] = url.pathname.split('/');
  if (lang === 'fr') return 'fr';
  return 'en';
}

/**
 * Get a translation string by dot-notation key.
 * e.g. t('fr', 'nav.home') → "Accueil"
 */
export function t(locale: Locale, key: string): string {
  const keys = key.split('.');
  let value: any = translations[locale];
  for (const k of keys) {
    value = value?.[k];
  }
  return (value as string) ?? key;
}

/**
 * Get the equivalent path in the other locale.
 * e.g. getLocalizedPath('/experiments/sleep', 'fr') → '/fr/experiments/sleep'
 *      getLocalizedPath('/fr/experiments/sleep', 'en') → '/experiments/sleep'
 */
export function getLocalizedPath(path: string, targetLocale: Locale): string {
  // Strip trailing slash (except root)
  const cleanPath = path === '/' ? '/' : path.replace(/\/$/, '');

  // Remove /fr prefix if present to get the canonical English path
  const englishPath = cleanPath.startsWith('/fr')
    ? cleanPath.replace(/^\/fr/, '') || '/'
    : cleanPath;

  if (targetLocale === 'fr') {
    return englishPath === '/' ? '/fr' : `/fr${englishPath}`;
  }
  return englishPath;
}

/**
 * Get the absolute URL for a given path and locale.
 */
export function getAbsoluteUrl(path: string, locale: Locale): string {
  const site = 'https://maxguerois.com';
  const localizedPath = getLocalizedPath(path, locale);
  return `${site}${localizedPath}`;
}
