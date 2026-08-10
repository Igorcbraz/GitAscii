import { NextResponse } from 'next/server'

import { loadProfileConfig } from '@/lib/profileStorage'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string; profileSlug: string }> }
) {
  try {
    const { username, profileSlug } = await params

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    const config = await loadProfileConfig(username, profileSlug || 'default')

    if (!config) {
      return NextResponse.json({ error: 'Config not found' }, { status: 404 })
    }

    return NextResponse.json(config, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch config'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
