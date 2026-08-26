import { NextResponse } from 'next/server'

import { getAppBaseUrl } from '@/lib/email/client'
import { emailService } from '@/lib/email/service'
import { verifyUnsubscribeToken } from '@/lib/email/tokens'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const baseUrl = getAppBaseUrl()

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/unsubscribe?status=invalid`)
  }

  const payload = verifyUnsubscribeToken(token)
  if (!payload) {
    return NextResponse.redirect(`${baseUrl}/unsubscribe?status=invalid`)
  }

  emailService.unsubscribe(payload.email, payload.username)

  return NextResponse.redirect(
    `${baseUrl}/unsubscribe?status=success&email=${encodeURIComponent(payload.email)}&username=${encodeURIComponent(payload.username)}`
  )
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Missing unsubscribe token' }, { status: 400 })
  }

  const payload = verifyUnsubscribeToken(token)
  if (!payload) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
  }

  emailService.unsubscribe(payload.email, payload.username)

  return NextResponse.json({
    success: true,
    message: 'Successfully unsubscribed from GitAscii notifications',
    email: payload.email,
  })
}
