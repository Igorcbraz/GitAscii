import { NextResponse } from 'next/server'

import { publishProfileRequest } from '@/features/github/server/publishProfile'
import { getSession } from '@/lib/auth'

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return publishProfileRequest(request, session)
}
