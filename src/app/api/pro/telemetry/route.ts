import { NextResponse } from 'next/server'

import { getProEntitlements, getUserSettings } from '@/features/pro/server/entitlements'
import { recordRenderTelemetry } from '@/features/pro/server/healthMonitoringStore'
import { verifyGitHubOidcToken } from '@/lib/githubOidc'

export const dynamic = 'force-dynamic'

export interface ProTelemetryBody {
  repository: string
  workflow?: string
  runId?: string
  revision?: string
  durationMs?: number
  status: 'published' | 'svg_unchanged' | 'skipped_stale' | 'failed' | 'policy_check'
  hasErrors?: boolean
  failedUrls?: string[]
  profileSlug?: string
  profiles?: Array<{
    slug: string
    status?: string
    hasErrors?: boolean
    failedUrls?: string[]
  }>
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing or invalid Bearer token' },
        { status: 401 }
      )
    }

    const idToken = authHeader.replace(/^Bearer\s+/i, '').trim()
    const verification = await verifyGitHubOidcToken(idToken, 'gitascii-pro')

    if (!verification.valid || !verification.claims) {
      return NextResponse.json(
        { error: `Unauthorized: ${verification.error || 'Invalid OIDC token'}` },
        { status: 401 }
      )
    }

    const claims = verification.claims
    const body: ProTelemetryBody = await request.json().catch(() => ({}) as ProTelemetryBody)

    const rawOwner = claims.repository_owner || body.repository?.split('/')[0] || ''
    const username = rawOwner.toLowerCase().trim()

    if (!username) {
      return NextResponse.json(
        { error: 'Bad Request: Unable to determine repository owner' },
        { status: 400 }
      )
    }

    if (body.status === 'policy_check') {
      const entitlements = await getProEntitlements(username)
      const settings = await getUserSettings(username)
      return NextResponse.json({
        success: true,
        tier: entitlements.tier,
        minimumIntervalMinutes:
          entitlements.tier === 'free'
            ? 1440
            : Math.max(60, settings.publishIntervalMinutes || 1440),
      })
    }

    const entitlements = await getProEntitlements(username)
    if (entitlements.tier === 'free') {
      return NextResponse.json({ success: true, recorded: false, reason: 'pro_required' })
    }

    const durationMs = Math.max(1, Math.round(body.durationMs || 100))
    const isSuccess = body.status === 'published' || body.status === 'svg_unchanged'
    const statusCode = isSuccess && !body.hasErrors ? 200 : 500

    const profileList =
      Array.isArray(body.profiles) && body.profiles.length > 0
        ? body.profiles
        : [
            {
              slug: (body.profileSlug || 'default').toLowerCase().trim(),
              status: body.status,
              hasErrors: Boolean(body.hasErrors),
              failedUrls: body.failedUrls,
            },
          ]

    for (const prof of profileList) {
      const slug = (prof.slug || 'default').toLowerCase().trim()
      const profHasErrors = Boolean(prof.hasErrors || body.hasErrors)
      const profFailedUrls = prof.failedUrls || body.failedUrls || []

      const widgetErrors =
        profFailedUrls.length > 0
          ? profFailedUrls.map((url, idx) => {
              let hostname = 'invalid-url'
              try {
                hostname = new URL(url).hostname || hostname
              } catch {}
              return {
                username,
                profileSlug: slug,
                widgetId: `external-widget-${idx + 1}`,
                widgetName: `External Asset (${hostname})`,
                errorType: 'FETCH_TIMEOUT' as const,
                message: `Failed to fetch external asset from ${url}`,
                details: `OIDC Telemetry reported failed asset: ${url}`,
              }
            })
          : undefined

      await recordRenderTelemetry({
        username,
        profileSlug: slug,
        durationMs,
        statusCode: profHasErrors ? 500 : statusCode,
        hasErrors: profHasErrors,
        renderedWidgets: [],
        widgetErrors,
      })
    }

    return NextResponse.json({
      success: true,
      recorded: true,
      repository: claims.repository,
      owner: username,
      status: body.status,
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
