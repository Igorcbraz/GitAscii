const LOCALE_TAGS: Record<string, string> = {
  pt: 'pt-BR',
  en: 'en-US',
  es: 'es-ES',
  zh: 'zh-CN',
  ja: 'ja-JP',
  de: 'de-DE',
  fr: 'fr-FR',
}

const DAY_NAME_TO_INDEX: Record<string, number> = {
  sunday: 0,
  sun: 0,
  '0': 0,
  monday: 1,
  mon: 1,
  '1': 1,
  tuesday: 2,
  tue: 2,
  '2': 2,
  wednesday: 3,
  wed: 3,
  '3': 3,
  thursday: 4,
  thu: 4,
  '4': 4,
  friday: 5,
  fri: 5,
  '5': 5,
  saturday: 6,
  sat: 6,
  '6': 6,
}

// 2026-01-04 is a Sunday (day 0)
const SUNDAY_BASE_DATE = new Date(Date.UTC(2026, 0, 4, 12, 0, 0))

export function formatLocalizedDay(
  dayInput: string | number | undefined | null,
  language: string = 'en',
  format: 'long' | 'short' = 'long'
): string {
  if (dayInput === undefined || dayInput === null || dayInput === '') {
    dayInput = 3 // default Wednesday
  }

  let dayIndex = 3
  if (typeof dayInput === 'number') {
    dayIndex = Math.min(Math.max(0, Math.floor(dayInput)), 6)
  } else {
    const normalized = String(dayInput).toLowerCase().trim()
    if (normalized in DAY_NAME_TO_INDEX) {
      dayIndex = DAY_NAME_TO_INDEX[normalized]
    }
  }

  try {
    const locale = LOCALE_TAGS[language] || language
    const d = new Date(SUNDAY_BASE_DATE.getTime() + dayIndex * 24 * 60 * 60 * 1000)
    const formatter = new Intl.DateTimeFormat(locale, { weekday: format })
    const formatted = formatter.format(d)
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
  } catch {
    const fallbackDays = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ]
    return fallbackDays[dayIndex] || 'Wednesday'
  }
}

export function getLocalizedDayLabels(
  language: string = 'en',
  format: 'short' = 'short'
): string[] {
  return [0, 1, 2, 3, 4, 5, 6].map((dayIdx) => formatLocalizedDay(dayIdx, language, format))
}

export function formatUtcHourToLocal(utcHour: number | undefined | null): string {
  const h = typeof utcHour === 'number' && !isNaN(utcHour) ? utcHour : 14
  try {
    const d = new Date(Date.UTC(2026, 0, 1, h, 0, 0))
    const localHour = d.getHours()
    return `${String(localHour).padStart(2, '0')}:00`
  } catch {
    return `${String(h).padStart(2, '0')}:00`
  }
}

export function formatLocalizedCountry(
  countryCode: string | null | undefined,
  fallbackName: string | null | undefined,
  language: string = 'en',
  t?: (key: string, def?: string) => string
): string {
  const code = countryCode ? countryCode.toUpperCase().trim() : ''
  const isUnknown =
    !code ||
    code === 'XX' ||
    code === 'ZZ' ||
    fallbackName === 'Unknown Region' ||
    fallbackName === 'Unknown Location' ||
    fallbackName === 'Unknown'

  if (isUnknown) {
    if (t) {
      return t('pro.geo.unknown_region', 'Unknown Region')
    }
    return language === 'pt' ? 'Região Desconhecida' : 'Unknown Region'
  }

  if (code.length === 2) {
    try {
      const locale = LOCALE_TAGS[language] || language
      const displayNames = new Intl.DisplayNames([locale], { type: 'region' })
      const localizedName = displayNames.of(code)
      if (localizedName && localizedName !== code) {
        return localizedName
      }
    } catch {
      // Fallback
    }
  }

  return fallbackName || code || (language === 'pt' ? 'Região Desconhecida' : 'Unknown Region')
}
