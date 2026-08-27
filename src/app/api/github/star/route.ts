import { NextResponse } from 'next/server'

import { EXTERNAL_LINKS } from '@/constants/links'
import { getSession } from '@/lib/auth'
import { API_ENDPOINTS } from '@/services/endpoints'

const REPO_URL = EXTERNAL_LINKS.GITHUB_REPO

export async function GET() {
  let stargazersCount: number | null = null

  try {
    const repoRes = await fetch(API_ENDPOINTS.GITHUB.GITASCII_REPO, {
      headers: {
        'User-Agent': 'GitAscii-App',
        Accept: 'application/vnd.github.v3+json',
      },
      next: { revalidate: 300 },
    })
    if (repoRes.ok) {
      const repoData = await repoRes.json()
      stargazersCount =
        typeof repoData.stargazers_count === 'number' ? repoData.stargazers_count : null
    }
  } catch {}

  try {
    const session = await getSession()
    if (!session || !session.accessToken) {
      return NextResponse.json({
        starred: false,
        authenticated: false,
        repoUrl: REPO_URL,
        stargazersCount,
      })
    }

    const response = await fetch(API_ENDPOINTS.GITHUB.GITASCII_STAR_STATUS, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'User-Agent': 'GitAscii-App',
        Accept: 'application/vnd.github.v3+json',
      },
      cache: 'no-store',
    })

    if (response.status === 204) {
      return NextResponse.json({
        starred: true,
        authenticated: true,
        repoUrl: REPO_URL,
        stargazersCount,
      })
    }

    return NextResponse.json({
      starred: false,
      authenticated: true,
      repoUrl: REPO_URL,
      stargazersCount,
    })
  } catch (error) {
    console.error('Error checking GitHub star status:', error)
    return NextResponse.json({
      starred: false,
      authenticated: false,
      repoUrl: REPO_URL,
      stargazersCount,
    })
  }
}

export async function POST() {
  try {
    const session = await getSession()
    if (!session || !session.accessToken) {
      return NextResponse.json({
        success: false,
        fallbackUrl: REPO_URL,
        reason: 'unauthenticated',
      })
    }

    const response = await fetch(API_ENDPOINTS.GITHUB.GITASCII_STAR_STATUS, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'User-Agent': 'GitAscii-App',
        Accept: 'application/vnd.github.v3+json',
        'Content-Length': '0',
      },
      cache: 'no-store',
    })

    if (response.status === 204 || response.ok) {
      if (session.email) {
        const { emailService } = await import('@/lib/email/service')
        void emailService
          .sendStarThankYouEmail({
            username: session.username,
            name: session.name,
            email: session.email,
            repoUrl: REPO_URL,
          })
          .catch((err) => {
            console.error('[Star Route] Non-blocking star thank-you email error:', err)
          })
      }

      return NextResponse.json({
        success: true,
        starred: true,
        repoUrl: REPO_URL,
      })
    }

    return NextResponse.json({
      success: false,
      fallbackUrl: REPO_URL,
      reason: 'scope_or_forbidden',
      status: response.status,
    })
  } catch (error) {
    console.error('Error starring GitHub repo:', error)
    return NextResponse.json({
      success: false,
      fallbackUrl: REPO_URL,
      reason: 'error',
    })
  }
}
