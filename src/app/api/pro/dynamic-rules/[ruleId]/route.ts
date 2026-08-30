import { NextResponse } from 'next/server'

import { deleteDynamicRule, updateDynamicRule } from '@/features/pro/server/dynamicRulesStore'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function PATCH(request: Request, { params }: { params: Promise<{ ruleId: string }> }) {
  const session = await getSession()
  if (!session || !session.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { ruleId } = await params

  try {
    const body = await request.json()
    const updated = await updateDynamicRule(session.username, ruleId, body)
    if (!updated) {
      return NextResponse.json({ error: 'Dynamic rule not found' }, { status: 404 })
    }
    return NextResponse.json({ rule: updated })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update dynamic rule'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ ruleId: string }> }
) {
  const session = await getSession()
  if (!session || !session.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { ruleId } = await params

  try {
    await deleteDynamicRule(session.username, ruleId)
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete dynamic rule'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
