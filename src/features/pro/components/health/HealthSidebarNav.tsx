'use client'

import { AlertCircle, Layers, Server, ShieldCheck } from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n'

import type { ProProfileRecord } from '../../types'
import { ProfileScopeSelect } from '../ProfileScopeSelect'

export type HealthSectionId = 'overview' | 'widgets' | 'errors' | 'badge'

interface HealthSidebarNavProps {
  activeSection: HealthSectionId
  setActiveSection: (id: HealthSectionId) => void
  selectedProfile: string
  setSelectedProfile: (slug: string) => void
  profiles: ProProfileRecord[]
  errorsCount: number
}

export const HealthSidebarNav: React.FC<HealthSidebarNavProps> = ({
  activeSection,
  setActiveSection,
  selectedProfile,
  setSelectedProfile,
  profiles,
  errorsCount,
}) => {
  const { t } = useI18n()

  const sections = [
    {
      id: 'overview' as const,
      label: t('pro.health.tab_overview', 'Profiles Health Matrix'),
      icon: <Layers className="w-3.5 h-3.5" />,
    },
    {
      id: 'widgets' as const,
      label: t('pro.health.tab_widgets', 'Widget Telemetry'),
      icon: <Server className="w-3.5 h-3.5" />,
    },
    {
      id: 'errors' as const,
      label: t('pro.health.tab_incidents', 'Incident Logs'),
      icon: <AlertCircle className="w-3.5 h-3.5" />,
      badge: errorsCount > 0 ? String(errorsCount) : undefined,
    },
    {
      id: 'badge' as const,
      label: t('pro.health.tab_badge', 'Status Badge'),
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
    },
  ]

  return (
    <>
      <aside className="w-52 lg:w-56 flex-shrink-0 hidden md:flex flex-col justify-between h-screen bg-[#080808] border-r border-white/[0.06] select-none p-3 space-y-4">
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#666] px-1 block">
              {t('pro.analytics.scope', 'Profile Scope')}
            </span>
            <ProfileScopeSelect
              profiles={profiles}
              selectedSlug={selectedProfile}
              onSelect={setSelectedProfile}
            />
          </div>

          <div className="space-y-0.5 pt-1">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#666] px-1 pb-1 block">
              {t('pro.health.title', 'GitAscii Health')}
            </span>
            <nav className="space-y-0.5">
              {sections.map((sec) => {
                const isActive = activeSection === sec.id
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id)}
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
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
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
          <span>{t('common.status', 'Status')}</span>
          <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {t('pro.health.status_operational', 'Operational')}
          </span>
        </div>
      </aside>

      <div className="md:hidden flex items-center gap-1 px-4 py-2.5 border-b border-white/[0.06] overflow-x-auto">
        {sections.map((sec) => {
          const isActive = activeSection === sec.id
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
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
