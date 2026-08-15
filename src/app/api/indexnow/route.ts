import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'

import { APP_DOMAIN } from '@/constants'
import { API_ENDPOINTS } from '@/services/endpoints'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const host = APP_DOMAIN
    const key = process.env.INDEXNOW_KEY || 'gitascii2026indexnowkey'

    const urlList = body.urlList || [
      `https://${host}/`,
      `https://${host}/templates`,
      `https://${host}/widgets`,
      `https://${host}/explore`,
      `https://${host}/guides`,
      `https://${host}/vs`,
    ]

    const indexNowPayload = {
      host,
      key,
      keyLocation: `https://${host}/${key}.txt`,
      urlList,
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
      submittedUrls: urlList.length,
    })
  } catch (error: unknown) {
    Sentry.captureException(error)
    const message = error instanceof Error ? error.message : 'Failed to submit IndexNow request'
    console.error('IndexNow submission error:', error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
