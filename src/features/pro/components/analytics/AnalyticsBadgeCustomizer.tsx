'use client'

import { Check, ExternalLink, EyeOff, Loader2, ScanEye } from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n'
import type { BadgeStyle } from '@/lib/analytics/telemetryBadge'

export interface BadgeStatus {
  installed: boolean
  canWrite: boolean
  installUrl?: string | null
  style?: BadgeStyle
}

interface Props {
  profile: string
  status: BadgeStatus | null
  style: BadgeStyle
  onStyleChange: (style: BadgeStyle) => void
  onApply: () => void
  onCheck: () => void
  saving: boolean
  checking: boolean
  error: string | null
}

const styles: BadgeStyle[] = ['classic', 'compact', 'outline', 'transparent']

export const AnalyticsBadgeCustomizer: React.FC<Props> = ({
  profile,
  status,
  style,
  onStyleChange,
  onApply,
  onCheck,
  saving,
  checking,
  error,
}) => {
  const { t } = useI18n()
  const showActions =
    status !== null && (!status.installed || style !== (status.style || 'classic'))
  const showRecheck = showActions || Boolean(error)
  return (
    <section id="badge" className="space-y-3 scroll-mt-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <ScanEye className="w-4 h-4 text-[#c5ff4a]" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
            {t('pro.analytics.badge_title', 'Analytics badge')}
          </h2>
        </div>
        <span
          className={`text-[10px] font-mono px-1.5 py-0.5 border rounded ${status?.installed ? 'text-[#c5ff4a] border-[#c5ff4a]/40' : 'text-amber-300 border-amber-300/30'}`}
        >
          {checking
            ? t('pro.analytics.badge_checking', 'Checking README…')
            : status?.installed
              ? t('pro.analytics.badge_active', 'Installed')
              : t('pro.analytics.badge_missing', 'Not installed')}
        </span>
      </div>
      <p className="text-xs text-[#a4a4a4] max-w-3xl leading-relaxed">
        {t(
          'pro.analytics.badge_desc',
          'Choose how the tracking image appears in your GitHub profile README. Every style records badge fetches, usually GitHub Camo refreshes rather than exact human views.'
        )}
      </p>

      <div
        role="radiogroup"
        aria-label={t('pro.analytics.badge_style', 'Badge style')}
        className="grid grid-cols-2 xl:grid-cols-4 gap-2"
      >
        {styles.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={style === option}
            onClick={() => onStyleChange(option)}
            className={`min-h-24 text-left p-3 border rounded-md transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#c5ff4a] ${style === option ? 'border-[#c5ff4a] bg-[#c5ff4a]/[0.06]' : 'border-white/10 bg-[#101010] hover:border-white/25'}`}
          >
            <span className="flex justify-between text-sm text-white font-medium">
              {option === 'classic'
                ? t('pro.analytics.badge_classic', 'Classic')
                : option === 'compact'
                  ? t('pro.analytics.badge_compact', 'Compact')
                  : option === 'outline'
                    ? t('pro.analytics.badge_outline', 'Outline')
                    : t('pro.analytics.badge_invisible', 'Invisible')}
              {style === option && <Check className="w-4 h-4 text-[#c5ff4a]" />}
            </span>
            <span className="block text-xs text-[#a4a4a4] mt-1">
              {option === 'transparent'
                ? t('pro.analytics.badge_invisible_desc', 'Transparent 1×1 image')
                : option === 'classic'
                  ? t('pro.analytics.badge_classic_desc', 'Full-width dark badge')
                  : option === 'compact'
                    ? t('pro.analytics.badge_compact_desc', 'Small signature')
                    : t('pro.analytics.badge_outline_desc', 'Light framed badge')}
            </span>
            <span className="mt-2 flex h-6 items-center justify-center">
              {option === 'transparent' ? (
                <EyeOff className="w-4 h-4 text-[#a4a4a4]" aria-hidden="true" />
              ) : (
                <span
                  className={`inline-flex items-center justify-center text-[10px] tracking-wide ${option === 'compact' ? 'w-32' : 'w-full'} h-5 rounded ${option === 'outline' ? 'border border-[#c5ff4a]/60 text-white' : 'bg-[#0a0a0c] text-[#a4a4a4]'}`}
                >
                  made with <strong className="ml-1 text-[#c5ff4a]">GitAscii</strong>
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      {showRecheck && (
        <div className="flex flex-wrap items-center gap-2.5">
          {showActions && (
            <button
              type="button"
              onClick={onApply}
              disabled={!status.canWrite || saving || checking}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[#c5ff4a] text-black text-xs font-semibold disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {status.installed
                ? t('pro.analytics.badge_update', 'Update README badge')
                : t('pro.analytics.badge_add', 'Add badge to README')}
            </button>
          )}
          <button
            type="button"
            onClick={onCheck}
            disabled={checking}
            className="text-xs text-[#a4a4a4] underline underline-offset-4 hover:text-white disabled:opacity-50 cursor-pointer"
          >
            {t('pro.analytics.badge_recheck', 'Check README again')}
          </button>
          {status?.installUrl && (
            <a
              href={status.installUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-[#c5ff4a] underline underline-offset-4"
            >
              {t('pro.analytics.badge_connect', 'Connect GitHub App')}{' '}
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <span className="sm:ml-auto text-[11px] text-[#8a8a8a]">
            {t('pro.analytics.badge_profile_scope', 'README profile:')}{' '}
            <code className="text-[#c5ff4a]">{profile}</code>
          </span>
        </div>
      )}
      {status && !status.canWrite && !checking && !status.installUrl && !error && (
        <p className="text-xs text-amber-300">
          {t(
            'pro.analytics.badge_readme_missing',
            'Create your GitHub profile README first, then check again.'
          )}
        </p>
      )}
      {error && (
        <p role="alert" className="text-xs text-rose-300">
          {error}
        </p>
      )}
    </section>
  )
}
