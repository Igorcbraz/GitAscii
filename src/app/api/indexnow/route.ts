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
    })

    return NextResponse.json({
      success: true,
      status: res.status,
      submittedUrls: urlList.length,
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to submit IndexNow request' },
      { status: 500 }
    )
  }
}
