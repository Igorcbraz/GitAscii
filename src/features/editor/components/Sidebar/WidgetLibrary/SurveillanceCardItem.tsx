'use client'

import { Plus } from 'lucide-react'
import React from 'react'

import type { WidgetCatalogItem } from '../../../config/widgets'
import { handleWidgetDragEnd, handleWidgetDragStart } from '../widgetDragHelper'

interface SurveillanceCardItemProps {
  item: WidgetCatalogItem
  onAdd: (id: string) => void
  onHover: (item: WidgetCatalogItem, rect: DOMRect) => void
  onLeave: () => void
}

export function SurveillanceCardItem({ item, onAdd, onHover, onLeave }: SurveillanceCardItemProps) {
  const Icon = item.icon

  return (
    <div
      key={item.id}
      draggable
      onDragStart={(e) => handleWidgetDragStart(e, item)}
      onDragEnd={handleWidgetDragEnd}
      onClick={() => onAdd(item.id)}
      data-testid={`add-widget-${item.id}`}
      onMouseEnter={(e) => onHover(item, e.currentTarget.getBoundingClientRect())}
      onMouseLeave={onLeave}
      className="group relative p-3 border border-[#1a1424] hover:border-[#55ffff]/50 bg-[#050308] hover:bg-[#0c0814] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-none cursor-pointer flex items-center justify-between shadow-xs hover:-translate-y-0.5 overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-15 group-hover:opacity-35 transition-opacity duration-500 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(85,255,255,0.06) 2px, rgba(85,255,255,0.06) 4px)',
        }}
      />

      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#55ffff] scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-300 shadow-[0_0_8px_#55ffff]" />
      <div className="absolute right-1 top-1 w-2 h-2 border-r-[1.5px] border-t-[1.5px] border-[#55ffff] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute right-1 bottom-1 w-2 h-2 border-r-[1.5px] border-b-[1.5px] border-[#55ffff] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-center gap-3 relative z-10">
        <div className="p-2 bg-[#0c0814] backdrop-blur-xs border border-[#2d2238] group-hover:border-[#55ffff]/40 text-[#55ffff] group-hover:text-[#e6fbfb] transition-all duration-300 shrink-0 shadow-[0_0_10px_rgba(85,255,255,0)] group-hover:shadow-[0_0_15px_rgba(85,255,255,0.25)]">
          <Icon size={16} />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h4 className="font-mono font-medium text-[11px] text-[#e6fbfb] group-hover:text-[#55ffff] transition-colors duration-300 tracking-tight">
              {item.name}
            </h4>
            {item.badge && (
              <span className="text-[9px] font-mono font-bold text-[#55ffff] bg-[#55ffff]/10 border border-[#55ffff]/20 px-1 py-0.2 rounded-none shrink-0 uppercase tracking-widest">
                {item.badge.text}
              </span>
            )}
          </div>
          <p className="font-mono text-[9px] text-[#8a8a8a] group-hover:text-[#aaaaaa] transition-colors line-clamp-1 mt-0.5 uppercase tracking-wider">
            {item.desc}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 relative z-10">
        <button className="text-[#6f6478] group-hover:text-[#55ffff] transition-colors duration-300 p-1">
          <Plus size={15} />
        </button>
      </div>
    </div>
  )
}
