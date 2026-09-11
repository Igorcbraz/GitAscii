import { API_ENDPOINTS } from '@/services/endpoints'

export interface ClientSession {
  username: string
  githubId: number
  isPro?: boolean
  tier?: string
}

let sessionPromise: Promise<ClientSession | null> | null = null

export function getClientSession(): Promise<ClientSession | null> {
  if (!sessionPromise) {
    sessionPromise = fetch(API_ENDPOINTS.AUTH.SESSION, {
      credentials: 'same-origin',
      cache: 'no-store',
    })
      .then(async (response) => {
        if (!response.ok) return null
        const data = (await response.json()) as { session?: ClientSession | null }
        return data.session ?? null
      })
      .catch(() => null)
  }
  return sessionPromise
}

export function clearClientSession(): void {
  sessionPromise = Promise.resolve(null)
}
