import * as core from '@actions/core'

export interface TelemetryPayload {
  repository: string
  workflow: string
  runId: string
  revision: string
  durationMs: number
  status: 'published' | 'svg_unchanged' | 'skipped_stale' | 'failed'
  hasErrors: boolean
  failedUrls?: string[]
  profileSlug?: string
  profiles?: Array<{
    slug: string
    status: 'published' | 'svg_unchanged' | 'skipped_stale' | 'failed'
    hasErrors: boolean
    failedUrls?: string[]
  }>
}

export async function sendProTelemetry(
  telemetryUrl: string,
  payload: TelemetryPayload
): Promise<void> {
  try {
    let idToken: string | undefined
    try {
      idToken = await core.getIDToken('gitascii-pro')
    } catch {
      return
    }

    if (!idToken) return

    const res = await fetch(telemetryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
        'User-Agent': 'GitAscii-Action',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) {
      console.log(`[Telemetry] Pro telemetry endpoint returned HTTP ${res.status}`)
    }
  } catch (err) {
    console.log(
      '[Telemetry] Telemetry submission skipped:',
      err instanceof Error ? err.message : String(err)
    )
  }
}

export async function getPublishPolicy(telemetryUrl: string): Promise<number> {
  try {
    const idToken = await core.getIDToken('gitascii-pro')
    if (!idToken) return 1440
    const res = await fetch(telemetryUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ status: 'policy_check', repository: process.env.GITHUB_REPOSITORY }),
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return 1440
    const data = await res.json()
    return Math.max(60, Number(data.minimumIntervalMinutes) || 1440)
  } catch {
    return 1440
  }
}
