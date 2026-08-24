'use client'

import { Plus } from 'lucide-react'
import React, { useEffect, useState } from 'react'

import { DEFAULT_POKEMON_CARD_IMAGE, EXTERNAL_LINKS, WIDGET_IDS } from '@/constants'
import { convertImageToAsciiCanvas } from '@/engine/ascii/converter'
import { renderWidgetSvg } from '@/engine/core/WidgetRenderer'
import type { GlobalStyles, NormalizedGitHubData, WidgetInstance } from '@/engine/types'
import { getMockGitHubData } from '@/features/github/api/mockProfile'
import { useI18n } from '@/i18n'

import { type WidgetCatalogItem } from '../../config/widgets'

interface WidgetPreviewTooltipProps {
  widgetItem: WidgetCatalogItem | null
  targetRect: DOMRect | null
  globalStyles: GlobalStyles
  githubData: NormalizedGitHubData | null
}

const DEFAULT_SIZE_MAP: Record<string, { width: number; height: number }> = {
  [WIDGET_IDS.HEADER]: { width: 800, height: 90 },
  [WIDGET_IDS.AVATAR]: { width: 160, height: 160 },
  [WIDGET_IDS.ASCII_ART]: { width: 280, height: 280 },
  [WIDGET_IDS.ASCII_TEXT]: { width: 800, height: 120 },
  [WIDGET_IDS.TERMINAL_INFO]: { width: 504, height: 280 },
  [WIDGET_IDS.TECH_STACK]: { width: 800, height: 140 },
  [WIDGET_IDS.SOCIAL_MEDIA]: { width: 800, height: 120 },
  [WIDGET_IDS.BIO]: { width: 800, height: 160 },
  [WIDGET_IDS.STATS]: { width: 800, height: 120 },
  [WIDGET_IDS.LANGUAGES]: { width: 800, height: 140 },
  [WIDGET_IDS.REPOSITORIES]: { width: 800, height: 300 },
  [WIDGET_IDS.GITFEST_LINEUP]: { width: 500, height: 650 },
  [WIDGET_IDS.GITHUB_README_STATS]: { width: 390, height: 210 },
  [WIDGET_IDS.STREAK_STATS]: { width: 390, height: 210 },
  [WIDGET_IDS.PROFILE_TROPHY]: { width: 800, height: 200 },
  [WIDGET_IDS.ACTIVITY_GRAPH]: { width: 710, height: 300 },
  [WIDGET_IDS.CONTRIBUTION_SNAKE]: { width: 800, height: 250 },
  [WIDGET_IDS.METRICS_CARD]: { width: 440, height: 380 },
  [WIDGET_IDS.VIEWS_COUNTER]: { width: 200, height: 96 },
  [WIDGET_IDS.README_QUOTES]: { width: 500, height: 210 },
  [WIDGET_IDS.AWESOME_BADGE]: { width: 360, height: 80 },
  [WIDGET_IDS.GHSTATS]: { width: 390, height: 350 },
  [WIDGET_IDS.DIVIDER]: { width: 800, height: 30 },
  [WIDGET_IDS.FOOTER]: { width: 800, height: 50 },
  [WIDGET_IDS.GODPROFILE_TERMINAL]: { width: 450, height: 300 },
  [WIDGET_IDS.GODPROFILE_MARQUEE]: { width: 800, height: 120 },
  [WIDGET_IDS.GODPROFILE_NEURAL]: { width: 800, height: 320 },
  [WIDGET_IDS.GODPROFILE_TROPHIES]: { width: 800, height: 280 },
  [WIDGET_IDS.GODPROFILE_WAKATIME]: { width: 420, height: 260 },

  [WIDGET_IDS.GODPROFILE_GLOBE]: { width: 320, height: 350 },
  [WIDGET_IDS.ASCII_PORTRAIT]: { width: 370, height: 400 },
  [WIDGET_IDS.ASCII_INFO]: { width: 490, height: 400 },
  [WIDGET_IDS.ASCII_HEATMAP]: { width: 780, height: 240 },
  [WIDGET_IDS.CODEWEB_HERO_ORBIT]: { width: 800, height: 360 },
  [WIDGET_IDS.CODEWEB_RETRO_GRID]: { width: 800, height: 260 },
  [WIDGET_IDS.CODEWEB_SHOWCASE_CARDS]: { width: 800, height: 220 },
  [WIDGET_IDS.CODEWEB_SOCIAL_BADGE]: { width: 800, height: 44 },
  [WIDGET_IDS.CODEWEB_MINIMAL_BADGE]: { width: 800, height: 44 },
  [WIDGET_IDS.POKEMON_CARD]: { width: 300, height: 418 },
  [WIDGET_IDS.GITFUT_CARD]: { width: 300, height: 420 },
  [WIDGET_IDS.SURVEILLANCE_HEADER]: { width: 780, height: 417 },
  [WIDGET_IDS.SURVEILLANCE_DOSSIER]: { width: 780, height: 260 },
  [WIDGET_IDS.SURVEILLANCE_LOADOUT]: { width: 780, height: 200 },
  [WIDGET_IDS.SURVEILLANCE_TELEMETRY]: { width: 780, height: 420 },
  [WIDGET_IDS.SURVEILLANCE_TRANSMISSION]: { width: 780, height: 160 },
  [WIDGET_IDS.SURVEILLANCE_FIELD]: { width: 780, height: 438 },
  [WIDGET_IDS.SURVEILLANCE_FEEDS]: { width: 780, height: 190 },
  [WIDGET_IDS.SURVEILLANCE_TITLE]: { width: 780, height: 30 },
  [WIDGET_IDS.PREMIUM_ASCII_PROFILE_CARD]: { width: 520, height: 440 },
  [WIDGET_IDS.PREMIUM_ASCII_DEV_SCORE]: { width: 400, height: 250 },
  [WIDGET_IDS.PREMIUM_ASCII_INSIGHTS]: { width: 400, height: 280 },
  [WIDGET_IDS.PREMIUM_ASCII_DNA]: { width: 400, height: 230 },
  [WIDGET_IDS.PREMIUM_ASCII_CODING_VELOCITY]: { width: 400, height: 160 },
}

