import { API_ENDPOINTS } from '@/services/endpoints'

export const TELEMETRY_START =
  '<!-- GITASCII:TELEMETRY:START - Measures badge fetches (usually GitHub Camo refreshes), not exact human views -->'
export const TELEMETRY_END = '<!-- GITASCII:TELEMETRY:END -->'

export const BADGE_STYLES = ['classic', 'compact', 'outline', 'transparent'] as const
export type BadgeStyle = (typeof BADGE_STYLES)[number]

export function isBadgeStyle(value: unknown): value is BadgeStyle {
  return typeof value === 'string' && BADGE_STYLES.includes(value as BadgeStyle)
}

export function badgeUrl(username: string, slug: string, style: BadgeStyle): string {
  const url = API_ENDPOINTS.BADGE.PUBLIC_PROFILE_URL(username, slug)
  return style === 'classic' ? url : `${url}&style=${style}`
}

export function generateTelemetryBlock(username: string, slug: string, style: BadgeStyle): string {
  const url = badgeUrl(username, slug, style)
  const htmlUrl = url.replace(/&/g, '&amp;')
  if (style === 'transparent') {
    return `${TELEMETRY_START}\n<img alt="GitAscii badge fetch analytics" src="${htmlUrl}" width="1" height="1">\n${TELEMETRY_END}`
  }
  const width = style === 'compact' ? '160' : '100%'
  return `${TELEMETRY_START}\n<p align="center">\n  <a href="${API_ENDPOINTS.SITE.HOME}">\n    <img alt="GitAscii badge fetch analytics" src="${htmlUrl}" width="${width}">\n  </a>\n</p>\n${TELEMETRY_END}`
}

const blockPattern = /<!-- GITASCII:TELEMETRY:START[^>]*-->[\s\S]*?<!-- GITASCII:TELEMETRY:END -->/g

function belongsToProfile(block: string, username: string, slug: string): boolean {
  return findBadgeImage(block, username, slug) !== null
}

export function findTelemetryBlock(content: string, username: string, slug: string): string | null {
  return (
    [...content.matchAll(blockPattern)]
      .map((match) => match[0])
      .find((block) => belongsToProfile(block, username, slug)) ?? null
  )
}

export function hasTelemetryBadge(content: string, username: string, slug: string): boolean {
  return findBadgeImage(content, username, slug) !== null
}

export function getTelemetryStyle(content: string, username: string, slug: string): BadgeStyle {
  const image = findBadgeImage(content, username, slug)
  const match = image
    ?.replace(/&amp;/g, '&')
    .match(/[?&]style=(classic|compact|outline|transparent)/)
  return match && isBadgeStyle(match[1]) ? match[1] : 'classic'
}

function findBadgeImage(content: string, username: string, slug: string): string | null {
  const target = `https://gitascii.com/api/badge/${username.toLowerCase()}`
  const renderedContent = stripCommentsAndCodeFences(content)
  const images = renderedContent.match(/<img\b[^>]*>/gi) || []
  return (
    images.find((image) => {
      const source = image.match(/\bsrc=["']([^"']+)["']/i)?.[1]?.replace(/&amp;/g, '&')
      if (!source) return false
      try {
        const url = new URL(source)
        return (
          `${url.origin}${url.pathname}`.toLowerCase() === target &&
          (url.searchParams.get('slug') || 'default') === slug
        )
      } catch {
        return false
      }
    }) ?? null
  )
}

function stripCommentsAndCodeFences(content: string): string {
  let result = ''
  let inComment = false
  let inFence = false

  for (const line of content.split(/\r?\n/)) {
    if (!inComment && /^\s*```/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue

    let index = 0
    while (index < line.length) {
      if (inComment) {
        const close = line.indexOf('-->', index)
        const closeBang = line.indexOf('--!>', index)
        const end = close < 0 ? closeBang : closeBang < 0 ? close : Math.min(close, closeBang)
        if (end < 0) break
        index = end + (end === closeBang ? 4 : 3)
        inComment = false
        continue
      }

      const start = line.indexOf('<!--', index)
      if (start < 0) {
        result += `${line.slice(index)}\n`
        break
      }
      result += `${line.slice(index, start)} `
      index = start + 4
      inComment = true
    }
    if (inComment) result += '\n'
  }
  return result
}

export function upsertTelemetryBlock(
  content: string,
  username: string,
  slug: string,
  style: BadgeStyle
): string {
  const block = generateTelemetryBlock(username, slug, style)
  const existing = findTelemetryBlock(content, username, slug)
  if (existing) return content.replace(existing, block)
  const legacyImage = findBadgeImage(content, username, slug)
  if (legacyImage) {
    const replacement = `<img alt="GitAscii badge fetch analytics" src="${badgeUrl(username, slug, style).replace(/&/g, '&amp;')}" width="${style === 'transparent' ? '1' : style === 'compact' ? '160' : '100%'}"${style === 'transparent' ? ' height="1"' : ''}>`
    return content.replace(legacyImage, replacement)
  }

  // Keep the badge alongside the matching profile image when GitAscii owns that embed.
  const slugStart = slug !== 'default' ? `<!-- GITASCII:${slug}:START -->` : null
  const position = slugStart ? content.indexOf(slugStart) : content.indexOf('<picture>')
  const pictureEnd = position >= 0 ? content.indexOf('</picture>', position) : -1
  const profileEnd = slugStart
    ? content.indexOf(`<!-- GITASCII:${slug}:END -->`, position)
    : content.length
  if (
    pictureEnd >= 0 &&
    pictureEnd < profileEnd &&
    content.slice(position, pictureEnd).includes(`profiles/${slug}/`)
  ) {
    const insertAt = pictureEnd + '</picture>'.length
    return `${content.slice(0, insertAt)}\n${block}${content.slice(insertAt)}`
  }
  return `${content.trimEnd()}\n\n${block}\n`
}
