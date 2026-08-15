import { escapeXml } from '@/engine/core/xmlUtils'
import type { GlobalStyles } from '@/engine/types'

export function renderExternalWidgetSvg(
  url: string,
  width: number,
  height: number,
  title: string,
  showTitle: boolean,
  globalStyles: GlobalStyles,
  accent: string,
  mode: 'contain' | 'badge' = 'contain',
  targetUrl?: string,
  fallbackUrl?: string
): string {
  let processedUrl = url
  try {
    const parsed = new URL(processedUrl)
    if (parsed.hostname.toLowerCase() === 'github.com' && parsed.pathname.includes('/blob/')) {
      processedUrl = processedUrl.replace(
        /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/(.+)$/i,
        'https://raw.githubusercontent.com/$1/$2/$3'
      )
    }
  } catch {}

  const imgY = showTitle ? 44 : 16
  const paddingX = 16
  const imgW = width - paddingX * 2
  const imgH = Math.max(28, height - imgY - 16)

  const imgStyle =
    mode === 'badge'
      ? 'height:32px; width:auto; max-width:100%; object-fit:contain; object-position:left center;'
      : 'width:100%; height:100%; max-width:100%; max-height:100%; object-fit:contain; object-position:left top;'

  const imgHtml = fallbackUrl
    ? `<img src="${escapeXml(processedUrl)}" alt="${escapeXml(title)}" style="${imgStyle}" onerror="this.onerror=null;this.src='${escapeXml(fallbackUrl)}';" />`
    : `<img src="${escapeXml(processedUrl)}" alt="${escapeXml(title)}" style="${imgStyle}" />`
  const innerContentHtml = targetUrl
    ? `<a href="${escapeXml(targetUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;max-width:100%;max-height:100%;">${imgHtml}</a>`
    : imgHtml

  return `
    ${showTitle ? `<text x="24" y="32" font-family="${globalStyles.fontFamily}" font-size="11" font-weight="500" fill="#7a7a7a" letter-spacing="2">${escapeXml(title)}</text>` : ''}
    <!-- EXTERNAL_WIDGET_START: ${escapeXml(processedUrl)} | ${paddingX} | ${imgY} | ${imgW} | ${imgH} | ${mode} | ${fallbackUrl ? escapeXml(fallbackUrl) : ''} -->
    <foreignObject x="${paddingX}" y="${imgY}" width="${imgW}" height="${imgH}">
      <div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;display:flex;align-items:flex-start;justify-content:flex-start;overflow:hidden;">
        ${innerContentHtml}
      </div>
    </foreignObject>
    <!-- EXTERNAL_WIDGET_END -->
  `
}
