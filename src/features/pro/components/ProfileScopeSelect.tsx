'use client'

import { Check, ChevronDown, Layers, User } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

import { useI18n } from '@/i18n'

export interface ProfileOption {
  slug: string
  name: string
  isDefault?: boolean
}

export interface ProfileScopeSelectProps {
  options: ProfileOption[]
  value: string
  onChange: (slug: string) => void
  className?: string
}

export const ProfileScopeSelect: React.FC<ProfileScopeSelectProps> = ({
  options,
  value,
  onChange,
  className = '',
}) => {
  const { t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.slug === value) ||
    options[0] || {
      slug: 'all',
      name: t('pro.scope.all_profiles_combined', 'All Profiles Combined'),
    }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="w-full flex items-center justify-between gap-2 p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.15] transition-colors text-left group cursor-pointer focus:outline-none"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0 text-[#8a8a8a] group-hover:text-white transition-colors">
            {selectedOption.slug === 'all' ? (
              <Layers className="w-3 h-3 text-[#c5ff4a]" />
            ) : (
              <User className="w-3 h-3 text-cyan-400" />
            )}
          </div>

          <div className="min-w-0">
            <span className="text-[11px] font-medium text-white/90 truncate block leading-tight">
              {selectedOption.name}
            </span>
            <span className="text-[9px] font-mono text-[#666] truncate block leading-tight">
              {selectedOption.slug === 'all'
                ? t('pro.scope.all_profiles', 'All profiles')
                : `@${selectedOption.slug}`}
            </span>
          </div>
        </div>

        <ChevronDown
          className={`w-3 h-3 text-[#666] group-hover:text-[#aaa] transition-transform duration-150 flex-shrink-0 ${
            isOpen ? 'rotate-180 text-white' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1 z-50 rounded-lg bg-[#141414] border border-white/10 shadow-xl p-1 space-y-0.5 max-h-60 overflow-y-auto"
        >
          <div className="px-2 py-1 text-[9px] font-mono font-medium uppercase tracking-wider text-[#555]">
            {t('pro.scope.select_title', 'Select Profile Scope')}
          </div>

          {options.map((opt) => {
            const isSelected = opt.slug === value

            return (
              <button
                key={opt.slug}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.slug)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-left text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-white/[0.08] text-white font-medium'
                    : 'text-[#888] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-4 h-4 rounded bg-white/[0.04] flex items-center justify-center flex-shrink-0 text-[#777]">
                    {opt.slug === 'all' ? (
                      <Layers className="w-2.5 h-2.5 text-[#c5ff4a]" />
                    ) : (
                      <User className="w-2.5 h-2.5 text-cyan-400" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <span
                      className={`text-[11px] truncate block ${isSelected ? 'text-white font-medium' : 'text-[#bbb]'}`}
                    >
                      {opt.name}
                    </span>
                  </div>
                </div>

                {isSelected && <Check className="w-3 h-3 text-[#c5ff4a] flex-shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
