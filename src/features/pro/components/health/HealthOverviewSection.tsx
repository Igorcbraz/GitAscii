'use client'

import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
} from 'lucide-react'
import Link from 'next/link'
import React, { useRef, useState } from 'react'

import { renderWidgetSvg } from '@/engine/core/WidgetRenderer'
import type {
  GlobalStyles,
  NormalizedGitHubData,
  SavedConfiguration,
  WidgetInstance,
} from '@/engine/types'
import { getMockGitHubData } from '@/features/github/api/mockProfile'
import { useI18n } from '@/i18n'

import type { ProfileHealthSummary, WidgetErrorRecord } from '../../types'
import { ProBadge } from '../ProBadge'

const DEFAULT_GLOBAL_STYLES: GlobalStyles = {
  backgroundColor: '#0d1117',
  textColor: '#ffffff',
  accentColor: '#c5ff4a',
  borderColor: '#30363d',
  fontFamily: 'monospace',
  borderRadius: 12,
  padding: 16,
  themeMode: 'dark',
  templateStyle: 'terminal',
}

interface HealthOverviewSectionProps {
  displayedProfiles: ProfileHealthSummary[]
  activeErrors: WidgetErrorRecord[]
  profileConfigs: Record<string, SavedConfiguration>
  effectiveUsername: string
  onSelectError: (err: WidgetErrorRecord) => void
}

