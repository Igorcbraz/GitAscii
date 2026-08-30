import { NextResponse } from 'next/server'

import { createProfileVersion, getProfileVersions } from '@/features/pro/server/profileManagerStore'
import { getSession } from '@/lib/auth'
import { loadProfileConfig } from '@/lib/profileStorage'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getSession()
  if (!session || !session.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await params

  try {
    const versions = await getProfileVersions(session.username, slug)
    return NextResponse.json({ versions })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch versions'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getSession()
  if (!session || !session.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await params

  try {
    const body = await request.json().catch(() => ({}))
    const { label, description } = body

    const config = body.config || (await loadProfileConfig(session.username, slug))

    if (!config) {
      return NextResponse.json(
        { error: 'Cannot create snapshot without active configuration' },
        { status: 400 }
      )
    }

    const version = await createProfileVersion(session.username, slug, {
      config,
      label: label || 'Manual Snapshot',
      description,
      createdBy: session.username,
    })

    return NextResponse.json({ version }, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create version snapshot'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
