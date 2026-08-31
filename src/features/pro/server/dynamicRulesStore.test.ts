import { beforeEach, describe, expect, it } from 'vitest'

import {
  createDynamicRule,
  deleteDynamicRule,
  evaluateDynamicProfile,
  getDynamicRulesConfig,
  saveDynamicRulesConfig,
  updateDynamicRule,
} from './dynamicRulesStore'
import { resetProRedisMemoryStoreForTesting } from './redisClient'

describe('DynamicRulesStore Unit & Engine Evaluation Tests', () => {
  beforeEach(() => {
    resetProRedisMemoryStoreForTesting()
  })

  it('loads empty default dynamic rules configuration', async () => {
    const username = 'DynamicUser'
    const config = await getDynamicRulesConfig(username)

    expect(config.enabled).toBe(false)
    expect(config.fallbackProfileSlug).toBe('default')
    expect(config.rules).toEqual([])
  })

  it('creates, updates and deletes dynamic rules', async () => {
    const username = 'RuleManager'

    const rule = await createDynamicRule(username, {
      name: 'Work Hours Layout',
      targetProfileSlug: 'work',
      priority: 80,
      type: 'work_hours',
      startTime: '09:00',
      endTime: '18:00',
      daysOfWeek: [1, 2, 3, 4, 5],
    })

    expect(rule.id).toBeDefined()
    expect(rule.name).toBe('Work Hours Layout')
    expect(rule.priority).toBe(80)

    const updated = await updateDynamicRule(username, rule.id, {
      priority: 90,
      name: 'Work Hours Prime',
    })

    expect(updated?.priority).toBe(90)
    expect(updated?.name).toBe('Work Hours Prime')

    const configAfterUpdate = await getDynamicRulesConfig(username)
    expect(configAfterUpdate.rules.length).toBe(1)

    const deleted = await deleteDynamicRule(username, rule.id)
    expect(deleted).toBe(true)

    const configAfterDelete = await getDynamicRulesConfig(username)
    expect(configAfterDelete.rules.length).toBe(0)
  })

  it('evaluates fallback profile when dynamic rules are disabled or empty', async () => {
    const username = 'FallbackTester'
    const result = await evaluateDynamicProfile(username)

    expect(result.isFallback).toBe(true)
    expect(result.selectedProfileSlug).toBe('default')
    expect(result.evaluationReason).toContain('Fallback')
  })

  it('evaluates work_hours rule correctly in specified timezone', async () => {
    const username = 'WorkScheduleUser'
    await saveDynamicRulesConfig(username, { enabled: true, fallbackProfileSlug: 'default' })

    await createDynamicRule(username, {
      name: 'Work Hours',
      targetProfileSlug: 'work-focus',
      priority: 50,
      enabled: true,
      type: 'work_hours',
      startTime: '09:00',
      endTime: '18:00',
      daysOfWeek: [1, 2, 3, 4, 5],
      timezone: 'America/Sao_Paulo',
    })

    // Tuesday at 14:00 (inside work hours)
    const workMatch = await evaluateDynamicProfile(username, {
      simulatedDate: '2026-09-01T14:00:00',
      simulatedTimezone: 'America/Sao_Paulo',
    })

    expect(workMatch.isFallback).toBe(false)
    expect(workMatch.selectedProfileSlug).toBe('work-focus')
    expect(workMatch.matchedRule?.name).toBe('Work Hours')

    // Saturday at 14:00 (outside work hours)
    const weekendFallback = await evaluateDynamicProfile(username, {
      simulatedDate: '2026-09-05T14:00:00',
      simulatedTimezone: 'America/Sao_Paulo',
    })

    expect(weekendFallback.isFallback).toBe(true)
    expect(weekendFallback.selectedProfileSlug).toBe('default')
  })

  it('evaluates weekend rule correctly', async () => {
    const username = 'WeekendUser'
    await saveDynamicRulesConfig(username, { enabled: true, fallbackProfileSlug: 'default' })

    await createDynamicRule(username, {
      name: 'Relax Weekend',
      targetProfileSlug: 'gaming-weekend',
      priority: 60,
      enabled: true,
      type: 'weekend',
      daysOfWeek: [0, 6],
    })

    // Sunday
    const sundayMatch = await evaluateDynamicProfile(username, {
      simulatedDate: '2026-09-06T15:00:00',
      simulatedTimezone: 'UTC',
    })

    expect(sundayMatch.isFallback).toBe(false)
    expect(sundayMatch.selectedProfileSlug).toBe('gaming-weekend')

    // Monday
    const mondayFallback = await evaluateDynamicProfile(username, {
      simulatedDate: '2026-09-07T15:00:00',
      simulatedTimezone: 'UTC',
    })

    expect(mondayFallback.isFallback).toBe(true)
    expect(mondayFallback.selectedProfileSlug).toBe('default')
  })

  it('resolves conflicts deterministically by highest priority', async () => {
    const username = 'PriorityConflictUser'
    await saveDynamicRulesConfig(username, { enabled: true, fallbackProfileSlug: 'default' })

    // Lower priority rule (P40)
    await createDynamicRule(username, {
      name: 'Normal Work Hours',
      targetProfileSlug: 'work',
      priority: 40,
      enabled: true,
      type: 'work_hours',
      startTime: '08:00',
      endTime: '20:00',
      daysOfWeek: [1, 2, 3, 4, 5],
    })

    // Higher priority temporary campaign (P90)
    await createDynamicRule(username, {
      name: 'Hackathon Weekend / Live Event',
      targetProfileSlug: 'hackathon',
      priority: 90,
      enabled: true,
      type: 'date_range',
      startDate: '2026-09-01T00:00:00Z',
      endDate: '2026-09-03T23:59:59Z',
    })

    // Both rules are active on 2026-09-01T10:00:00Z. P90 must win.
    const result = await evaluateDynamicProfile(username, {
      simulatedDate: '2026-09-01T10:00:00Z',
      simulatedTimezone: 'UTC',
    })

    expect(result.isFallback).toBe(false)
    expect(result.selectedProfileSlug).toBe('hackathon')
    expect(result.matchedRule?.priority).toBe(90)
    expect(result.evaluatedRules.length).toBe(2)
  })

  it('respects expiration timestamp on temporary rules', async () => {
    const username = 'TemporaryRuleUser'
    await saveDynamicRulesConfig(username, { enabled: true, fallbackProfileSlug: 'default' })

    await createDynamicRule(username, {
      name: 'Flash Sale / Temporary',
      targetProfileSlug: 'sponsor',
      priority: 100,
      enabled: true,
      type: 'temporary',
      expiresAt: '2026-09-01T12:00:00Z',
    })

    // Before expiration
    const beforeExp = await evaluateDynamicProfile(username, {
      simulatedDate: '2026-09-01T10:00:00Z',
      simulatedTimezone: 'UTC',
    })
    expect(beforeExp.selectedProfileSlug).toBe('sponsor')

    // After expiration
    const afterExp = await evaluateDynamicProfile(username, {
      simulatedDate: '2026-09-01T13:00:00Z',
      simulatedTimezone: 'UTC',
    })
    expect(afterExp.selectedProfileSlug).toBe('default')
  })
})
