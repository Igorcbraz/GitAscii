import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockedGetIdToken } = vi.hoisted(() => ({
  mockedGetIdToken: vi.fn(),
}))

vi.mock('@actions/core', () => ({
  getIDToken: mockedGetIdToken,
}))

import {
  DEFAULT_PUBLISH_INTERVAL_MINUTES,
  getPublishPolicy,
  sendProTelemetry,
} from './oidcTelemetry'

const telemetryPayload = {
  repository: 'owner/repo',
  workflow: 'Publish',
  runId: '42',
  revision: 'abc123',
  durationMs: 120,
  status: 'published' as const,
  hasErrors: false,
}

describe('Pro Action OIDC telemetry contract', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    mockedGetIdToken.mockReset()
  })

  it('does not call telemetry without an OIDC token', async () => {
    mockedGetIdToken.mockRejectedValue(new Error('OIDC unavailable'))
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    await expect(
      sendProTelemetry('https://example.test/telemetry', telemetryPayload)
    ).resolves.toBeUndefined()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('sends the signed payload with the expected contract', async () => {
    mockedGetIdToken.mockResolvedValue('signed-token')
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 204 }))

    await sendProTelemetry('https://example.test/telemetry', telemetryPayload)

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [, init] = fetchSpy.mock.calls[0]
    expect(init?.method).toBe('POST')
    expect(init?.headers).toMatchObject({ Authorization: 'Bearer signed-token' })
    expect(JSON.parse(String(init?.body))).toEqual(telemetryPayload)
  })

  it('does not fail publication when telemetry is unavailable', async () => {
    mockedGetIdToken.mockResolvedValue('signed-token')
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network unavailable'))

    await expect(
      sendProTelemetry('https://example.test/telemetry', telemetryPayload)
    ).resolves.toBeUndefined()
  })

  it('enforces the server minimum interval and falls back safely', async () => {
    mockedGetIdToken.mockResolvedValue('signed-token')
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ minimumIntervalMinutes: 180 }), { status: 200 })
      )
      .mockResolvedValueOnce(new Response(null, { status: 503 }))

    await expect(getPublishPolicy('https://example.test/telemetry')).resolves.toBe(180)
    await expect(getPublishPolicy('https://example.test/telemetry')).resolves.toBe(
      DEFAULT_PUBLISH_INTERVAL_MINUTES
    )
    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })
})
