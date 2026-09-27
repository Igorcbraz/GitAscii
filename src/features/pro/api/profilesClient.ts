import type { ProProfileRecord } from '@/features/pro/types/profiles'
import { API_ENDPOINTS } from '@/services/endpoints'

export async function fetchProfiles(signal?: AbortSignal): Promise<ProProfileRecord[]> {
  const response = await fetch(API_ENDPOINTS.PRO.PROFILES, { cache: 'no-store', signal })
  if (!response.ok) throw new Error(`Failed to fetch profiles (${response.status})`)
  const data = await response.json()
  if (
    !Array.isArray(data?.profiles) ||
    !data.profiles.every(
      (profile: ProProfileRecord) =>
        profile && typeof profile.slug === 'string' && typeof profile.name === 'string'
    )
  ) {
    throw new Error('Invalid profiles response')
  }
  return data.profiles
}
