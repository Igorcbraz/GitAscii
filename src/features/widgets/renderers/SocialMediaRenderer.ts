import { SOCIAL_PLATFORMS } from '@/constants'
import { escapeXml } from '@/engine/core/xmlUtils'
import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'
import { API_ENDPOINTS } from '@/services/endpoints'
import { sanitizeSafeHref } from '@/utils/svgSanitizer'

export function renderSocialMedia(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles
): string {
  const { width, height } = widget.size
  const cfg = widget.config

  const selectedSocials =
    Array.isArray(cfg.selectedSocials) && cfg.selectedSocials.length > 0
      ? (cfg.selectedSocials as string[])
      : ['github', 'linkedin', 'twitter', 'discord', 'youtube', 'website']

  const socialUrls = (cfg.socialUrls as Record<string, string>) || {}
  const badgeStyle = (cfg.badgeStyle as string) || 'for-the-badge'
  const showTitle = cfg.showTitle !== false
  const customTitle = (cfg.customTitle as string) || '[ SOCIAL MEDIA ]'
  const theme = (cfg.theme as string) || 'dark'

  const titleY = 32
  const startY = showTitle ? 44 : 16

  if (badgeStyle === 'skillicons') {
    const socialTechString = selectedSocials.join(',')
    const skillIconsUrl = API_ENDPOINTS.SKILL_ICONS.GET(socialTechString, theme, 12)
    const imageWidth = width - 48
    const imageHeight = Math.max(40, height - startY - 16)

    return `
      ${showTitle ? `<text x="24" y="${titleY}" font-family="${globalStyles.fontFamily}" font-size="11" font-weight="500" fill="#7a7a7a" letter-spacing="2">${escapeXml(customTitle)}</text>` : ''}
      <image href="${escapeXml(skillIconsUrl)}" x="24" y="${startY}" width="${imageWidth}" height="${imageHeight}" preserveAspectRatio="xMinYMin meet" />
    `
  }

  const socialPlatformsMap = SOCIAL_PLATFORMS.reduce<
    Record<string, (typeof SOCIAL_PLATFORMS)[number]>
  >((acc, curr) => {
    acc[curr.id] = curr
    return acc
  }, {})

  const badgeH = badgeStyle === 'for-the-badge' ? 28 : 22
  const gapX = 10
  const gapY = 10
  const maxX = width - 24

  let currentX = 24
  let currentY = startY

  const badgesSvg = selectedSocials
    .map((platformId) => {
      const p = socialPlatformsMap[platformId]
      if (!p) return ''

      const label = p.label
      const badgeW =
        badgeStyle === 'for-the-badge'
          ? Math.max(64, Math.round(54 + label.length * 7.6))
          : Math.max(50, Math.round(40 + label.length * 6.2))

      if (currentX + badgeW > maxX && currentX > 24) {
        currentX = 24
        currentY += badgeH + gapY
      }

      const posX = currentX
      currentX += badgeW + gapX

      const badgeUrl = API_ENDPOINTS.SHIELDS_IO.CUSTOM_BADGE(label, p.color, badgeStyle, p.logo)
      const rawTargetUrl =
        socialUrls[platformId] || p.defaultUrl.replace('{username}', data.user.login)
      const targetUrl = sanitizeSafeHref(rawTargetUrl, '#')

      return `
        <a href="${escapeXml(targetUrl)}" target="_blank" rel="noopener noreferrer" cursor="pointer">
          <image href="${escapeXml(badgeUrl)}" x="${posX}" y="${currentY}" width="${badgeW}" height="${badgeH}" preserveAspectRatio="xMinYMid meet" />
        </a>
      `
    })
    .filter(Boolean)
    .join('\n')

  return `
    ${showTitle ? `<text x="24" y="${titleY}" font-family="${globalStyles.fontFamily}" font-size="11" font-weight="500" fill="#7a7a7a" letter-spacing="2">${escapeXml(customTitle)}</text>` : ''}
    ${badgesSvg}
  `
}
