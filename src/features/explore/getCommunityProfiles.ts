import { profileRepository } from '@/lib/profileRepository'

export interface CommunityProfileItem {
  username: string
  profileSlug: string
  templateId: string
  widgetsCount: number
  hasAsciiArt: boolean
  tags: string[]
  isStored: boolean
}

export async function getStoredProfiles(): Promise<CommunityProfileItem[]> {
  const profiles: CommunityProfileItem[] = []

  try {
    const configs = await profileRepository.listAll()

    for (const config of configs) {
      if (config && config.username) {
        const asciiWidget = config.widgets?.find(
          (w) =>
            w.widgetId === 'ascii-art' &&
            Array.isArray((w.config as Record<string, unknown>)?.asciiText) &&
            ((w.config as Record<string, unknown>).asciiText as unknown[]).length > 0
        )

        profiles.push({
          username: config.username,
          profileSlug: config.profileSlug || 'default',
          templateId: config.templateId || 'terminal',
          widgetsCount: config.widgets?.length || 0,
          hasAsciiArt: Boolean(asciiWidget),
          tags: [
            config.templateId || 'terminal',
            asciiWidget ? 'ASCII Art' : 'SVG Widgets',
            'Verified Data',
          ],
          isStored: true,
        })
      }
    }
  } catch (error) {
    console.error('Failed to list stored profiles:', error)
  }

  const map = new Map<string, CommunityProfileItem>()
  for (const item of profiles) {
    map.set(item.username.toLowerCase(), item)
  }

  return Array.from(map.values())
}
