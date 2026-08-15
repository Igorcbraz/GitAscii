import { NextResponse } from 'next/server'

import { generateBestProfile } from '@/engine/generate/profileAnalyzer'
import { fetchGitHubProfile } from '@/features/github/api/fetchProfile'

export async function POST(request: Request) {
  try {
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body in request' }, { status: 400 })
    }

    const { username } = body

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: 'Username is required and must be a string' },
        { status: 400 }
      )
    }

    const data = await fetchGitHubProfile(username)
    const config = generateBestProfile(data)

    return NextResponse.json({
      config,
      data,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate best profile'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
