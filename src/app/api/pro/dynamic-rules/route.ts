import { NextResponse } from 'next/server'

import {
  createDynamicRule,
  getDynamicRulesConfig,
  saveDynamicRulesConfig,
} from '@/features/pro/server/dynamicRulesStore'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()
  if (!session || !session.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const config = await getDynamicRulesConfig(session.username)
    return NextResponse.json(config)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch dynamic rules'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session || !session.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      name,
      targetProfileSlug,
      priority,
      type,
      daysOfWeek,
      startTime,
      endTime,
      timezone,
      startDate,
      endDate,
      eventName,
      expiresAt,
      description,
    } = body

    if (!name || !targetProfileSlug) {
      return NextResponse.json(
        { error: 'Rule name and target profile slug are required' },
        { status: 400 }
      )
    }

    const newRule = await createDynamicRule(session.username, {
      name,
      targetProfileSlug,
      priority: priority !== undefined ? Number(priority) : 50,
      enabled: true,
      type: type || 'work_hours',
      daysOfWeek,
      startTime,
      endTime,
      timezone,
      startDate,
      endDate,
      eventName,
      expiresAt,
      description,
    })

    return NextResponse.json({ rule: newRule }, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create dynamic rule'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const session = await getSession()
  if (!session || !session.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const updatedConfig = await saveDynamicRulesConfig(session.username, body)
    return NextResponse.json(updatedConfig)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update dynamic config'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
