import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { ConnectionsPanel } from '@/features/automation/components/ConnectionsPanel'
import { appOrigin } from '@/features/automation/config'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Connected apps',
  robots: { index: false, follow: false },
}

export default async function ConnectionsPage() {
  const session = await getSession()
  if (!session) redirect('/api/auth/login?redirect_to=%2Fsettings%2Fconnections')
  return (
    <ConnectionsPanel
      endpoint={`${appOrigin()}/mcp`}
      username={session.username}
      enabled={process.env.GITASCII_MCP_ENABLED === 'true'}
    />
  )
}
