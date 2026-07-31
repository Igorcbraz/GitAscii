import fs from 'fs'
import { NextResponse } from 'next/server'
import path from 'path'

export const dynamic = 'force-static'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'llms.txt')
    const content = fs.readFileSync(filePath, 'utf8')
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      },
    })
  } catch {
    return new NextResponse('# GitAscii — GitHub Profile README & ASCII Art Generator\n', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }
}
