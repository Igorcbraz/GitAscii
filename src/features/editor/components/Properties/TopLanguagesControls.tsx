'use client'

import { AlignLeft, BarChart2, Code2, LayoutGrid, PieChart, X } from 'lucide-react'
import React from 'react'

import { Switch } from '@/components/ui/Switch'
import { COMMON_LANGUAGES } from '@/constants'
import type { WidgetConfig } from '@/engine/types'
import { useI18n } from '@/i18n'

import { useEditorStore } from '../../store/editorStore'

interface TopLanguagesControlsProps {
  instanceId: string
  config: WidgetConfig
}

function computeHeight(layout: string, langsCount: number): number {
  switch (layout) {
    case 'bars':
      return 40 + 16 + Math.ceil(langsCount / 2) * 24 + 32
    case 'list':
      return 40 + langsCount * 26 + 32
    case 'compact':
      return 40 + Math.ceil(langsCount / 3) * 52 + 32
    case 'donut':
      return 200 + Math.min(4, langsCount) * 20 + 32
    default:
      return 40 + 16 + Math.ceil(langsCount / 2) * 24 + 32
  }
}

const LAYOUT_OPTIONS = [
  { value: 'bars', label: 'Barras', Icon: BarChart2 },
  { value: 'list', label: 'Lista', Icon: AlignLeft },
  { value: 'compact', label: 'Compacto', Icon: LayoutGrid },
  { value: 'donut', label: 'Donut', Icon: PieChart },
] as const

