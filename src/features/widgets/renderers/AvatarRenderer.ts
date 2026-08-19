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

  return `
    <clipPath id="avatar-clip-${widget.instanceId}">
      <rect class="no-anim" x="16" y="16" width="${width - 32}" height="${height - 32}" rx="${Math.max(4, rx)}" />
    </clipPath>
    <rect x="16" y="16" width="${width - 32}" height="${height - 32}" rx="${Math.max(4, rx)}" fill="#00000000" stroke="${accent}" stroke-width="1.5" />
    <image href="${escapeXml(avatarUrl)}" x="16" y="16" width="${width - 32}" height="${height - 32}" preserveAspectRatio="xMidYMid meet" clip-path="url(#avatar-clip-${widget.instanceId})" />
  `
}
