import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'

import { APP_DOMAIN } from '@/constants'
import { API_ENDPOINTS } from '@/services/endpoints'

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const secretHeader = request.headers.get('x-indexnow-secret')
    const configuredSecret = process.env.INDEXNOW_SECRET

    if (!configuredSecret) {
      return NextResponse.json({ error: 'IndexNow secret is not configured' }, { status: 500 })
    }

    const isAuthorized =
      secretHeader === configuredSecret || authHeader === `Bearer ${configuredSecret}`
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const host = APP_DOMAIN
    const key = process.env.INDEXNOW_KEY || 'gitascii2026indexnowkey'

    const defaultUrls = [
      `https://${host}/`,
      `https://${host}/templates`,
      `https://${host}/widgets`,
      `https://${host}/explore`,
      `https://${host}/guides`,
      `https://${host}/vs`,
    ]

    let incomingUrls: string[] = defaultUrls
    if (Array.isArray(body.urlList) && body.urlList.length > 0) {
      incomingUrls = body.urlList
    }

    const validatedUrls = incomingUrls
      .slice(0, 100)
      .filter((u): u is string => typeof u === 'string')
      .map((u) => u.trim())
      .filter((u) => {
        try {
          const parsed = new URL(u)
          const isDomainMatch =
            parsed.hostname.toLowerCase() === host.toLowerCase() ||
            (process.env.NODE_ENV === 'development' && parsed.hostname === 'localhost')
          const isProtocolMatch = parsed.protocol === 'https:' || parsed.protocol === 'http:'
          return isDomainMatch && isProtocolMatch
        } catch {
          return false
        }
      })

    if (validatedUrls.length === 0) {
      return NextResponse.json(
        { error: `No valid URLs provided matching domain ${host}` },
        { status: 400 }
      )
    }

    const indexNowPayload = {
      host,
      key,
      keyLocation: `https://${host}/${key}.txt`,
      urlList: validatedUrls,
    }

    const res = await fetch(API_ENDPOINTS.INDEXNOW.SUBMIT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(indexNowPayload),
      signal: AbortSignal.timeout(6000),
    })

    return NextResponse.json({
      success: true,
      status: res.status,
      submittedUrls: validatedUrls.length,
    })
  } catch (error: unknown) {
    Sentry.captureException(error)
    const message = error instanceof Error ? error.message : 'Failed to submit IndexNow request'
    console.error('IndexNow submission error:', error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
