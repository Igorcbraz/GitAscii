export interface EmbedOptions {
  username: string
  profileSlug?: string
  includeBadge?: boolean
  dynamic?: boolean
}

export function generateV2EmbedCode(options: EmbedOptions): string {
  const username = options.username.toLowerCase()
  const slug = (options.profileSlug || 'default').toLowerCase()
  const darkUrl = options.dynamic
    ? API_ENDPOINTS.SVG.PUBLIC_DYNAMIC_CARD(username, 'dark')
    : API_ENDPOINTS.GITHUB.PUBLISHED_PROFILE(username, slug, 'dark')
  const lightUrl = options.dynamic
    ? API_ENDPOINTS.SVG.PUBLIC_DYNAMIC_CARD(username, 'light')
    : API_ENDPOINTS.GITHUB.PUBLISHED_PROFILE(username, slug, 'light')

  const pictureBlock = `<picture>
  <source media="(prefers-color-scheme: dark)" srcset="${darkUrl}">
  <source media="(prefers-color-scheme: light)" srcset="${lightUrl}">
  <img alt="GitAscii Profile" src="${darkUrl}" width="100%">
</picture>`

  if (options.includeBadge) {
    const badgeBlock = `\n<!-- GITASCII:TELEMETRY:START - Measures badge fetches (usually GitHub Camo refreshes), not exact human views -->\n<p align="center">\n  <a href="${API_ENDPOINTS.SITE.HOME}">\n    <img alt="GitAscii badge fetch analytics" src="${API_ENDPOINTS.BADGE.PUBLIC_PROFILE_URL(username, slug)}" width="100%">\n  </a>\n</p>\n<!-- GITASCII:TELEMETRY:END -->`
    return `${pictureBlock}\n${badgeBlock}`
  }

  return pictureBlock
}

export function updateReadmeContent(
  currentContent: string,
  newEmbedCode: string,
  profileSlug = 'default'
): string {
  const slug = profileSlug.toLowerCase()

  if (slug !== 'default') {
    const markerStart = `<!-- GITASCII:${slug}:START -->`
    const markerEnd = `<!-- GITASCII:${slug}:END -->`

    if (currentContent.includes(markerStart) && currentContent.includes(markerEnd)) {
      const markerRegex = new RegExp(`${markerStart}[\\s\\S]*?${markerEnd}`, 'g')
      return currentContent.replace(markerRegex, `${markerStart}\n${newEmbedCode}\n${markerEnd}`)
    }

    return `${currentContent.trim()}\n\n${markerStart}\n${newEmbedCode}\n${markerEnd}\n`
  }

  const legacyWidgetRegex =
    /(?:<!-- GITASCII:TELEMETRY:START[\s\S]*?<!-- GITASCII:TELEMETRY:END -->\s*)?<picture>[\s\S]*?<\/picture>(?:\s*<!-- GITASCII:TELEMETRY:START[\s\S]*?<!-- GITASCII:TELEMETRY:END -->|\s*<p align="(?:right|center)">[\s\S]*?<\/p>)*|<p align="(?:right|center)">\s*<a href="https:\/\/gitascii\.com">\s*<img[^>]*api\/badge\/[^>]*>\s*<\/a>\s*<\/p>|!\[(?:GitAscii|Widget)\]\([^)]+\)|<a href="[^"]+">\s*<img\s+src="[^"]+?\/api\/[^"]+"\s+alt="GitAscii Widget"\s+width="100%"\s*\/?>\s*<\/a>/i

  if (currentContent.match(legacyWidgetRegex)) {
    return currentContent.replace(legacyWidgetRegex, newEmbedCode)
  }

  if (!currentContent.trim()) {
    return `${newEmbedCode}\n`
  }

  return `${currentContent.trim()}\n\n${newEmbedCode}\n`
}
import { API_ENDPOINTS } from '@/services/endpoints'
