import { NextResponse } from 'next/server'

import { setSession } from '@/lib/auth'
import { API_ENDPOINTS } from '@/services/endpoints'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state') || '/'

    if (!code) {
      return NextResponse.json({ error: 'Authorization code is missing' }, { status: 400 })
    }

    const clientId = process.env.GITHUB_CLIENT_ID
    const clientSecret = process.env.GITHUB_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'GitHub Client ID or Client Secret is not configured.' },
        { status: 500 }
      )
    }

    const tokenResponse = await fetch(API_ENDPOINTS.GITHUB.OAUTH_ACCESS_TOKEN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
      signal: AbortSignal.timeout(8000),
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for access token')
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    if (!accessToken) {
      return NextResponse.json(
        { error: 'GitHub authorization failed (no access token)' },
        { status: 400 }
      )
    }

    const userResponse = await fetch(API_ENDPOINTS.GITHUB.CURRENT_USER, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'GitAscii-App',
      },
      signal: AbortSignal.timeout(8000),
    })

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user details from GitHub')
    }

    const userData = await userResponse.json()

    if (!userData.login || !userData.id) {
      throw new Error('Invalid user details returned from GitHub')
    }

    await setSession({
      username: userData.login,
      githubId: userData.id,
      accessToken: accessToken,
    })

    const origin = new URL(request.url).origin
    let finalState = state
    if (finalState === '/') {
      finalState = `/${userData.login}`
    }
    const redirectUrl = finalState.startsWith('/') ? `${origin}${finalState}` : finalState

    return NextResponse.redirect(redirectUrl)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error during OAuth callback'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
