'use client'

import Link from 'next/link'
import { useState } from 'react'

import { useI18n } from '@/i18n'

const labels: Record<string, [string, string]> = {
  'account:read': ['automation.scope.account', 'Read your identity, plan and account limits'],
  'profiles:read': ['automation.scope.read', 'Read your profiles, drafts and public GitHub data'],
  'profiles:write': ['automation.scope.write', 'Create profiles and edit shared drafts'],
  'profiles:publish': [
    'automation.scope.publish',
    'Publish profiles and modify your GitHub README and workflow',
  ],
  'analytics:read': ['automation.scope.analytics', 'Read Pro analytics and publication health'],
  'rules:write': ['automation.scope.rules', 'Manage profile schedules and refresh settings'],
}

export function ConsentForm({
  ticket,
  clientName,
  callbackHost,
  username,
  scopes,
}: {
  ticket: string
  clientName: string
  callbackHost: string
  username: string
  scopes: string[]
}) {
  const { t } = useI18n()
  const [submitting, setSubmitting] = useState(false)
  const [failed, setFailed] = useState(false)
  return (
    <main className="min-h-screen bg-void-black px-6 py-16 text-chalk">
      <div className="mx-auto max-w-xl space-y-8">
        <Link href={`/${username}`} className="text-signal-lime underline underline-offset-4">
          GitAscii
        </Link>
        <div className="space-y-4">
          <h1 className="text-heading-sm font-semibold">
            {t('automation.consent.title', 'Connect your assistant')}
          </h1>
          <p className="text-ash">
            {t(
              'automation.consent.request',
              'This application is requesting access to your GitAscii account:'
            )}
          </p>
          <p className="break-words text-subheading font-semibold">{clientName}</p>
          <p className="break-words text-sm text-ash">
            {t('automation.consent.callback', 'After authorization, you will return to:')}{' '}
            <strong className="text-chalk">{callbackHost}</strong>
          </p>
          <p className="text-ash">
            {t('automation.consent.account', 'Signed in as')}{' '}
            <strong className="text-chalk">@{username}</strong>
          </p>
        </div>
        <ul className="space-y-3 border-y border-graphite py-6">
          {scopes.map((scope) => (
            <li key={scope}>{labels[scope] ? t(...labels[scope]) : scope}</li>
          ))}
        </ul>
        <p className="text-sm text-ash">
          {t(
            'automation.consent.note',
            'Only connect applications you trust. You can revoke access in Connected apps. Purchases stay on the GitAscii website.'
          )}
        </p>
        <form
          action="/oauth/consent"
          method="POST"
          className="flex flex-wrap gap-3"
          onSubmit={async (event) => {
            event.preventDefault()
            const data = new FormData(
              event.currentTarget,
              (event.nativeEvent as SubmitEvent).submitter
            )
            const body = new URLSearchParams()
            data.forEach((value, key) => {
              if (typeof value === 'string') body.set(key, value)
            })
            setSubmitting(true)
            setFailed(false)
            try {
              const response = await fetch('/oauth/consent', {
                method: 'POST',
                headers: { Accept: 'application/json' },
                body,
              })
              if (!response.ok) throw new Error()
              const result = await response.json()
              // A navigation after fetch avoids CSP form-action restrictions on cross-origin redirects.
              window.location.assign(result.redirectTo)
            } catch {
              setFailed(true)
              setSubmitting(false)
            }
          }}
        >
          <input type="hidden" name="ticket" value={ticket} />
          <button
            type="submit"
            name="decision"
            value="allow"
            disabled={submitting}
            className="rounded border border-signal-lime bg-signal-lime px-6 py-3 font-semibold text-void-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal-lime"
          >
            {t('automation.consent.allow', 'Allow access')}
          </button>
          <button
            type="submit"
            name="decision"
            value="deny"
            disabled={submitting}
            className="rounded border border-graphite px-6 py-3 hover:border-ash focus-visible:outline-2 focus-visible:outline-signal-lime"
          >
            {t('automation.consent.deny', 'Cancel')}
          </button>
        </form>
        {failed && (
          <p role="alert">
            {t(
              'automation.consent.error',
              'Authorization failed or expired. Reconnect from your assistant to try again.'
            )}
          </p>
        )}
      </div>
    </main>
  )
}