export function TopLanguagesControls({ instanceId, config }: TopLanguagesControlsProps) {
  const { t } = useI18n()
  const updateWidgetConfig = useEditorStore((state) => state.updateWidgetConfig)
  const updateWidgetSize = useEditorStore((state) => state.updateWidgetSize)
  const currentWidgetWidth = useEditorStore(
    (state) => state.config?.widgets.find((w) => w.instanceId === instanceId)?.size?.width
  )
  const currentWidgetHeight = useEditorStore(
    (state) => state.config?.widgets.find((w) => w.instanceId === instanceId)?.size?.height
  )

  const langsCount = Number(config.langsCount) || 5
  const layout = (config.langsLayout as string) || 'bars'
  const showPercentage = config.showPercentage !== false

  const donutLegendPos = (config.donutLegendPos as string) || 'bottom'
  const donutShowPct = config.donutShowPct !== false
  const donutCenterLabel = config.donutCenterLabel === true

  React.useEffect(() => {
    const newHeight = computeHeight(layout, langsCount)
    const currentWidth = currentWidgetWidth ?? 300

    if (currentWidgetHeight === newHeight && currentWidgetWidth === currentWidth) {
      return
    }

    updateWidgetSize(instanceId, { width: currentWidth, height: newHeight }, false)
  }, [layout, langsCount, currentWidgetWidth, currentWidgetHeight, updateWidgetSize, instanceId])

  const hideLangs: string[] = React.useMemo(() => {
    if (Array.isArray(config.hideLangsArr)) return config.hideLangsArr as string[]
    if (typeof config.hideLangs === 'string' && config.hideLangs) {
      return (config.hideLangs as string)
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean)
    }
    return []
  }, [config.hideLangsArr, config.hideLangs])

  const [customInput, setCustomInput] = React.useState('')

  const updateHideLangs = (langs: string[]) => {
    updateWidgetConfig(instanceId, {
      hideLangsArr: langs,
      hideLangs: langs.join(','),
    })
  }

  const addLang = (lang: string) => {
    const trimmed = lang.trim()
    if (!trimmed) return

    if (hideLangs.some((l) => l.toLowerCase() === trimmed.toLowerCase())) return
    updateHideLangs([...hideLangs, trimmed])
  }

  const removeLang = (lang: string) => {
    updateHideLangs(hideLangs.filter((l) => l !== lang))
  }

  return (
    <div className="space-y-4 pt-3 border-t border-graphite">
      <div className="flex items-center gap-2 text-signal-lime font-inter-tight text-eyebrow uppercase tracking-wider font-medium">
        <Code2 size={14} />
        <span>{t('editor.langs.title', 'Configurações de Linguagens')}</span>
      </div>

      <div>
        <div className="flex justify-between text-eyebrow mb-1">
          <span className="text-ash font-inter-tight">
            {t('editor.langs.count', 'Qtd. de Linguagens')}
          </span>
          <span className="text-chalk font-jetbrains-mono">{langsCount}</span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={langsCount}
          onChange={(e) =>
            updateWidgetConfig(instanceId, { langsCount: parseInt(e.target.value, 10) })
          }
          className="w-full accent-signal-lime h-1 bg-graphite rounded cursor-pointer"
        />
      </div>

      <div>
        <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
          {t('editor.langs.layout', 'Layout')}
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {LAYOUT_OPTIONS.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => updateWidgetConfig(instanceId, { langsLayout: value })}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xs text-eyebrow font-inter-tight transition-all cursor-pointer border ${
                layout === value
                  ? 'bg-signal-lime text-black border-signal-lime font-bold'
                  : 'bg-graphite text-ash border-graphite hover:border-slate hover:text-chalk'
              }`}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between p-2 bg-graphite rounded-sm border border-graphite">
        <label className="text-eyebrow text-chalk font-inter-tight cursor-pointer">
          {t('editor.langs.show_pct', 'Exibir Porcentagem')}
        </label>
        <Switch
          checked={showPercentage}
          onChange={(checked) => updateWidgetConfig(instanceId, { showPercentage: checked })}
        />
      </div>

      {layout === 'donut' && (
        <div className="space-y-2">
          <div>
            <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
              {t('editor.langs.donut_legend_pos', 'Posição da Legenda')}
            </label>
            <select
              value={donutLegendPos}
              onChange={(e) => updateWidgetConfig(instanceId, { donutLegendPos: e.target.value })}
              className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-eyebrow px-2 py-1.5 rounded-xs focus:border-signal-lime focus:outline-none cursor-pointer"
            >
              <option value="bottom">
                {t('editor.langs.donut_legend_bottom', 'Legenda Abaixo')}
              </option>
              <option value="side">{t('editor.langs.donut_legend_side', 'Legenda ao Lado')}</option>
              <option value="none">{t('editor.langs.donut_legend_none', 'Sem Legenda')}</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-2 bg-graphite rounded-sm border border-graphite">
            <label className="text-eyebrow text-chalk font-inter-tight cursor-pointer">
              {t('editor.langs.donut_show_pct', 'Mostrar % no Donut')}
            </label>
            <Switch
              checked={donutShowPct}
              onChange={(checked) => updateWidgetConfig(instanceId, { donutShowPct: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-2 bg-graphite rounded-sm border border-graphite">
            <label className="text-eyebrow text-chalk font-inter-tight cursor-pointer">
              {t('editor.langs.donut_center_label', 'Texto Central (maior linguagem)')}
            </label>
            <Switch
              checked={donutCenterLabel}
              onChange={(checked) => updateWidgetConfig(instanceId, { donutCenterLabel: checked })}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-eyebrow text-ash block font-inter-tight">
          {t('editor.langs.hide_langs', 'Linguagens Ocultas')}
        </label>

        <div className="min-h-10 max-h-18 overflow-y-auto">
          {hideLangs.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {hideLangs.map((lang) => (
                <span
                  key={lang}
                  className="inline-flex items-center gap-1 bg-graphite border border-slate text-chalk font-inter-tight text-eyebrow px-2 py-0.5 rounded-xs"
                >
                  {lang}
                  <button
                    type="button"
                    onClick={() => removeLang(lang)}
                    className="text-ash hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-caption text-ash/60 font-inter-tight mb-1.5">
            {t('editor.langs.quick_hide', 'Ocultar rapidamente:')}
          </p>
          <div className="flex flex-wrap gap-1">
            {COMMON_LANGUAGES.filter(
              (l) => !hideLangs.some((h) => h.toLowerCase() === l.toLowerCase())
            )
              .slice(0, 12)
              .map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => addLang(lang)}
                  className="text-caption font-inter-tight bg-graphite border border-graphite hover:border-signal-lime hover:text-chalk text-ash px-1.5 py-0.5 rounded-xs transition-colors cursor-pointer"
                >
                  {lang}
                </button>
              ))}
          </div>
        </div>

        <div className="flex gap-1.5">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addLang(customInput)
                setCustomInput('')
              }
            }}
            placeholder={t('editor.langs.custom_lang', 'Ex: Markdown')}
            className="flex-1 bg-graphite border border-graphite text-chalk font-inter-tight text-note px-2 py-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              addLang(customInput)
              setCustomInput('')
            }}
            className="px-2 bg-graphite border border-graphite hover:border-signal-lime text-ash hover:text-chalk rounded-xs transition-colors cursor-pointer text-eyebrow"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}
