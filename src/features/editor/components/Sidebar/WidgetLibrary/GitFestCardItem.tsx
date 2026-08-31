'use client'

import { Github, Plus } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

import type { WidgetCatalogItem } from '../../../config/widgets'
import { handleWidgetDragEnd, handleWidgetDragStart } from '../widgetDragHelper'

interface GitFestCardItemProps {
  item: WidgetCatalogItem
  onAdd: (id: string) => void
  onHover: (item: WidgetCatalogItem, rect: DOMRect) => void
  onLeave: () => void
}

export function GitFestCardItem({ item, onAdd, onHover, onLeave }: GitFestCardItemProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={(e) => handleWidgetDragStart(e, item)}
      onDragEnd={handleWidgetDragEnd}
      onClick={() => onAdd(item.id)}
      data-testid="add-widget-gitfest-lineup"
      onMouseEnter={(e) => onHover(item, e.currentTarget.getBoundingClientRect())}
      onMouseLeave={onLeave}
      className="group relative w-full transition-all duration-300 ease-out cursor-pointer my-1.5 select-none transform hover:-translate-y-0.5"
    >
      <div className="relative w-full h-17.5 flex items-stretch filter drop-shadow-[0_4px_16px_rgba(88,28,135,0.3)] group-hover:drop-shadow-[0_8px_26px_rgba(147,51,234,0.45)] transition-all duration-300">
        <div
          className="flex-1 h-full pl-3.5 pr-2 flex items-center justify-between relative transition-all duration-300 group-hover:brightness-105"
          style={{
            background: 'linear-gradient(135deg, #220b3f 0%, #140626 50%, #0c0317 100%)',
            maskImage:
              'radial-gradient(circle 8px at 100% 0px, transparent 0, transparent 8px, black 8.5px), radial-gradient(circle 8px at 100% 100%, transparent 0, transparent 8px, black 8.5px), radial-gradient(circle 6px at 0% 50%, transparent 0, transparent 6px, black 6.5px)',
            WebkitMaskImage:
              'radial-gradient(circle 8px at 100% 0px, transparent 0, transparent 8px, black 8.5px), radial-gradient(circle 8px at 100% 100%, transparent 0, transparent 8px, black 8.5px), radial-gradient(circle 6px at 0% 50%, transparent 0, transparent 6px, black 6.5px)',
            maskComposite: 'intersect',
            WebkitMaskComposite: 'source-in',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-15"
            style={{
              backgroundImage: 'radial-gradient(#c084fc 0.8px, transparent 0.8px)',
              backgroundSize: '5px 5px',
            }}
          />

          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-30">
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
          </div>

          <div className="flex items-center gap-3.5 relative z-10 min-w-0 pl-1">
            <Github
              size={24}
              className="text-purple-300 group-hover:text-white transition-colors duration-300 drop-shadow-[0_2px_8px_rgba(168,85,247,0.5)] shrink-0"
            />

            <div className="flex items-center min-w-0">
              <Image
                src="/gitfest.webp"
                alt="GitFest"
                width={140}
                height={36}
                sizes="140px"
                className="h-11 w-auto object-contain drop-shadow-[0_2px_14px_rgba(168,85,247,0.65)] group-hover:drop-shadow-[0_2px_22px_rgba(192,132,252,1)] group-hover:brightness-110 transition-all duration-300"
              />
            </div>
          </div>
        </div>

        <div
          className="w-12.5 h-full flex items-center justify-center relative shrink-0 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-top-left group-hover:translate-x-2 group-hover:rotate-[4.5deg] group-hover:translate-y-0.5 group-hover:shadow-[-4px_4px_12px_rgba(0,0,0,0.5)]"
          style={{
            background: 'linear-gradient(135deg, #1c0836 0%, #120522 50%, #0a0214 100%)',
            maskImage:
              'radial-gradient(circle 8px at 0px 0px, transparent 0, transparent 8px, black 8.5px), radial-gradient(circle 8px at 0px 100%, transparent 0, transparent 8px, black 8.5px), radial-gradient(circle 6px at 100% 50%, transparent 0, transparent 6px, black 6.5px)',
            WebkitMaskImage:
              'radial-gradient(circle 8px at 0px 0px, transparent 0, transparent 8px, black 8.5px), radial-gradient(circle 8px at 0px 100%, transparent 0, transparent 8px, black 8.5px), radial-gradient(circle 6px at 100% 50%, transparent 0, transparent 6px, black 6.5px)',
            maskComposite: 'intersect',
            WebkitMaskComposite: 'source-in',
          }}
        >
          <div className="absolute top-2.5 bottom-2.5 left-0 border-l border-dashed border-purple-400/40 group-hover:border-purple-300/90 group-hover:shadow-[0_0_8px_rgba(192,132,252,0.6)] transition-all duration-300 z-10" />

          <div className="text-purple-300/80 group-hover:text-white transition-colors duration-300 flex items-center justify-center relative z-20">
            <Plus size={16} className="group-hover:scale-120 transition-transform duration-300" />
          </div>
        </div>
      </div>
    </div>
  )
}
