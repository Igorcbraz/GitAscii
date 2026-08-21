import { escapeXml } from '@/engine/core/xmlUtils'
import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'

export function renderAvatar(
  widget: WidgetInstance,
  data: NormalizedGitHubData,
  globalStyles: GlobalStyles
): string {
  const width = Math.max(48, Number(widget?.size?.width) || 160)
  const height = Math.max(48, Number(widget?.size?.height) || 160)
  const cfg = widget?.config || {}
  const accent = (cfg.accentColor as string) || globalStyles?.accentColor || '#c5ff4a'
  const rx =
    cfg.borderRadius !== undefined ? Number(cfg.borderRadius) || 0 : globalStyles?.borderRadius || 0

  const sourceType = (cfg.sourceType as 'avatar' | 'url' | 'upload') || 'avatar'
  let avatarUrl = data?.user?.avatar_url || ''

  if (sourceType === 'upload' && cfg.uploadedImageData) {
    avatarUrl = String(cfg.uploadedImageData)
  } else if (sourceType === 'url' && cfg.imageUrl) {
    avatarUrl = String(cfg.imageUrl)
  } else if (cfg.avatarUrl && !cfg.sourceType) {
    avatarUrl = String(cfg.avatarUrl)
  }

  const hideBorder = Boolean(cfg.hideBorder)
  const borderWidth = hideBorder ? 0 : 1.5
  const borderElement = hideBorder
    ? ''
    : `<rect x="0" y="0" width="${width}" height="${height}" rx="${rx}" fill="none" stroke="${accent}" stroke-width="${borderWidth}" />`

  return `
    <clipPath id="avatar-clip-${widget.instanceId}">
      <rect class="no-anim" x="0" y="0" width="${width}" height="${height}" rx="${rx}" />
    </clipPath>
    ${borderElement}
    <image href="${escapeXml(avatarUrl)}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" clip-path="url(#avatar-clip-${widget.instanceId})" />
  `
}
