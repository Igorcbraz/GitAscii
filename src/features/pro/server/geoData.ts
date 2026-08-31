export interface CountryInfo {
  code: string
  name: string
  continent: 'NA' | 'SA' | 'EU' | 'AS' | 'AF' | 'OC' | 'AN'
  continentName: string
}

export const CONTINENTS: Record<string, string> = {
  NA: 'North America',
  SA: 'South America',
  EU: 'Europe',
  AS: 'Asia',
  AF: 'Africa',
  OC: 'Oceania',
  AN: 'Antarctica',
}

export const COUNTRY_MAP: Record<string, { name: string; continent: keyof typeof CONTINENTS }> = {
  US: { name: 'United States', continent: 'NA' },
  BR: { name: 'Brazil', continent: 'SA' },
  DE: { name: 'Germany', continent: 'EU' },
  GB: { name: 'United Kingdom', continent: 'EU' },
  CA: { name: 'Canada', continent: 'NA' },
  FR: { name: 'France', continent: 'EU' },
  IN: { name: 'India', continent: 'AS' },
  JP: { name: 'Japan', continent: 'AS' },
  AU: { name: 'Australia', continent: 'OC' },
  NL: { name: 'Netherlands', continent: 'EU' },
  ES: { name: 'Spain', continent: 'EU' },
  IT: { name: 'Italy', continent: 'EU' },
  CN: { name: 'China', continent: 'AS' },
  KR: { name: 'South Korea', continent: 'AS' },
  RU: { name: 'Russia', continent: 'EU' },
  SE: { name: 'Sweden', continent: 'EU' },
  PL: { name: 'Poland', continent: 'EU' },
  PT: { name: 'Portugal', continent: 'EU' },
  CH: { name: 'Switzerland', continent: 'EU' },
  MX: { name: 'Mexico', continent: 'NA' },
  AR: { name: 'Argentina', continent: 'SA' },
  CL: { name: 'Chile', continent: 'SA' },
  CO: { name: 'Colombia', continent: 'SA' },
  SG: { name: 'Singapore', continent: 'AS' },
  ID: { name: 'Indonesia', continent: 'AS' },
  TW: { name: 'Taiwan', continent: 'AS' },
  VN: { name: 'Vietnam', continent: 'AS' },
  TR: { name: 'Turkey', continent: 'EU' },
  UA: { name: 'Ukraine', continent: 'EU' },
  ZA: { name: 'South Africa', continent: 'AF' },
  NG: { name: 'Nigeria', continent: 'AF' },
  EG: { name: 'Egypt', continent: 'AF' },
  IL: { name: 'Israel', continent: 'AS' },
  AE: { name: 'United Arab Emirates', continent: 'AS' },
  SA: { name: 'Saudi Arabia', continent: 'AS' },
  NZ: { name: 'New Zealand', continent: 'OC' },
  NO: { name: 'Norway', continent: 'EU' },
  DK: { name: 'Denmark', continent: 'EU' },
  FI: { name: 'Finland', continent: 'EU' },
  BE: { name: 'Belgium', continent: 'EU' },
  AT: { name: 'Austria', continent: 'EU' },
  IE: { name: 'Ireland', continent: 'EU' },
  CZ: { name: 'Czech Republic', continent: 'EU' },
  RO: { name: 'Romania', continent: 'EU' },
  HU: { name: 'Hungary', continent: 'EU' },
  GR: { name: 'Greece', continent: 'EU' },
  PH: { name: 'Philippines', continent: 'AS' },
  PK: { name: 'Pakistan', continent: 'AS' },
  BD: { name: 'Bangladesh', continent: 'AS' },
  TH: { name: 'Thailand', continent: 'AS' },
  MY: { name: 'Malaysia', continent: 'AS' },
  HK: { name: 'Hong Kong', continent: 'AS' },
  PE: { name: 'Peru', continent: 'SA' },
  UY: { name: 'Uruguay', continent: 'SA' },
  CR: { name: 'Costa Rica', continent: 'NA' },
  KE: { name: 'Kenya', continent: 'AF' },
  GH: { name: 'Ghana', continent: 'AF' },
  MA: { name: 'Morocco', continent: 'AF' },
}

export function getCountryFlagEmoji(countryCode: string | null | undefined): string {
  if (!countryCode || countryCode.length !== 2) return '🌐'
  const code = countryCode.toUpperCase()
  if (code === 'XX' || code === 'ZZ') return '🌐'
  const codePoints = code.split('').map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

export function getCountryName(countryCode: string | null | undefined): string {
  if (!countryCode) return 'Unknown Region'
  const code = countryCode.toUpperCase().trim()
  if (code === 'XX' || code === 'ZZ') return 'Unknown Region'
  return COUNTRY_MAP[code]?.name || code
}

export function getCountryContinent(countryCode: string | null | undefined): {
  code: string
  name: string
} {
  if (!countryCode) return { code: 'OTHER', name: 'Other' }
  const code = countryCode.toUpperCase().trim()
  const contCode = COUNTRY_MAP[code]?.continent || 'OTHER'
  return {
    code: contCode,
    name: CONTINENTS[contCode] || 'Other',
  }
}

export const LANGUAGE_MAP: Record<string, string> = {
  en: 'English',
  pt: 'Portuguese',
  es: 'Spanish',
  zh: 'Chinese',
  ja: 'Japanese',
  de: 'German',
  fr: 'French',
  ru: 'Russian',
  ko: 'Korean',
  it: 'Italian',
  hi: 'Hindi',
  ar: 'Arabic',
  nl: 'Dutch',
  pl: 'Polish',
  tr: 'Turkish',
  vi: 'Vietnamese',
  id: 'Indonesian',
  sv: 'Swedish',
  uk: 'Ukrainian',
}

export function getLanguageName(langCode: string | null | undefined): string {
  if (!langCode) return 'Unknown'
  const code = langCode.toLowerCase().split('-')[0].trim()
  return LANGUAGE_MAP[code] || langCode.toUpperCase()
}
