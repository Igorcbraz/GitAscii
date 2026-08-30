'use client'

import { AlertTriangle, Play, X } from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n'

import type { ProProfileRecord } from '../../types'
import { CustomSelect } from '../profiles/CustomSelect'

interface HealthSimulateModalProps {
  isOpen: boolean
  onClose: () => void
  profiles: ProProfileRecord[]
  simulateTargetProfile: string
  setSimulateTargetProfile: (val: string) => void
  simulateTargetWidget: string
  setSimulateTargetWidget: (val: string) => void
  simulateErrorType: string
  setSimulateErrorType: (val: string) => void
  simulateCustomMessage: string
  setSimulateCustomMessage: (val: string) => void
  simulating: boolean
  onSimulate: () => Promise<void>
}

export const HealthSimulateModal: React.FC<HealthSimulateModalProps> = ({
  isOpen,
  onClose,
  profiles,
  simulateTargetProfile,
  setSimulateTargetProfile,
  simulateTargetWidget,
  setSimulateTargetWidget,
  simulateErrorType,
  setSimulateErrorType,
  simulateCustomMessage,
  setSimulateCustomMessage,
  simulating,
  onSimulate,
}) => {
  const { t } = useI18n()

  if (!isOpen) return null

  const profileOptions = [
    { value: 'default', label: 'Primary Profile (/default)' },
    ...profiles
      .filter((p) => p.slug !== 'default')
      .map((p) => ({ value: p.slug, label: `${p.name} (/${p.slug})` })),
  ]

  const widgetOptions = [
    { value: 'contribution-snake', label: 'Contribution Snake Game' },
    { value: 'bio', label: 'Developer Bio & Avatar' },
    { value: 'stats', label: 'GitHub Stats Cards' },
    { value: 'languages', label: 'Top Languages Radar' },
    { value: 'repositories', label: 'Repository Showcase' },
  ]

  const errorTypeOptions = [
    {
      value: 'FETCH_TIMEOUT',
      label: 'FETCH_TIMEOUT',
      sublabel: 'Upstream HTTP timeout (>5000ms)',
    },
    {
      value: 'UPSTREAM_500',
      label: 'UPSTREAM_500',
      sublabel: 'Upstream API server error (HTTP 500/502)',
    },
    {
      value: 'SVG_SYNTAX_ERROR',
      label: 'SVG_SYNTAX_ERROR',
      sublabel: 'Invalid XML/SVG element generated',
    },
    {
      value: 'RATE_LIMITED',
      label: 'RATE_LIMITED',
      sublabel: 'Upstream rate limit exceeded (HTTP 429)',
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-[#0f0f10] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#141416]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {t('pro.health.simulate_modal_title', 'Simulate Failure Incident')}
              </h3>
              <p className="text-[11px] font-mono text-[#8a8a8a]">
                {t(
                  'pro.health.simulate_modal_sub',
                  'Trigger an artificial telemetry failure to test automated alerting and UI fallback states.'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8a8a8a] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-white/90">
              {t('pro.health.simulate_target_profile', 'Target Profile')}
            </label>
            <CustomSelect
              options={profileOptions}
              value={simulateTargetProfile}
              onChange={setSimulateTargetProfile}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-white/90">
              {t('pro.health.simulate_target_widget', 'Target Widget')}
            </label>
            <CustomSelect
              options={widgetOptions}
              value={simulateTargetWidget}
              onChange={setSimulateTargetWidget}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-white/90">
              {t('pro.health.simulate_error_type', 'Error Condition Type')}
            </label>
            <CustomSelect
              options={errorTypeOptions}
              value={simulateErrorType}
              onChange={setSimulateErrorType}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-white/90">
              {t('pro.health.simulate_custom_msg', 'Custom Diagnostic Message (Optional)')}
            </label>
            <input
              type="text"
              value={simulateCustomMessage}
              onChange={(e) => setSimulateCustomMessage(e.target.value)}
              placeholder={t(
                'pro.health.simulate_msg_ph',
                'e.g. Synthetic test incident triggered from Health Studio'
              )}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white placeholder:text-[#555] focus:outline-none focus:border-[#c5ff4a]/60 text-xs"
            />
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-[#141416] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer text-xs font-medium"
          >
            {t('pro.common.cancel', 'Cancel')}
          </button>
          <button
            type="button"
            onClick={onSimulate}
            disabled={simulating}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold transition-all cursor-pointer text-xs shadow-xs disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>
              {simulating
                ? t('pro.health.simulating', 'Triggering...')
                : t('pro.health.trigger_incident', 'Trigger Incident')}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
