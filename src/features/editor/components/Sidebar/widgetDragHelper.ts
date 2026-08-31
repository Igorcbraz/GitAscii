import type { DragEvent } from 'react'

import type { WidgetCatalogItem } from '../../config/widgets'
import { useWidgetDragStore } from '../../store/widgetDragStore'

let emptyDragImg: HTMLImageElement | null = null

function getEmptyDragImage(): HTMLImageElement {
  if (!emptyDragImg && typeof window !== 'undefined') {
    emptyDragImg = new Image()
    emptyDragImg.src =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>'
  }
  return emptyDragImg || new Image()
}

export function handleWidgetDragStart(e: DragEvent, item: WidgetCatalogItem) {
  e.dataTransfer.setData('text/plain', item.id)
  e.dataTransfer.setData('application/gitascii-widget', item.id)
  e.dataTransfer.effectAllowed = 'copy'

  const defaultSize = item.defaultSize || { width: 800, height: 120 }
  useWidgetDragStore.getState().startDrag({
    widgetId: item.id,
    name: item.name,
    width: defaultSize.width,
    height: defaultSize.height,
  })

  try {
    const img = getEmptyDragImage()
    e.dataTransfer.setDragImage(img, 0, 0)
  } catch {
    // Fallback if browser security blocks custom drag image
  }
}

export function handleWidgetDragEnd() {
  useWidgetDragStore.getState().endDrag()
}
