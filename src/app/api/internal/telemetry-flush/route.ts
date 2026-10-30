import { flushQueuedTelemetry } from '@/features/pro/server/telemetryQueueRedis'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Optional hourly scheduler/manual drain. It does not bypass the shared hourly budget.
export async function POST(request: Request) {
  const secret = process.env.TELEMETRY_CRON_SECRET || process.env.CRON_SECRET
  if (!secret?.trim()) return Response.json({ error: 'Not configured' }, { status: 503 })
  if (request.headers.get('authorization') !== `Bearer ${secret}`)
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    return Response.json(
      { processed: await flushQueuedTelemetry() },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch {
    return Response.json(
      { error: 'Telemetry drain unavailable; queued batches retained' },
      { status: 503 }
    )
  }
}
