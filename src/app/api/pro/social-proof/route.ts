import { NextResponse } from 'next/server'

import { getProSocialProof } from '@/features/pro/server/socialProofStore'

export const revalidate = 600 // 10 minutes ISR

export async function GET() {
  try {
    const data = await getProSocialProof()
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=60',
      },
    })
  } catch {
    return NextResponse.json({ count: 0, usernames: [] })
  }
}
