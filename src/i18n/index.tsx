'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

import { safeStorage } from '@/utils/storage'

import { type AppLocale, locales } from './locales'

export type Language = AppLocale

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, defaultValue?: string, variables?: Record<string, string>) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export const translations: Record<Language, Record<string, string>> = locales

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('pt')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = safeStorage.getItem('gitascii_lang') as Language
      const validLangs: Language[] = ['en', 'pt', 'es', 'zh', 'ja', 'de', 'fr']
      if (saved && validLangs.includes(saved)) {
        setLanguageState(saved)
      } else {
        const navLang = navigator.language.split('-')[0]
        if (navLang === 'pt' || navLang === 'br') {
          setLanguageState('pt')
        } else if (navLang === 'es') {
          setLanguageState('es')
        } else if (navLang === 'zh') {
          setLanguageState('zh')
        } else if (navLang === 'ja') {
          setLanguageState('ja')
        } else if (navLang === 'de') {
          setLanguageState('de')
        } else if (navLang === 'fr') {
          setLanguageState('fr')
        } else {
          setLanguageState('en')
        }
      }
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    if (typeof window !== 'undefined') {
      safeStorage.setItem('gitascii_lang', lang)
      document.documentElement.lang = lang
    }
  }

  const t = (key: string, defaultValue?: string, variables?: Record<string, string>): string => {
    const translationSet = translations[language] || translations['en']
    let value = translationSet?.[key]

    if (value === undefined) {
      value = translations['en']?.[key]
    }

    if (value === undefined) {
      value = defaultValue !== undefined ? defaultValue : key
    }

    if (variables) {
      Object.entries(variables).forEach(([k, v]) => {
        value = value.replace(new RegExp(`\\{${k}\\}`, 'g'), v)
      })
    }

    return value
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>{children}</I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

export { locales } from './locales'
