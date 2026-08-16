'use client'

import React, { memo } from 'react'

import { renderWidgetSvg } from '@/engine/core/WidgetRenderer'
import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'

export const WidgetNode = memo(
  function WidgetNode({
    widget,
    githubData,
    globalStyles,
    isSelected,
    isStatic = false,
  }: {
    widget: WidgetInstance
    githubData: NormalizedGitHubData
    globalStyles: GlobalStyles
    isSelected?: boolean
    isStatic?: boolean
  }) {
    const innerSvg = renderWidgetSvg(widget, githubData, globalStyles, false, isStatic)
    return (
      <g
        id={`widget-${widget.instanceId}`}
        data-testid={`canvas-widget-${widget.widgetId}`}
        data-selected={isSelected ? 'true' : undefined}
        data-x={widget.position.x}
        data-y={widget.position.y}
        data-width={widget.size.width}
        data-height={widget.size.height}
        transform={`translate(${widget.position.x}, ${widget.position.y})`}
        dangerouslySetInnerHTML={{ __html: innerSvg }}
      />
    )
  },
  (prev, next) => {
    return (
      prev.widget === next.widget &&
      prev.githubData === next.githubData &&
      prev.globalStyles === next.globalStyles &&
      prev.isSelected === next.isSelected &&
      prev.isStatic === next.isStatic
    )
  }
)
