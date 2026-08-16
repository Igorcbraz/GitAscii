'use client'

import { Plus } from 'lucide-react'
import React from 'react'

import type { WidgetCatalogItem } from '../../../config/widgets'

interface GodProfileCardItemProps {
  item: WidgetCatalogItem
  onAdd: (id: string) => void
  onHover: (item: WidgetCatalogItem, rect: DOMRect) => void
  onLeave: () => void
}

export function GodProfileCardItem({ item, onAdd, onHover, onLeave }: GodProfileCardItemProps) {
  const Icon = item.icon

  return (
    <div
      key={item.id}
      onClick={() => onAdd(item.id)}
      data-testid={`add-widget-${item.id}`}
      onMouseEnter={(e) => onHover(item, e.currentTarget.getBoundingClientRect())}
      onMouseLeave={onLeave}
      className="group relative px-3 py-2.5 bg-[#27272a] hover:bg-[#323238] border border-transparent hover:border-[#b6a891]/30 rounded-lg cursor-pointer flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-xs hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
        <div className="absolute inset-y-0 -left-1/2 w-1/2 bg-linear-to-r from-transparent via-[#b6a891]/10 to-transparent skew-x-[25deg] group-hover:translate-x-[400%] transition-transform duration-1000 ease-out" />
      </div>
      <div className="flex items-center gap-3 relative z-10">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-[#18181b] group-hover:bg-[#b6a891] group-hover:text-[#18181b] text-[#b6a891]/80 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shrink-0 border border-white/5 group-hover:scale-105 group-hover:shadow-[0_0_12px_rgba(182,168,145,0.4)]">
          <Icon size={14} className="transition-transform duration-500 group-hover:scale-110" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h4 className="font-inter-tight font-medium text-label text-[#d4d4d8] group-hover:text-[#b6a891] transition-colors duration-500">
              {item.name}
            </h4>
          </div>
          <p className="font-inter-tight text-eyebrow text-[#a1a1aa] group-hover:text-[#b6a891]/80 transition-colors line-clamp-1 mt-0.5 duration-500">
            {item.desc}
          </p>
        </div>
      </div>
      <div className="flex items-center shrink-0 relative z-10">
        <div className="w-6 h-6 flex items-center justify-center rounded-full text-[#a1a1aa]/50 group-hover:text-[#b6a891] group-hover:bg-[#b6a891]/10 group-hover:rotate-90 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]">
          <Plus size={14} />
        </div>
      </div>
    </div>
  )
}
