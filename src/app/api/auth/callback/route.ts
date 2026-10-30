import crypto from 'crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { GITHUB_OAUTH, OAUTH_ERROR, OAUTH_STAGE, type OAuthStage } from '@/constants/auth'
import { setSession } from '@/lib/auth'
import { API_ENDPOINTS } from '@/services/endpoints'
import {
  exchangeGithubOAuthCode,
  fetchGithubOAuthEmail,
  fetchGithubOAuthProfile,
  logGithubOAuthWarning,
} from '@/services/githubOAuth'

export async function GET(request: Request) {
  const cookieStore = await cookies()
  const startedAt = Date.now()
  let stage: OAuthStage = OAUTH_STAGE.VALIDATION
  let customRedirectPath = '/'
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code) {
      return NextResponse.json({ error: 'Authorization code is missing' }, { status: 400 })
    }

    if (!state) {
      return NextResponse.json(
        { error: 'State parameter is missing (CSRF validation failed)' },
        { status: 400 }
      )
    }

    const savedStateCookie = cookieStore.get(GITHUB_OAUTH.stateCookie)
    const savedNonce = savedStateCookie?.value
    cookieStore.delete(GITHUB_OAUTH.stateCookie)

    if (!savedNonce) {
      return NextResponse.json(
        { error: 'OAuth session expired or missing state cookie' },
        { status: 403 }
      )
    }

    const [receivedNonce, redirectB64] = state.split(':')
    if (
      !receivedNonce ||
      receivedNonce.length !== savedNonce.length ||
      !crypto.timingSafeEqual(Buffer.from(receivedNonce), Buffer.from(savedNonce))
    ) {
      return NextResponse.json(
        { error: 'Invalid OAuth state parameter (CSRF validation failed)' },
        { status: 403 }
      )
    }

    if (redirectB64) {
      try {
        const decoded = Buffer.from(redirectB64, 'base64url').toString('utf8')
        if (decoded.startsWith('/') && !decoded.startsWith('//') && !decoded.includes('\\')) {
          customRedirectPath = decoded
        }
      } catch (error) {
        logGithubOAuthWarning('Invalid redirect payload; using home', error)
        customRedirectPath = '/'
      }
    }

    const clientId = process.env.GITHUB_CLIENT_ID
    const clientSecret = process.env.GITHUB_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'GitHub Client ID or Client Secret is not configured.' },
        { status: 500 }
      )
    }

    stage = OAUTH_STAGE.TOKEN_EXCHANGE
    const accessToken = await exchangeGithubOAuthCode({ clientId, clientSecret, code })

    if (!accessToken) {
      return NextResponse.json(
        { error: 'GitHub authorization failed (no access token)' },
        { status: 400 }
      )
    }

    stage = OAUTH_STAGE.USER_PROFILE
    const userData = await fetchGithubOAuthProfile(accessToken)

    stage = OAUTH_STAGE.SESSION
    const userEmail = userData.email || (await fetchGithubOAuthEmail(accessToken))

    await setSession({
      username: userData.login,
      githubId: userData.id,
      email: userEmail,
      name: userData.name || userData.login,
      accessToken: accessToken,
    })

    try {
      const { ensureUser } = await import('@/lib/db/repositories/userRepository')
      await ensureUser(userData.login, {
        githubId: userData.id,
        email: userEmail,
        name: userData.name || userData.login,
      })
    } catch (dbErr) {
      logGithubOAuthWarning('Non-blocking DB user creation failed', dbErr)
    }

    try {
      const { getProRedisClient } = await import('@/features/pro/server/redisClient')
      const redis = getProRedisClient()
      await redis.sadd(GITHUB_OAUTH.allUsersKey, userData.login.toLowerCase())
    } catch (error) {
      logGithubOAuthWarning('Non-blocking user index update failed', error)
    }

    if (userEmail) {
      const { emailService } = await import('@/lib/email/service')
      void emailService
        .sendWelcomeEmail({
          username: userData.login,
          email: userEmail,
          name: userData.name || userData.login,
        })
        .catch((err) => {
          logGithubOAuthWarning('Non-blocking welcome email failed', err)
        })
    }

    const origin = new URL(request.url).origin
    const safePath = customRedirectPath === '/' ? `/${userData.login}` : customRedirectPath
    const redirectUrl = new URL(safePath, origin).toString()

    return NextResponse.redirect(redirectUrl)
  } catch (error: unknown) {
    const errorName = error instanceof Error ? error.name : 'UnknownError'
    console.error('[OAuth Callback] Login failed', {
      stage,
      errorName,
      elapsedMs: Date.now() - startedAt,
    })
    if (
      errorName === OAUTH_ERROR.TIMEOUT_NAME &&
      (stage === OAUTH_STAGE.TOKEN_EXCHANGE || stage === OAUTH_STAGE.USER_PROFILE)
    ) {
      return NextResponse.json(
        {
          error: OAUTH_ERROR.TIMEOUT_MESSAGE,
          code: OAUTH_ERROR.TIMEOUT_CODE,
          stage,
          retryUrl: API_ENDPOINTS.AUTH.LOGIN(customRedirectPath),
        },
        { status: 504, headers: { 'Cache-Control': 'no-store' } }
      )
    }
    return NextResponse.json({ error: OAUTH_ERROR.UNEXPECTED_MESSAGE }, { status: 500 })
  }
}
