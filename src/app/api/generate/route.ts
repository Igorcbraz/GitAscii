import { NextResponse } from 'next/server'

import { generateBestProfile } from '@/engine/generate/profileAnalyzer'
import { fetchGitHubProfile } from '@/features/github/api/fetchProfile'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username } = body

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
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
