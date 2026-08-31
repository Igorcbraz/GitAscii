'use client'

import { Plus } from 'lucide-react'
import React from 'react'

import { WidgetBadgeType, type WidgetCatalogItem } from '../../../config/widgets'
import { handleWidgetDragEnd, handleWidgetDragStart } from '../widgetDragHelper'

function renderWidgetBadge(badge?: { text: string; type: WidgetBadgeType }) {
  if (!badge) return null

  return (
    <span className="text-[9px] font-inter-tight font-medium text-signal-lime/90 bg-signal-lime/10 border border-signal-lime/20 px-1.5 py-0.5 rounded-xs shrink-0 whitespace-nowrap">
      {badge.text}
    </span>
  )
}

interface DefaultWidgetCardItemProps {
  item: WidgetCatalogItem
  onAdd: (id: string) => void
  onHover: (item: WidgetCatalogItem, rect: DOMRect) => void
  onLeave: () => void
}

export function DefaultWidgetCardItem({
  item,
  onAdd,
  onHover,
  onLeave,
}: DefaultWidgetCardItemProps) {
  const Icon = item.icon

  return (
    <div
      draggable
      onDragStart={(e) => handleWidgetDragStart(e, item)}
      onDragEnd={handleWidgetDragEnd}
      onClick={() => onAdd(item.id)}
      data-testid={`add-widget-${item.id}`}
      onMouseEnter={(e) => onHover(item, e.currentTarget.getBoundingClientRect())}
      onMouseLeave={onLeave}
      className={`group relative p-3 border transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-xs cursor-pointer flex items-center justify-between shadow-xs hover:-translate-y-0.5 overflow-hidden ${
        item.isExternal
          ? 'border-graphite hover:border-violet-500 bg-void-black/60 hover:bg-[#1a1423] hover:shadow-[0_4px_12px_rgba(139,92,246,0.2)]'
          : 'border-graphite hover:border-signal-lime bg-void-black/60 hover:bg-onyx hover:shadow-[0_4px_12px_rgba(197,255,74,0.15)]'
      }`}
    >
      {item.isExternal && (
        <div className="absolute inset-0 border border-dashed border-transparent group-hover:border-violet-500/30 pointer-events-none transition-colors duration-200 rounded-xs"></div>
      )}

      <div className="flex items-center gap-3 relative z-10">
        <div
          className={`p-2 rounded-xs transition-colors duration-300 shrink-0 ${
            item.isExternal
              ? 'bg-graphite group-hover:bg-violet-500 text-violet-400 group-hover:text-white'
              : 'bg-graphite group-hover:bg-signal-lime text-signal-lime group-hover:text-black'
          }`}
        >
          <Icon size={16} />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h4
              className={`font-inter-tight font-medium text-label text-chalk transition-colors duration-300 ${
                item.isExternal ? 'group-hover:text-violet-400' : 'group-hover:text-signal-lime'
              }`}
            >
              {item.name}
            </h4>
            {renderWidgetBadge(item.badge)}
          </div>
          <p className="font-inter-tight text-eyebrow text-ash line-clamp-1">{item.desc}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0 relative z-10">
        <button
          className={`transition-colors duration-300 p-1 ${
            item.isExternal
              ? 'text-ash group-hover:text-violet-400'
              : 'text-ash group-hover:text-signal-lime'
          }`}
        >
          <Plus size={15} />
        </button>
      </div>
    </div>
  )
}
