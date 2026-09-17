'use client'

import { Plus } from 'lucide-react'
import React, { useState } from 'react'

import type { WidgetCatalogItem } from '../../../config/widgets'
import { handleWidgetDragEnd, handleWidgetDragStart } from '../widgetDragHelper'

interface MinecraftCardItemProps {
  item: WidgetCatalogItem
  onAdd: (id: string) => void
  onHover: (item: WidgetCatalogItem, rect: DOMRect) => void
  onLeave: () => void
}

export function MinecraftCardItem({ item, onAdd, onHover, onLeave }: MinecraftCardItemProps) {
  const Icon = item.icon
  const [pressed, setPressed] = useState(false)

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
      className="group relative cursor-pointer flex items-center justify-between overflow-hidden select-none transition-transform duration-75"
      style={{
        backgroundColor: pressed ? '#585858' : '#6b6b6b',
        boxShadow: pressed
          ? 'inset 2px 2px 0px #1e1e1e, inset -2px -2px 0px #8b8b8b, 0 0 0 2px #000000'
          : 'inset 2px 2px 0px #8b8b8b, inset -2px -2px 0px #373737, 0 0 0 2px #000000',
        padding: '7px 10px',
        margin: '2px',
        fontFamily: "'Minecraft', 'Courier New', monospace",
        imageRendering: 'pixelated',
        transform: pressed ? 'translateY(1px)' : undefined,
      }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          background: 'rgba(255, 255, 255, 0.12)',
          boxShadow: 'inset 2px 2px 0px #ffffff, inset -2px -2px 0px #555555',
        }}
      />

      <div className="flex items-center gap-3 relative z-10">
        <div
          className="p-2 shrink-0 flex items-center justify-center"
          style={{
            background: '#1a1a1a',
            boxShadow: 'inset 2px 2px 0px #0a0a0a, inset -2px -2px 0px #555555',
            color: '#55ffff',
          }}
        >
          <Icon size={14} />
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <h4
              className="font-bold text-[12px] tracking-wide transition-colors group-hover:text-[#ffffa0]"
              style={{
                color: '#ffffff',
                textShadow: '1px 1px 0 #2a2a2a, 2px 2px 0 #000000',
              }}
            >
              {item.name}
            </h4>
            {item.badge && (
              <span
                className="text-[8px] font-bold px-1 py-0.5 uppercase tracking-wider shrink-0"
                style={{
                  color: '#55ff55',
                  background: '#141414',
                  boxShadow: 'inset 1px 1px 0px #000000, inset -1px -1px 0px #373737',
                  textShadow: '1px 1px 0 #003300',
                }}
              >
                {item.badge.text}
              </span>
            )}
          </div>
          <p
            className="text-[10px] tracking-tight line-clamp-1 mt-0.5 transition-colors group-hover:text-[#ddddaa]"
            style={{
              color: '#aaaaaa',
              textShadow: '1px 1px 0 #222222',
            }}
          >
            {item.desc}
          </p>
        </div>
      </div>

      <div className="flex items-center shrink-0 relative z-10">
        <div
          className="p-1 transition-colors text-[#55ff55] group-hover:text-[#ffff55]"
          style={{ textShadow: '1px 1px 0 #000000' }}
        >
          <Plus size={15} strokeWidth={3} />
        </div>
      </div>
    </div>
  )
}
