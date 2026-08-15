import { NextResponse } from 'next/server'

import { fetchGitHubProfile } from '@/features/github/api/fetchProfile'
import { loadProfileConfig } from '@/lib/profileStorage'
import { generateProfileSvgResponse } from '@/services/profileSvgService'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string; profileSlug: string }> }
) {
  const { username, profileSlug } = await params

  if (username.toLowerCase() === 'github') {
    const actualUsername = profileSlug
    try {
      const data = await fetchGitHubProfile(actualUsername)
      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch GitHub profile'
      return NextResponse.json({ error: message }, { status: 500 })
    }
  }

  if (username.toLowerCase() === 'config') {
    const actualUsername = profileSlug
    const config = await loadProfileConfig(actualUsername, 'default')
    if (!config) {
      return NextResponse.json({ error: 'Config not found' }, { status: 404 })
    }
    return NextResponse.json(config, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  }

  return generateProfileSvgResponse(request, {
    username,
    profileSlug: profileSlug || 'default',
  })
}
