'use client'

import { Globe, Maximize2, Minus, Plus, RotateCcw, Search } from 'lucide-react'
import React, { useId, useMemo, useState } from 'react'

import { useI18n } from '@/i18n'

import type { CountryMetric } from '../../types/analytics'
import { CountryFlag } from '../CountryFlag'
import {
  GRATICULE_LINES,
  SPHERE_OUTLINE,
  WORLD_MAP_REGIONS,
  type WorldMapRegion,
} from './worldMapData'

export interface WorldMapProps {
  countries: CountryMetric[]
  selectedCountry?: string | null
  onSelectCountry?: (code: string | null) => void
  className?: string
}

const CONTINENT_VIEWBOXES: Record<string, { x: number; y: number; width: number; height: number }> =
  {
    ALL: { x: 0, y: 0, width: 1000, height: 500 },
    NA: { x: 90, y: 20, width: 380, height: 260 },
    SA: { x: 230, y: 230, width: 260, height: 260 },
    EU: { x: 440, y: 30, width: 280, height: 220 },
    AS: { x: 540, y: 50, width: 420, height: 290 },
    AF: { x: 430, y: 160, width: 280, height: 300 },
    OC: { x: 720, y: 250, width: 260, height: 230 },
  }

export const WorldMap: React.FC<WorldMapProps> = ({
  countries,
  selectedCountry,
  onSelectCountry,
  className = '',
}) => {
  const { t } = useI18n()
  const gradientId = useId()
  const [hoveredCountry, setHoveredCountry] = useState<CountryMetric | null>(null)
  const [hoveredRegion, setHoveredRegion] = useState<WorldMapRegion | null>(null)
  const [activeContinent, setActiveContinent] = useState<string>('ALL')
  const [zoomLevel, setZoomLevel] = useState<number>(1)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showGraticules, setShowGraticules] = useState<boolean>(true)

  const countryLookup = useMemo(() => {
    const map = new Map<string, CountryMetric>()
    for (const c of countries) {
      if (c.code) {
        map.set(c.code.toUpperCase().trim(), c)
      }
    }
    return map
  }, [countries])

  const maxViews = useMemo(() => {
    const counts = countries.map((c) => c.count || 0)
    return Math.max(...counts, 1)
  }, [countries])

  const totalGlobalViews = useMemo(() => {
    return countries.reduce((acc, c) => acc + (c.count || 0), 0)
  }, [countries])

  const continents = [
    { id: 'ALL', label: t('pro.charts.continent_all', 'Global (All)') },
    { id: 'NA', label: t('pro.charts.continent_na', 'North America') },
    { id: 'SA', label: t('pro.charts.continent_sa', 'South America') },
    { id: 'EU', label: t('pro.charts.continent_eu', 'Europe') },
    { id: 'AS', label: t('pro.charts.continent_as', 'Asia') },
    { id: 'AF', label: t('pro.charts.continent_af', 'Africa') },
    { id: 'OC', label: t('pro.charts.continent_oc', 'Oceania') },
  ]

  const currentViewBox = useMemo(() => {
    const base = CONTINENT_VIEWBOXES[activeContinent] || CONTINENT_VIEWBOXES.ALL
    if (zoomLevel === 1) {
      return `${base.x} ${base.y} ${base.width} ${base.height}`
    }

    const scale = 1 / zoomLevel
    const w = base.width * scale
    const h = base.height * scale
    const x = base.x + (base.width - w) / 2
    const y = base.y + (base.height - h) / 2
    return `${x} ${y} ${w} ${h}`
  }, [activeContinent, zoomLevel])

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.35, 3.5))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.35, 1))
  }

  const handleResetZoom = () => {
    setActiveContinent('ALL')
    setZoomLevel(1)
  }

  const isRegionSearched = (region: WorldMapRegion) => {
    if (!searchQuery.trim()) return false
    const q = searchQuery.toLowerCase().trim()
    return region.name.toLowerCase().includes(q) || region.id.toLowerCase() === q
  }

  const getPathFill = (region: WorldMapRegion) => {
    const metric = countryLookup.get(region.id)
    const isSelected = selectedCountry === region.id
    const isHovered = hoveredRegion?.id === region.id
    const isSearched = isRegionSearched(region)
    const matchesContinent = activeContinent === 'ALL' || region.continent === activeContinent

    if (!matchesContinent) {
      return 'rgba(255,255,255,0.02)'
    }

    if (isSelected || isHovered || isSearched) {
      return '#c5ff4a'
    }

    if (!metric || metric.count === 0) {
      return 'rgba(255,255,255,0.06)'
    }

    const intensity = metric.count / maxViews

    if (intensity >= 0.7) return '#c5ff4a'
    if (intensity >= 0.45) return 'rgba(197, 255, 74, 0.78)'
    if (intensity >= 0.25) return 'rgba(197, 255, 74, 0.54)'
    if (intensity >= 0.1) return 'rgba(197, 255, 74, 0.36)'
    return 'rgba(197, 255, 74, 0.22)'
  }

  const getPathStroke = (region: WorldMapRegion) => {
    const metric = countryLookup.get(region.id)
    const isSelected = selectedCountry === region.id
    const isHovered = hoveredRegion?.id === region.id
    const isSearched = isRegionSearched(region)
    const matchesContinent = activeContinent === 'ALL' || region.continent === activeContinent

    if (isSelected || isHovered || isSearched) {
      return '#ffffff'
    }

    if (!matchesContinent) {
      return 'rgba(255, 255, 255, 0.04)'
    }

    if (metric && metric.count > 0) {
      return 'rgba(197, 255, 74, 0.5)'
    }

    return 'rgba(255, 255, 255, 0.12)'
  }

  return (
    <div className={`space-y-3.5 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-white/5 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {continents.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setActiveContinent(c.id)
                setZoomLevel(1)
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeContinent === c.id
                  ? 'bg-[#c5ff4a] text-black font-semibold shadow-sm'
                  : 'bg-white/5 text-[#8a8a8a] hover:text-white hover:bg-white/10'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 ml-auto text-xs">
          <div className="relative flex items-center">
            <Search className="w-3 h-3 absolute left-2 text-[#777] pointer-events-none" />
            <input
              type="text"
              placeholder={t('pro.charts.search_country', 'Search country / ISO code...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-md pl-6 pr-2 py-0.5 text-[11px] text-white placeholder-[#666] focus:outline-none focus:border-[#c5ff4a] w-28 focus:w-36 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-1.5 text-[10px] text-[#888] hover:text-white cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={() => setShowGraticules(!showGraticules)}
            title={
              showGraticules
                ? t('pro.charts.hide_grid', 'Hide Grid')
                : t('pro.charts.show_grid', 'Show Grid')
            }
            className={`p-1 rounded-md border text-[11px] transition-colors cursor-pointer ${
              showGraticules
                ? 'bg-white/10 border-white/20 text-[#c5ff4a]'
                : 'bg-white/5 border-white/10 text-[#666] hover:text-white'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleZoomIn}
            title={t('pro.charts.zoom_in', 'Zoom in')}
            disabled={zoomLevel >= 3.5}
            className="p-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-[#8a8a8a] hover:text-white transition-colors disabled:opacity-30 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleZoomOut}
            title={t('pro.charts.zoom_out', 'Zoom out')}
            disabled={zoomLevel <= 1 && activeContinent === 'ALL'}
            className="p-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-[#8a8a8a] hover:text-white transition-colors disabled:opacity-30 cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {(() => {
            const isZoomedOrFiltered = zoomLevel !== 1 || activeContinent !== 'ALL'
            return (
              <button
                onClick={handleResetZoom}
                title={t('pro.charts.reset_view', 'Reset View')}
                disabled={!isZoomedOrFiltered}
                aria-disabled={!isZoomedOrFiltered}
                className={`p-1 rounded-md border transition-colors ${
                  isZoomedOrFiltered
                    ? 'bg-white/10 border-white/20 text-[#c5ff4a] hover:bg-white/15 cursor-pointer shadow-xs'
                    : 'bg-white/5 border-white/10 text-[#8a8a8a] opacity-30 cursor-not-allowed pointer-events-none'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )
          })()}

          {selectedCountry && onSelectCountry && (
            <button
              onClick={() => onSelectCountry(null)}
              className="text-[11px] text-[#c5ff4a] hover:underline cursor-pointer ml-1"
            >
              {t('pro.charts.clear_selection', 'Clear ({code})', { code: selectedCountry })}
            </button>
          )}
        </div>
      </div>

      <div className="relative w-full rounded-xl bg-[#0a0a0a] border border-white/[0.08] p-3 overflow-hidden shadow-inner">
        {hoveredRegion && (
          <div className="absolute top-4 left-4 z-30 pointer-events-none bg-[#141414]/95 border border-white/20 px-3.5 py-2.5 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-1 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center gap-2 font-semibold text-white">
              <CountryFlag code={hoveredRegion.id} size="sm" />
              <span>{hoveredRegion.name}</span>
              <span className="font-mono text-[#8a8a8a] text-[11px]">({hoveredRegion.id})</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono pt-1">
              <span className="text-[#c5ff4a] font-bold">
                {(hoveredCountry?.count || 0).toLocaleString()} {t('pro.common.views', 'views')}
              </span>
              <span className="text-[#8a8a8a]">
                (
                {hoveredCountry
                  ? `${hoveredCountry.percentage}%`
                  : totalGlobalViews > 0
                    ? '0%'
                    : '0%'}
                )
              </span>
            </div>
            <div className="text-[10px] text-[#777]">
              {t('pro.charts.continent_label', 'Continent:')} {hoveredRegion.continent}
            </div>
          </div>
        )}

        <svg
          viewBox={currentViewBox}
          className="w-full h-auto max-h-[420px] select-none overflow-visible transition-all duration-300 ease-out"
          style={{ willChange: 'viewBox' }}
        >
          <defs>
            <filter id={`${gradientId}-glow`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="2"
                floodColor="#c5ff4a"
                floodOpacity="0.6"
              />
            </filter>

            <radialGradient id={`${gradientId}-ocean`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#14191d" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0a0c0e" stopOpacity="0.8" />
            </radialGradient>
          </defs>

          <path
            d={SPHERE_OUTLINE}
            fill={`url(#${gradientId}-ocean)`}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={1}
          />

          {showGraticules && (
            <path
              d={GRATICULE_LINES}
              fill="none"
              stroke="rgba(255, 255, 255, 0.035)"
              strokeWidth={0.6}
              strokeDasharray="2 3"
            />
          )}

          <g className="transition-opacity duration-200">
            {WORLD_MAP_REGIONS.map((region) => {
              const metric = countryLookup.get(region.id)
              const isHovered = hoveredRegion?.id === region.id
              const isSelected = selectedCountry === region.id
              const isSearched = isRegionSearched(region)
              const isHighlighted = isSelected || isHovered || isSearched

              return (
                <path
                  key={`${region.id}-${region.numericId || ''}`}
                  d={region.path}
                  fill={getPathFill(region)}
                  stroke={getPathStroke(region)}
                  strokeWidth={isHighlighted ? 1.4 : 0.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  filter={isHighlighted ? `url(#${gradientId}-glow)` : undefined}
                  className="transition-colors duration-150 cursor-pointer"
                  onMouseEnter={() => {
                    setHoveredRegion(region)
                    if (metric) {
                      setHoveredCountry(metric)
                    } else {
                      setHoveredCountry({
                        code: region.id,
                        name: region.name,
                        key: region.id,
                        continent: region.continent,
                        continentCode: region.continent,
                        flagEmoji: '',
                        count: 0,
                        percentage: 0,
                      })
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredRegion(null)
                    setHoveredCountry(null)
                  }}
                  onClick={() => {
                    if (onSelectCountry) {
                      onSelectCountry(selectedCountry === region.id ? null : region.id)
                    }
                  }}
                />
              )
            })}
          </g>
        </svg>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#8a8a8a] mt-2 pt-2.5 border-t border-white/5">
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-[#c5ff4a]" />
            <span className="text-white font-medium">
              {t('pro.charts.map_projection', 'Natural Earth 1 Geographic Projection')}
            </span>
            <span className="text-[#666]">
              {t('pro.charts.active_regions', '({active} active of {total} sovereign regions)', {
                active: String(countries.length),
                total: String(WORLD_MAP_REGIONS.length),
              })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#777]">{t('pro.charts.zero_hits', '0 Hits')}</span>
            <div className="flex items-center gap-1">
              <span
                className="w-3 h-2.5 rounded-xs bg-white/5 border border-white/10"
                title={t('pro.charts.no_traffic', 'No traffic')}
              />
              <span
                className="w-3 h-2.5 rounded-xs bg-[#c5ff4a]/22 border border-[#c5ff4a]/30"
                title={t('pro.charts.low_traffic', 'Low traffic')}
              />
              <span
                className="w-3 h-2.5 rounded-xs bg-[#c5ff4a]/45 border border-[#c5ff4a]/50"
                title={t('pro.charts.moderate_traffic', 'Moderate traffic')}
              />
              <span
                className="w-3 h-2.5 rounded-xs bg-[#c5ff4a]/75 border border-[#c5ff4a]/80"
                title={t('pro.charts.high_traffic', 'High traffic')}
              />
              <span
                className="w-3 h-2.5 rounded-xs bg-[#c5ff4a] border border-white shadow-xs"
                title={t('pro.charts.peak_traffic', 'Peak traffic')}
              />
            </div>
            <span className="text-[10px] text-[#c5ff4a] font-bold">
              {t('pro.charts.peak_hits', 'Peak Hits')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
