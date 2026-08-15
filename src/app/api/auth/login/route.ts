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
  const redirectTo = searchParams.get('redirect_to') || '/'

  const githubAuthUrl = API_ENDPOINTS.GITHUB.OAUTH_AUTHORIZE(clientId, redirectTo)

  return NextResponse.redirect(githubAuthUrl)
}
