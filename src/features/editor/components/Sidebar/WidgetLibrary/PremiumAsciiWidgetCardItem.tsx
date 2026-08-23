'use client'

import { Plus } from 'lucide-react'
import React from 'react'

import { WIDGET_IDS } from '@/constants'

import type { WidgetCatalogItem } from '../../../config/widgets'

interface PremiumAsciiWidgetCardItemProps {
  item: WidgetCatalogItem
  onAdd: (id: string) => void
  onHover: (item: WidgetCatalogItem, rect: DOMRect) => void
  onLeave: () => void
}

function getWidgetMinimalMeta(id: string) {
  switch (id) {
    case WIDGET_IDS.PREMIUM_ASCII_PROFILE_CARD:
      return {
        cmd: '$ profile --card',
        highlight: '@dev:~$ • 340★ • TS 51% • Repos',
        tag: 'Terminal Card',
      }
    case WIDGET_IDS.PREMIUM_ASCII_DEV_SCORE:
      return {
        cmd: '$ score --radar',
        highlight: 'Radar 0-100 • Tier A+ • 8 Metrics',
        tag: 'Scorecard',
      }
    case WIDGET_IDS.PREMIUM_ASCII_INSIGHTS:
      return {
        cmd: '$ insights --habits',
        highlight: '🌙 Night Owl • Peak Day • 4 Shifts',
        tag: 'Insights',
      }
    case WIDGET_IDS.PREMIUM_ASCII_DNA:
      return {
        cmd: '$ dna --archetype',
        highlight: '🧬 > THE BUILDER • 5 Traits',
        tag: 'Archetype',
      }
    case WIDGET_IDS.PREMIUM_ASCII_CODING_VELOCITY:
      return {
        cmd: '$ velocity --cadence',
        highlight: '⚡ 143 commits/mo • 4.7/day',
        tag: 'Velocity',
      }
    default:
      return {
        cmd: '$ run --ascii',
        highlight: 'ASCII Terminal Widget',
        tag: 'Widget',
      }
  }
}

export function PremiumAsciiWidgetCardItem({
  item,
  onAdd,
  onHover,
  onLeave,
}: PremiumAsciiWidgetCardItemProps) {
  const Icon = item.icon
  const meta = getWidgetMinimalMeta(item.id)

  return (
    <div
      key={item.id}
      onClick={() => onAdd(item.id)}
      data-testid={`add-widget-${item.id}`}
      onMouseEnter={(e) => onHover(item, e.currentTarget.getBoundingClientRect())}
      onMouseLeave={onLeave}
      className="group relative border border-[#30363d] hover:border-[#3fb950]/70 bg-[#0d1117] hover:bg-[#161b22] transition-all duration-200 ease-out rounded-xs cursor-pointer shadow-xs hover:-translate-y-0.5 overflow-hidden hover:shadow-[0_4px_16px_rgba(63,185,80,0.14)] flex flex-col font-jetbrains-mono"
    >
      {/* Subtle CRT scanline overlay on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(63, 185, 80, 0.03) 2px, rgba(63, 185, 80, 0.03) 4px)',
        }}
      />

      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#161b22] border-b border-[#30363d] group-hover:border-[#3fb950]/40 transition-colors select-none relative z-10">
        <div className="flex items-center gap-1.5 text-[10px]">
          <div className="flex gap-1 text-[8px] font-bold text-[#8b949e]">
            <span className="text-[#ff5f56]">●</span>
            <span className="text-[#ffbd2e]">●</span>
            <span className="text-[#27c93f]">●</span>
          </div>
          <span className="text-[#3fb950] font-semibold ml-1">{meta.cmd}</span>
        </div>

        <span className="text-[9px] px-1.5 py-0.2 bg-[#3fb950]/10 text-[#3fb950] border border-[#3fb950]/25 rounded-xs font-semibold">
          {item.badge?.text || meta.tag}
        </span>
      </div>

      {/* Main card content */}
      <div className="p-3 relative z-10 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-7 rounded-xs bg-[#161b22] border border-[#30363d] group-hover:border-[#3fb950]/50 flex items-center justify-center text-[#8b949e] group-hover:text-[#3fb950] transition-colors shrink-0">
              <Icon size={14} />
            </div>
            <div className="min-w-0">
              <span className="text-body-sm font-semibold text-chalk group-hover:text-[#3fb950] transition-colors truncate block">
                {item.name}
              </span>
            </div>
          </div>

          <button
            className="h-6.5 px-2 rounded-xs bg-[#161b22] hover:bg-[#3fb950] border border-[#30363d] hover:border-[#3fb950] text-[#8b949e] hover:text-black flex items-center gap-1 text-[10px] font-bold transition-all shrink-0 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              onAdd(item.id)
            }}
            aria-label={`Add ${item.name}`}
          >
            <Plus size={11} strokeWidth={3} />
            <span>ADD</span>
          </button>
        </div>

        {/* Minimalist expressive indicator */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#090d12] border border-[#21262d] group-hover:border-[#3fb950]/30 rounded-xs text-[10px] text-[#8b949e] group-hover:text-[#c9d1d9] transition-colors truncate">
          <span className="text-[#3fb950] font-bold">›</span>
          <span className="truncate">{meta.highlight}</span>
        </div>
      </div>
    </div>
  )
}
