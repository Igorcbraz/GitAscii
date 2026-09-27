import { NextResponse } from 'next/server'

import {
  getUserProfiles,
  promoteProfileToCanonicalDefault,
} from '@/features/pro/server/profileManagerStore'
import { getSession } from '@/lib/auth'
import { promoteProfileToDefaultV2 } from '@/lib/v2/profilePublisher'

export const dynamic = 'force-dynamic'

export async function POST(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getSession()
  if (!session || !session.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await params

  try {
    if (slug.toLowerCase().trim() === 'default') {
      return NextResponse.json({
        profiles: await getUserProfiles(session.username),
        defaultSlug: 'default',
      })
    }
    const snapshot = await promoteProfileToDefaultV2(session.username, slug)
    const updatedProfiles = await promoteProfileToCanonicalDefault(session.username, slug, snapshot)
    return NextResponse.json({ profiles: updatedProfiles, defaultSlug: 'default' })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to set default profile'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