export function WidgetPreviewTooltip({
  widgetItem,
  targetRect,
  globalStyles,
  githubData,
}: WidgetPreviewTooltipProps) {
  const { t } = useI18n()
  const [asciiArtCache, setAsciiArtCache] = useState<{
    lines: string[]
    colors?: string[][]
  } | null>(null)

  const size = widgetItem
    ? DEFAULT_SIZE_MAP[widgetItem.id] || { width: 800, height: 120 }
    : { width: 800, height: 120 }
  const data = githubData || getMockGitHubData('Igorcbraz')

  useEffect(() => {
    if (widgetItem?.id !== WIDGET_IDS.ASCII_ART || asciiArtCache) return

    let isCurrent = true
    async function loadPreviewAscii() {
      const avatarUrl = data.user.avatar_url || EXTERNAL_LINKS.DEFAULT_GITHUB_AVATAR
      try {
        const result = await convertImageToAsciiCanvas(avatarUrl, {
          charset: 'dense',
          cols: 45,
          colorMode: 'monochrome',
        })
        if (isCurrent) {
          setAsciiArtCache({
            lines: result.lines,
            colors: result.colorMatrix,
          })
        }
      } catch (err) {
        console.warn('Preview ASCII art generation failed:', err)
      }
    }

    loadPreviewAscii()
    return () => {
      isCurrent = false
    }
  }, [widgetItem?.id, data.user.avatar_url, asciiArtCache])

  if (!widgetItem || !targetRect) return null

  const translatedName = t(`widget.catalog.${widgetItem.id}.name`, widgetItem.name)
  const translatedDesc = widgetItem.desc
    ? t(`widget.catalog.${widgetItem.id}.desc`, widgetItem.desc)
    : ''
  const translatedBadgeText = widgetItem.badge
    ? t(
        `widget.badge.${widgetItem.badge.text.toLowerCase().replace(/\s+/g, '_')}`,
        widgetItem.badge.text
      )
    : ''

  const previewWidget: WidgetInstance = {
    instanceId: `preview_${widgetItem.id}`,
    widgetId: widgetItem.id,
    name: translatedName,
    position: { x: 0, y: 0 },
    size,
    config: {
      ...(widgetItem.id === 'avatar' ||
      widgetItem.id === 'ascii-art' ||
      widgetItem.id.startsWith('premium-ascii-')
        ? { lockAspectRatio: true }
        : {}),
      ...(widgetItem.category === 'controlplane' ? { layoutType: 'hero' } : {}),
      ...(widgetItem.id === 'ascii-art' && asciiArtCache
        ? {
            asciiText: asciiArtCache.lines,
            asciiColors: asciiArtCache.colors,
          }
        : {}),
      ...(widgetItem.id === WIDGET_IDS.POKEMON_CARD
        ? {
            imageUrl: DEFAULT_POKEMON_CARD_IMAGE,
            rotateX: -8,
            rotateY: 12,
            glareX: 45,
            glareY: 35,
            intensity: 1.2,
          }
        : {}),
      ...(widgetItem.id === WIDGET_IDS.GITFUT_CARD
        ? {
            username: data?.user?.login || 'torvalds',
            rotateX: -6,
            rotateY: 10,
            glareX: 45,
            glareY: 35,
            intensity: 1.1,
          }
        : {}),
    },
    locked: false,
    visible: true,
    zIndex: 1,
  }

  const svgContent = renderWidgetSvg(previewWidget, data, globalStyles)

  const leftPosition = targetRect.right + 12
  const rawTop = targetRect.top - 20
  const topPosition =
    typeof window !== 'undefined'
      ? Math.max(16, Math.min(window.innerHeight - 300, rawTop))
      : rawTop

  const arrowTop = targetRect.top - topPosition + targetRect.height / 2 - 6
  const clampedArrowTop = Math.max(12, Math.min(arrowTop, 270))

  return (
    <div
      className="fixed z-100 w-87.5 bg-onyx border border-signal-lime/40 rounded-xs shadow-[0_12px_40px_rgba(0,0,0,0.9),0_0_20px_rgba(197,255,74,0.12)] p-3.5 animate-fade-in pointer-events-none"
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
            [ {t('editor.sidebar.preview', 'PREVIEW')}: {translatedName} ]
          </span>
          {widgetItem.badge && (
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/30 uppercase tracking-wider shrink-0">
              {translatedBadgeText}
            </span>
          )}
        </div>
        <span className="font-jetbrains-mono text-caption text-ash bg-carbon px-1.5 py-0.5 rounded-xs border border-graphite shrink-0">
          {size.width}×{size.height}px
        </span>
      </div>

      <div className="bg-carbon border border-graphite/80 rounded-xs p-2 overflow-hidden flex items-center justify-center min-h-22.5">
        <svg
          viewBox={`0 0 ${size.width} ${size.height}`}
          className="w-full h-auto max-h-42.5 rounded object-contain"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      </div>

      <div className="mt-2.5 flex items-center justify-between text-eyebrow">
        <p className="text-ash font-inter-tight line-clamp-1 flex-1 mr-2">{translatedDesc}</p>
        <div className="text-signal-lime font-inter-tight font-medium flex items-center gap-1 shrink-0 bg-signal-lime/10 px-2 py-0.5 rounded-xs border border-signal-lime/20">
          <Plus size={12} />
          <span>{t('editor.sidebar.insert', 'Inserir')}</span>
        </div>
      </div>
    </div>
  )
}
