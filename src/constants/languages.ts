export type AppLanguageCode = 'en' | 'pt' | 'es' | 'zh' | 'ja' | 'de' | 'fr'

export interface LanguageOption {
  code: AppLanguageCode
  labelKey: string
  defaultLabel: string
  flag: string
}

export const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { code: 'en', labelKey: 'common.english', defaultLabel: 'English', flag: '🇬🇧' },
  { code: 'pt', labelKey: 'common.portuguese', defaultLabel: 'Português', flag: '🇧🇷' },
  { code: 'es', labelKey: 'common.spanish', defaultLabel: 'Español', flag: '🇪🇸' },
  { code: 'zh', labelKey: 'common.chinese', defaultLabel: '中文', flag: '🇨🇳' },
  { code: 'ja', labelKey: 'common.japanese', defaultLabel: '日本語', flag: '🇯🇵' },
  { code: 'de', labelKey: 'common.german', defaultLabel: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', labelKey: 'common.french', defaultLabel: 'Français', flag: '🇫🇷' },
]
