import * as core from '@actions/core'

export interface TelemetryPayload {
  repository: string
  workflow: string
  runId: string
  revision: string
  durationMs: number
  status: 'published' | 'svg_unchanged' | 'failed'
  hasErrors: boolean
  failedUrls?: string[]
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
