import { NextResponse } from 'next/server'

import { getProEntitlements } from '@/features/pro/server/entitlements'
import { createProfile, getUserProfiles } from '@/features/pro/server/profileManagerStore'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()
  if (!session || !session.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const profiles = await getUserProfiles(session.username)
    return NextResponse.json({ profiles })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch profiles'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session || !session.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { slug, name, description } = body

    if (!slug || !name) {
      return NextResponse.json({ error: 'Slug and Name are required' }, { status: 400 })
    }

    const entitlements = await getProEntitlements(session.username)
    const existing = await getUserProfiles(session.username)

    if (existing.length >= entitlements.maxProfiles) {
      return NextResponse.json(
        {
          error: `You have reached the maximum number of profiles (${entitlements.maxProfiles}) for your plan.`,
        },
        { status: 403 }
      )
    }

    const newProfile = await createProfile(session.username, { slug, name, description })
    return NextResponse.json({ profile: newProfile }, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create profile'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
