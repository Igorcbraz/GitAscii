'use client'

import React from 'react'

import { LanguageSelector } from '@/components/ui/LanguageSelector'
import { UserMenuDropdown } from '@/components/ui/UserMenuDropdown'
import { useI18n } from '@/i18n'

import { ProBadge } from './ProBadge'
import { CustomSelect } from './profiles/CustomSelect'

export interface ProHeaderProps {
  title: string
  subtitle?: string
  username?: string
  profiles?: Array<{ slug: string; name: string }>
  selectedProfile?: string
  onSelectProfile?: (slug: string) => void
  center?: React.ReactNode
  actions?: React.ReactNode
}

export const ProHeader: React.FC<ProHeaderProps> = ({
  title,
  subtitle,
  username,
  profiles = [],
  selectedProfile = 'default',
  onSelectProfile,
  center,
  actions,
}) => {
  const { t } = useI18n()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 sm:px-8 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/[0.07] flex-shrink-0">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white truncate">
              {title}
            </h1>
            <ProBadge variant="lime">{t('pro.common.pro_workspace', 'Pro Workspace')}</ProBadge>
          </div>
          {subtitle && (
            <p className="text-xs text-[#8a8a8a] hidden sm:block truncate mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {center && (
        <div className="hidden lg:flex items-center justify-center flex-shrink-0 px-4">
          {center}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 flex-1">
        {profiles.length > 1 && onSelectProfile && (
          <div className="w-44">
            <CustomSelect
              options={profiles.map((p) => ({
                value: p.slug,
                label: p.name,
                sublabel: `/${p.slug}`,
              }))}
              value={selectedProfile}
              onChange={onSelectProfile}
            />
          </div>
        )}

        <LanguageSelector align="right" />

        {username && <UserMenuDropdown username={username} align="right" />}

        {actions}
      </div>
    </header>
  )
}
