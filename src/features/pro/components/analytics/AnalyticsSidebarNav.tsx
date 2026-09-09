'use client'

import { Activity, Compass, Cpu, Globe2, Laptop, Layers, TrendingUp } from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n'

import type { ProProfileRecord } from '../../types'
import { ProfileScopeSelect } from '../ProfileScopeSelect'

export type SectionId =
  'overview' | 'traffic' | 'geography' | 'technology' | 'sources' | 'profiles' | 'activity'

interface AnalyticsSidebarNavProps {
  activeSection: SectionId
  onSelectSection: (id: SectionId) => void
  selectedProfile: string
  setSelectedProfile: (slug: string) => void
  profiles: ProProfileRecord[]
  activeLiveCount: number
}

export const AnalyticsSidebarNav: React.FC<AnalyticsSidebarNavProps> = ({
  activeSection,
  onSelectSection,
  selectedProfile,
  setSelectedProfile,
  profiles,
  activeLiveCount,
}) => {
  const { t } = useI18n()

  const sections: { id: SectionId; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'overview',
      label: t('pro.analytics.sec_overview', 'Overview'),
      icon: <Layers className="w-3.5 h-3.5" />,
    },
    {
      id: 'traffic',
      label: t('pro.analytics.sec_traffic', 'Traffic & Trends'),
      icon: <TrendingUp className="w-3.5 h-3.5" />,
    },
    {
      id: 'geography',
      label: t('pro.analytics.sec_geography', 'Geography'),
      icon: <Globe2 className="w-3.5 h-3.5" />,
    },
    {
      id: 'technology',
      label: t('pro.analytics.sec_technology', 'Technology'),
      icon: <Cpu className="w-3.5 h-3.5" />,
    },
    {
      id: 'sources',
      label: t('pro.analytics.sec_sources', 'Sources'),
      icon: <Compass className="w-3.5 h-3.5" />,
    },
    {
      id: 'profiles',
      label: t('pro.analytics.sec_profiles', 'Profiles'),
      icon: <Laptop className="w-3.5 h-3.5" />,
    },
    {
      id: 'activity',
      label: t('pro.analytics.sec_telemetry', 'Live Telemetry'),
      icon: <Activity className="w-3.5 h-3.5" />,
      badge: 'LIVE',
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
              selectedSlug={selectedProfile}
              onSelect={setSelectedProfile}
            />
          </div>

          <div className="space-y-0.5 pt-1">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#666] px-1 pb-1 block">
              {t('pro.analytics.sections', 'Sections')}
            </span>
            <nav className="space-y-0.5">
              {sections.map((sec) => {
                const isActive = activeSection === sec.id
                return (
                  <button
                    key={sec.id}
                    onClick={() => onSelectSection(sec.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer text-left ${
                      isActive
                        ? 'bg-white/[0.08] text-white font-medium shadow-xs'
                        : 'text-[#777] hover:text-white hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={isActive ? 'text-[#c5ff4a]' : 'text-[#666]'}>
                        {sec.icon}
                      </span>
                      <span className="truncate">{sec.label}</span>
                    </div>
                    {sec.badge && (
                      <span className="px-1 py-0.2 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                        {sec.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5 text-[10px] font-mono text-[#777] flex items-center justify-between">
          <span>{t('pro.analytics.retention_90d', '90-Day Retention')}</span>
          <span className="text-[#c5ff4a] font-semibold">
            {t('pro.analytics.pro_retention', 'Pro Active')}
          </span>
        </div>
      </aside>

      <div className="md:hidden flex items-center gap-1 px-4 py-2.5 border-b border-white/[0.06] overflow-x-auto">
        {sections.map((sec) => {
          const isActive = activeSection === sec.id
          return (
            <button
              key={sec.id}
              onClick={() => onSelectSection(sec.id)}
              className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#c5ff4a] text-black font-bold'
                  : 'text-[#777] hover:text-white bg-white/5'
              }`}
            >
              {sec.icon}
              <span>{sec.label}</span>
            </button>
          )
        })}
      </div>
    </>
  )
}
