import { NextResponse } from 'next/server'

import { generateProfileSvgResponse } from '@/services/profileSvgService'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string; profileSlug: string }> }
) {
  const { username, profileSlug } = await params

  if (username === 'badge') {
    return new NextResponse('Not found', { status: 404 })
  }

  return generateProfileSvgResponse(request, {
    username,
    profileSlug: profileSlug || 'default',
  })
}
