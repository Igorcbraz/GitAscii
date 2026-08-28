import { NextResponse } from 'next/server'

import { deleteWidgetErrors, resolveWidgetError } from '@/features/pro/server/errorTrackerStore'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ errorId: string }> }
) {
  const session = await getSession()
  if (!session || !session.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { errorId } = await params

  try {
    const success = await resolveWidgetError(session.username, errorId)
    if (!success) {
      return NextResponse.json({ error: 'Error not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to resolve error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ errorId: string }> }
) {
  const session = await getSession()
  if (!session || !session.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { errorId } = await params

  try {
    await deleteWidgetErrors(session.username, [errorId])
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
