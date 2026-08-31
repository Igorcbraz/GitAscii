'use client'

import { Layers, Zap } from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n'

import type { ProProfileRecord } from '../../types'
import { ProfileScopeSelect } from '../ProfileScopeSelect'

export type ProfilesNavSection = 'profiles' | 'dynamic'

interface ProfilesSidebarNavProps {
  activeTab: ProfilesNavSection
  setActiveTab: (tab: ProfilesNavSection) => void
  profiles: ProProfileRecord[]
  selectedSlug: string
  setSelectedSlug: (slug: string) => void
  onCreateNew?: () => void
}

export const ProfilesSidebarNav: React.FC<ProfilesSidebarNavProps> = ({
  activeTab,
  setActiveTab,
  profiles,
  selectedSlug,
  setSelectedSlug,
  onCreateNew,
}) => {
  const { t } = useI18n()

  const navItems = [
    {
      id: 'profiles' as const,
      label: t('pro.profiles.tab_profiles', 'Profiles'),
      icon: <Layers className="w-3.5 h-3.5" />,
      count: profiles.length,
    },
    {
      id: 'dynamic' as const,
      label: t('pro.profiles.tab_dynamic', 'Automation'),
      icon: <Zap className="w-3.5 h-3.5" />,
      badge: 'AUTO',
    },
  ]

  return (
    <>
      <aside className="w-52 lg:w-56 flex-shrink-0 hidden md:flex flex-col justify-between h-screen bg-[#080808] border-r border-white/[0.06] select-none p-3 space-y-4">
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#666] px-1 block">
              {t('pro.analytics.scope', 'Scope')}
            </span>
            <ProfileScopeSelect
              profiles={profiles}
              includeAll={false}
              selectedSlug={selectedSlug}
              onSelect={(slug) => {
                setActiveTab('profiles')
                setSelectedSlug(slug)
              }}
            />
          </div>

          <div className="space-y-0.5 pt-1">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#666] px-1 pb-1 block">
              {t('pro.profiles.navigation', 'Sections')}
            </span>
            <nav className="space-y-0.5">
              {navItems.map((item) => {
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer text-left ${
                      isActive
                        ? 'bg-white/[0.08] text-white font-medium shadow-xs'
                        : 'text-[#777] hover:text-white hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={isActive ? 'text-[#c5ff4a]' : 'text-[#666]'}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.count !== undefined && (
                      <span className="text-[10px] font-mono text-[#888] bg-white/5 px-1.5 py-0.2 rounded border border-white/5">
                        {item.count}
                      </span>
                    )}

                    {item.badge && (
                      <span className="px-1 py-0.2 rounded text-[8px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 font-bold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 space-y-2 text-[10px] font-mono">
          <div className="flex items-center justify-between text-[#888]">
            <span>{t('pro.profiles.quota_label', 'Profile Quota')}</span>
            <span className="text-white font-bold">{profiles.length} / 10</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
            <div
              className="bg-[#c5ff4a] h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, (profiles.length / 10) * 100)}%` }}
            />
          </div>
        </div>
      </aside>

      <div className="md:hidden flex items-center gap-1.5 px-4 py-2.5 border-b border-white/[0.06] overflow-x-auto bg-[#080808]">
        {navItems.map((item) => {
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#c5ff4a] text-black font-bold'
                  : 'text-[#888] hover:text-white bg-white/5'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.count !== undefined && <span className="opacity-70">({item.count})</span>}
            </button>
          )
        })}
      </div>
    </>
  )
}
