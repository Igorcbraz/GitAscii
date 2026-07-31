import fs from 'fs'
import path from 'path'

import type { SavedConfiguration } from '@/engine/types'

export interface CommunityProfileItem {
  username: string
  profileSlug: string
  templateId: string
  widgetsCount: number
  hasAsciiArt: boolean
  tags: string[]
  isStored: boolean
}

const PROFILES_DIR = path.join(process.cwd(), 'src', 'data', 'profiles')

export function getStoredProfiles(): CommunityProfileItem[] {
  const profiles: CommunityProfileItem[] = []

  try {
    if (fs.existsSync(PROFILES_DIR)) {
      const files = fs.readdirSync(PROFILES_DIR)
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const filePath = path.join(PROFILES_DIR, file)
            const content = fs.readFileSync(filePath, 'utf-8')
            const config = JSON.parse(content) as SavedConfiguration

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
          } catch (e) {
            console.error(`Error reading profile file ${file}:`, e)
          }
        }
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
