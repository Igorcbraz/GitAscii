'use client'

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

import { safeStorage } from '@/utils/storage'

import type { AppLocale } from './locales'
import { pt } from './locales/pt'

export type Language = AppLocale

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, defaultValue?: string, variables?: Record<string, string>) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const initialTranslations: Partial<Record<Language, Record<string, string>>> = { pt }
const localeLoaders = {
  en: () => import('./locales/en').then((module) => module.en),
  es: () => import('./locales/es').then((module) => module.es),
  zh: () => import('./locales/zh').then((module) => module.zh),
  ja: () => import('./locales/ja').then((module) => module.ja),
  de: () => import('./locales/de').then((module) => module.de),
  fr: () => import('./locales/fr').then((module) => module.fr),
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('pt')
  const [translations, setTranslations] = useState(initialTranslations)
  const selectionRef = useRef(0)
  const initializedRef = useRef(false)

  const selectLanguage = useCallback(
    (lang: Language, persist: boolean) => {
      const selection = ++selectionRef.current
      if (persist) safeStorage.setItem('gitascii_lang', lang)
      const apply = (dictionary?: Record<string, string>) => {
        if (selection !== selectionRef.current) return
        if (dictionary) {
          setTranslations((current) => ({ ...current, [lang]: dictionary }))
        }
        setLanguageState(lang)
        document.documentElement.lang = lang === 'pt' ? 'pt-BR' : lang
      }

      if (translations[lang]) {
        apply()
      } else {
        void localeLoaders[lang as keyof typeof localeLoaders]()
          .then(apply)
          .catch(() => {})
      }
    },
    [translations]
  )

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    if (typeof window !== 'undefined') {
      const saved = safeStorage.getItem('gitascii_lang') as Language
      const validLangs: Language[] = ['en', 'pt', 'es', 'zh', 'ja', 'de', 'fr']
      if (saved && validLangs.includes(saved)) {
        selectLanguage(saved, false)
      } else {
        const navLang = navigator.language.split('-')[0]
        if (navLang === 'pt' || navLang === 'br') {
          selectLanguage('pt', false)
        } else if (navLang === 'es') {
          selectLanguage('es', false)
        } else if (navLang === 'zh') {
          selectLanguage('zh', false)
        } else if (navLang === 'ja') {
          selectLanguage('ja', false)
        } else if (navLang === 'de') {
          selectLanguage('de', false)
        } else if (navLang === 'fr') {
          selectLanguage('fr', false)
        } else {
          selectLanguage('en', false)
        }
      }
    }
  }, [selectLanguage])

  const setLanguage = (lang: Language) => {
    selectLanguage(lang, true)
  }

  const t = (key: string, defaultValue?: string, variables?: Record<string, string>): string => {
    const translationSet = translations[language] || translations['en']
    let value = translationSet?.[key] ?? translations['en']?.[key] ?? defaultValue ?? key

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
