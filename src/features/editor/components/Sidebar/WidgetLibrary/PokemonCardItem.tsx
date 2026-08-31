'use client'

import { Plus } from 'lucide-react'
import React from 'react'

import type { WidgetCatalogItem } from '../../../config/widgets'
import { handleWidgetDragEnd, handleWidgetDragStart } from '../widgetDragHelper'

interface PokemonCardItemProps {
  item: WidgetCatalogItem
  onAdd: (id: string) => void
  onHover: (item: WidgetCatalogItem, rect: DOMRect) => void
  onLeave: () => void
}

export function PokemonCardItem({ item, onAdd, onHover, onLeave }: PokemonCardItemProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={(e) => handleWidgetDragStart(e, item)}
      onDragEnd={handleWidgetDragEnd}
      onClick={() => onAdd(item.id)}
      data-testid="add-widget-pokemon-card"
      onMouseEnter={(e) => onHover(item, e.currentTarget.getBoundingClientRect())}
      onMouseLeave={onLeave}
      className="group relative w-full rounded-lg transition-all duration-300 ease-out overflow-hidden cursor-pointer my-1.5 transform hover:-translate-y-0.5 select-none shadow-[0_4px_16px_rgba(197,32,40,0.3)] hover:shadow-[0_8px_28px_rgba(220,38,38,0.55)]"
      style={{
        background: 'linear-gradient(180deg, #d8232a 0%, #a8131b 60%, #850c12 100%)',
        border: '1.5px solid #5a070c',
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.4)',
      }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-30">
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-rose-400/20 via-amber-300/25 via-emerald-300/20 via-cyan-400/25 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
      </div>

      <div className="flex items-center justify-between px-2.5 py-1 border-b border-black/25 bg-black/20 relative z-10">
        <div className="flex items-center gap-1.5">
          <div className="relative w-3.5 h-3.5 rounded-full bg-linear-to-br from-cyan-300 via-sky-500 to-blue-700 border border-white/90 shadow-[0_0_6px_rgba(56,189,248,0.7)] group-hover:shadow-[0_0_12px_rgba(56,189,248,1)] group-hover:scale-110 transition-all duration-300 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-white/95 absolute top-0.5 left-0.5 blur-[0.2px]" />
          </div>
          <div className="flex items-center gap-1 pl-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#ff3b30] border border-black/40 shadow-[0_0_3px_rgba(255,59,48,0.7)] group-hover:shadow-[0_0_6px_rgba(255,59,48,1)] transition-shadow duration-300" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#ffcc00] border border-black/40 shadow-[0_0_3px_rgba(255,204,0,0.7)] group-hover:shadow-[0_0_6px_rgba(255,204,0,1)] transition-shadow duration-300" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#34c759] border border-black/40 shadow-[0_0_3px_rgba(52,199,89,0.7)] group-hover:shadow-[0_0_6px_rgba(52,199,89,1)] transition-shadow duration-300" />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="font-jetbrains-mono text-[8.5px] font-bold text-white/90 tracking-wider uppercase drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] group-hover:text-amber-200 transition-colors">
            PKMN // TCG-025
          </span>
          <div className="flex gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
            <div className="w-0.5 h-2 bg-black/60 rounded-full" />
            <div className="w-0.5 h-2 bg-black/60 rounded-full" />
            <div className="w-0.5 h-2 bg-black/60 rounded-full" />
          </div>
        </div>
      </div>

      <div className="p-1.5 relative z-10">
        <div className="relative rounded-md p-2 bg-[#0b1219] border border-[#1e2d3d] group-hover:border-cyan-500/40 shadow-[inset_0_1px_6px_rgba(0,0,0,0.8)] group-hover:shadow-[inset_0_1px_8px_rgba(6,182,212,0.2)] transition-all duration-300 overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none opacity-20 group-hover:opacity-35 transition-opacity duration-300"
            style={{
              backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
              backgroundSize: '4px 4px',
            }}
          />

          <div className="relative z-10 flex items-center justify-between gap-2.5">
            <div className="relative shrink-0 flex items-center justify-center w-9 h-9">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-14 h-14 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.45)_0%,rgba(56,189,248,0.1)_50%,transparent_75%)] scale-0 group-hover:scale-125 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out" />
                <div className="absolute -left-2.5 top-1.5 w-4 h-0.5 bg-linear-to-r from-transparent to-white/70 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
                <div className="absolute -left-3 bottom-1.5 w-5 h-0.5 bg-linear-to-r from-transparent to-cyan-400/80 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 delay-75 ease-out" />
              </div>

              <div className="relative w-8 h-8 rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-1.5 group-hover:translate-x-1.5 group-hover:rotate-[360deg] group-hover:scale-120 group-hover:shadow-[0_8px_18px_rgba(239,68,68,0.45),0_0_12px_rgba(255,255,255,0.5)] shadow-[0_3px_8px_rgba(0,0,0,0.6)] z-20">
                <div className="w-full h-full rounded-full border-[1.5px] border-[#18181b] overflow-hidden relative bg-white">
                  <div className="absolute top-0 left-0 right-0 h-[48%] bg-linear-to-b from-[#ff3838] to-[#cc0a0a]" />

                  <div className="absolute top-1 left-1.5 w-2.5 h-1 bg-white/75 rounded-full rotate-[-25deg] pointer-events-none" />

                  <div className="absolute top-1/2 left-0 right-0 h-[14%] bg-[#18181b] -translate-y-1/2" />

                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#18181b] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white border border-black/40 group-hover:bg-white group-hover:shadow-[0_0_6px_rgba(255,255,255,0.9)] transition-all duration-300" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="font-jetbrains-mono font-bold text-xs text-white tracking-wider uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] group-hover:text-cyan-200 transition-colors">
                  {item.name}
                </h4>
              </div>
              {item.desc && (
                <p className="font-jetbrains-mono text-caption text-cyan-300/80 group-hover:text-cyan-100 transition-colors truncate mt-0.5 tracking-tight">
                  {item.desc}
                </p>
              )}
            </div>

            <div className="text-white/60 group-hover:text-cyan-300 group-hover:scale-115 transition-all duration-300 p-1 shrink-0 drop-shadow-[0_0_6px_rgba(56,189,248,0)] group-hover:drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]">
              <Plus size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
