'use client'

import { Github, Plus } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

import { WIDGET_CATEGORIES, WIDGET_IDS } from '@/constants'

import { WidgetBadgeType, type WidgetCatalogItem } from '../../../config/widgets'

function renderWidgetBadge(badge?: { text: string; type: WidgetBadgeType }) {
  if (!badge) return null

  return (
    <span className="text-[9px] font-inter-tight font-medium text-signal-lime/90 bg-signal-lime/10 border border-signal-lime/20 px-1.5 py-0.5 rounded-xs shrink-0 whitespace-nowrap">
      {badge.text}
    </span>
  )
}

interface WidgetCardItemProps {
  item: WidgetCatalogItem
  onAdd: (id: string) => void
  onHover: (item: WidgetCatalogItem, rect: DOMRect) => void
  onLeave: () => void
}

export function WidgetCardItem({ item, onAdd, onHover, onLeave }: WidgetCardItemProps) {
  const Icon = item.icon

  if (item.id === WIDGET_IDS.GITFEST_LINEUP) {
    return (
      <div
        role="button"
        tabIndex={0}
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
                  src="/gitfest.png"
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

  if (item.category === WIDGET_CATEGORIES.CODEWEB_DEV) {
    return (
      <div
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

  if (item.id === WIDGET_IDS.POKEMON_CARD) {
    return (
      <div
        role="button"
        tabIndex={0}
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

  return (
    <div
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