export const HealthOverviewSection: React.FC<HealthOverviewSectionProps> = ({
  displayedProfiles,
  activeErrors,
  profileConfigs,
  effectiveUsername,
  onSelectError,
}) => {
  const { t } = useI18n()
  const matrixScrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragScrollLeft, setDragScrollLeft] = useState(0)

  const mockData: NormalizedGitHubData = getMockGitHubData(effectiveUsername || 'user')

  const updateMatrixScrollIndicators = () => {
    if (matrixScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = matrixScrollRef.current
      setCanScrollLeft(scrollLeft > 10)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  const handleScrollMatrixBy = (delta: number) => {
    if (matrixScrollRef.current) {
      matrixScrollRef.current.scrollBy({ left: delta, behavior: 'smooth' })
    }
  }

  const handleMatrixMouseDown = (e: React.MouseEvent) => {
    if (!matrixScrollRef.current) return
    setIsDragging(true)
    setDragStartX(e.pageX - matrixScrollRef.current.offsetLeft)
    setDragScrollLeft(matrixScrollRef.current.scrollLeft)
  }

  const handleMatrixMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !matrixScrollRef.current) return
    e.preventDefault()
    const x = e.pageX - matrixScrollRef.current.offsetLeft
    const walk = (x - dragStartX) * 1.5
    matrixScrollRef.current.scrollLeft = dragScrollLeft - walk
  }

  const handleMatrixMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <section id="overview" className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-[#c5ff4a]" />
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white">
            {t('pro.health.tab_overview', 'Profiles Health Matrix')}
          </h3>
        </div>
        <ProBadge variant="lime" size="sm">
          {displayedProfiles.length} {t('pro.health.profiles_monitored', 'Profiles Monitored')}
        </ProBadge>
      </div>

      <div className="relative w-full">
        {canScrollLeft && (
          <button
            onClick={() => handleScrollMatrixBy(-360)}
            aria-label={t('common.scroll_left', 'Scroll left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-black/80 border border-white/20 text-[#c5ff4a] hover:border-[#c5ff4a] shadow-lg backdrop-blur-md transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {canScrollRight && (
          <button
            onClick={() => handleScrollMatrixBy(360)}
            aria-label={t('common.scroll_right', 'Scroll right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-black/80 border border-white/20 text-[#c5ff4a] hover:border-[#c5ff4a] shadow-lg backdrop-blur-md transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        <div
          ref={matrixScrollRef}
          onScroll={updateMatrixScrollIndicators}
          className="flex gap-6 overflow-x-auto pb-3 select-none scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
          style={{ cursor: isDragging ? 'grabbing' : 'grab', scrollbarWidth: 'thin' }}
          onMouseDown={handleMatrixMouseDown}
          onMouseMove={handleMatrixMouseMove}
          onMouseUp={handleMatrixMouseUp}
          onMouseLeave={handleMatrixMouseUp}
        >
          {displayedProfiles.map((prof) => {
            const profileActiveErrs = activeErrors.filter(
              (e) => !e.profileSlug || e.profileSlug === prof.profileSlug
            )
            const hasErrors = profileActiveErrs.length > 0
            const isDefault = prof.isDefault || prof.profileSlug === 'default'
            const editorUrl = isDefault
              ? `/${effectiveUsername}`
              : `/${effectiveUsername}/${prof.profileSlug}`

            const profileConfig = profileConfigs[prof.profileSlug]
            const widgetsList: WidgetInstance[] = profileConfig?.widgets || [
              {
                instanceId: 'inst_bio',
                widgetId: 'bio',
                position: { x: 0, y: 0 },
                size: { width: 800, height: 130 },
                config: { title: 'Developer Bio & Avatar' },
                locked: false,
                visible: true,
                zIndex: 1,
              },
              {
                instanceId: 'inst_stats',
                widgetId: 'stats',
                position: { x: 0, y: 140 },
                size: { width: 800, height: 180 },
                config: { title: 'GitHub Stats Cards' },
                locked: false,
                visible: true,
                zIndex: 2,
              },
              {
                instanceId: 'inst_snake',
                widgetId: 'contribution-snake',
                position: { x: 0, y: 330 },
                size: { width: 800, height: 160 },
                config: { title: 'Contribution Snake Game' },
                locked: false,
                visible: true,
                zIndex: 3,
              },
            ]

            const maxX = Math.max(
              800,
              ...widgetsList.map((w) => (w.position?.x || 0) + (w.size?.width || 380))
            )
            const maxY = Math.max(
              340,
              ...widgetsList.map((w) => (w.position?.y || 0) + (w.size?.height || 120))
            )

            return (
              <div
                key={prof.profileSlug}
                className="p-4 rounded bg-[#0c0c0c] border border-white/[0.06] hover:border-white/[0.12] transition-all flex flex-col justify-between space-y-4 relative overflow-hidden flex-shrink-0 w-[min(100%,520px)] h-[480px]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        hasErrors ? 'bg-rose-500 animate-pulse' : 'bg-emerald-400'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white font-mono truncate">
                          /{prof.profileSlug}
                        </h4>
                        {prof.isDefault && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-white/10 text-white font-semibold">
                            DEFAULT
                          </span>
                        )}
                        <ProBadge
                          variant={
                            prof.status === 'operational' && !hasErrors
                              ? 'emerald'
                              : prof.status === 'warning'
                                ? 'amber'
                                : 'rose'
                          }
                          size="sm"
                        >
                          {hasErrors ? 'INCIDENT DETECTED' : prof.status.toUpperCase()}
                        </ProBadge>
                      </div>
                      <span className="text-[10px] font-mono text-[#7a7a7a] block truncate">
                        /api/{effectiveUsername}
                        {!isDefault ? `/${prof.profileSlug}` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={editorUrl}
                      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-black bg-[#c5ff4a] hover:bg-[#b0f533] rounded transition-all"
                    >
                      <span>{t('pro.profiles.editor_btn', 'Editor')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                    <Link
                      href={`/${effectiveUsername}/${prof.profileSlug}.svg`}
                      target="_blank"
                      className="p-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[#8a8a8a] hover:text-white transition-colors"
                      title={t('pro.health.open_svg_tab', 'Open Live SVG in new tab')}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-px bg-white/[0.04] rounded overflow-hidden text-center font-mono text-xs">
                  <div className="bg-[#0c0c0c] py-2">
                    <span className="text-[10px] text-[#7a7a7a] block uppercase">
                      {t('pro.health.th_health', 'Health')}
                    </span>
                    <span
                      className={`font-bold ${hasErrors ? 'text-rose-400' : 'text-emerald-400'}`}
                    >
                      {hasErrors
                        ? t('pro.health.degraded', 'Degraded')
                        : `${prof.healthScore ?? 100}%`}
                    </span>
                  </div>
                  <div className="bg-[#0c0c0c] py-2">
                    <span className="text-[10px] text-[#7a7a7a] block uppercase">
                      {t('pro.health.th_renders', 'Renders')}
                    </span>
                    <span className="font-bold text-white">{prof.totalRenders || 0}</span>
                  </div>
                  <div className="bg-[#0c0c0c] py-2">
                    <span className="text-[10px] text-[#7a7a7a] block uppercase">
                      {t('pro.health.th_latency', 'Latency')}
                    </span>
                    <span className="font-bold text-white">{prof.avgRenderDurationMs || 24}ms</span>
                  </div>
                  <div className="bg-[#0c0c0c] py-2">
                    <span className="text-[10px] text-[#7a7a7a] block uppercase">
                      {t('common.status', 'Status')}
                    </span>
                    <span
                      className={`font-bold ${
                        profileActiveErrs.length > 0 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {profileActiveErrs.length > 0 ? `${profileActiveErrs.length} ERR` : '100% OK'}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl bg-[#080808] border border-white/[0.08] p-3 flex flex-col items-center justify-center h-[280px] relative overflow-hidden w-full select-none">
                  <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

                  <div className="relative z-10 w-full h-full flex items-center justify-center overflow-hidden">
                    <svg
                      width="100%"
                      height="100%"
                      viewBox={`0 0 ${maxX} ${maxY + 20}`}
                      preserveAspectRatio="xMidYMid meet"
                      className="w-full h-full max-h-[260px] select-none"
                    >
                      <defs>
                        <pattern
                          id={`grid-pat-${prof.profileSlug}`}
                          width="20"
                          height="20"
                          patternUnits="userSpaceOnUse"
                        >
                          <circle cx="2" cy="2" r="0.75" fill="#333" opacity="0.3" />
                        </pattern>
                      </defs>

                      <rect
                        width={maxX}
                        height={maxY + 20}
                        fill={profileConfig?.globalStyles?.backgroundColor || '#0d1117'}
                        rx={profileConfig?.globalStyles?.borderRadius || 12}
                      />
                      <rect
                        width={maxX}
                        height={maxY + 20}
                        fill={`url(#grid-pat-${prof.profileSlug})`}
                        rx={profileConfig?.globalStyles?.borderRadius || 12}
                      />

                      {widgetsList
                        .filter((w) => w.visible !== false)
                        .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                        .map((widget) => {
                          const widgetErr = profileActiveErrs.find(
                            (e) =>
                              e.widgetId === widget.widgetId ||
                              (e.widgetId === 'contribution-snake' &&
                                widget.widgetId.includes('snake')) ||
                              (e.widgetId === 'avatar-card' && widget.widgetId === 'bio') ||
                              (e.widgetId === 'stats-cards' && widget.widgetId === 'stats')
                          )
                          const isFailing = Boolean(widgetErr)
                          const wx = Number(widget.position?.x) || 0
                          const wy = Number(widget.position?.y) || 0
                          const ww = Math.max(10, Number(widget.size?.width) || 380)
                          const wh = Math.max(10, Number(widget.size?.height) || 120)

                          const innerSvg = renderWidgetSvg(
                            widget,
                            mockData,
                            profileConfig?.globalStyles || DEFAULT_GLOBAL_STYLES,
                            false,
                            true
                          )

                          return (
                            <g
                              key={widget.instanceId}
                              transform={`translate(${wx}, ${wy})`}
                              className="transition-all"
                            >
                              <g dangerouslySetInnerHTML={{ __html: innerSvg }} />

                              {isFailing && (
                                <g>
                                  <rect
                                    x={-2}
                                    y={-2}
                                    width={ww + 4}
                                    height={wh + 4}
                                    fill="rgba(225, 29, 72, 0.14)"
                                    stroke="#f43f5e"
                                    strokeWidth="2.5"
                                    strokeDasharray="6,4"
                                    rx={8}
                                  />
                                  <g transform={`translate(${Math.max(8, ww - 180)}, -10)`}>
                                    <rect
                                      width="170"
                                      height="22"
                                      rx="4"
                                      fill="#e11d48"
                                      stroke="#ffffff"
                                      strokeWidth="1"
                                    />
                                    <text
                                      x="8"
                                      y="15"
                                      fill="#ffffff"
                                      fontSize="10"
                                      fontFamily="monospace"
                                      fontWeight="bold"
                                    >
                                      ⚠ ERROR: {widget.widgetId.substring(0, 14)}
                                    </text>
                                  </g>
                                </g>
                              )}
                            </g>
                          )
                        })}
                    </svg>
                  </div>
                </div>

                {hasErrors ? (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-mono text-rose-300 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>
                        {profileActiveErrs.length} widget incident(s) flagged directly on preview
                      </span>
                    </div>
                    <button
                      onClick={() => onSelectError(profileActiveErrs[0])}
                      className="text-[11px] underline text-rose-400 hover:text-white cursor-pointer"
                    >
                      View Logs
                    </button>
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs font-mono text-emerald-400 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>
                        {t(
                          'pro.health.all_healthy_pass',
                          'All widgets operational & healthy (100% telemetry pass)'
                        )}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/60">
                      {t('pro.health.zero_errors_24h', '0 errors in 24h')}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
