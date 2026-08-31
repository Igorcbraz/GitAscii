'use client'

import { Plus } from 'lucide-react'
import React, { useState } from 'react'

import type { WidgetCatalogItem } from '../../../config/widgets'
import { handleWidgetDragEnd, handleWidgetDragStart } from '../widgetDragHelper'

interface WinXPCardItemProps {
  item: WidgetCatalogItem
  onAdd: (id: string) => void
  onHover: (item: WidgetCatalogItem, rect: DOMRect) => void
  onLeave: () => void
}

/**
 * Paleta de cores autêntica do Windows XP Luna.
 * Cada widget recebe um acento diferente baseado nos tons reais do XP:
 * azul royal, verde floresta, teal, vinho, laranja queimado, roxo, ciano.
 */
const XP_ACCENT_MAP: Record<string, { strip: string; icon: string; border: string }> = {
  'winxp-window': {
    strip: 'linear-gradient(90deg, #1F4FC6 0%, #3A7BD5 40%, #1245A8 100%)',
    icon: '#1F4FC6',
    border: '#3A6EA5',
  },
  'winxp-minesweeper': {
    strip: 'linear-gradient(90deg, #267C26 0%, #3DA63D 40%, #1A5C1A 100%)',
    icon: '#267C26',
    border: '#3A7A3A',
  },
  'winxp-media-player': {
    strip: 'linear-gradient(90deg, #8B5A00 0%, #C47C00 40%, #6B4200 100%)',
    icon: '#9B6400',
    border: '#A07030',
  },
  'winxp-paint': {
    strip: 'linear-gradient(90deg, #005A5A 0%, #008B8B 40%, #004040 100%)',
    icon: '#007070',
    border: '#006060',
  },
  'winxp-taskbar': {
    strip: 'linear-gradient(90deg, #1A5276 0%, #2E86C1 40%, #154360 100%)',
    icon: '#1A7AAA',
    border: '#1A5C8A',
  },
  'winxp-error-dialog': {
    strip: 'linear-gradient(90deg, #8B0000 0%, #C0392B 40%, #6B0000 100%)',
    icon: '#A00000',
    border: '#900000',
  },
  'winxp-system-properties': {
    strip: 'linear-gradient(90deg, #4A235A 0%, #7D3C98 40%, #321746 100%)',
    icon: '#6C3483',
    border: '#5B2C6F',
  },
  'winxp-bliss': {
    strip: 'linear-gradient(90deg, #267C26 0%, #74b9e8 50%, #3a8fd4 100%)',
    icon: '#4ea827',
    border: '#3a8fd4',
  },
}

const DEFAULT_ACCENT = {
  strip: 'linear-gradient(90deg, #1F4FC6 0%, #3A7BD5 40%, #1245A8 100%)',
  icon: '#1F4FC6',
  border: '#3A6EA5',
}

export function WinXPCardItem({ item, onAdd, onHover, onLeave }: WinXPCardItemProps) {
  const Icon = item.icon
  const [pressed, setPressed] = useState(false)
  const accent = XP_ACCENT_MAP[item.id] ?? DEFAULT_ACCENT

  return (
    <div
      key={item.id}
      draggable
      onDragStart={(e) => handleWidgetDragStart(e, item)}
      onDragEnd={handleWidgetDragEnd}
      onClick={() => onAdd(item.id)}
      data-testid={`add-widget-${item.id}`}
      onMouseEnter={(e) => onHover(item, e.currentTarget.getBoundingClientRect())}
      onMouseLeave={() => {
        setPressed(false)
        onLeave()
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      className="group relative cursor-pointer overflow-hidden select-none"
      style={{
        background: pressed
          ? 'linear-gradient(180deg, #C0C0C0 0%, #E0DECE 40%, #ECE9D8 100%)'
          : 'linear-gradient(180deg, #FFFFFF 0%, #F5F4EA 40%, #ECE9D8 100%)',
        border: '2px solid transparent',
        borderRadius: '3px',
        boxShadow: pressed
          ? 'inset 1px 1px 0px #808080, inset -1px -1px 0px #DFDFDF, 0 1px 2px rgba(0,0,0,0.3)'
          : '1px 1px 0px #FFFFFF inset, -1px -1px 0px #808080 inset, 0 2px 4px rgba(0,0,0,0.25)',
        transform: pressed ? 'translateY(1px)' : undefined,
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[3px] pointer-events-none"
        style={{ background: accent.strip }}
      />

      <div className="flex items-center justify-between px-2.5 pt-3 pb-2.5 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="shrink-0 flex items-center justify-center w-8 h-8"
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #E8E4D4 100%)',
              boxShadow: pressed
                ? 'inset 1px 1px 2px rgba(0,0,0,0.4), inset -1px -1px 0px rgba(255,255,255,0.6)'
                : 'inset -1px -1px 2px rgba(0,0,0,0.25), 1px 1px 0px rgba(255,255,255,0.9)',
              borderRadius: '2px',
              border: `1px solid ${accent.border}`,
            }}
          >
            <Icon
              size={16}
              style={{
                color: accent.icon,
                filter: 'drop-shadow(0 1px 0 rgba(255,255,255,0.8))',
              }}
            />
          </div>

          <div className="min-w-0">
            <h4
              className="font-bold text-[11px] leading-tight truncate"
              style={{
                fontFamily: 'Tahoma, Arial, sans-serif',
                color: '#0A0A0A',
                textShadow: '0 1px 0 rgba(255,255,255,0.9)',
              }}
            >
              {item.name}
            </h4>
            <p
              className="text-[9px] line-clamp-1 mt-0.5"
              style={{
                fontFamily: 'Tahoma, Arial, sans-serif',
                color: '#555555',
                textShadow: '0 1px 0 rgba(255,255,255,0.7)',
              }}
            >
              {item.desc}
            </p>
          </div>
        </div>

        <button
          className="shrink-0 flex items-center justify-center w-6 h-6"
          style={{
            background: pressed
              ? 'linear-gradient(180deg, #C8C8C8 0%, #D8D4C8 100%)'
              : 'linear-gradient(180deg, #FFFFFF 0%, #E8E4D8 100%)',
            border: `1px solid ${accent.border}`,
            borderRadius: '2px',
            boxShadow: pressed
              ? 'inset 1px 1px 1px rgba(0,0,0,0.3)'
              : '1px 1px 0px rgba(255,255,255,0.9) inset, 0 1px 2px rgba(0,0,0,0.2)',
            color: accent.icon,
          }}
          tabIndex={-1}
        >
          <Plus size={12} strokeWidth={2.5} />
        </button>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-[1px] pointer-events-none"
        style={{ background: 'rgba(255,255,255,0.8)' }}
      />
    </div>
  )
}
