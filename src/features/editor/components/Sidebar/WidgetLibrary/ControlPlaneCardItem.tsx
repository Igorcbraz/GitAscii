'use client'

import { Plus } from 'lucide-react'
import React from 'react'

import type { WidgetCatalogItem } from '../../../config/widgets'

interface ControlPlaneCardItemProps {
  item: WidgetCatalogItem
  onAdd: (id: string) => void
  onHover: (item: WidgetCatalogItem, rect: DOMRect) => void
  onLeave: () => void
}

export function ControlPlaneCardItem({ item, onAdd, onHover, onLeave }: ControlPlaneCardItemProps) {
  const Icon = item.icon

  return (
    <div
      key={item.id}
      onClick={() => onAdd(item.id)}
      data-testid={`add-widget-${item.id}`}
      onMouseEnter={(e) => onHover(item, e.currentTarget.getBoundingClientRect())}
      onMouseLeave={onLeave}
      className="group relative p-3 border border-[#0A1929] hover:border-[#00E5FF]/50 bg-[#020617] hover:bg-[#031024] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-none cursor-pointer flex items-center justify-between shadow-xs hover:-translate-y-0.5 overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 20 0 L 0 0 0 20' fill='none' stroke='rgba(0,229,255,0.2)' stroke-width='1'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#00E5FF] scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-300" />
      <div className="absolute right-0 bottom-0 w-2 h-2 border-r-[1.5px] border-b-[1.5px] border-[#00E5FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-center gap-3 relative z-10">
        <div className="p-2 bg-[#0A1929]/80 backdrop-blur-xs border border-[#132F4C] group-hover:border-[#00E5FF]/40 text-[#66B2FF] group-hover:text-[#00E5FF] transition-all duration-300 shrink-0 shadow-[0_0_10px_rgba(0,229,255,0)] group-hover:shadow-[0_0_15px_rgba(0,229,255,0.2)]">
          <Icon size={16} />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h4 className="font-mono font-medium text-[11px] text-[#B2D8FF] group-hover:text-[#00E5FF] transition-colors duration-300 tracking-tight">
              {item.name}
            </h4>
          </div>
          <p className="font-mono text-[9px] text-[#4A6B8C] group-hover:text-[#66B2FF] transition-colors line-clamp-1 mt-0.5 uppercase tracking-wider">
            {item.desc}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0 relative z-10">
        <button className="text-[#4A6B8C] group-hover:text-[#00E5FF] transition-colors duration-300 p-1">
          <Plus size={15} />
        </button>
      </div>
    </div>
  )
}
