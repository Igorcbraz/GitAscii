export type ConsentChoice = 'granted' | 'denied' | null

const STORAGE_KEY = 'gitascii_analytics_consent'

export function getConsentChoice(): ConsentChoice {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === 'granted' || raw === 'denied') return raw
  } catch {
    // localStorage may be blocked (private mode, security policy)
  }
  return null
}

export function saveConsentChoice(choice: 'granted' | 'denied'): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, choice)
  } catch {
    // ignore write errors
  }
}

export function clearConsentChoice(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
