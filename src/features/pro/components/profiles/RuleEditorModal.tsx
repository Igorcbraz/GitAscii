'use client'

import { Clock, Plus, X, Zap } from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n'

import type { DynamicRuleRecord, DynamicRuleType, ProProfileRecord } from '../../types'
import { CustomDatePicker } from '../CustomDatePicker'
import { CustomSelect } from './CustomSelect'

const COMMON_TIMEZONES = [
  'America/Sao_Paulo',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Australia/Sydney',
  'UTC',
]

interface RuleEditorModalProps {
  isOpen: boolean
  onClose: () => void
  editingRule: DynamicRuleRecord | null
  profiles: ProProfileRecord[]
  ruleName: string
  setRuleName: (val: string) => void
  targetSlug: string
  setTargetSlug: (val: string) => void
  priority: number
  setPriority: (val: number) => void
  ruleType: DynamicRuleType
  setRuleType: (val: DynamicRuleType) => void
  daysOfWeek: number[]
  setDaysOfWeek: (val: number[] | ((prev: number[]) => number[])) => void
  startTime: string
  setStartTime: (val: string) => void
  endTime: string
  setEndTime: (val: string) => void
  ruleTimezone: string
  setRuleTimezone: (val: string) => void
  startDate: string
  setStartDate: (val: string) => void
  endDate: string
  setEndDate: (val: string) => void
  eventName: string
  setEventName: (val: string) => void
  expiresAt: string
  setExpiresAt: (val: string) => void
  description: string
  setDescription: (val: string) => void
  ruleSubmitting: boolean
  ruleError: string | null
  onSaveRule: (e: React.FormEvent) => void
}

