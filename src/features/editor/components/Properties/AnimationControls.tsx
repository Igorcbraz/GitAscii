'use client'

import { Play, Zap } from 'lucide-react'
import React from 'react'

import {
  ANIMATION_DURATION_PRESETS,
  ANIMATION_EASING_OPTIONS,
  ANIMATION_PRESETS,
  type AnimationEasing,
  type AnimationType,
} from '@/constants'
import { useI18n } from '@/i18n'

import { useEditorStore } from '../../store/editorStore'

export type { AnimationEasing, AnimationType }

interface AnimationControlsProps {
  instanceId: string
  config: Record<string, unknown>
  widgetId?: string
}

const EASING_OPTIONS = ANIMATION_EASING_OPTIONS
const DURATION_PRESETS = ANIMATION_DURATION_PRESETS

export function AnimationControls({ instanceId, config, widgetId }: AnimationControlsProps) {
  const { t } = useI18n()
  const { updateWidgetConfig } = useEditorStore()

  const animationType = (config.animationType as AnimationType) || 'none'
  const animationDuration = config.animationDuration !== undefined ? config.animationDuration : 1500
  const animationDelay = config.animationDelay !== undefined ? config.animationDelay : 0
  const animationEasing = (config.animationEasing as AnimationEasing) || 'ease-out'
  const previewKey = (config.animationPreviewKey as number) || 0

  const handlePreview = () =>
    updateWidgetConfig(instanceId, { animationPreviewKey: previewKey + 1 })

  return (
    <div className="space-y-4 pt-3 border-t border-graphite" data-testid="animation-controls">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-signal-lime font-inter-tight text-eyebrow uppercase tracking-wider font-medium">
          <Zap size={14} />
          <span>{t('editor.animation.title', 'Animação de Entrada')}</span>
        </div>
        {animationType !== 'none' && (
          <button
            onClick={handlePreview}
            title="Preview da animação"
            className="flex items-center gap-1 text-caption font-jetbrains-mono text-ash hover:text-signal-lime transition-colors cursor-pointer"
          >
            <Play size={11} />
            <span>preview</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {ANIMATION_PRESETS.filter((preset) => {
          if (widgetId === 'ascii-art') {
            return preset.id === 'typewriter' || preset.id === 'none'
          }
          if (widgetId === 'languages') {
            return !['flip-y', 'typewriter', 'scan-lines'].includes(preset.id)
          }
          return true
        }).map((preset) => {
          const Icon = preset.icon
          return (
            <button
              key={preset.id}
              type="button"
              title={preset.description}
              onClick={() =>
                updateWidgetConfig(instanceId, {
                  animationType: preset.id,
                  animationPreviewKey: previewKey + 1,
                })
              }
              className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-xs text-center cursor-pointer transition-all border text-[10px] font-inter-tight leading-tight ${
                animationType === preset.id
                  ? 'bg-signal-lime text-black border-signal-lime font-semibold'
                  : 'bg-graphite text-ash border-graphite hover:border-ash hover:text-chalk'
              }`}
            >
              <Icon className="w-[18px] h-[18px] mb-1" />
              <span className="leading-tight">{preset.label}</span>
            </button>
          )
        })}
      </div>

      {animationType !== 'none' && (
        <>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-eyebrow">
              <span className="text-ash font-inter-tight">
                {t('editor.animation.duration', 'Duração')}
              </span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={100}
                  max={5000}
                  value={animationDuration === '' ? '' : (animationDuration as number)}
                  onChange={(e) => {
                    const val = e.target.value
                    updateWidgetConfig(instanceId, {
                      animationDuration: val === '' ? '' : parseInt(val, 10),
                    })
                  }}
                  onBlur={(e) => {
                    const val = parseInt(e.target.value, 10)
                    if (isNaN(val) || val < 100) {
                      updateWidgetConfig(instanceId, { animationDuration: 1500 })
                    }
                  }}
                  className="w-14 bg-graphite border border-graphite focus:border-signal-lime px-1 py-0.5 text-right text-chalk font-jetbrains-mono rounded-xs focus:outline-none"
                />
                <span className="text-chalk font-jetbrains-mono">ms</span>
              </div>
            </div>
            <div className="flex gap-1">
              {DURATION_PRESETS.map((dp) => (
                <button
                  key={dp.value}
                  type="button"
                  onClick={() => updateWidgetConfig(instanceId, { animationDuration: dp.value })}
                  className={`flex-1 py-1 rounded-xs text-[10px] font-jetbrains-mono cursor-pointer transition-all border ${
                    animationDuration === dp.value
                      ? 'bg-signal-lime text-black border-signal-lime font-bold'
                      : 'bg-graphite text-ash border-graphite hover:border-ash hover:text-chalk'
                  }`}
                >
                  {dp.label}
                </button>
              ))}
            </div>
            <input
              type="range"
              min={100}
              max={3000}
              step={50}
              value={animationDuration === '' ? 600 : (animationDuration as number)}
              onChange={(e) =>
                updateWidgetConfig(instanceId, {
                  animationDuration: parseInt(e.target.value, 10),
                })
              }
              className="w-full accent-signal-lime h-1 bg-graphite rounded cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-eyebrow">
              <span className="text-ash font-inter-tight">
                {t('editor.animation.delay', 'Atraso (delay)')}
              </span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={5000}
                  value={animationDelay === '' ? '' : (animationDelay as number)}
                  onChange={(e) => {
                    const val = e.target.value
                    updateWidgetConfig(instanceId, {
                      animationDelay: val === '' ? '' : parseInt(val, 10),
                    })
                  }}
                  onBlur={(e) => {
                    const val = parseInt(e.target.value, 10)
                    if (isNaN(val) || val < 0) {
                      updateWidgetConfig(instanceId, { animationDelay: 0 })
                    }
                  }}
                  className="w-14 bg-graphite border border-graphite focus:border-signal-lime px-1 py-0.5 text-right text-chalk font-jetbrains-mono rounded-xs focus:outline-none"
                />
                <span className="text-chalk font-jetbrains-mono">ms</span>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={1500}
              step={50}
              value={animationDelay === '' ? 0 : (animationDelay as number)}
              onChange={(e) =>
                updateWidgetConfig(instanceId, {
                  animationDelay: parseInt(e.target.value, 10),
                })
              }
              className="w-full accent-signal-lime h-1 bg-graphite rounded cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-eyebrow text-ash font-inter-tight block">
              {t('editor.animation.easing', 'Curva de aceleração')}
            </span>
            <div className="grid grid-cols-3 gap-1">
              {EASING_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updateWidgetConfig(instanceId, { animationEasing: opt.id })}
                  className={`py-1 rounded-xs text-[10px] font-jetbrains-mono cursor-pointer transition-all border ${
                    animationEasing === opt.id
                      ? 'bg-signal-lime text-black border-signal-lime font-bold'
                      : 'bg-graphite text-ash border-graphite hover:border-ash hover:text-chalk'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-carbon border border-signal-lime/30 p-2 rounded-xs text-center">
            <span className="text-caption font-jetbrains-mono text-signal-lime/70">
              {t('editor.animation.active', '✓ animação ativa ao montar')} ·{' '}
              <strong className="text-signal-lime">{animationType}</strong>
            </span>
          </div>
        </>
      )}
    </div>
  )
}
