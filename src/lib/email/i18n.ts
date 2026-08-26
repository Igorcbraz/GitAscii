import { type AppLocale, locales } from '@/i18n/locales'

export function getEmailTranslator(locale: AppLocale = 'en') {
  const targetTranslations = locales[locale] || locales['en']

  return (
    key: string,
    defaultValue?: string,
    variables?: Record<string, string | number>
  ): string => {
    let value = targetTranslations?.[key]

    if (value === undefined) {
      value = locales['en']?.[key]
    }

    if (value === undefined) {
      value = defaultValue !== undefined ? defaultValue : key
    }

    if (variables) {
      Object.entries(variables).forEach(([k, v]) => {
        value = value.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
      })
    }

    return value
  }
}
