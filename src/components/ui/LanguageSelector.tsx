'use client'

import { Check, ChevronDown, Globe } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

import { AVAILABLE_LANGUAGES } from '@/constants'
import { useI18n } from '@/i18n'

interface LanguageSelectorProps {
  align?: 'left' | 'right'
  className?: string
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
    flag: lang.flag,
  }))

  return (
    <div ref={containerRef} className={`relative inline-block text-left z-50 ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('common.select_language', 'Select language')}
        aria-expanded={isOpen}
        className="inline-flex items-center justify-center gap-1.5 px-2 h-[32px] font-inter-tight text-label font-medium text-ash transition-all duration-200 hover:text-white active:scale-[0.98] cursor-pointer group"
      >
        <Globe
          className="size-3.5 text-ash group-hover:text-signal-lime transition-colors duration-200"
          aria-hidden="true"
        />
        <span className="uppercase tracking-wider font-jetbrains-mono text-[11px] group-hover:text-white transition-colors">
          {language}
        </span>
        <ChevronDown
          className={`size-3 text-ash transition-transform duration-200 ${isOpen ? 'rotate-180 text-signal-lime' : 'group-hover:text-signal-lime'}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-2 w-40 origin-top-right rounded-sm border border-graphite bg-onyx/95 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all animate-in fade-in slide-in-from-top-2 duration-200 z-50`}
        >
          <div className="py-1" role="menu" aria-orientation="vertical">
            {languagesList.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center justify-between px-4 py-2 text-left font-inter-tight text-label transition-colors duration-200 cursor-pointer ${
                  lang.code === language
                    ? 'bg-graphite text-signal-lime font-medium'
                    : 'text-white hover:bg-graphite/50 hover:text-signal-lime'
                }`}
                role="menuitem"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base select-none">{lang.flag}</span>
                  <span>{lang.label}</span>
                </div>
                {lang.code === language && <Check className="size-3.5 text-signal-lime shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export { LanguageSelector }
