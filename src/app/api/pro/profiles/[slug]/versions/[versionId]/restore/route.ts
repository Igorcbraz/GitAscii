import { NextResponse } from 'next/server'

import { restoreProfileVersion } from '@/features/pro/server/profileManagerStore'
import { getSession } from '@/lib/auth'
import { publishStoredProfileV2 } from '@/lib/v2/profilePublisher'

export const dynamic = 'force-dynamic'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string; versionId: string }> }
) {
  const session = await getSession()
  if (!session || !session.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug, versionId } = await params

  try {
    const result = await restoreProfileVersion(session.username, slug, versionId)
    await publishStoredProfileV2(session.username, slug)
    return NextResponse.json(result)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to restore version snapshot'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
