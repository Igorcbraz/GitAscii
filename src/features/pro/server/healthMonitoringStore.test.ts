import { beforeEach, describe, expect, it } from 'vitest'

import {
  getHealthHistory,
  getOverallHealth,
  getProfileHealthList,
  getWidgetHealthList,
  recordRenderTelemetry,
  simulateHealthIncident,
} from './healthMonitoringStore'
import { resetProRedisMemoryStoreForTesting } from './redisClient'

describe('HealthMonitoringStore Unit Tests', () => {
  beforeEach(() => {
    resetProRedisMemoryStoreForTesting()
  })

  it('computes 100% operational health for fresh user without errors', async () => {
    const username = 'HealthyUser'
    const health = await getOverallHealth(username)

    expect(health.status).toBe('operational')
    expect(health.overallHealthScore).toBe(100)
    expect(health.errorsLast24h).toBe(0)
    expect(health.activeIncidentsCount).toBe(0)
    expect(health.healthHistory.length).toBe(30)
  })

  it('records render telemetry and updates widget performance metrics', async () => {
    const username = 'TelemetryUser'

    // Successful render
    await recordRenderTelemetry({
      username,
      profileSlug: 'default',
      durationMs: 45,
      statusCode: 200,
      hasErrors: false,
      renderedWidgets: ['avatar-card', 'stats-cards'],
    })

    const widgets = await getWidgetHealthList(username, 'default')
    const avatarWidget = widgets.find((w) => w.widgetId === 'avatar-card')

    expect(avatarWidget).toBeDefined()
    expect(avatarWidget?.status).toBe('operational')
    expect(avatarWidget?.successRate).toBe(100)
    expect(avatarWidget?.totalRenders).toBe(1)
  })

  it('updates status to warning or failed when render errors occur', async () => {
    const username = 'TroubledUser'

    // Record failure
    await recordRenderTelemetry({
      username,
      profileSlug: 'default',
      durationMs: 5000,
      statusCode: 500,
      hasErrors: true,
      renderedWidgets: ['streak-graph'],
      widgetErrors: [
        {
          username,
          profileSlug: 'default',
          widgetId: 'streak-graph',
          widgetName: 'Streak Graph',
          errorType: 'FETCH_TIMEOUT',
          message: 'Upstream server did not reply',
        },
      ],
    })

    const overall = await getOverallHealth(username)
    expect(overall.errorsLast24h).toBe(1)
    expect(overall.activeIncidentsCount).toBe(1)
    expect(['warning', 'failed']).toContain(overall.status)

    const profilesHealth = await getProfileHealthList(username)
    expect(profilesHealth.length).toBeGreaterThanOrEqual(1)
  })

  it('simulates health incident and returns updated metrics immediately', async () => {
    const username = 'SimUser'

    const simulated = await simulateHealthIncident(username, {
      widgetId: 'contribution-snake',
      widgetName: 'Contribution Snake',
      profileSlug: 'default',
      errorType: 'PARSING_ERROR',
      message: 'Failed to parse malformed SVG from CDN',
    })

    expect(simulated.errorsLast24h).toBe(1)
    expect(simulated.activeIncidentsCount).toBe(1)

    const history = await getHealthHistory(username, 30)
    expect(history.length).toBe(30)
    const today = history[history.length - 1]
    expect(today.failedRenders).toBe(1)
  })
})
