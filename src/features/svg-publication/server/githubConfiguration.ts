import type { SavedConfiguration } from '@/engine/types'
import { API_ENDPOINTS } from '@/services/endpoints'

export async function loadGitHubConfiguration(
  username: string,
  slug: string
): Promise<SavedConfiguration | null> {
  const filename = slug === 'default' ? 'gitascii.json' : `gitascii_${slug}.json`
  for (const branch of ['main', 'master']) {
    for (const file of [filename, `.github/${filename}`]) {
      const response = await fetch(API_ENDPOINTS.GITHUB.RAW_PROFILE_FILE(username, branch, file), {
        signal: AbortSignal.timeout(5000),
      })
      if (response.status === 404) continue
      if (!response.ok)
        throw new Error(`Cannot retrieve saved GitHub configuration: HTTP ${response.status}`)
      const config = (await response.json()) as SavedConfiguration
      if (!Array.isArray(config.widgets) || !config.globalStyles)
        throw new Error('Invalid saved GitHub configuration')
      return { ...config, username, profileSlug: slug }
    }
  }
  return null
}
