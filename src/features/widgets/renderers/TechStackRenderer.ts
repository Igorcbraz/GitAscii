import { escapeXml } from '@/engine/core/xmlUtils'
import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'
import { API_ENDPOINTS } from '@/services/endpoints'

export function renderTechStack(
  widget: WidgetInstance,
  _data: NormalizedGitHubData,
  globalStyles: GlobalStyles
): string {
  const { width, height } = widget.size
  const cfg = widget.config

  const selectedTechs =
    Array.isArray(cfg.selectedTechs) && cfg.selectedTechs.length > 0
      ? (cfg.selectedTechs as string[])
      : ['js', 'ts', 'react', 'nextjs', 'nodejs', 'tailwind', 'python', 'docker', 'git', 'postgres']

  const theme = (cfg.theme as string) || 'dark'
  const perLine = Number(cfg.perLine) || 12
  const showTitle = cfg.showTitle !== false
  const customTitle = (cfg.customTitle as string) || '[ TECHNOLOGIES & SKILLS ]'

  const mappedTechs = selectedTechs.map((t) => (t === 'reactnative' ? 'react' : t))
  const uniqueTechs = Array.from(new Set(mappedTechs))
  const techString = uniqueTechs.join(',')
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
