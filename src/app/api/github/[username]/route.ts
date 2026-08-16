import { NextResponse } from 'next/server'

import { fetchGitHubProfile, GitHubUserNotFoundError } from '@/features/github/api/fetchProfile'

export async function GET(request: Request, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    const data = await fetchGitHubProfile(username)

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error: unknown) {
    const isNotFound =
      error instanceof GitHubUserNotFoundError ||
      (error instanceof Error && error.message.toLowerCase().includes('not found'))
    const message = error instanceof Error ? error.message : 'Failed to fetch GitHub profile'
    return NextResponse.json({ error: message }, { status: isNotFound ? 404 : 500 })
  }
}
