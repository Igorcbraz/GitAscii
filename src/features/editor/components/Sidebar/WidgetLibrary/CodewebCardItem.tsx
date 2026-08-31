'use client'

import { Plus } from 'lucide-react'
import React from 'react'

import type { WidgetCatalogItem } from '../../../config/widgets'
import { handleWidgetDragEnd, handleWidgetDragStart } from '../widgetDragHelper'

interface CodewebCardItemProps {
  item: WidgetCatalogItem
  onAdd: (id: string) => void
  onHover: (item: WidgetCatalogItem, rect: DOMRect) => void
  onLeave: () => void
}

export function CodewebCardItem({ item, onAdd, onHover, onLeave }: CodewebCardItemProps) {
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
      className="group relative p-3 border border-white/10 hover:border-white/20 bg-[#08080d] hover:bg-[#0c0c14] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-2xl cursor-pointer flex items-center justify-between shadow-xs hover:-translate-y-0.5 overflow-hidden hover:shadow-[0_8px_24px_rgba(108,195,130,0.15)]"
    >
      <div className="absolute -left-4 -top-4 w-20 h-20 bg-[radial-gradient(circle,rgba(108,195,130,0.2)_0%,transparent_70%)] opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-[radial-gradient(circle,rgba(230,100,115,0.15)_0%,transparent_70%)] opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="flex items-center gap-3 relative z-10">
        <div className="p-2 rounded-xl bg-white/4 border border-white/8 text-white/80 group-hover:text-white group-hover:bg-white/8 transition-all duration-300 shrink-0">
          <Icon size={16} />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h4 className="font-inter-tight font-medium text-label text-white group-hover:text-white transition-colors duration-300">
              {item.name}
            </h4>
          </div>
          <p className="font-inter-tight text-eyebrow text-white/45 group-hover:text-white/70 transition-colors line-clamp-1">
            {item.desc}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0 relative z-10">
        <button className="text-white/40 group-hover:text-white transition-colors duration-300 p-1">
          <Plus size={15} />
        </button>
      </div>
    </div>
  )
}
