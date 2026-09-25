import { NextResponse } from 'next/server'

import { isProUser } from '@/features/pro/server/entitlements'
import {
  getTelemetryStyle,
  hasTelemetryBadge,
  isBadgeStyle,
  upsertTelemetryBlock,
} from '@/lib/analytics/telemetryBadge'
import { getSession } from '@/lib/auth'
import { getInstallationTokenForUser } from '@/lib/githubApp'
import { API_ENDPOINTS } from '@/services/endpoints'

export const dynamic = 'force-dynamic'

function validSlug(value: unknown): value is string {
  return typeof value === 'string' && /^[a-z0-9_-]{1,50}$/.test(value)
}

async function context() {
  const session = await getSession()
  if (!session?.username)
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  if (!(await isProUser(session.username))) {
    return { error: NextResponse.json({ error: 'Pro subscription required' }, { status: 403 }) }
  }
  return { username: session.username.toLowerCase() }
}

async function readReadme(username: string, token: string) {
  const endpoint = API_ENDPOINTS.GITHUB.REPO_CONTENTS(username, username, 'README.md')
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'GitAscii-App',
    },
    cache: 'no-store',
  })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`GitHub README unavailable (${response.status})`)
  const file = await response.json()
  if (typeof file.content !== 'string' || typeof file.sha !== 'string') {
    throw new Error('GitHub README response is invalid')
  }
  return {
    content: Buffer.from(file.content.replace(/\s/g, ''), 'base64').toString('utf8'),
    sha: file.sha as string,
    endpoint,
  }
}

export async function GET(request: Request) {
  const auth = await context()
  if (auth.error) return auth.error
  const username = auth.username!
  const slug = new URL(request.url).searchParams.get('profile') || 'default'
  if (!validSlug(slug)) return NextResponse.json({ error: 'Invalid profile' }, { status: 400 })

  const { token, installUrl } = await getInstallationTokenForUser(username)
  if (!token) {
    if (!installUrl) {
      return NextResponse.json({ error: 'Unable to connect to GitHub App' }, { status: 502 })
    }
    return NextResponse.json({ installed: false, canWrite: false, installUrl })
  }
  try {
    const readme = await readReadme(username, token)
    return NextResponse.json({
      installed: readme ? hasTelemetryBadge(readme.content, username, slug) : false,
      style: readme ? getTelemetryStyle(readme.content, username, slug) : 'classic',
      canWrite: Boolean(readme),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to inspect README'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}

export async function PUT(request: Request) {
  const auth = await context()
  if (auth.error) return auth.error
  const username = auth.username!
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  const body = payload as { profile?: unknown; style?: unknown }
  const slug = body?.profile || 'default'
  if (!validSlug(slug) || !isBadgeStyle(body?.style)) {
    return NextResponse.json({ error: 'Invalid badge settings' }, { status: 400 })
  }
  const { token, installUrl } = await getInstallationTokenForUser(username)
  if (!token)
    return NextResponse.json({ error: 'GitHub App required', installUrl }, { status: 403 })

  try {
    const readme = await readReadme(username, token)
    if (!readme) return NextResponse.json({ error: 'Profile README.md not found' }, { status: 404 })
    const updated = upsertTelemetryBlock(readme.content, username, slug, body.style)
    if (updated !== readme.content) {
      const response = await fetch(readme.endpoint, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'GitAscii-App',
        },
        body: JSON.stringify({
          message: `Update GitAscii analytics badge (${slug})`,
          content: Buffer.from(updated, 'utf8').toString('base64'),
          sha: readme.sha,
        }),
      })
      if (!response.ok) {
        return NextResponse.json(
          { error: `GitHub could not update README (${response.status})` },
          { status: response.status === 409 ? 409 : 502 }
        )
      }
    }
    return NextResponse.json({ installed: true, style: body.style, canWrite: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update README'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
