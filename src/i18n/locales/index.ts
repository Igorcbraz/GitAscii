import { de } from './de'
import { en } from './en'
import { es } from './es'
import { fr } from './fr'
import { ja } from './ja'
import { pt } from './pt'
import { zh } from './zh'

export type AppLocale = 'en' | 'pt' | 'es' | 'zh' | 'ja' | 'de' | 'fr'

export const locales: Record<AppLocale, Record<string, string>> = {
  en,
  pt,
  es,
  zh,
  ja,
  de,
  fr,
}

export { de, en, es, fr, ja, pt, zh }
