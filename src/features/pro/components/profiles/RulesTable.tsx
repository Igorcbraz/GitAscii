'use client'

import { Calendar, Clock, Edit, Plus, Sliders, Sparkles, Sun, Trash2, Zap } from 'lucide-react'
import React from 'react'

import { Switch } from '@/components/ui/Switch'
import { useI18n } from '@/i18n'

import type { DynamicRuleRecord, DynamicRuleType, ProProfileRecord } from '../../types'
import { ProBadge } from '../ProBadge'

interface RulesTableProps {
  rules: DynamicRuleRecord[]
  profiles: ProProfileRecord[]
  onOpenCreateModal: () => void
  onOpenEditModal: (rule: DynamicRuleRecord) => void
  onToggleRuleStatus: (rule: DynamicRuleRecord) => void
  onDeleteRule: (id: string) => void
}

export const RulesTable: React.FC<RulesTableProps> = ({
  rules,
  profiles,
  onOpenCreateModal,
  onOpenEditModal,
  onToggleRuleStatus,
  onDeleteRule,
}) => {
  const { t } = useI18n()

  const getRuleTypeBadge = (type: DynamicRuleType) => {
    switch (type) {
      case 'work_hours':
        return (
          <ProBadge variant="lime" size="sm" className="gap-1">
            <Clock className="w-2.5 h-2.5" />
            <span>{t('pro.dynamic.type_work_hours', 'Work Hours')}</span>
          </ProBadge>
        )
      case 'weekend':
        return (
          <ProBadge variant="emerald" size="sm" className="gap-1">
            <Sun className="w-2.5 h-2.5" />
            <span>{t('pro.dynamic.type_weekend', 'Weekend')}</span>
          </ProBadge>
        )
      case 'date_range':
        return (
          <ProBadge variant="outline" size="sm" className="gap-1">
            <Calendar className="w-2.5 h-2.5" />
            <span>{t('pro.dynamic.type_date_range', 'Date Range')}</span>
          </ProBadge>
        )
      case 'event':
        return (
          <ProBadge variant="amber" size="sm" className="gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            <span>{t('pro.dynamic.type_event', 'Event / Holiday')}</span>
          </ProBadge>
        )
      case 'temporary':
        return (
          <ProBadge variant="rose" size="sm" className="gap-1">
            <Zap className="w-2.5 h-2.5" />
            <span>{t('pro.dynamic.type_temporary', 'Temporary')}</span>
          </ProBadge>
        )
      case 'custom':
        return (
          <ProBadge variant="muted" size="sm" className="gap-1">
            <Sliders className="w-2.5 h-2.5" />
            <span>{t('pro.dynamic.type_custom', 'Custom')}</span>
          </ProBadge>
        )
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8a8a8a]">
            {t('pro.dynamic.rules_catalog', 'Scheduled Dynamic Rules')}
          </span>
          <span className="text-[10px] font-mono bg-white/[0.04] text-[#888] px-2 py-0.5 rounded border border-white/5">
            {rules.length} {t('pro.dynamic.configured', 'configured')}
          </span>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-black bg-[#c5ff4a] hover:bg-[#b0f533] rounded-lg transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('pro.dynamic.create_rule_btn', 'Add Rule')}</span>
        </button>
      </div>

      {rules.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#111111] border border-dashed border-white/10 text-center space-y-3">
          <Sliders className="w-6 h-6 text-[#7a7a7a] mx-auto" />
          <p className="text-xs font-semibold text-white">
            {t('pro.dynamic.no_rules_title', 'No Dynamic Rules Configured')}
          </p>
          <p className="text-[11px] text-[#8a8a8a] max-w-sm mx-auto">
            {t(
              'pro.dynamic.no_rules_desc',
              'Add rules to switch profiles automatically based on work hours, weekends, or upcoming vacations.'
            )}
          </p>
          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-black bg-[#c5ff4a] rounded-lg hover:bg-[#b0f533] cursor-pointer mt-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('pro.dynamic.create_first_rule', 'Create First Rule')}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => {
            const targetProfile = profiles.find((p) => p.slug === rule.targetProfileSlug)
            return (
              <div
                key={rule.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  rule.enabled
                    ? 'bg-[#111111] border-white/[0.08] hover:border-white/20'
                    : 'bg-white/[0.02] border-white/5 opacity-60'
                }`}
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-[#c5ff4a] font-bold border border-white/10">
                      P{rule.priority}
                    </span>
                    <h4 className="text-xs font-bold text-white truncate">{rule.name}</h4>
                    {getRuleTypeBadge(rule.type)}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-[#8a8a8a] flex-wrap">
                    <span className="text-white font-medium">
                      → /{rule.targetProfileSlug}{' '}
                      <span className="text-[#7a7a7a] font-normal">
                        ({targetProfile?.name || rule.targetProfileSlug})
                      </span>
                    </span>
                    {rule.startTime && rule.endTime && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-[10px]">
                          {rule.startTime} - {rule.endTime}
                        </span>
                      </>
                    )}
                    {rule.timezone && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-[10px]">{rule.timezone}</span>
                      </>
                    )}
                  </div>

                  {rule.description && (
                    <p className="text-[10px] text-[#7a7a7a]">{rule.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Switch checked={rule.enabled} onChange={() => onToggleRuleStatus(rule)} />
                  <button
                    onClick={() => onOpenEditModal(rule)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#8a8a8a] hover:text-white transition-colors cursor-pointer"
                    title={t('pro.dynamic.edit_rule', 'Edit Rule')}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteRule(rule.id)}
                    className="p-1.5 rounded-lg text-[#7a7a7a] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title={t('pro.dynamic.delete_rule', 'Delete Rule')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
