'use client'

import { Sliders } from 'lucide-react'
import React from 'react'

import { Switch } from '@/components/ui/Switch'

import { useEditorStore } from '../../store/editorStore'
import { ColorPicker } from './ColorPicker'
import { FeaturedReposControls } from './FeaturedReposControls'

interface ControlPlaneControlsProps {
  instanceId: string
  widgetId: string
  config: Record<string, unknown>
}

export function ControlPlaneControls({
  instanceId,
  widgetId: _widgetId,
  config,
}: ControlPlaneControlsProps) {
  const updateWidgetConfig = useEditorStore((state) => state.updateWidgetConfig)

  const showGrid = config.showGrid !== false
  const speed = typeof config.animationSpeed === 'number' ? config.animationSpeed : 1
  const layoutType = (config.layoutType as 'hero' | 'closed-loop') || 'closed-loop'

  const handleUpdate = (patch: Record<string, unknown>) => {
    updateWidgetConfig(instanceId, patch)
  }

  return (
    <div className="space-y-4 pt-3 border-t border-graphite font-inter-tight">
      <div className="flex items-center gap-2 text-signal-lime text-eyebrow uppercase tracking-wider font-semibold">
        <Sliders size={14} />
        <span>Control Plane Customization</span>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
            Design Variant (Type)
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => handleUpdate({ layoutType: 'closed-loop' })}
              className={`py-1.5 rounded-xs text-eyebrow font-inter-tight transition-all cursor-pointer border text-center ${
                layoutType === 'closed-loop'
                  ? 'bg-signal-lime text-black border-signal-lime font-bold'
                  : 'bg-graphite text-ash border-graphite hover:border-slate hover:text-chalk'
              }`}
            >
              Closed-Loop
            </button>
            <button
              type="button"
              onClick={() => handleUpdate({ layoutType: 'hero' })}
              className={`py-1.5 rounded-xs text-eyebrow font-inter-tight transition-all cursor-pointer border text-center ${
                layoutType === 'hero'
                  ? 'bg-signal-lime text-black border-signal-lime font-bold'
                  : 'bg-graphite text-ash border-graphite hover:border-slate hover:text-chalk'
              }`}
            >
              Hero Layout
            </button>
          </div>
        </div>

        <div>
          <label className="text-eyebrow text-ash block mb-1 font-inter-tight">Custom Title</label>
          <input
            type="text"
            value={(config.customTitle as string) || ''}
            onChange={(e) => handleUpdate({ customTitle: e.target.value })}
            placeholder="e.g. LIFCC or Your Name"
            className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note p-1.5 rounded-xs focus:border-[#00A7D1] focus:outline-none"
          />
        </div>

        <div>
          <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
            Custom Biography / Subtitle
          </label>
          <textarea
            value={(config.customBio as string) || ''}
            onChange={(e) => handleUpdate({ customBio: e.target.value })}
            placeholder="e.g. Building the systems around coding agents..."
            rows={2}
            className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note p-1.5 rounded-xs focus:border-[#00A7D1] focus:outline-none resize-y"
          />
        </div>

        <div className="flex items-center justify-between p-2 bg-graphite rounded-sm border border-graphite">
          <label className="text-eyebrow text-chalk font-inter-tight cursor-pointer">
            Show Grid Matrix
          </label>
          <Switch
            checked={showGrid}
            onChange={(checkedValue) => handleUpdate({ showGrid: checkedValue })}
          />
        </div>

        <div>
          <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
            Animation Speed Factor
          </label>
          <select
            value={speed}
            onChange={(e) => handleUpdate({ animationSpeed: parseFloat(e.target.value) })}
            className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note p-1.5 rounded-xs focus:border-[#00A7D1] focus:outline-none"
          >
            <option value="0.5">0.5x (Slow)</option>
            <option value="1">1.0x (Normal)</option>
            <option value="1.5">1.5x (Fast)</option>
            <option value="2">2.0x (Hyper)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <ColorPicker
            label="Accent Color"
            align="left"
            value={(config.accentColor as string) || '#00A7D1'}
            onChange={(color) => handleUpdate({ accentColor: color })}
          />

          <ColorPicker
            label="Secondary Color"
            align="right"
            value={(config.secondaryColor as string) || '#E84A8A'}
            onChange={(color) => handleUpdate({ secondaryColor: color })}
          />
        </div>
      </div>

      <div className="pt-3 border-t border-graphite">
        <FeaturedReposControls instanceId={instanceId} config={config} />
      </div>
    </div>
  )
}
