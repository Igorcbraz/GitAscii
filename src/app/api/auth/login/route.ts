import crypto from 'crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { API_ENDPOINTS } from '@/services/endpoints'

export async function GET(request: Request) {
  const clientId = process.env.GITHUB_CLIENT_ID
  if (!clientId) {
    return NextResponse.json(
      { error: 'GitHub Client ID is not configured on the server.' },
      { status: 500 }
    )
  }

  const { searchParams } = new URL(request.url)
  const rawRedirect = searchParams.get('redirect_to') || '/'
  const safeRedirect =
    rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') && !rawRedirect.includes('\\')
      ? rawRedirect
      : '/'

  const nonce = crypto.randomBytes(24).toString('hex')
  const statePayload = `${nonce}:${Buffer.from(safeRedirect, 'utf8').toString('base64url')}`

  const cookieStore = await cookies()
  cookieStore.set({
    name: 'oauth_state',
    value: nonce,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600, // 10 minutes
  })

  const githubAuthUrl = API_ENDPOINTS.GITHUB.OAUTH_AUTHORIZE(clientId, statePayload)

  return NextResponse.redirect(githubAuthUrl)
}
