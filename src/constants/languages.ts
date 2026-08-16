export type AppLanguageCode = 'en' | 'pt' | 'es'

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
]