export const RuleEditorModal: React.FC<RuleEditorModalProps> = ({
  isOpen,
  onClose,
  editingRule,
  profiles,
  ruleName,
  setRuleName,
  targetSlug,
  setTargetSlug,
  priority,
  setPriority,
  ruleType,
  setRuleType,
  daysOfWeek,
  setDaysOfWeek,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  ruleTimezone,
  setRuleTimezone,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  eventName,
  setEventName,
  expiresAt,
  setExpiresAt,
  description,
  setDescription,
  ruleSubmitting,
  ruleError,
  onSaveRule,
}) => {
  const { t } = useI18n()

  if (!isOpen) return null

  const daysList = [
    { label: t('pro.dynamic.day_mon', 'Mon'), value: 1 },
    { label: t('pro.dynamic.day_tue', 'Tue'), value: 2 },
    { label: t('pro.dynamic.day_wed', 'Wed'), value: 3 },
    { label: t('pro.dynamic.day_thu', 'Thu'), value: 4 },
    { label: t('pro.dynamic.day_fri', 'Fri'), value: 5 },
    { label: t('pro.dynamic.day_sat', 'Sat'), value: 6 },
    { label: t('pro.dynamic.day_sun', 'Sun'), value: 0 },
  ]

  const ruleTypeOptions = [
    {
      value: 'work_hours',
      label: t('pro.dynamic.type_work_hours', 'Work Hours (Schedule)'),
      sublabel: t('pro.dynamic.type_work_hours_sub', 'Displays during designated business hours'),
    },
    {
      value: 'weekend',
      label: t('pro.dynamic.type_weekend', 'Weekend Mode'),
      sublabel: t(
        'pro.dynamic.type_weekend_sub',
        'Displays automatically on Saturdays and Sundays'
      ),
    },
    {
      value: 'event',
      label: t('pro.dynamic.type_event', 'Calendar Date Range / Event'),
      sublabel: t('pro.dynamic.type_event_sub', 'Displays during specific start/end timestamps'),
    },
    {
      value: 'temporary',
      label: t('pro.dynamic.type_temporary', 'Temporary / Auto-Expire'),
      sublabel: t('pro.dynamic.type_temporary_sub', 'Reverts to fallback after an expiration date'),
    },
    {
      value: 'custom',
      label: t('pro.dynamic.type_custom', 'Custom Days & Time Rule'),
      sublabel: t('pro.dynamic.type_custom_sub', 'Fine-grained schedule configuration'),
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-xl rounded-2xl bg-[#0f0f10] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#141416]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#c5ff4a]/10 text-[#c5ff4a] border border-[#c5ff4a]/20">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {editingRule
                  ? t('pro.dynamic.edit_rule_title', 'Edit Dynamic Rule')
                  : t('pro.dynamic.new_rule_title', 'New Dynamic Switching Rule')}
              </h3>
              <p className="text-[11px] text-[#8a8a8a]">
                {t(
                  'pro.dynamic.modal_subtitle',
                  'Configure conditional schedule triggers to automatically switch profiles.'
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8a8a8a] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSaveRule} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {ruleError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono text-xs">
              {ruleError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-white/90">
                {t('pro.dynamic.rule_name_label', 'Rule Name')}
              </label>
              <input
                type="text"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                placeholder={t(
                  'pro.dynamic.rule_name_placeholder',
                  'e.g. Workday Focus, Hackathon Special'
                )}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white placeholder:text-[#555] focus:outline-none focus:border-[#c5ff4a]/60 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-white/90">
                {t('pro.dynamic.target_profile_label', 'Target Profile to Display')}
              </label>
              <CustomSelect
                options={profiles.map((p) => ({
                  value: p.slug,
                  label: p.name,
                  sublabel: `/${p.slug}`,
                }))}
                value={targetSlug}
                onChange={setTargetSlug}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-white/90">
                {t('pro.dynamic.rule_type_label', 'Trigger Condition Type')}
              </label>
              <CustomSelect
                options={ruleTypeOptions}
                value={ruleType}
                onChange={(val) => setRuleType(val as DynamicRuleType)}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-white/90">
                  {t('pro.dynamic.priority_label', 'Evaluation Priority')}
                </label>
                <span className="text-[10px] font-mono text-[#c5ff4a]">{priority}</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="w-full accent-[#c5ff4a] cursor-pointer"
              />
              <span className="text-[10px] text-[#7a7a7a] block">
                {t(
                  'pro.dynamic.priority_desc',
                  'Higher priority rules evaluate first (100 = highest).'
                )}
              </span>
            </div>
          </div>

          {(ruleType === 'work_hours' || ruleType === 'custom') && (
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
              <span className="text-[11px] font-semibold text-white/90 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#c5ff4a]" />
                {t('pro.dynamic.schedule_window', 'Schedule Time Window')}
              </span>

              {ruleType === 'custom' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] text-[#8a8a8a] uppercase tracking-wider block">
                    {t('pro.dynamic.active_days', 'Active Days')}
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {daysList.map((d) => {
                      const isSelected = daysOfWeek.includes(d.value)
                      return (
                        <button
                          key={d.value}
                          type="button"
                          onClick={() => {
                            setDaysOfWeek((prev) =>
                              prev.includes(d.value)
                                ? prev.filter((x) => x !== d.value)
                                : [...prev, d.value]
                            )
                          }}
                          className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#c5ff4a] text-black font-semibold shadow-xs'
                              : 'bg-white/5 text-[#7a7a7a] hover:text-white'
                          }`}
                        >
                          {d.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-[#8a8a8a] uppercase tracking-wider block">
                    {t('pro.dynamic.start_time', 'Start Time')}
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#c5ff4a]/60"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-[#8a8a8a] uppercase tracking-wider block">
                    {t('pro.dynamic.end_time', 'End Time')}
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#c5ff4a]/60"
                  />
                </div>
              </div>
            </div>
          )}

          {ruleType === 'event' && (
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-white/90">
                  {t('pro.dynamic.event_name', 'Event / Campaign Name')}
                </label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder={t(
                    'pro.dynamic.event_placeholder',
                    'e.g. Hackathon 2026, Black Friday, Vacation'
                  )}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white placeholder:text-[#555] focus:outline-none focus:border-[#c5ff4a]/60 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-[#8a8a8a] uppercase tracking-wider block">
                    {t('pro.dynamic.start_timestamp', 'Start Timestamp')}
                  </label>
                  <CustomDatePicker
                    value={startDate}
                    onChange={setStartDate}
                    placeholder={t('pro.dynamic.pick_start', 'Pick start date & time')}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-[#8a8a8a] uppercase tracking-wider block">
                    {t('pro.dynamic.end_timestamp', 'End Timestamp')}
                  </label>
                  <CustomDatePicker
                    value={endDate}
                    onChange={setEndDate}
                    placeholder={t('pro.dynamic.pick_end', 'Pick end date & time')}
                  />
                </div>
              </div>
            </div>
          )}

          {ruleType === 'temporary' && (
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] text-[#8a8a8a] uppercase tracking-wider block">
                  {t('pro.dynamic.expires_at', 'Expires At Timestamp')}
                </label>
                <CustomDatePicker
                  value={expiresAt}
                  onChange={setExpiresAt}
                  placeholder={t('pro.dynamic.pick_expiration', 'Pick expiration date & time')}
                />
                <span className="text-[10px] text-[#7a7a7a] block mt-1">
                  {t(
                    'pro.dynamic.expires_desc',
                    'Once this date is reached, this rule automatically deactivates.'
                  )}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-white/90">
                {t('pro.dynamic.override_tz', 'Timezone Override (Optional)')}
              </label>
              <CustomSelect
                options={[
                  {
                    value: '',
                    label: t('pro.dynamic.tz_inherit', 'Inherit Default Profile Timezone'),
                  },
                  ...COMMON_TIMEZONES.map((tz) => ({ value: tz, label: tz })),
                ]}
                value={ruleTimezone}
                onChange={setRuleTimezone}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-white/90">
                {t('pro.dynamic.description', 'Description & Notes')}
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t(
                  'pro.dynamic.desc_placeholder',
                  'Internal note on why this rule exists'
                )}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white placeholder:text-[#555] focus:outline-none focus:border-[#c5ff4a]/60 text-xs"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer text-xs font-medium"
            >
              {t('pro.common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={ruleSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#c5ff4a] hover:bg-[#b0f533] text-black font-semibold transition-all cursor-pointer text-xs shadow-[0_0_12px_rgba(197,255,74,0.2)] disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>
                {ruleSubmitting
                  ? t('pro.common.saving', 'Saving...')
                  : editingRule
                    ? t('pro.dynamic.update_rule', 'Update Rule')
                    : t('pro.dynamic.create_rule', 'Create Rule')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
