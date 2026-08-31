'use client'

import { Clock, Flame, Moon, RefreshCw, Sun, Zap } from 'lucide-react'
import Image from 'next/image'
import React, { useState } from 'react'

import { useI18n } from '@/i18n'

import type { DynamicEvaluationResult, ProProfileRecord } from '../../types'
import { CustomDatePicker } from '../CustomDatePicker'
import { ProBadge } from '../ProBadge'
import { CustomSelect, type CustomSelectOption } from './CustomSelect'

interface DynamicRuleSimulatorProps {
  username: string
  profiles: ProProfileRecord[]
  simDate: string
  setSimDate: (val: string) => void
  simTimezone: string
  setSimTimezone: (val: string) => void
  simulating: boolean
  simResult: DynamicEvaluationResult | null
  timezoneOptions: CustomSelectOption[]
  onRunSimulation: (customDate?: string, customTz?: string) => Promise<void>
  onQuickPreset: (preset: 'now' | 'work' | 'weekend' | 'night' | 'vacation') => void
}

export const DynamicRuleSimulator: React.FC<DynamicRuleSimulatorProps> = ({
  username,
  profiles,
  simDate,
  setSimDate,
  simTimezone,
  setSimTimezone,
  simulating,
  simResult,
  timezoneOptions,
  onRunSimulation,
  onQuickPreset,
}) => {
  const { t } = useI18n()
  const [previewLoaded, setPreviewLoaded] = useState(false)

  const previewSvgUrl = simResult?.selectedProfileSlug
    ? `/api/${encodeURIComponent(username || 'user')}/${encodeURIComponent(simResult.selectedProfileSlug)}?t=${Date.now()}`
    : `/api/${encodeURIComponent(username || 'user')}?t=${Date.now()}`

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#111111] border border-white/[0.08] space-y-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#c5ff4a]" />
          <h3 className="text-xs font-bold text-white">
            {t('pro.dynamic.simulator_title', 'Dynamic Preview & Simulator')}
          </h3>
        </div>
        <button
          onClick={() => onRunSimulation()}
          disabled={simulating}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#8a8a8a] hover:text-white transition-colors cursor-pointer"
          title={t('pro.dynamic.re_evaluate', 'Re-evaluate simulation')}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${simulating ? 'animate-spin text-[#c5ff4a]' : ''}`} />
        </button>
      </div>

      <div className="space-y-1.5">
        <span className="text-[10px] uppercase font-mono text-[#7a7a7a] tracking-wider block">
          {t('pro.dynamic.quick_presets', 'Quick Simulation Presets')}
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => onQuickPreset('now')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-mono rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-white/90 border border-white/5 transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-[#c5ff4a] shrink-0" />
            <span className="truncate">{t('pro.dynamic.preset_now', 'Right Now')}</span>
          </button>
          <button
            onClick={() => onQuickPreset('work')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-mono rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-white/90 border border-white/5 transition-colors cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">{t('pro.dynamic.preset_work', 'Tuesday 2:30 PM')}</span>
          </button>
          <button
            onClick={() => onQuickPreset('weekend')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-mono rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-white/90 border border-white/5 transition-colors cursor-pointer"
          >
            <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{t('pro.dynamic.preset_weekend', 'Saturday 3:00 PM')}</span>
          </button>
          <button
            onClick={() => onQuickPreset('night')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-mono rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-white/90 border border-white/5 transition-colors cursor-pointer"
          >
            <Moon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">{t('pro.dynamic.preset_night', 'Late Night')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
        <div className="space-y-1.5">
          <label className="text-[#8a8a8a] text-[10px] font-mono block">
            {t('pro.dynamic.test_date_time', 'Simulated Date & Time')}
          </label>
          <CustomDatePicker
            value={simDate}
            onChange={(val) => {
              setSimDate(val)
              void onRunSimulation(val, simTimezone)
            }}
            includeTime={true}
            placeholder={t('pro.dynamic.test_date_time', 'Simulated Date & Time')}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[#8a8a8a] text-[10px] font-mono block">
            {t('pro.dynamic.test_timezone', 'Timezone')}
          </label>
          <CustomSelect
            options={timezoneOptions}
            value={simTimezone}
            onChange={(val) => {
              setSimTimezone(val)
              void onRunSimulation(simDate, val)
            }}
          />
        </div>
      </div>

      {simResult && (
        <div className="p-3.5 rounded-xl bg-[#09090b] border border-white/[0.08] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono text-[#7a7a7a] tracking-wider">
              {t('pro.dynamic.selected_profile', 'Selected Dynamic Profile')}
            </span>
            <ProBadge variant={simResult.isFallback ? 'muted' : 'lime'} size="sm">
              {simResult.isFallback
                ? t('pro.common.default', 'Default Fallback')
                : t('pro.dynamic.matched_rule', 'Rule Match')}
            </ProBadge>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white font-mono">
              /{simResult.selectedProfileSlug}
            </span>
            <span className="text-xs text-[#8a8a8a]">
              ({profiles.find((p) => p.slug === simResult.selectedProfileSlug)?.name || 'Profile'})
            </span>
          </div>

          <p className="text-[11px] text-[#c5ff4a] font-mono leading-relaxed">
            {simResult.evaluationReason}
          </p>

          {simResult.evaluatedRules.length > 0 && (
            <div className="pt-2 border-t border-white/5 space-y-1.5">
              <span className="text-[10px] font-mono text-[#7a7a7a] uppercase tracking-wider block">
                {t('pro.dynamic.evaluation_trace', 'Priority Evaluation Trace')}
              </span>
              <div className="space-y-1 max-h-32 overflow-y-auto font-mono text-[10px]">
                {simResult.evaluatedRules.map((step) => (
                  <div
                    key={step.ruleId}
                    className={`p-1.5 rounded flex items-center justify-between gap-2 ${
                      step.matched
                        ? 'bg-[#c5ff4a]/10 text-[#c5ff4a] border border-[#c5ff4a]/20'
                        : 'text-[#7a7a7a] bg-white/[0.01]'
                    }`}
                  >
                    <span className="truncate">
                      P{step.priority}: {step.ruleName}
                    </span>
                    <span className="shrink-0 font-bold">
                      {step.matched ? 'MATCHED' : 'SKIPPED'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl bg-[#09090b] border border-white/[0.08] p-3 flex flex-col items-center justify-center min-h-[180px] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]" />

        {!previewLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 z-10 bg-[#09090b]/80 backdrop-blur-xs">
            <span className="w-4 h-4 border-2 border-[#c5ff4a] border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-mono text-[#8a8a8a]">
              {t('pro.dynamic.rendering_card', 'Rendering live card...')}
            </span>
          </div>
        )}

        <Image
          key={previewSvgUrl}
          src={previewSvgUrl}
          alt={t('pro.dynamic.preview_alt', 'Dynamic Profile Live Simulation')}
          width={500}
          height={220}
          unoptimized
          className={`w-full h-auto max-h-[220px] object-contain relative z-10 select-none transition-opacity ${
            previewLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setPreviewLoaded(true)}
          onError={() => setPreviewLoaded(true)}
        />
      </div>
    </div>
  )
}
