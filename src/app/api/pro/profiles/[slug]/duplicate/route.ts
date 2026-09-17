import { NextResponse } from 'next/server'

import { duplicateProfile } from '@/features/pro/server/profileManagerStore'
import { getSession } from '@/lib/auth'
import { publishStoredProfileV2 } from '@/lib/v2/profilePublisher'

export const dynamic = 'force-dynamic'

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getSession()
  if (!session || !session.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await params

  try {
    const body = await request.json()
    const { targetSlug, name, description } = body

    if (!targetSlug || !name) {
      return NextResponse.json({ error: 'Destination slug and name are required' }, { status: 400 })
    }

    const duplicated = await duplicateProfile(session.username, slug, {
      slug: targetSlug,
      name,
      description,
    })
    await publishStoredProfileV2(session.username, duplicated.slug)

    return NextResponse.json({ profile: duplicated }, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to duplicate profile'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
