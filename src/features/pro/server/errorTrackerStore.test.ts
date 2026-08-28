import { beforeEach, describe, expect, it } from 'vitest'

import {
  clearAllWidgetErrors,
  deleteWidgetErrors,
  getWidgetErrors,
  recordWidgetError,
  resolveWidgetError,
} from './errorTrackerStore'
import { resetProRedisMemoryStoreForTesting } from './redisClient'

describe('ErrorTrackerStore Comprehensive Unit Tests', () => {
  beforeEach(() => {
    resetProRedisMemoryStoreForTesting()
  })

  it('records new widget errors with active status and 1 occurrence', async () => {
    const username = 'DevTester'

    await recordWidgetError({
      username,
      profileSlug: 'default',
      widgetId: 'wakatime-stats',
      widgetName: 'WakaTime Coding Activity',
      errorType: 'RATE_LIMITED',
      message: 'Rate limit exceeded on WakaTime API',
      details: 'HTTP 429 Too Many Requests',
    })

    const errors = await getWidgetErrors(username)
    expect(errors.length).toBe(1)
    expect(errors[0].id).toBe('err_default_wakatime-stats')
    expect(errors[0].widgetName).toBe('WakaTime Coding Activity')
    expect(errors[0].status).toBe('active')
    expect(errors[0].occurrences).toBe(1)
    expect(errors[0].details).toBe('HTTP 429 Too Many Requests')
    expect(errors[0].resolvedAt).toBeNull()
  })

  it('re-opens a previously resolved error and increments occurrences on duplicate trigger', async () => {
    const username = 'DevTester2'

    await recordWidgetError({
      username,
      profileSlug: 'default',
      widgetId: 'stats',
      widgetName: 'Stats Card',
      errorType: 'FETCH_TIMEOUT',
      message: 'Initial timeout',
    })

    await resolveWidgetError(username, 'err_default_stats')
    let list = await getWidgetErrors(username)
    expect(list[0].status).toBe('resolved')
    expect(list[0].resolvedAt).not.toBeNull()

    await recordWidgetError({
      username,
      profileSlug: 'default',
      widgetId: 'stats',
      widgetName: 'Stats Card',
      errorType: 'FETCH_TIMEOUT',
      message: 'Timeout occurred again',
    })

    list = await getWidgetErrors(username)
    expect(list[0].status).toBe('active')
    expect(list[0].occurrences).toBe(2)
    expect(list[0].message).toBe('Timeout occurred again')
  })

  it('deletes specific widget error IDs', async () => {
    const username = 'DeleteTester'

    await recordWidgetError({
      username,
      profileSlug: 'default',
      widgetId: 'widget-1',
      errorType: 'FETCH_TIMEOUT',
      message: 'Error 1',
    })
    await recordWidgetError({
      username,
      profileSlug: 'default',
      widgetId: 'widget-2',
      errorType: 'NETWORK_ERROR',
      message: 'Error 2',
    })

    let errors = await getWidgetErrors(username)
    expect(errors.length).toBe(2)

    await deleteWidgetErrors(username, ['err_default_widget-1'])
    errors = await getWidgetErrors(username)
    expect(errors.length).toBe(1)
    expect(errors[0].widgetId).toBe('widget-2')
  })

  it('clears all widget errors for a user', async () => {
    const username = 'ClearTester'

    await recordWidgetError({
      username,
      profileSlug: 'default',
      widgetId: 'w1',
      errorType: 'PARSING_ERROR',
      message: 'A',
    })
    await recordWidgetError({
      username,
      profileSlug: 'default',
      widgetId: 'w2',
      errorType: 'UNAUTHORIZED',
      message: 'B',
    })

    await clearAllWidgetErrors(username)
    const errors = await getWidgetErrors(username)
    expect(errors.length).toBe(0)
  })

  it('returns empty array when user has no errors logged', async () => {
    const errors = await getWidgetErrors('non_existent_user')
    expect(errors).toEqual([])
  })
})
