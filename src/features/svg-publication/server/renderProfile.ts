import { embedExternalImages } from '@/engine/core/embedExternalImages'
import { renderSvg } from '@/engine/core/SVGEngine'
import { createConfiguration } from '@/engine/core/TemplateRenderer'
import type { NormalizedGitHubData, SavedConfiguration } from '@/engine/types'
import { WIDGET_CATALOG } from '@/features/editor/config/widgets'

import { PUBLICATION } from '../constants'
import type { RenderedPublication, SvgVariant } from '../types'

export async function renderPublishedProfile(
  saved: SavedConfiguration | null,
  data: NormalizedGitHubData,
  variant: SvgVariant
): Promise<RenderedPublication> {
  const config = saved
    ? structuredClone(saved)
    : createConfiguration(
        data.user.id,
        data.user.login,
        variant.template || 'terminal',
        variant.profileSlug,
        'Default',
        data
      )
  for (const widgetId of variant.widgets) {
    const item = WIDGET_CATALOG.find((widget) => widget.id === widgetId)
    if (!item || config.widgets.some((widget) => widget.widgetId === widgetId)) continue
    config.widgets.push({
      instanceId: `${widgetId}-query`,
      widgetId,
      position: { x: 20, y: 20 },
      size: item.defaultSize || { width: 400, height: 200 },
      config: {},
      locked: false,
      visible: true,
      zIndex: 99,
    })
  }
  const result = await embedExternalImages(
    renderSvg(config, data, {
      theme: variant.theme,
      widgets: variant.widgets.length ? variant.widgets : undefined,
    })
  )
  if (!result.svg.includes('<svg') || !result.svg.includes('</svg>'))
    throw new Error('Invalid SVG output')
  if (Buffer.byteLength(result.svg) > PUBLICATION.maxSvgBytes)
    throw new Error('SVG exceeds publication size budget')
  return { svg: result.svg, degraded: result.hasErrors }
}
