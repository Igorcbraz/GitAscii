import { beforeEach, describe, expect, it } from 'vitest'

import {
  canSendReengagement,
  getLastEventTimestamp,
  hasEventBeenSent,
  isSuppressed,
  recordEventSent,
  recordSuppression,
  removeSuppression,
  resetLedgerForTesting,
} from './ledger'

describe('Email Ledger and Suppression Management Suite', () => {
  beforeEach(() => {
    resetLedgerForTesting()
  })

  describe('Event Recording & Idempotency', () => {
    it('returns false for events that have not been recorded', () => {
      expect(hasEventBeenSent('octocat', 'welcome')).toBe(false)
      expect(getLastEventTimestamp('octocat', 'welcome')).toBeNull()
    })

    it('records and checks event history accurately', () => {
      recordEventSent('octocat', 'welcome')

      expect(hasEventBeenSent('octocat', 'welcome')).toBe(true)
      expect(hasEventBeenSent('OCTOCAT', 'welcome')).toBe(true)
      expect(hasEventBeenSent('  octocat  ', 'welcome')).toBe(true)
      expect(hasEventBeenSent('octocat', 'first_export')).toBe(false)
      expect(hasEventBeenSent('otheruser', 'welcome')).toBe(false)

      const ts = getLastEventTimestamp('octocat', 'welcome')
      expect(ts).toBeTypeOf('number')
      expect(ts).toBeLessThanOrEqual(Date.now())
    })
  })

  describe('Suppression & Opt-Outs', () => {
    it('defaults to not suppressed for unknown emails', () => {
      expect(isSuppressed('clean@example.com')).toBe(false)
    })

    it('records suppression and handles case-insensitive checks', () => {
      recordSuppression('UnsubUser@Example.COM', 'unsubuser')

      expect(isSuppressed('unsubuser@example.com')).toBe(true)
      expect(isSuppressed('UNSUBUSER@EXAMPLE.COM')).toBe(true)
      expect(isSuppressed('  unsubuser@example.com  ')).toBe(true)
      expect(isSuppressed('other@example.com')).toBe(false)
    })

    it('allows removing an email from suppression list', () => {
      recordSuppression('optin@example.com', 'user')
      expect(isSuppressed('optin@example.com')).toBe(true)

      removeSuppression('optin@example.com')
      expect(isSuppressed('optin@example.com')).toBe(false)
    })

    it('handles removing non-existent email without throwing', () => {
      expect(() => removeSuppression('nonexistent@example.com')).not.toThrow()
    })
  })

  describe('Re-engagement Cooldown Logic', () => {
    it('allows sending re-engagement when no previous record exists', () => {
      expect(canSendReengagement('newuser', 15)).toBe(true)
    })

    it('enforces cooldown period immediately after an event is recorded', () => {
      recordEventSent('inactive_user', 'reengagement')
      expect(canSendReengagement('inactive_user', 15)).toBe(false)
      expect(canSendReengagement('inactive_user', 1)).toBe(false)
    })
  })

  describe('Ledger Reset', () => {
    it('clears all recorded events and suppressions on reset', () => {
      recordEventSent('user1', 'welcome')
      recordSuppression('user1@example.com', 'user1')

      expect(hasEventBeenSent('user1', 'welcome')).toBe(true)
      expect(isSuppressed('user1@example.com')).toBe(true)

      resetLedgerForTesting()

      expect(hasEventBeenSent('user1', 'welcome')).toBe(false)
      expect(isSuppressed('user1@example.com')).toBe(false)
    })
  })
})
