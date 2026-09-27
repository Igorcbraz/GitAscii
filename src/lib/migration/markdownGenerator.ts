import { type BadgeStyle, generateTelemetryBlock } from '@/lib/analytics/telemetryBadge'
import { API_ENDPOINTS } from '@/services/endpoints'

export interface EmbedOptions {
  username: string
  profileSlug?: string
  includeBadge?: boolean
  dynamic?: boolean
  badgeStyle?: BadgeStyle
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
    return `${pictureBlock}\n\n${generateTelemetryBlock(username, slug, options.badgeStyle || 'classic')}`
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
