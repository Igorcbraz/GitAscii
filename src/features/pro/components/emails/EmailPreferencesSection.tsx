'use client'

import { Bell, CheckCircle2 } from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n'

interface EmailPreferencesSectionProps {
  emailAlertsEnabled: boolean
  setEmailAlertsEnabled: (val: boolean) => void
  digestEnabled: boolean
  setDigestEnabled: (val: boolean) => void
  alertEmail: string
  setAlertEmail: (val: string) => void
  savingAlerts: boolean
  alertSaveSuccess: boolean
  onSaveSettings: () => void
}

export const EmailPreferencesSection: React.FC<EmailPreferencesSectionProps> = ({
  emailAlertsEnabled,
  setEmailAlertsEnabled,
  digestEnabled,
  setDigestEnabled,
  alertEmail,
  setAlertEmail,
  savingAlerts,
  alertSaveSuccess,
  onSaveSettings,
}) => {
  const { t } = useI18n()

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
        <Bell className="w-3.5 h-3.5 text-[#c5ff4a]" />
        <h3 className="text-xs font-bold text-white">
          {t('pro.health.alert_settings_title', 'Incident & Failure Email Alerts')}
        </h3>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-white">
            {t('pro.health.enable_alerts', 'Instant Failure Alerts')}
          </p>
          <p className="text-[11px] text-[#5a5a5a]">
            {t(
              'pro.health.enable_alerts_desc',
              'Receive instant email notifications when a widget in your GitHub README fails or times out.'
            )}
          </p>
        </div>
        <input
          type="checkbox"
          checked={emailAlertsEnabled}
          onChange={(e) => setEmailAlertsEnabled(e.target.checked)}
          className="w-4 h-4 rounded text-[#c5ff4a] accent-[#c5ff4a] cursor-pointer shrink-0"
        />
      </div>

      <div className="border-t border-white/[0.05]" />

      <div className="flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-white">
            {t('pro.emails.weekly_digest_title', 'Weekly Telemetry Digest')}
          </p>
          <p className="text-[11px] text-[#5a5a5a]">
            {t(
              'pro.emails.weekly_digest_desc',
              'Receive weekly summary emails with profile impressions, health uptime, and top referral stats.'
            )}
          </p>
        </div>
        <input
          type="checkbox"
          checked={digestEnabled}
          onChange={(e) => setDigestEnabled(e.target.checked)}
          className="w-4 h-4 rounded text-[#c5ff4a] accent-[#c5ff4a] cursor-pointer shrink-0"
        />
      </div>

      <div className="border-t border-white/[0.05]" />

      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-[#7a7a7a]">
          {t('pro.health.recipient_email', 'Alert Recipient Email')}
        </label>
        <input
          type="email"
          value={alertEmail}
          onChange={(e) => setAlertEmail(e.target.value)}
          placeholder={t('pro.emails.email_placeholder', 'developer@example.com')}
          className="w-full px-3 py-2 rounded bg-white/[0.04] border border-white/[0.08] text-white font-mono text-xs focus:border-[#c5ff4a]/60 focus:outline-none transition-colors"
        />
      </div>

      <p className="text-[11px] text-[#5a5a5a] leading-relaxed">
        <span className="text-[#7a7a7a] font-semibold">
          {t('pro.emails.antispam_title', 'Anti-Spam Rate Limiting:')}{' '}
        </span>
        {t(
          'pro.emails.antispam_desc',
          'Alerts are strictly deduplicated with a 1-hour cooldown per widget to prevent inbox spam during transient network outages.'
        )}
      </p>

      <div className="flex items-center justify-end gap-3 pt-1">
        {alertSaveSuccess && (
          <span className="text-emerald-400 font-mono text-xs flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t('pro.emails.save_success', 'Preferences saved successfully!')}
          </span>
        )}
        <button
          onClick={onSaveSettings}
          disabled={savingAlerts}
          className="px-4 py-1.5 text-xs font-semibold text-black bg-[#c5ff4a] hover:bg-[#b0f533] rounded cursor-pointer transition-colors"
        >
          {savingAlerts
            ? t('pro.common.saving', 'Saving...')
            : t('pro.common.save', 'Save Preferences')}
        </button>
      </div>
    </div>
  )
}
