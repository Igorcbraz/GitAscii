import { escapeXml } from '@/engine/core/xmlUtils'
import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'
import { detectTechStackFromProfile } from '@/features/editor/utils/profileAutoDetection'
import { API_ENDPOINTS } from '@/services/endpoints'

export function renderTechStack(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles
): string {
  const width = Math.max(100, Number(widget?.size?.width) || 800)
  const height = Math.max(60, Number(widget?.size?.height) || 140)
  const cfg = widget?.config || {}

  const defaultTechs = detectTechStackFromProfile(data)

  const rawTechs =
    Array.isArray(cfg.selectedTechs) && cfg.selectedTechs.length > 0
      ? (cfg.selectedTechs as string[])
      : defaultTechs

  const selectedTechs = Array.isArray(rawTechs)
    ? rawTechs.filter((t) => typeof t === 'string' && t.trim())
    : []
  const theme = (cfg.theme as string) || 'dark'
  const perLine = Math.max(1, Number(cfg.perLine) || 12)
  const showTitle = cfg.showTitle !== false
  const customTitle = (cfg.customTitle as string) || '[ TECHNOLOGIES & SKILLS ]'

  const mappedTechs = selectedTechs.map((t) => (t === 'reactnative' ? 'react' : t.toLowerCase()))
  const uniqueTechs = Array.from(new Set(mappedTechs))
  const techString = uniqueTechs.length > 0 ? uniqueTechs.join(',') : 'js,ts,react,nodejs'
  const skillIconsUrl = API_ENDPOINTS.SKILL_ICONS.GET(techString, theme, perLine)

  const titleY = 32
  const imageY = showTitle ? 44 : 16
  const imageWidth = width - 48
  const imageHeight = Math.max(40, height - imageY - 16)

  return `
    ${showTitle ? `<text x="24" y="${titleY}" font-family="${globalStyles.fontFamily}" font-size="11" font-weight="500" fill="#7a7a7a" letter-spacing="2">${escapeXml(customTitle)}</text>` : ''}
    <image href="${escapeXml(skillIconsUrl)}" x="24" y="${imageY}" width="${imageWidth}" height="${imageHeight}" preserveAspectRatio="xMinYMin meet" />
  `
}
