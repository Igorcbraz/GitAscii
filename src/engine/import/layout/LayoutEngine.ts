import type { ClusterGroup, LayoutBlock } from '../types'

export interface LayoutEngineOptions {
  canvasWidth?: number
  spacingX?: number
  spacingY?: number
}

export function computeLayout(
  clusterGroups: ClusterGroup[],
  options: LayoutEngineOptions = {}
): LayoutBlock[] {
  const canvasWidth = options.canvasWidth || 800
  const spacingX = options.spacingX !== undefined ? options.spacingX : 20

  const layoutBlocks: LayoutBlock[] = []
  let currentX = 0
  let currentRowBlocks: ClusterGroup[] = []

  const flushRow = (row: ClusterGroup[]) => {
    if (row.length === 0) return

    // Total width of all items in row including spacing
    const totalRowWidth =
      row.reduce((sum, item) => sum + item.width, 0) + (row.length - 1) * spacingX

    // For side-by-side placement of stats or cards, adjust individual widths if they overflow canvas
    let scaleRatio = 1
    if (totalRowWidth > canvasWidth && row.length > 1) {
      scaleRatio = canvasWidth / totalRowWidth
    }

    for (const group of row) {
      const finalWidth = Math.floor(group.width * scaleRatio)
      const finalHeight = group.height

      // Determine widgetId for generator
      let widgetId = 'custom-image'
      if (group.type === 'tech-stack') widgetId = 'tech-stack'
      else if (group.type === 'social-media') widgetId = 'social-media'
      else if (group.candidates.length > 0) widgetId = group.candidates[0].widgetId

      layoutBlocks.push({
        id: group.id,
        widgetId,
        width: Math.min(canvasWidth, Math.max(120, finalWidth)),
        height: Math.max(40, finalHeight),
        align: group.align,
        sectionCategory: group.sectionCategory,
        config: group.config,
      })
    }
  }

  for (let i = 0; i < clusterGroups.length; i++) {
    const group = clusterGroups[i]

    // Banners, headers, footers, full-width text span full width
    const isFullWidth = group.width >= canvasWidth - 100 || group.type === 'raw-block'

    if (isFullWidth) {
      if (currentRowBlocks.length > 0) {
        flushRow(currentRowBlocks)
        currentRowBlocks = []
        currentX = 0
      }
      flushRow([group])
      continue
    }

    // Check if item fits in current row
    if (currentX > 0 && currentX + group.width + spacingX > canvasWidth) {
      flushRow(currentRowBlocks)
      currentRowBlocks = [group]
      currentX = group.width + spacingX
    } else {
      currentRowBlocks.push(group)
      currentX += group.width + spacingX
    }
  }

  if (currentRowBlocks.length > 0) {
    flushRow(currentRowBlocks)
  }

  return layoutBlocks
}
