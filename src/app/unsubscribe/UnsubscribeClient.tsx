'use client'

import Link from 'next/link'
import React from 'react'

import { useI18n } from '@/i18n'

interface UnsubscribeClientProps {
  status?: string
  email?: string
  username?: string
}

export function UnsubscribeClient({ status, email, username }: UnsubscribeClientProps) {
  const { t } = useI18n()

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090b] px-4 py-12 text-[#f4f4f5]">
      <div className="w-full max-w-md rounded-xl border border-[#27272a] bg-[#131316] p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between border-b border-[#27272a] pb-4">
          <Link href="/" className="font-mono text-xl font-bold tracking-tight text-white">
            GIT<span className="text-[#c5ff4a]">ASCII</span>
          </Link>
          <span className="rounded bg-[#1f1f23] px-2 py-1 font-mono text-xs text-[#a1a1aa]">
            {t('unsubscribe.badge', 'EMAIL PREFERENCES')}
          </span>
        </div>

        {status === 'success' ? (
          <div>
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1c2e17] text-[#c5ff4a]">
              ✓
            </div>
            <h1 className="mb-2 text-xl font-bold text-white">
              {t('unsubscribe.success_title', 'You have been unsubscribed')}
            </h1>
            <p className="mb-6 text-sm text-[#a1a1aa]">
              {email
                ? t(
                    'unsubscribe.success_desc_email',
                    '{email} will no longer receive product updates or re-engagement notifications from GitAscii.',
                    { email }
                  )
                : t(
                    'unsubscribe.success_desc',
                    'You will no longer receive marketing or product notifications from GitAscii.'
                  )}
            </p>
            <div className="rounded-lg border border-[#27272a] bg-[#18181c] p-4 text-xs text-[#71717a]">
              {t(
                'unsubscribe.security_notice',
                'Important account security alerts and essential transactional confirmations will still be delivered if triggered by your direct actions.'
              )}
            </div>
          </div>
        ) : status === 'invalid' ? (
          <div>
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#331b1b] text-[#ef4444]">
              !
            </div>
            <h1 className="mb-2 text-xl font-bold text-white">
              {t('unsubscribe.invalid_title', 'Invalid or Expired Link')}
            </h1>
            <p className="mb-6 text-sm text-[#a1a1aa]">
              {t(
                'unsubscribe.invalid_desc',
                'The unsubscribe link you followed is invalid or has expired. If you wish to manage your preferences, please ensure you are using the link provided in the latest email.'
              )}
            </p>
          </div>
        ) : (
          <div>
            <h1 className="mb-2 text-xl font-bold text-white">
              {t('unsubscribe.manage_title', 'Manage Notification Preferences')}
            </h1>
            <p className="mb-6 text-sm text-[#a1a1aa]">
              {username
                ? t('unsubscribe.preferences_for', 'Preferences for @{username}:', {
                    username,
                  })
                : t('unsubscribe.email_settings', 'Your email settings:')}
            </p>
            <p className="text-xs text-[#71717a]">
              {t(
                'unsubscribe.footer_hint',
                'To unsubscribe from any email list, click the unsubscribe link in the footer of that email.'
              )}
            </p>
          </div>
        )}

        <div className="mt-8 border-t border-[#27272a] pt-6 text-center">
          <Link
            href="/"
            className="inline-block rounded-lg bg-[#c5ff4a] px-6 py-2.5 text-sm font-bold text-[#09090b] transition hover:bg-[#d6ff70]"
          >
            {t('unsubscribe.return_button', 'Return to GitAscii')}
          </Link>
        </div>
      </div>
    </div>
  )
}
