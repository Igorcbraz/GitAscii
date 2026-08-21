'use client'

import { BookOpen, Pencil } from 'lucide-react'
import React, { useMemo } from 'react'

import { EXTERNAL_LINKS, GITHUB_THEME_KEYS, isGitHubAdaptiveTheme } from '@/constants'
import { renderWidgetSvg } from '@/engine/core/WidgetRenderer'

import { useEditorStore } from '../../store/editorStore'

export function GitHubReadmeCanvas() {
  const config = useEditorStore((state) => state.config)
  const githubData = useEditorStore((state) => state.githubData)

  const svgContent = useMemo(() => {
    if (!config || !githubData) return ''

    try {
      const globalStyles = config.globalStyles || {}
      const isAdaptiveBg =
        isGitHubAdaptiveTheme(globalStyles.backgroundColor) || globalStyles.themeMode === 'auto'
      const bg = isAdaptiveBg ? GITHUB_THEME_KEYS.DARK : globalStyles.backgroundColor || '#060606'
      const isTransparent = Boolean(globalStyles.transparentBackground)

      let maxY = 100
      const visibleWidgets = (config.widgets || [])
        .filter((w) => w && w.visible)
        .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))

      visibleWidgets.forEach((w) => {
        const bottom = (Number(w.position?.y) || 0) + (Number(w.size?.height) || 100)
        if (bottom > maxY) maxY = bottom
      })

      const width = 800
      const height = Math.max(maxY + 16, 200)

      const widgetsSvg = visibleWidgets
        .map((widget) => renderWidgetSvg(widget, githubData, config.globalStyles))
        .join('\n')

      return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <style>
    @import url('${EXTERNAL_LINKS.GOOGLE_FONTS_CSS}');
    * { box-sizing: border-box; }
    text { user-select: none; }
    .gitascii-canvas-bg { fill: #0d1117; transition: fill 0.3s ease; }
    @media (prefers-color-scheme: light) { .gitascii-canvas-bg { fill: #ffffff !important; } }
    @media (prefers-color-scheme: dark) { .gitascii-canvas-bg { fill: #0d1117 !important; } }
  </style>
  ${!isTransparent ? `<rect class="${isAdaptiveBg ? 'gitascii-canvas-bg' : ''}" width="${width}" height="${height}" fill="${bg}" rx="${globalStyles.borderRadius || 0}" />` : ''}
  ${widgetsSvg}
</svg>`
    } catch (err) {
      console.error('Failed to render SVG in GitHub Mode:', err)
      return ''
    }
  }, [config, githubData])

  if (!config || !githubData) return null

  const { user } = githubData

  return (
    <div className="mb-6">
      <div className="border border-[#30363d] rounded-t-md bg-[#161b22] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-[#9198a1]">
          <BookOpen size={16} className="shrink-0" />
          <span>
            <span className="text-[#4493f8] hover:underline cursor-default">{user.login}</span>
            <span className="mx-1 text-[#9198a1]">/</span>
            <span className="text-[#f0f6fc] font-semibold">README</span>
            <span className="text-[#9198a1]">.md</span>
          </span>
        </div>
        <button className="text-[#9198a1] hover:text-[#4493f8] transition-colors cursor-default p-1">
          <Pencil size={16} />
        </button>
      </div>

      <div className="border border-t-0 border-[#30363d] rounded-b-md bg-[#0d1117] overflow-hidden">
        <div className="p-6 overflow-x-auto">
          <div
            className="mx-auto w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:rounded-[inherit]"
            style={{ maxWidth: 800 }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        </div>
      </div>
    </div>
  )
}
