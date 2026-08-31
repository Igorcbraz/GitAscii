'use client'

import { Check, ChevronDown, Globe } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

import { AVAILABLE_LANGUAGES } from '@/constants'
import { CountryFlag } from '@/features/pro/components/CountryFlag'
import { useI18n } from '@/i18n'

interface LanguageSelectorProps {
  align?: 'left' | 'right'
  className?: string
}

const LANG_TO_FLAG_CODE: Record<string, string> = {
  en: 'GB',
  pt: 'BR',
  es: 'ES',
  zh: 'CN',
  ja: 'JP',
  de: 'DE',
  fr: 'FR',
}

export default function LanguageSelector({
  align = 'right',
  className = '',
}: LanguageSelectorProps) {
  const { language, setLanguage, t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const languagesList = AVAILABLE_LANGUAGES.map((lang) => ({
    code: lang.code,
    label: t(lang.labelKey, lang.defaultLabel),
    flagCode: LANG_TO_FLAG_CODE[lang.code] || 'XX',
  }))

  return (
    <div ref={containerRef} className={`relative inline-block text-left z-50 ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('common.select_language', 'Select language')}
        aria-expanded={isOpen}
        className="inline-flex items-center justify-center gap-1.5 px-2.5 h-[32px] rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-xs font-mono text-[#8a8a8a] transition-colors hover:text-white cursor-pointer group"
      >
        <Globe
          className="w-3.5 h-3.5 text-[#777] group-hover:text-white transition-colors"
          aria-hidden="true"
        />
        <span className="uppercase tracking-wider text-[11px] group-hover:text-white transition-colors">
          {language}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-[#666] transition-transform duration-150 ${isOpen ? 'rotate-180 text-white' : 'group-hover:text-white'}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-1.5 w-44 origin-top-right rounded-xl border border-white/10 bg-[#141414] shadow-xl transition-all animate-in fade-in-0 zoom-in-95 duration-100 z-50 p-1`}
        >
          <div className="py-0.5 space-y-0.5" role="menu" aria-orientation="vertical">
            {languagesList.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                  lang.code === language
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-[#888] hover:bg-white/[0.04] hover:text-white'
                }`}
                role="menuitem"
              >
                <div className="flex items-center gap-2.5">
                  <CountryFlag code={lang.flagCode} size="sm" />
                  <span>{lang.label}</span>
                </div>
                {lang.code === language && (
                  <Check className="w-3.5 h-3.5 text-[#c5ff4a] shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export { LanguageSelector }
