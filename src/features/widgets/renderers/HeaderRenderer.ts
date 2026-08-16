import { escapeXml } from '@/engine/core/xmlUtils'
import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'

export function renderHeader(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles
): string {
  const { width } = widget.size
  const cfg = widget.config
  const textClr = (cfg.textColor as string) || globalStyles.textColor || '#ffffff'
  const accent = (cfg.accentColor as string) || globalStyles.accentColor || '#c5ff4a'

  const name = escapeXml(data.user.name || data.user.login)
  const handle = escapeXml(`@${data.user.login}`)
  const company = data.user.company ? escapeXml(data.user.company) : ''

  return `
    <text x="24" y="44" font-family="${globalStyles.fontFamily}" font-size="28" font-weight="300" fill="${textClr}">${name}</text>
    <text x="24" y="72" font-family="'JetBrains Mono', monospace" font-size="14" fill="${accent}">${handle}</text>
    ${company ? `<text x="${width - 24}" y="44" text-anchor="end" font-family="'Inter Tight', sans-serif" font-size="12" fill="#7a7a7a">[ ${company} ]</text>` : ''}
  `
}
