import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const state = url.searchParams.get('state')

  if (state) {
    return NextResponse.redirect(new URL(`/${state}`, request.url))
  }

  return NextResponse.redirect(new URL('/', request.url))
}
