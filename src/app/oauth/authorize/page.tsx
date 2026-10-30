import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { ConsentForm } from '@/features/automation/components/ConsentForm'
import { requireAutomation } from '@/features/automation/config'
import { consentTicket, validateAuthorization } from '@/features/automation/oauth'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Connect your assistant',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

export default async function AuthorizePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  requireAutomation()
  const params = await searchParams
  const { value, scopes, clientName } = await validateAuthorization(params)
  const session = await getSession()
  if (!session) {
    const query = new URLSearchParams(
      Object.entries(params).filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string'
      )
    )
    redirect(`/api/auth/login?redirect_to=${encodeURIComponent(`/oauth/authorize?${query}`)}`)
  }
  return (
    <ConsentForm
      ticket={consentTicket(value, session.githubId)}
      clientName={clientName}
      callbackHost={new URL(value.redirect_uri).host}
      username={session.username}
      scopes={scopes}
    />
  )
}
