import { NextResponse } from 'next/server'

import { setDefaultProfile } from '@/features/pro/server/profileManagerStore'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getSession()
  if (!session || !session.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await params

  try {
    const updatedProfiles = await setDefaultProfile(session.username, slug)
    return NextResponse.json({ profiles: updatedProfiles, defaultSlug: slug })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to set default profile'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
