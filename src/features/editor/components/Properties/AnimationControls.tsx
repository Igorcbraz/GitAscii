'use client'

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Ban,
  FlipHorizontal,
  FlipVertical,
  Keyboard,
  Monitor,
  Play,
  Sparkles,
  Zap,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n'

import { useEditorStore } from '../../store/editorStore'

interface AnimationControlsProps {
  instanceId: string
  config: Record<string, unknown>
  widgetId?: string
}

export type AnimationType =
  | 'none'
  | 'fade-in'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'zoom-in'
  | 'zoom-out'
  | 'flip-x'
  | 'flip-y'
  | 'typewriter'
  | 'glitch'
  | 'scan-lines'

export type AnimationEasing = 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear' | 'spring'

interface AnimationPreset {
  id: AnimationType
  label: string
  icon: React.ElementType
  description: string
}

const ANIMATION_PRESETS: AnimationPreset[] = [
  {
    id: 'none',
    label: 'Sem animação',
    icon: Ban,
    description: 'Widget aparece instantaneamente',
  },
  {
    id: 'fade-in',
    label: 'Fade In',
    icon: Sparkles,
    description: 'Aparece gradualmente com opacidade',
  },
  {
    id: 'slide-up',
    label: 'Slide Up',
    icon: ArrowUp,
    description: 'Desliza de baixo para cima',
  },
  {
    id: 'slide-down',
    label: 'Slide Down',
    icon: ArrowDown,
    description: 'Desliza de cima para baixo',
  },
  {
    id: 'slide-left',
    label: 'Slide Left',
    icon: ArrowLeft,
    description: 'Desliza da direita para esquerda',
  },
  {
    id: 'slide-right',
    label: 'Slide Right',
    icon: ArrowRight,
    description: 'Desliza da esquerda para direita',
  },
  {
    id: 'zoom-in',
    label: 'Zoom In',
    icon: ZoomIn,
    description: 'Expande de um ponto central',
  },
  {
    id: 'zoom-out',
    label: 'Zoom Out',
    icon: ZoomOut,
    description: 'Reduz desde tamanho maior',
  },
  {
    id: 'flip-x',
    label: 'Flip Horizontal',
    icon: FlipHorizontal,
    description: 'Gira no eixo horizontal',
  },
  {
    id: 'flip-y',
    label: 'Flip Vertical',
    icon: FlipVertical,
    description: 'Gira no eixo vertical',
  },
  {
    id: 'typewriter',
    label: 'Typing',
    icon: Keyboard,
    description: 'Digita caractere por caractere',
  },
  {
    id: 'glitch',
    label: 'Glitch',
    icon: Zap,
    description: 'Efeito de falha digital',
  },
  {
    id: 'scan-lines',
    label: 'Scan Lines',
    icon: Monitor,
    description: 'Varredura estilo terminal CRT',
  },
]

const EASING_OPTIONS: { id: AnimationEasing; label: string }[] = [
  { id: 'ease', label: 'Ease' },
  { id: 'ease-in', label: 'Ease In' },
  { id: 'ease-out', label: 'Ease Out' },
  { id: 'ease-in-out', label: 'Ease In-Out' },
  { id: 'linear', label: 'Linear' },
  { id: 'spring', label: 'Spring' },
]

const DURATION_PRESETS = [
  { label: '400ms', value: 400 },
  { label: '800ms', value: 800 },
  { label: '1.2s', value: 1200 },
  { label: '1.6s', value: 1600 },
  { label: '2s', value: 2000 },
]

export function AnimationControls({ instanceId, config, widgetId }: AnimationControlsProps) {
  const { t } = useI18n()
  const { updateWidgetConfig } = useEditorStore()

  const animationType = (config.animationType as AnimationType) || 'none'
  const animationDuration = (config.animationDuration as number) || 600
  const animationDelay = (config.animationDelay as number) || 0
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

      {/* Grid de presets de animação */}
      <div className="grid grid-cols-3 gap-1.5">
        {ANIMATION_PRESETS.filter((preset) => {
          if (widgetId === 'ascii-art') {
            return preset.id === 'typewriter' || preset.id === 'none'
          }
          return true
        }).map((preset) => {
          const Icon = preset.icon
          return (
            <button
              key={preset.id}
              type="button"
              title={preset.description}
              onClick={() => updateWidgetConfig(instanceId, { animationType: preset.id })}
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
          {/* Duração */}
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
                  value={animationDuration}
                  onChange={(e) =>
                    updateWidgetConfig(instanceId, {
                      animationDuration: Math.max(100, parseInt(e.target.value, 10) || 100),
                    })
                  }
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
              max={2000}
              step={50}
              value={animationDuration}
              onChange={(e) =>
                updateWidgetConfig(instanceId, {
                  animationDuration: parseInt(e.target.value, 10),
                })
              }
              className="w-full accent-signal-lime h-1 bg-graphite rounded cursor-pointer"
            />
          </div>

          {/* Delay */}
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
                  value={animationDelay}
                  onChange={(e) =>
                    updateWidgetConfig(instanceId, {
                      animationDelay: Math.max(0, parseInt(e.target.value, 10) || 0),
                    })
                  }
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
              value={animationDelay}
              onChange={(e) =>
                updateWidgetConfig(instanceId, {
                  animationDelay: parseInt(e.target.value, 10),
                })
              }
              className="w-full accent-signal-lime h-1 bg-graphite rounded cursor-pointer"
            />
          </div>

          {/* Easing */}
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

          {/* Preview badge */}
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
