import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const host = 'git-ascii.vercel.app'
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

    const res = await fetch('https://api.indexnow.org/indexnow', {
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
