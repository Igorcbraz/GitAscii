import { NextResponse } from 'next/server'

import { deleteProfile, updateProfile } from '@/features/pro/server/profileManagerStore'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getSession()
  if (!session || !session.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await params

  try {
    const body = await request.json()
    const updated = await updateProfile(session.username, slug, body)
    if (!updated) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }
    return NextResponse.json({ profile: updated })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update profile'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getSession()
  if (!session || !session.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await params

  try {
    await deleteProfile(session.username, slug)
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete profile'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
