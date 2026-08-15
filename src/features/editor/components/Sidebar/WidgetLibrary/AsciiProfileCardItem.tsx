'use client'

import { Plus } from 'lucide-react'
import React from 'react'

import { WIDGET_IDS } from '@/constants'

import type { WidgetCatalogItem } from '../../../config/widgets'

interface AsciiProfileCardItemProps {
  item: WidgetCatalogItem
  onAdd: (id: string) => void
  onHover: (item: WidgetCatalogItem, rect: DOMRect) => void
  onLeave: () => void
}

export function AsciiProfileCardItem({ item, onAdd, onHover, onLeave }: AsciiProfileCardItemProps) {
  const Icon = item.icon
  const shellScript =
    item.id === WIDGET_IDS.ASCII_PORTRAIT
      ? './portrait.sh'
      : item.id === WIDGET_IDS.ASCII_INFO
        ? 'neofetch'
        : 'contributions --graph'

  return (
    <div
      key={item.id}
      onClick={() => onAdd(item.id)}
      data-testid={`add-widget-${item.id}`}
      onMouseEnter={(e) => onHover(item, e.currentTarget.getBoundingClientRect())}
      onMouseLeave={onLeave}
      className="group relative border border-[#30363d] hover:border-[#ffa657]/60 bg-[#0d1117] hover:bg-[#161b22] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-xs cursor-pointer shadow-xs hover:-translate-y-0.5 overflow-hidden hover:shadow-[0_4px_15px_rgba(255,166,87,0.15)] flex flex-col"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 166, 87, 0.05) 2px, rgba(255, 166, 87, 0.05) 4px)',
        }}
      />
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#ffa657] scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-300 shadow-[0_0_8px_rgba(255,166,87,0.8)] z-20" />
      <div className="absolute right-0 bottom-0 w-3 h-3 border-r-[2px] border-b-[2px] border-[#ffa657] opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_8px_rgba(255,166,87,0.8)] z-20" />
      <div className="absolute left-0 top-0 w-3 h-3 border-l-[2px] border-t-[2px] border-[#ffa657] opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_8px_rgba(255,166,87,0.8)] z-20" />

      <div className="flex items-center gap-1.5 px-3 py-1 bg-[#161b22] border-b border-[#30363d] group-hover:border-[#ffa657]/30 font-mono text-[9px] text-[#7d8590] transition-colors select-none relative z-10">
        <div className="flex gap-0.5 text-[8px] font-bold">
          <span className="text-[#ff5f56]">[o]</span>
          <span className="text-[#ffbd2e]">[o]</span>
          <span className="text-[#27c93f]">[o]</span>
        </div>
        <span className="ml-1 text-ash/80 group-hover:text-[#ffa657]/80 transition-colors">
          term://
        </span>
        <span className="text-chalk/90 font-semibold truncate group-hover:text-[#ffa657] transition-colors">
          {shellScript}
        </span>
      </div>

      <div className="p-3 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xs bg-[#161b22] border border-[#30363d] group-hover:border-[#ffa657]/40 text-[#ffa657] transition-colors shrink-0">
            <Icon size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-mono text-label text-chalk group-hover:text-[#ffa657] transition-colors">
                {item.name}
              </h4>
            </div>
            <p className="font-mono text-eyebrow text-ash group-hover:text-chalk/80 transition-colors line-clamp-1">
              {item.desc}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button className="text-ash group-hover:text-[#ffa657] transition-colors duration-300 p-1">
            <Plus size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
