import { NextResponse } from 'next/server'

import { getSession } from '@/lib/auth'
import { saveProfileConfig } from '@/lib/profileStorage'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in to save' },
        { status: 401 }
      )
    }

    const body = await request.json()
    if (!body || !body.username) {
      return NextResponse.json({ error: 'Invalid configuration' }, { status: 400 })
    }

    if (session.username.toLowerCase() !== body.username.toLowerCase()) {
      return NextResponse.json(
        { error: 'Forbidden: You cannot modify other users profiles' },
        { status: 403 }
      )
    }

    await saveProfileConfig(body)

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save profile config'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
