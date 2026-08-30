'use client'

import { Check, Copy, Globe, Layers, Sparkles, Zap } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { Switch } from '@/components/ui/Switch'
import { useI18n } from '@/i18n'
import { API_ENDPOINTS } from '@/services/endpoints'

import type {
  DynamicEvaluationResult,
  DynamicRuleRecord,
  DynamicRulesConfig,
  DynamicRuleType,
  ProProfileRecord,
} from '../../types'
import { ConfirmDialog } from '../ConfirmDialog'
import { ProBadge } from '../ProBadge'
import { CustomSelect, type CustomSelectOption } from './CustomSelect'
import { DynamicRuleSimulator } from './DynamicRuleSimulator'
import { RuleEditorModal } from './RuleEditorModal'
import { RulesTable } from './RulesTable'

interface DynamicProfilesSectionProps {
  username: string
  profiles: ProProfileRecord[]
  onProfileUpdated?: () => void
}

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

export const DynamicProfilesSection: React.FC<DynamicProfilesSectionProps> = ({
  username,
  profiles,
}) => {
  const { t } = useI18n()
  const [config, setConfig] = useState<DynamicRulesConfig>({
    enabled: false,
    fallbackProfileSlug: 'default',
    defaultTimezone: 'UTC',
    rules: [],
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [savingConfig, setSavingConfig] = useState(false)

  const [showRuleModal, setShowRuleModal] = useState(false)
  const [editingRule, setEditingRule] = useState<DynamicRuleRecord | null>(null)
  const [ruleName, setRuleName] = useState('')
  const [targetSlug, setTargetSlug] = useState('default')
  const [priority, setPriority] = useState(50)
  const [ruleType, setRuleType] = useState<DynamicRuleType>('work_hours')
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5])
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('18:00')
  const [ruleTimezone, setRuleTimezone] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [eventName, setEventName] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [description, setDescription] = useState('')
  const [ruleSubmitting, setRuleSubmitting] = useState(false)
  const [ruleError, setRuleError] = useState<string | null>(null)

  const [simDate, setSimDate] = useState<string>(() => new Date().toISOString().slice(0, 16))
  const [simTimezone, setSimTimezone] = useState<string>('America/Sao_Paulo')
  const [simulating, setSimulating] = useState(false)
  const [simResult, setSimResult] = useState<DynamicEvaluationResult | null>(null)
  const [copiedUrl, setCopiedUrl] = useState(false)

  const [deleteRuleId, setDeleteRuleId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchConfig = useCallback(async () => {
    try {
      setRefreshing(true)
      const res = await fetch(API_ENDPOINTS.PRO.DYNAMIC_RULES)
      if (!res.ok) throw new Error(t('pro.dynamic.fetch_error', 'Failed to fetch dynamic rules'))
      const data = await res.json()
      setConfig(data)
      if (data.defaultTimezone) {
        setSimTimezone(data.defaultTimezone)
      }
    } catch (err) {
      console.warn('Error fetching dynamic rules:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [t])

  useEffect(() => {
    void fetchConfig()
  }, [fetchConfig])

  const runSimulation = useCallback(
    async (customDate?: string, customTz?: string) => {
      try {
        setSimulating(true)
        const res = await fetch(API_ENDPOINTS.PRO.DYNAMIC_PREVIEW, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            simulatedDate: customDate || simDate,
            simulatedTimezone: customTz || simTimezone,
          }),
        })
        const data = await res.json()
        setSimResult(data)
      } catch (err) {
        console.warn('Simulation error:', err)
      } finally {
        setSimulating(false)
      }
    },
    [simDate, simTimezone]
  )

  useEffect(() => {
    if (!loading) {
      void runSimulation()
    }
  }, [loading, runSimulation])

  const handleToggleGlobal = async (checked: boolean) => {
    try {
      setSavingConfig(true)
      const res = await fetch(API_ENDPOINTS.PRO.DYNAMIC_RULES, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: checked }),
      })
      const data = await res.json()
      setConfig(data)
      await runSimulation()
    } catch (err) {
      console.error('Failed to update dynamic config:', err)
    } finally {
      setSavingConfig(false)
    }
  }

  const handleSaveSettings = async (updates: Partial<DynamicRulesConfig>) => {
    try {
      setSavingConfig(true)
      const res = await fetch(API_ENDPOINTS.PRO.DYNAMIC_RULES, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const data = await res.json()
      setConfig(data)
      await runSimulation()
    } catch (err) {
      console.error('Failed to save dynamic settings:', err)
    } finally {
      setSavingConfig(false)
    }
  }

  const handleOpenCreateModal = () => {
    setEditingRule(null)
    setRuleName('')
    setTargetSlug(profiles[0]?.slug || 'default')
    setPriority(50)
    setRuleType('work_hours')
    setDaysOfWeek([1, 2, 3, 4, 5])
    setStartTime('09:00')
    setEndTime('18:00')
    setRuleTimezone('')
    setStartDate('')
    setEndDate('')
    setEventName('')
    setExpiresAt('')
    setDescription('')
    setRuleError(null)
    setShowRuleModal(true)
  }

  const handleOpenEditModal = (rule: DynamicRuleRecord) => {
    setEditingRule(rule)
    setRuleName(rule.name)
    setTargetSlug(rule.targetProfileSlug)
    setPriority(rule.priority)
    setRuleType(rule.type)
    setDaysOfWeek(rule.daysOfWeek || [1, 2, 3, 4, 5])
    setStartTime(rule.startTime || '09:00')
    setEndTime(rule.endTime || '18:00')
    setRuleTimezone(rule.timezone || '')
    setStartDate(rule.startDate ? rule.startDate.slice(0, 16) : '')
    setEndDate(rule.endDate ? rule.endDate.slice(0, 16) : '')
    setEventName(rule.eventName || '')
    setExpiresAt(rule.expiresAt ? rule.expiresAt.slice(0, 16) : '')
    setDescription(rule.description || '')
    setRuleError(null)
    setShowRuleModal(true)
  }

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault()
    setRuleError(null)

    if (!ruleName.trim()) {
      setRuleError(t('pro.dynamic.name_required', 'Rule name is required'))
      return
    }

    try {
      setRuleSubmitting(true)
      const payload = {
        name: ruleName.trim(),
        targetProfileSlug: targetSlug,
        priority: Number(priority),
        type: ruleType,
        daysOfWeek: ruleType === 'weekend' ? [0, 6] : daysOfWeek,
        startTime: ruleType === 'work_hours' || ruleType === 'custom' ? startTime : undefined,
        endTime: ruleType === 'work_hours' || ruleType === 'custom' ? endTime : undefined,
        timezone: ruleTimezone || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        eventName: ruleType === 'event' ? eventName : undefined,
        expiresAt: ruleType === 'temporary' ? expiresAt : undefined,
        description: description.trim(),
      }

      if (editingRule) {
        const res = await fetch(API_ENDPOINTS.PRO.DYNAMIC_RULE(editingRule.id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error(t('pro.dynamic.update_rule_failed', 'Failed to update rule'))
      } else {
        const res = await fetch(API_ENDPOINTS.PRO.DYNAMIC_RULES, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error(t('pro.dynamic.create_rule_failed', 'Failed to create rule'))
      }

      setShowRuleModal(false)
      await fetchConfig()
      await runSimulation()
    } catch (err: unknown) {
      setRuleError(
        err instanceof Error
          ? err.message
          : t('pro.dynamic.save_error', 'Error saving dynamic rule')
      )
    } finally {
      setRuleSubmitting(false)
    }
  }

  const handleDeleteRule = async () => {
    if (!deleteRuleId) return
    try {
      setIsDeleting(true)
      const res = await fetch(API_ENDPOINTS.PRO.DYNAMIC_RULE(deleteRuleId), { method: 'DELETE' })
      if (res.ok) {
        setDeleteRuleId(null)
        await fetchConfig()
        await runSimulation()
      }
    } catch (err) {
      console.error('Failed to delete rule:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleRuleStatus = async (rule: DynamicRuleRecord) => {
    try {
      await fetch(API_ENDPOINTS.PRO.DYNAMIC_RULE(rule.id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !rule.enabled }),
      })
      await fetchConfig()
      await runSimulation()
    } catch (err) {
      console.error('Failed to toggle rule:', err)
    }
  }

  const handleQuickPreset = (preset: 'now' | 'work' | 'weekend' | 'night' | 'vacation') => {
    const now = new Date()
    let target = new Date()

    if (preset === 'now') {
      target = new Date()
    } else if (preset === 'work') {
      target.setDate(now.getDate() + ((2 + 7 - now.getDay()) % 7))
      target.setHours(14, 30, 0, 0)
    } else if (preset === 'weekend') {
      target.setDate(now.getDate() + ((6 + 7 - now.getDay()) % 7))
      target.setHours(15, 0, 0, 0)
    } else if (preset === 'night') {
      target.setHours(23, 30, 0, 0)
    } else if (preset === 'vacation') {
      target.setMonth(11, 25)
      target.setHours(12, 0, 0, 0)
    }

    const isoString = target.toISOString().slice(0, 16)
    setSimDate(isoString)
    void runSimulation(isoString, simTimezone)
  }

  const dynamicApiUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/${username || 'user'}`
      : `https://gitascii.com/api/${username || 'user'}`

  const profileOptions: CustomSelectOption[] = useMemo(() => {
    return profiles.map((p) => ({
      value: p.slug,
      label: p.name,
      sublabel: `/${p.slug}${p.isDefault ? ' · Default' : ''}`,
      icon: <Layers className="w-3.5 h-3.5 text-[#c5ff4a]" />,
    }))
  }, [profiles])

  const timezoneOptions: CustomSelectOption[] = useMemo(() => {
    return COMMON_TIMEZONES.map((tz) => ({
      value: tz,
      label: tz,
      icon: <Globe className="w-3.5 h-3.5 text-[#8a8a8a]" />,
    }))
  }, [])

  return (
    <div className="space-y-5 w-full">
      <div className="p-4 sm:p-5 rounded-2xl bg-[#111111] border border-white/[0.08] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/5 text-[#c5ff4a] border border-white/10">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-white tracking-tight">
                  {t('pro.dynamic.title', 'Dynamic Profiles Automation Engine')}
                </h3>
                <ProBadge variant={config.enabled ? 'lime' : 'muted'} size="sm">
                  {config.enabled
                    ? t('pro.dynamic.active_badge', 'ACTIVE')
                    : t('pro.dynamic.inactive_badge', 'DISABLED')}
                </ProBadge>
              </div>
              <p className="text-[11px] text-[#8a8a8a] mt-0.5">
                {t(
                  'pro.dynamic.subtitle',
                  'Automatically switch displayed profiles by work hours, weekends, vacations, holidays, and custom events.'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-white/80 font-mono">
              {config.enabled
                ? t('pro.dynamic.enabled', 'Enabled')
                : t('pro.dynamic.disabled', 'Disabled')}
            </span>
            <Switch checked={config.enabled} onChange={handleToggleGlobal} />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#09090b] border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-xs text-white/90">
              <Sparkles className="w-3.5 h-3.5 text-[#c5ff4a]" />
              <span className="font-semibold text-xs">
                {t('pro.dynamic.universal_url_title', 'Universal Dynamic README URL')}
              </span>
              <span className="text-[10px] text-[#7a7a7a] font-mono">
                (
                {t(
                  'pro.dynamic.universal_url_desc',
                  'No profile slug needed — resolves dynamically on every request'
                )}
                )
              </span>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `[![GitAscii Card](${dynamicApiUrl})](https://github.com/${username})`
                )
                setCopiedUrl(true)
                setTimeout(() => setCopiedUrl(false), 2500)
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer border border-white/10"
            >
              {copiedUrl ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              <span>
                {copiedUrl
                  ? t('pro.common.copied', 'Copied!')
                  : t('pro.dynamic.copy_markdown', 'Copy Dynamic Markdown')}
              </span>
            </button>
          </div>

          <div className="font-mono text-[11px] text-[#c5ff4a] break-all select-all">
            {dynamicApiUrl}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-7 space-y-4">
          <RulesTable
            rules={config.rules}
            profiles={profiles}
            onOpenCreateModal={handleOpenCreateModal}
            onOpenEditModal={handleOpenEditModal}
            onToggleRuleStatus={handleToggleRuleStatus}
            onDeleteRule={(id) => setDeleteRuleId(id)}
          />

          <div className="p-4 rounded-xl bg-[#111111] border border-white/[0.08] space-y-3">
            <h4 className="text-xs font-bold text-white">
              {t('pro.dynamic.engine_settings', 'Engine Fallback & Defaults')}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1.5">
                <label className="text-[#8a8a8a] text-[11px] font-medium block">
                  {t('pro.dynamic.fallback_profile', 'Fallback Profile (When no rules match)')}
                </label>
                <CustomSelect
                  options={profileOptions}
                  value={config.fallbackProfileSlug}
                  onChange={(val) => handleSaveSettings({ fallbackProfileSlug: val })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#8a8a8a] text-[11px] font-medium block">
                  {t('pro.dynamic.default_timezone', 'Default Timezone')}
                </label>
                <CustomSelect
                  options={timezoneOptions}
                  value={config.defaultTimezone}
                  onChange={(val) => {
                    handleSaveSettings({ defaultTimezone: val })
                    setSimTimezone(val)
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <DynamicRuleSimulator
            username={username}
            profiles={profiles}
            simDate={simDate}
            setSimDate={setSimDate}
            simTimezone={simTimezone}
            setSimTimezone={setSimTimezone}
            simulating={simulating}
            simResult={simResult}
            timezoneOptions={timezoneOptions}
            onRunSimulation={runSimulation}
            onQuickPreset={handleQuickPreset}
          />
        </div>
      </div>

      <RuleEditorModal
        isOpen={showRuleModal}
        onClose={() => setShowRuleModal(false)}
        editingRule={editingRule}
        profiles={profiles}
        ruleName={ruleName}
        setRuleName={setRuleName}
        targetSlug={targetSlug}
        setTargetSlug={setTargetSlug}
        priority={priority}
        setPriority={setPriority}
        ruleType={ruleType}
        setRuleType={setRuleType}
        daysOfWeek={daysOfWeek}
        setDaysOfWeek={setDaysOfWeek}
        startTime={startTime}
        setStartTime={setStartTime}
        endTime={endTime}
        setEndTime={setEndTime}
        ruleTimezone={ruleTimezone}
        setRuleTimezone={setRuleTimezone}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        eventName={eventName}
        setEventName={setEventName}
        expiresAt={expiresAt}
        setExpiresAt={setExpiresAt}
        description={description}
        setDescription={setDescription}
        ruleSubmitting={ruleSubmitting}
        ruleError={ruleError}
        onSaveRule={handleSaveRule}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteRuleId)}
        title={t('pro.dynamic.delete_rule_title', 'Delete Dynamic Rule')}
        description={t(
          'pro.dynamic.delete_rule_desc',
          'Are you sure you want to permanently delete this dynamic schedule rule?'
        )}
        confirmLabel={t('pro.dynamic.delete_rule_confirm', 'Delete Rule')}
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteRule}
        onCancel={() => setDeleteRuleId(null)}
      />
    </div>
  )
}
