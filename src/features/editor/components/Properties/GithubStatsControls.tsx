'use client'

import { BarChart3, FileCode2, FolderGit2, GitFork, Star, UserCheck, Users } from 'lucide-react'
import React, { useEffect } from 'react'

import { Switch } from '@/components/ui/Switch'
import type { WidgetConfig } from '@/engine/types'
import { useI18n } from '@/i18n'

import { useEditorStore } from '../../store/editorStore'

interface GithubStatsControlsProps {
  instanceId: string
  config: WidgetConfig
}

const TOTAL_METRICS = 6

const METRICS: { id: string; label: string; icon: React.ElementType }[] = [
  { id: 'stars', label: 'Stars', icon: Star },
  { id: 'repos', label: 'Repos', icon: FolderGit2 },
  { id: 'followers', label: 'Followers', icon: Users },
  { id: 'following', label: 'Following', icon: UserCheck },
  { id: 'forks', label: 'Total Forks', icon: GitFork },
  { id: 'gists', label: 'Public Gists', icon: FileCode2 },
]

const STATS_STYLES: { value: string; label: string; preview: string }[] = [
  { value: 'default', label: 'Números grandes', preview: '42\nSTARS' },
  { value: 'terminal', label: 'Terminal', preview: '[ 42 ]\nSTARS' },
  { value: 'minimal', label: 'Minimalista', preview: '42' },
  { value: 'cards', label: 'Cartões', preview: '┌──────┐\n│  42  │\n└──────┘' },
]

function computeHeight(layout: string, visibleCount: number): number {
  if (layout === 'vertical') return visibleCount * 52 + 64
  if (layout === 'grid') return Math.ceil(visibleCount / 2) * 60 + 64

  return 120
}

export function GithubStatsControls({ instanceId, config }: GithubStatsControlsProps) {
  const { t } = useI18n()
  const { updateWidgetConfig, updateWidgetSize } = useEditorStore()
  const currentWidget = useEditorStore((s) =>
    s.config?.widgets.find((w) => w.instanceId === instanceId)
  )

  const hiddenMetrics: string[] = Array.isArray(config.hideMetrics)
    ? (config.hideMetrics as string[])
    : []

  const layout = (config.statsLayout as string) || 'horizontal'
  const labelStyle = (config.labelStyle as string) || 'label'
  const statsStyle = (config.statsStyle as string) || 'default'
  const valueFontSize = Number(config.valueFontSize) || 28

  const visibleCount = TOTAL_METRICS - hiddenMetrics.length

  useEffect(() => {
    const currentWidth = currentWidget?.size.width ?? 800
    const newHeight = computeHeight(layout, visibleCount)
    updateWidgetSize(instanceId, { width: currentWidth, height: newHeight }, false)
  }, [currentWidget?.size.width, instanceId, layout, updateWidgetSize, visibleCount])

  const toggleMetric = (metricId: string, visible: boolean) => {
    const updated = visible
      ? hiddenMetrics.filter((m) => m !== metricId)
      : [...hiddenMetrics.filter((m) => m !== metricId), metricId]
    updateWidgetConfig(instanceId, { hideMetrics: updated })
  }

  return (
    <div className="space-y-4 pt-3 border-t border-graphite">
      <div className="flex items-center gap-2 text-signal-lime font-inter-tight text-eyebrow uppercase tracking-wider font-medium">
        <BarChart3 size={14} />
        <span>{t('editor.stats.title', 'Configurações de Métricas')}</span>
      </div>

      <div className="space-y-1.5">
        <label className="text-eyebrow text-ash block font-inter-tight">
          {t('editor.stats.visible_metrics', 'Métricas Visíveis')}
        </label>
        <div className="space-y-1">
          {METRICS.map((metric) => {
            const isVisible = !hiddenMetrics.includes(metric.id)
            const Icon = metric.icon
            return (
              <div
                key={metric.id}
                className="flex items-center justify-between p-2 bg-graphite rounded-sm border border-graphite"
              >
                <label className="flex items-center gap-1.5 text-eyebrow text-chalk font-inter-tight cursor-pointer">
                  <Icon size={12} className="text-ash shrink-0" />
                  {metric.label}
                </label>
                <Switch
                  checked={isVisible}
                  onChange={(checked) => toggleMetric(metric.id, checked)}
                />
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
          {t('editor.stats.layout', 'Layout')}
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { value: 'horizontal', label: 'Linha' },
            { value: 'vertical', label: 'Coluna' },
            { value: 'grid', label: 'Grid 2x' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateWidgetConfig(instanceId, { statsLayout: opt.value })}
              className={`py-1.5 rounded-xs text-eyebrow font-inter-tight transition-all cursor-pointer border ${
                layout === opt.value
                  ? 'bg-signal-lime text-black border-signal-lime font-bold'
                  : 'bg-graphite text-ash border-graphite hover:border-slate hover:text-chalk'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
          {t('editor.stats.stats_style', 'Estilo Visual')}
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {STATS_STYLES.map((opt) => {
            const isActive = statsStyle === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateWidgetConfig(instanceId, { statsStyle: opt.value })}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xs text-eyebrow font-inter-tight transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-signal-lime text-black border-signal-lime font-bold'
                    : 'bg-graphite text-ash border-graphite hover:border-slate hover:text-chalk'
                }`}
              >
                <pre
                  className={`font-jetbrains-mono text-[9px] leading-tight whitespace-pre text-center ${
                    isActive ? 'text-black' : 'text-chalk'
                  }`}
                >
                  {opt.preview}
                </pre>
                <span className="text-caption leading-tight">{opt.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
          {t('editor.stats.label_style', 'Estilo do Rótulo')}
        </label>
        <select
          value={labelStyle}
          onChange={(e) => updateWidgetConfig(instanceId, { labelStyle: e.target.value })}
          className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note p-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
        >
          <option value="label">Rótulo (ex: STARS)</option>
          <option value="icon">Ícone + Rótulo</option>
          <option value="none">Sem Rótulo</option>
        </select>
      </div>

      <div>
        <div className="flex justify-between text-eyebrow mb-1">
          <span className="text-ash font-inter-tight">
            {t('editor.stats.value_size', 'Tamanho dos Valores')}
          </span>
          <span className="text-chalk font-jetbrains-mono">{valueFontSize}px</span>
        </div>
        <input
          type="range"
          min="18"
          max="48"
          step="2"
          value={valueFontSize}
          onChange={(e) =>
            updateWidgetConfig(instanceId, { valueFontSize: parseInt(e.target.value, 10) })
          }
          className="w-full accent-signal-lime h-1 bg-graphite rounded cursor-pointer"
        />
      </div>
    </div>
  )
}
