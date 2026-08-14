import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'

function localEscapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function renderCodewebMinimalBadge(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  _globalStyles: GlobalStyles,
  _forceStatic = false
): string {
  const width = widget.size.width || 800
  const height = widget.size.height || 44
  const cfg = widget.config || {}

  const prefix = (cfg.prefix as string) || 'crafted with precision by'
  const highlight = (cfg.highlight as string) || data.user.name || data.user.login || 'codeweb-dev'
  const suffix = (cfg.suffix as string) || '• powered by readme-aura'
  const align = (cfg.align as 'center' | 'left' | 'right') || 'center'

  let textAnchor = 'middle'
  let posX = 400
  if (align === 'left') {
    textAnchor = 'start'
    posX = 24
  } else if (align === 'right') {
    textAnchor = 'end'
    posX = 776
  }

  const showBorder = cfg.showBorder !== false
  const bgColor = (cfg.bgColor as string) || 'rgba(8,8,13,0.6)'

  const borderElement = showBorder
    ? `<rect x="0.5" y="0.5" width="799" height="43" rx="21.5" ry="21.5" fill="${bgColor}" stroke="rgba(255,255,255,0.09)" stroke-width="1" />`
    : `<rect x="0" y="0" width="800" height="44" fill="${bgColor}" />`

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 800 44" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <g>
        ${borderElement}
        <text x="${posX}" y="27" text-anchor="${textAnchor}" font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" letter-spacing="0.4">
          <tspan fill="rgba(255,255,255,0.45)">${localEscapeXml(prefix)} </tspan>
          <tspan fill="#ffffff" font-weight="700">${localEscapeXml(highlight)} </tspan>
          <tspan fill="rgba(255,255,255,0.45)">${localEscapeXml(suffix)}</tspan>
        </text>
      </g>
    </svg>
  `
}
