'use client'

import { Check, ChevronDown, Globe } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

import { type Language, useI18n } from '@/i18n'

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

  const languagesList: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: t('common.english', 'English'), flag: '🇬🇧' },
    { code: 'pt', label: t('common.portuguese', 'Português'), flag: '🇧🇷' },
    { code: 'es', label: t('common.spanish', 'Español'), flag: '🇪🇸' },
  ]

  return (
    <div ref={containerRef} className={`relative inline-block text-left z-50 ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 rounded-sm border border-graphite bg-onyx px-2 py-1 font-inter-tight text-eyebrow font-medium text-white transition-all duration-300 ease-in-out hover:border-signal-lime hover:bg-onyx/80 active:scale-[0.98] cursor-pointer group"
      >
        <Globe className="size-3 text-ash group-hover:text-signal-lime transition-colors duration-300" />
        <span className="uppercase tracking-wider">{language}</span>
        <ChevronDown
          className={`size-3 text-ash transition-transform duration-300 ${isOpen ? 'rotate-180 text-signal-lime' : ''}`}
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
