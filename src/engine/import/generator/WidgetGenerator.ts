import type { WidgetInstance } from '../../types'
import type { LayoutBlock } from '../types'

export interface WidgetGeneratorOptions {
  canvasWidth?: number
  spacingX?: number
  spacingY?: number
}

export function generateWidgetsFromLayout(
  layoutBlocks: LayoutBlock[],
  options: WidgetGeneratorOptions = {}
): WidgetInstance[] {
  const canvasWidth = options.canvasWidth || 800
  const spacingX = options.spacingX !== undefined ? options.spacingX : 20
  const spacingY = options.spacingY !== undefined ? options.spacingY : 20

  const widgets: WidgetInstance[] = []
  let currentY = 0
  let currentX = 0
  let maxHeightInRow = 0
  let rowBlocks: LayoutBlock[] = []

  const renderRowWidgets = (row: LayoutBlock[], y: number) => {
    const totalRowWidth = row.reduce((sum, b) => sum + b.width, 0) + (row.length - 1) * spacingX
    let startX = 0

    if (row.length === 1) {
      const b = row[0]
      if (b.align === 'center') startX = (canvasWidth - b.width) / 2
      else if (b.align === 'right') startX = canvasWidth - b.width
      startX = Math.max(0, startX)
    } else {
      const firstAlign = row[0].align
      if (firstAlign === 'center') startX = Math.max(0, (canvasWidth - totalRowWidth) / 2)
      else if (firstAlign === 'right') startX = Math.max(0, canvasWidth - totalRowWidth)
    }

    let cx = startX
    for (const block of row) {
      widgets.push({
        instanceId: `widget_${Date.now()}_${widgets.length}`,
        widgetId: block.widgetId,
        name: block.config.customTitle
          ? (block.config.customTitle as string)
          : `${block.widgetId} Widget`,
        position: { x: Math.floor(cx), y: Math.floor(y) },
        size: { width: Math.floor(block.width), height: Math.floor(block.height) },
        config: block.config,
        locked: false,
        visible: true,
        zIndex: widgets.length + 1,
      })
      cx += block.width + spacingX
    }
  }

  for (const block of layoutBlocks) {
    if (currentX > 0 && currentX + block.width > canvasWidth) {
      renderRowWidgets(rowBlocks, currentY)
      currentY += maxHeightInRow + spacingY
      currentX = 0
      maxHeightInRow = 0
      rowBlocks = []
    }

    if (block.width >= canvasWidth - 100) {
      if (rowBlocks.length > 0) {
        renderRowWidgets(rowBlocks, currentY)
        currentY += maxHeightInRow + spacingY
        currentX = 0
        maxHeightInRow = 0
        rowBlocks = []
      }
      renderRowWidgets([block], currentY)
      currentY += block.height + spacingY
    } else {
      rowBlocks.push(block)
      currentX += block.width + spacingX
      if (block.height > maxHeightInRow) {
        maxHeightInRow = block.height
      }
    }
  }

  if (rowBlocks.length > 0) {
    renderRowWidgets(rowBlocks, currentY)
  }

  return widgets
}
