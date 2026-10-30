'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

import { useI18n } from '@/i18n'

interface Connection {
  id: string
  name: string
  scopes: string[]
  created_at: string
  expires_at: string
}

export function ConnectionsPanel({
  endpoint,
  username,
  enabled,
}: {
  endpoint: string
  username: string
  enabled: boolean
}) {
  const { t } = useI18n()
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const loadError = t(
    'automation.connections.load_error',
    'Could not load connected apps. Try again.'
  )
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/account/connections', { cache: 'no-store' })
      if (!response.ok) throw new Error()
      const data = await response.json()
      setConnections(data.connections)
      setError('')
    } catch {
      setError(loadError)
    } finally {
      setLoading(false)
    }
  }, [loadError])
  useEffect(() => {
    void load()
  }, [load])
  const revoke = async (id: string) => {
    setBusy(id)
    try {
      const response = await fetch('/api/account/connections', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!response.ok) throw new Error()
      setConnections((current) => current.filter((c) => c.id !== id))
      setError('')
    } catch {
      setError(t('automation.connections.revoke_error', 'Could not revoke access. Try again.'))
    } finally {
      setBusy(null)
    }
  }
  return (
    <main className="min-h-screen bg-void-black px-6 py-12 text-chalk">
      <div className="mx-auto max-w-3xl space-y-10">
        <nav className="flex flex-wrap gap-6 text-sm text-signal-lime">
          <Link href={`/${username}`} className="underline underline-offset-4">
            {t('automation.back_editor', 'Back to editor')}
          </Link>
          <Link href="/pro" className="underline underline-offset-4">
            GitAscii Pro
          </Link>
        </nav>
        <header className="space-y-3">
          <h1 className="text-heading-sm font-semibold">
            {t('automation.connections.title', 'Connected apps')}
          </h1>
          <p className="max-w-2xl text-ash">
            {t(
              'automation.connections.description',
              'Use your editor and Pro tools from an assistant, with the same account and limits. You can always continue in the browser.'
            )}
          </p>
        </header>
        <section aria-labelledby="connect-heading" className="space-y-5">
          <h2 id="connect-heading" className="text-subheading font-semibold">
            {t('automation.connections.connect', 'Connect an assistant')}
          </h2>
          {!enabled && (
            <p role="status" className="text-ash">
              {t(
                'automation.connections.disabled',
                'New assistant connections are not enabled on this deployment yet.'
              )}
            </p>
          )}
          <label className="block space-y-2">
            <span className="text-sm text-ash">
              {t('automation.connections.url', 'Server URL')}
            </span>
            <input
              readOnly
              value={endpoint}
              onFocus={(event) => event.currentTarget.select()}
              className="w-full rounded border border-graphite bg-onyx p-3 font-jetbrains-mono text-sm focus:border-signal-lime focus:outline-none"
            />
          </label>
          <button
            disabled={!enabled}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(endpoint)
                setCopied(true)
              } catch {
                setError(
                  t('automation.connections.copy_error', 'Select and copy the server URL above.')
                )
              }
            }}
            className="rounded border border-graphite px-4 py-2 hover:border-signal-lime focus-visible:outline-2 focus-visible:outline-signal-lime disabled:opacity-50"
          >
            {copied
              ? t('automation.copied', 'Copied')
              : t('automation.connections.copy', 'Copy server URL')}
          </button>
          <ol className="list-inside list-decimal space-y-3 text-ash">
            <li>
              {t(
                'automation.connections.step1',
                'Add this URL in your assistant’s MCP or integrations settings.'
              )}
            </li>
            <li>
              {t(
                'automation.connections.step2',
                'Sign in to GitAscii and review the requested permissions.'
              )}
            </li>
            <li>
              {t(
                'automation.connections.step3',
                'Ask your assistant to analyze your GitHub profile or edit a shared draft.'
              )}
            </li>
          </ol>
          <p className="text-sm text-ash">
            {t(
              'automation.connections.drafts',
              'In the editor, use Shared draft to save changes for your assistant or load its changes. Saving a draft does not publish to GitHub.'
            )}
          </p>
        </section>
        <section aria-labelledby="apps-heading" className="border-t border-graphite pt-8">
          <h2 id="apps-heading" className="mb-5 text-subheading font-semibold">
            {t('automation.connections.apps', 'Applications with access')}
          </h2>
          <div aria-live="polite" aria-busy={loading} className="min-h-20">
            {loading && <p className="text-ash">{t('automation.loading', 'Loading…')}</p>}
            {!loading && !error && connections.length === 0 && (
              <p className="text-ash">
                {t(
                  'automation.connections.empty',
                  'No applications are connected to your account.'
                )}
              </p>
            )}
            {connections.map((connection) => (
              <article
                key={connection.id}
                className="flex flex-wrap items-start justify-between gap-4 border-b border-graphite py-5"
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <h3 className="break-words font-semibold">{connection.name}</h3>
                  <p className="break-words text-sm text-ash">{connection.scopes.join(' · ')}</p>
                  <p className="text-sm text-ash">
                    {t('automation.connections.expires', 'Expires')}:{' '}
                    {new Date(connection.expires_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  disabled={busy !== null}
                  onClick={() => void revoke(connection.id)}
                  className="rounded border border-graphite px-4 py-2 hover:border-chalk disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-signal-lime"
                >
                  {busy === connection.id
                    ? t('automation.saving', 'Saving…')
                    : t('automation.connections.revoke', 'Revoke access')}
                </button>
              </article>
            ))}
          </div>
          {error && (
            <div role="alert" className="mt-4 space-y-3">
              <p>{error}</p>
              <button onClick={() => void load()} className="text-signal-lime underline">
                {t('automation.retry', 'Try again')}
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
