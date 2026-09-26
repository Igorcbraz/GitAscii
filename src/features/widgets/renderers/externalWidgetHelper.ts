import { escapeXml } from '@/engine/core/xmlUtils'
import type { GlobalStyles } from '@/engine/types'
import { sanitizeSafeHref } from '@/utils/svgSanitizer'

export function renderExternalWidgetSvg(
  url: string,
  width: number,
  height: number,
  title: string,
  showTitle: boolean,
  globalStyles: GlobalStyles,
  _accent: string,
  mode: 'contain' | 'badge' = 'contain',
  targetUrl?: string,
  fallbackUrl?: string
): string {
  let processedUrl = sanitizeSafeHref(url, '')
  try {
    const parsed = new URL(processedUrl)
    if (parsed.hostname.toLowerCase() === 'github.com' && parsed.pathname.includes('/blob/')) {
      processedUrl = processedUrl.replace(
        /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/(.+)$/i,
        'https://raw.githubusercontent.com/$1/$2/$3'
      )
    }
  } catch {}

  const safeTargetUrl = targetUrl ? sanitizeSafeHref(targetUrl, '') : undefined
  const safeFallbackUrl = fallbackUrl ? sanitizeSafeHref(fallbackUrl, '') : undefined

  const imgY = showTitle ? 44 : 16
  const paddingX = 16
  const imgW = width - paddingX * 2
  const imgH = Math.max(28, height - imgY - 16)

  const attrW = Math.round(imgW)
  const attrH = mode === 'badge' ? 32 : Math.round(imgH)

  const imageSvg = `<image x="${paddingX}" y="${imgY}" width="${attrW}" height="${attrH}" href="${escapeXml(processedUrl)}" ${safeFallbackUrl ? `data-fallback-url="${escapeXml(safeFallbackUrl)}"` : ''} preserveAspectRatio="${mode === 'badge' ? 'xMinYMid' : 'xMidYMid'} meet"><title>${escapeXml(title)}</title></image>`
  const previewSvg = safeTargetUrl
    ? `<a href="${escapeXml(safeTargetUrl)}" target="_blank" rel="noopener noreferrer">${imageSvg}</a>`
    : imageSvg

  return `
    ${showTitle ? `<text x="24" y="32" font-family="${escapeXml(globalStyles.fontFamily)}" font-size="11" font-weight="500" fill="#7a7a7a" letter-spacing="2">${escapeXml(title)}</text>` : ''}
    <!-- EXTERNAL_WIDGET_JSON: ${escapeXml(JSON.stringify({ url: processedUrl, x: paddingX, y: imgY, width: imgW, height: imgH, mode, fallbackUrl: safeFallbackUrl || '' }))} -->
    <!-- EXTERNAL_WIDGET_START: ${escapeXml(processedUrl)} | ${paddingX} | ${imgY} | ${imgW} | ${imgH} | ${mode} | ${safeFallbackUrl ? escapeXml(safeFallbackUrl) : ''} -->
    ${previewSvg}
    <!-- EXTERNAL_WIDGET_END -->
  `
}
