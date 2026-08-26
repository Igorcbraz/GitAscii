'use client'

import { Sparkles } from 'lucide-react'
import React, { useMemo } from 'react'

import { renderSvg } from '@/engine/core/SVGEngine'
import { createConfiguration, type TemplatePreset } from '@/engine/core/TemplateRenderer'
import type { NormalizedGitHubData } from '@/engine/types'
import { getMockGitHubData } from '@/features/github/api/mockProfile'
import { useI18n } from '@/i18n'

interface TemplatePreviewTooltipProps {
  template: TemplatePreset | null
  targetRect: DOMRect | null
  githubData: NormalizedGitHubData | null
}

export function TemplatePreviewTooltip({
  template,
  targetRect,
  githubData,
}: TemplatePreviewTooltipProps) {
  const { t } = useI18n()
  const data = githubData || getMockGitHubData('Igorcbraz')

  const templateConfig = useMemo(() => {
    if (!template) return null
    return createConfiguration(
      0,
      data.user?.login || 'Igorcbraz',
      template.id,
      'default',
      'Default',
      data
    )
  }, [template, data])

  const { svgMarkup, calculatedHeight } = useMemo(() => {
    if (!templateConfig) return { svgMarkup: '', calculatedHeight: 400 }

    let maxY = 0
    templateConfig.widgets.forEach((w) => {
      const bottom = (Number(w.position?.y) || 0) + (Number(w.size?.height) || 100)
      if (bottom > maxY) maxY = bottom
    })
    const height = Math.max(320, maxY + 32)

    const rawSvg = renderSvg(templateConfig, data, { width: 800 })
    const cleanSvg = rawSvg.replace(/<\?xml[\s\S]*?\?>/i, '').trim()
    return { svgMarkup: cleanSvg, calculatedHeight: height }
  }, [templateConfig, data])

  if (!template || !targetRect) return null

  const leftPosition = targetRect.right + 12
  const rawTop = targetRect.top - 20
  const topPosition =
    typeof window !== 'undefined'
      ? Math.max(16, Math.min(window.innerHeight - 380, rawTop))
      : rawTop

  const arrowTop = targetRect.top - topPosition + targetRect.height / 2 - 6
  const clampedArrowTop = Math.max(12, Math.min(arrowTop, 350))

  const categoryLabel = template.widgetCategory || template.category || 'Native'

  return (
    <div
      className="fixed z-100 w-92 bg-onyx border border-signal-lime/40 rounded-xs shadow-[0_12px_40px_rgba(0,0,0,0.9),0_0_20px_rgba(197,255,74,0.12)] p-3.5 animate-fade-in pointer-events-none"
      style={{
        left: `${leftPosition}px`,
        top: `${topPosition}px`,
      }}
    >
      <div
        className="absolute -left-1.75 w-0 h-0 border-y-[6px] border-y-transparent border-r-[7px] border-r-signal-lime/50"
        style={{
          top: `${clampedArrowTop}px`,
        }}
      />

      <div className="flex items-center justify-between pb-2 mb-2 border-b border-graphite gap-2">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className="w-1.5 h-1.5 rounded-full bg-signal-lime animate-pulse shrink-0" />
          <span className="font-inter-tight text-caption font-medium uppercase tracking-[0.16em] text-signal-lime truncate">
            [ {t('editor.sidebar.preview', 'PREVIEW')}: {template.name} ]
          </span>
          <span className="text-[9px] font-jetbrains-mono font-semibold px-1.5 py-0.5 rounded-xs border bg-carbon text-ash border-graphite uppercase tracking-wider shrink-0">
            {categoryLabel}
          </span>
        </div>
        <span className="font-jetbrains-mono text-caption text-ash bg-carbon px-1.5 py-0.5 rounded-xs border border-graphite shrink-0">
          800×{calculatedHeight}px
        </span>
      </div>

      <div className="bg-carbon border border-graphite/80 rounded-xs p-2 overflow-hidden flex items-center justify-center min-h-32 max-h-64 shadow-inner relative">
        <div
          className="w-full h-auto max-h-56 flex items-center justify-center [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-h-56 [&>svg]:object-contain"
          dangerouslySetInnerHTML={{ __html: svgMarkup }}
        />
      </div>

      <div className="mt-2.5 flex items-center justify-between text-eyebrow">
        <p className="text-ash font-inter-tight line-clamp-1 flex-1 mr-2">{template.description}</p>
        <div className="text-signal-lime font-inter-tight font-medium flex items-center gap-1 shrink-0 bg-signal-lime/10 px-2 py-0.5 rounded-xs border border-signal-lime/20">
          <Sparkles size={12} />
          <span>{t('editor.sidebar.click_to_apply', 'Aplicar')}</span>
        </div>
      </div>
    </div>
  )
}
