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

  const markerStart = slug !== 'default' ? `<!-- GITASCII:${slug}:START -->` : ''
  const markerEnd = slug !== 'default' ? `<!-- GITASCII:${slug}:END -->` : ''

  const finalEmbedCode =
    slug !== 'default' ? `${markerStart}\n${newEmbedCode}\n${markerEnd}` : newEmbedCode

  return `${finalEmbedCode}\n`
}
import { API_ENDPOINTS } from '@/services/endpoints'
