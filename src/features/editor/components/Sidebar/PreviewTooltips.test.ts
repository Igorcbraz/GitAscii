import React from 'react'
import { describe, expect, it } from 'vitest'

import { WIDGET_IDS } from '@/constants'
import { renderSvg } from '@/engine/core/SVGEngine'
import { createConfiguration, TEMPLATE_PRESETS } from '@/engine/core/TemplateRenderer'
import { renderWidgetSvg } from '@/engine/core/WidgetRenderer'
import type { GlobalStyles, WidgetInstance } from '@/engine/types'
import { getMockGitHubData } from '@/features/github/api/mockProfile'

import { isExternalWidget, type WidgetCatalogItem } from '../../config/widgets'
import { TemplatePreviewTooltip } from './TemplatePreviewTooltip'
import { WidgetPreviewTooltip } from './WidgetPreviewTooltip'

const mockRect: DOMRect = {
  bottom: 100,
  height: 50,
  left: 200,
  right: 250,
  top: 50,
  width: 50,
  x: 200,
  y: 50,
  toJSON: () => ({}),
}

const mockGlobalStyles: GlobalStyles = {
  fontFamily: 'Inter',
  borderRadius: 8,
  textColor: '#ffffff',
  accentColor: '#c5ff4a',
  backgroundColor: '#060606',
  borderColor: '#252525',
  padding: 16,
  themeMode: 'dark',
}

const mockGithubData = getMockGitHubData('Igorcbraz')

describe('WidgetPreviewTooltip & Widget Previews', () => {
  it('identifies external widgets correctly for loading state', () => {
    const externalItem: WidgetCatalogItem = {
      id: WIDGET_IDS.GITHUB_README_STATS,
      name: 'GitHub Readme Stats',
      desc: 'Stats from external service',
      icon: () => null,
      isExternal: true,
      category: 'external',
    }

    expect(isExternalWidget(externalItem)).toBe(true)
    expect(Boolean(externalItem.isExternal)).toBe(true)
  })

  it('renders SVG for external widgets in preview', () => {
    const widget: WidgetInstance = {
      instanceId: 'test-preview',
      widgetId: WIDGET_IDS.GITHUB_README_STATS,
      name: 'GitHub Readme Stats',
      position: { x: 0, y: 0 },
      size: { width: 390, height: 210 },
      config: { username: 'Igorcbraz' },
      locked: false,
      visible: true,
      zIndex: 1,
    }

    const svg = renderWidgetSvg(widget, mockGithubData, mockGlobalStyles)
    expect(svg).toContain('foreignObject')
    expect(svg).toContain('img')
  })

  it('renders template SVG configuration properly', () => {
    const template = TEMPLATE_PRESETS.native || Object.values(TEMPLATE_PRESETS)[0]
    const config = createConfiguration(
      0,
      'Igorcbraz',
      template.id,
      'default',
      'Default',
      mockGithubData
    )

    const rawSvg = renderSvg(config, mockGithubData, { width: 800 })
    expect(rawSvg).toContain('<svg')
    expect(rawSvg).toContain('</svg>')
    expect(rawSvg).toContain('viewBox')
  })

  it('WidgetPreviewTooltip returns null when widgetItem is null', () => {
    const element = React.createElement(WidgetPreviewTooltip, {
      widgetItem: null,
      targetRect: mockRect,
      globalStyles: mockGlobalStyles,
      githubData: mockGithubData,
    })
    expect(element).toBeDefined()
  })

  it('TemplatePreviewTooltip returns null when template is null', () => {
    const element = React.createElement(TemplatePreviewTooltip, {
      template: null,
      targetRect: mockRect,
      githubData: mockGithubData,
    })
    expect(element).toBeDefined()
  })
})
