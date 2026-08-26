import type { EmailPreferences } from './types'

const sentEventsLedger = new Map<string, number>()
const suppressionList = new Map<string, EmailPreferences>()

function getEventKey(username: string, eventType: string): string {
  return `${username.toLowerCase().trim()}:${eventType}`
}

export function isSuppressed(email: string): boolean {
  const normEmail = email.toLowerCase().trim()
  const pref = suppressionList.get(normEmail)
  if (!pref) return false
  return pref.marketingOptOut || pref.productUpdatesOptOut
}

export function recordSuppression(
  email: string,
  username: string = '',
  marketingOptOut = true,
  productUpdatesOptOut = true
): void {
  const normEmail = email.toLowerCase().trim()
  suppressionList.set(normEmail, {
    email: normEmail,
    username: username.toLowerCase().trim(),
    marketingOptOut,
    productUpdatesOptOut,
    updatedAt: Date.now(),
  })
}

export function removeSuppression(email: string): void {
  const normEmail = email.toLowerCase().trim()
  suppressionList.delete(normEmail)
}

export function hasEventBeenSent(username: string, eventType: string): boolean {
  const key = getEventKey(username, eventType)
  return sentEventsLedger.has(key)
}

export function recordEventSent(username: string, eventType: string): void {
  const key = getEventKey(username, eventType)
  sentEventsLedger.set(key, Date.now())
}

export function getLastEventTimestamp(username: string, eventType: string): number | null {
  const key = getEventKey(username, eventType)
  return sentEventsLedger.get(key) || null
}

export function canSendReengagement(username: string, cooldownDays: number = 15): boolean {
  const lastSent = getLastEventTimestamp(username, 'reengagement')
  if (!lastSent) return true

  const elapsedMs = Date.now() - lastSent
  const cooldownMs = cooldownDays * 24 * 60 * 60 * 1000
  return elapsedMs >= cooldownMs
}

export function resetLedgerForTesting(): void {
  sentEventsLedger.clear()
  suppressionList.clear()
}
