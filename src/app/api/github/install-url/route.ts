import { NextResponse } from 'next/server'

import { getAppInstallUrl } from '@/lib/githubApp'

export async function GET() {
  const url = await getAppInstallUrl()
  return NextResponse.json({ url })
}
