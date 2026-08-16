'use client'

import { Search, X } from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n'

import { WIDGET_FILTERS, type WidgetFilterItem } from '../../../config/widgets'

interface WidgetFilterBarProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  categoryFilter: string
  onCategoryChange: (cat: string) => void
  scrollRef: React.RefObject<HTMLDivElement | null>
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void
  onMouseUpOrLeave: () => void
  searchPlaceholder: string
}

export function WidgetFilterBar({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  scrollRef,
  onMouseDown,
  onMouseMove,
  onMouseUpOrLeave,
  searchPlaceholder,
}: WidgetFilterBarProps) {
  const { t } = useI18n()

  return (
    <div className="space-y-2 pb-1 border-b border-graphite/60">
      <div className="relative">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ash" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full bg-void-black text-chalk text-note font-inter-tight pl-8 pr-7 py-1.5 border border-graphite rounded-xs focus:outline-none focus:border-signal-lime placeholder:text-ash/60 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-ash hover:text-chalk p-0.5"
          >
            <X size={12} />
          </button>
        )}
      </div>

      <div
        ref={scrollRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUpOrLeave}
        onMouseLeave={onMouseUpOrLeave}
        className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none cursor-grab active:cursor-grabbing"
      >
        {WIDGET_FILTERS.map((filter: WidgetFilterItem) => {
          const FilterIcon = filter.icon
          const isActive = categoryFilter === filter.id
          return (
            <button
              key={filter.id}
              onClick={() => onCategoryChange(filter.id)}
              className={`px-2 py-1 text-caption font-medium font-inter-tight rounded-xs border whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? 'bg-signal-lime/10 text-signal-lime border-signal-lime'
                  : 'bg-void-black/60 text-ash border-graphite hover:text-chalk hover:border-slate'
              }`}
            >
              <FilterIcon size={12} className={isActive ? 'text-signal-lime' : 'text-ash'} />
              <span>{t(filter.labelKey as any, filter.defaultLabel)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
