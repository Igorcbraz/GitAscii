'use client'

import {
  AlignCenter,
  AlignEndVertical,
  AlignHorizontalDistributeCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  AlignStartVertical,
  AlignVerticalDistributeCenter,
  AlignVerticalJustifyCenter,
  Ban,
  Cpu,
  Eye,
  EyeOff,
  Flame,
  Layers,
  Lock,
  Maximize2,
  Palette,
  Radio,
  Sparkles,
  Terminal,
  TerminalSquare,
  Trash2,
  Unlock,
  Zap,
} from 'lucide-react'
import React from 'react'

import { Switch } from '@/components/ui/Switch'
import {
  ANIMATION_DURATION_PRESETS,
  ANIMATION_EASING_OPTIONS,
  ANIMATION_PRESETS,
  type AnimationEasing,
  type AnimationType,
  ASCII_PREMIUM_COLOR_THEMES,
  SURVEILLANCE_COLOR_THEMES,
  WIDGET_CATEGORIES,
  WIDGET_IDS,
} from '@/constants'
import type { WidgetInstance } from '@/engine/types'
import { useI18n } from '@/i18n'

import { WIDGET_CATALOG } from '../../config/widgets'
import { useEditorStore } from '../../store/editorStore'
import { ColorPicker } from './ColorPicker'

const WIDTH_PRESETS = [
  { label: '100%', val: 800 },
  { label: '75%', val: 600 },
  { label: '50%', val: 392 },
  { label: '33%', val: 256 },
]

function getWidgetCategory(widget: WidgetInstance): string {
  const catalogItem = WIDGET_CATALOG.find((item) => item.id === widget.widgetId)
  if (catalogItem?.category) return catalogItem.category
  if (widget.widgetId.startsWith('surveillance-')) return WIDGET_CATEGORIES.SURVEILLANCE
  if (widget.widgetId.startsWith('controlplane-')) return WIDGET_CATEGORIES.CONTROLPLANE
  if (widget.widgetId.startsWith('codeweb-')) return WIDGET_CATEGORIES.CODEWEB_DEV
  if (widget.widgetId.startsWith('godprofile-')) return WIDGET_CATEGORIES.GODPROFILE
  if (widget.widgetId.startsWith('asciiprofile-')) return WIDGET_CATEGORIES.ASCIIPROFILE
  if (widget.widgetId.startsWith('premium-ascii-')) return WIDGET_CATEGORIES.PREMIUM_ASCII
  if (
    [
      WIDGET_IDS.STATS,
      WIDGET_IDS.LANGUAGES,
      WIDGET_IDS.REPOSITORIES,
      WIDGET_IDS.GITHUB_README_STATS,
      WIDGET_IDS.STREAK_STATS,
      WIDGET_IDS.PROFILE_TROPHY,
      WIDGET_IDS.ACTIVITY_GRAPH,
      WIDGET_IDS.CONTRIBUTION_SNAKE,
      WIDGET_IDS.METRICS_CARD,
      WIDGET_IDS.VIEWS_COUNTER,
      WIDGET_IDS.README_QUOTES,
      WIDGET_IDS.AWESOME_BADGE,
      WIDGET_IDS.GHSTATS,
    ].includes(widget.widgetId as any)
  ) {
    return 'stats'
  }
  return 'general'
}

const CATEGORY_NAMES: Record<string, { label: string; icon: React.ElementType }> = {
  [WIDGET_CATEGORIES.SURVEILLANCE]: { label: 'Surveillance (198X)', icon: Radio },
  [WIDGET_CATEGORIES.CONTROLPLANE]: { label: 'Control Plane', icon: Cpu },
  [WIDGET_CATEGORIES.CODEWEB_DEV]: { label: 'Codeweb Aura', icon: Sparkles },
  [WIDGET_CATEGORIES.GODPROFILE]: { label: 'GodProfile', icon: TerminalSquare },
  [WIDGET_CATEGORIES.ASCIIPROFILE]: { label: 'ASCII Profile', icon: Terminal },
  [WIDGET_CATEGORIES.PREMIUM_ASCII]: { label: 'ASCII Premium Kit', icon: Terminal },
  [WIDGET_CATEGORIES.ESSENTIAL]: { label: 'Essenciais', icon: Flame },
  [WIDGET_CATEGORIES.INTERACTIVE]: { label: 'Interativos', icon: Sparkles },
  stats: { label: 'Estatísticas & Métricas', icon: Flame },
}

interface MultiPropertiesPanelProps {
  selectedWidgets: WidgetInstance[]
}

export function MultiPropertiesPanel({ selectedWidgets }: MultiPropertiesPanelProps) {
  const { t } = useI18n()
  const globalStyles = useEditorStore((state) => state.config?.globalStyles)

  const updateWidgetsConfig = useEditorStore((state) => state.updateWidgetsConfig)
  const updateWidgetsSize = useEditorStore((state) => state.updateWidgetsSize)
  const scaleWidgets = useEditorStore((state) => state.scaleWidgets)
  const toggleWidgetsVisibility = useEditorStore((state) => state.toggleWidgetsVisibility)
  const toggleWidgetsLock = useEditorStore((state) => state.toggleWidgetsLock)
  const alignWidgets = useEditorStore((state) => state.alignWidgets)
  const distributeWidgets = useEditorStore((state) => state.distributeWidgets)
  const removeWidgets = useEditorStore((state) => state.removeWidgets)
  const recordHistorySnapshot = useEditorStore((state) => state.recordHistorySnapshot)

  if (selectedWidgets.length === 0 || !globalStyles) return null

  const instanceIds = selectedWidgets.map((w) => w.instanceId)
  const primaryWidget = selectedWidgets[0]
  const primaryCategory = getWidgetCategory(primaryWidget)

  const isSameCategory = selectedWidgets.every((w) => getWidgetCategory(w) === primaryCategory)

  const allLocked = selectedWidgets.every((w) => w.locked)
  const allVisible = selectedWidgets.every((w) => w.visible)
  const allHideBorder = selectedWidgets.every((w) => Boolean(w.config.hideBorder))
  const allHideDecorations = selectedWidgets.every((w) => Boolean(w.config.hideDecorations))
  const allShowTitle = selectedWidgets.every((w) => w.config.showTitle !== false)

  const representativeCfg = primaryWidget.config
  const currentAccent =
    (representativeCfg.accentColor as string) || globalStyles.accentColor || '#c5ff4a'
  const currentBg =
    (representativeCfg.backgroundColor as string) || globalStyles.backgroundColor || '#1f1f1f'
  const currentSecondary = (representativeCfg.secondaryColor as string) || '#c084fc'
  const currentText = (representativeCfg.textColor as string) || globalStyles.textColor || '#ffffff'
  const currentBorder =
    (representativeCfg.borderColor as string) || globalStyles.borderColor || '#252525'

  const currentAnimType = (representativeCfg.animationType as AnimationType) || 'none'
  const currentAnimDuration =
    representativeCfg.animationDuration !== undefined
      ? (representativeCfg.animationDuration as number)
      : 1500
  const currentAnimEasing = (representativeCfg.animationEasing as AnimationEasing) || 'ease-out'

  const averageWidth = Math.round(
    selectedWidgets.reduce((sum, w) => sum + w.size.width, 0) / selectedWidgets.length
  )
  const averageHeight = Math.round(
    selectedWidgets.reduce((sum, w) => sum + w.size.height, 0) / selectedWidgets.length
  )

  const catMeta = CATEGORY_NAMES[primaryCategory] || {
    label: primaryCategory.toUpperCase(),
    icon: Layers,
  }
  const CategoryIcon = catMeta.icon

  return (
    <aside
      id="tour-properties-sidebar"
      className="w-full lg:w-[320px] h-full bg-onyx border-l-0 lg:border-l border-graphite flex flex-col shrink-0 overflow-y-auto"
      data-testid="multi-properties-panel"
    >
      <div className="p-4 border-b border-graphite flex items-center justify-between bg-void-black">
        <div>
          <span className="label-stamp text-signal-lime">
            {t('editor.properties.multi_title', '[ MULTI-SELEÇÃO ]')}
          </span>
          <h3 className="font-inter-tight font-semibold text-base text-chalk mt-0.5">
            {selectedWidgets.length} {t('editor.statusbar.widgets', 'Widgets')}{' '}
            {t('editor.statusbar.selected', 'Selecionados')}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleWidgetsLock(instanceIds)}
            data-testid="multi-widget-lock-btn"
            title={
              allLocked
                ? t('editor.properties.unlock_all', 'Desbloquear Todos')
                : t('editor.properties.lock_all', 'Bloquear Todos')
            }
            className={`p-1.5 rounded-xs hover:bg-graphite transition-colors cursor-pointer ${
              allLocked ? 'text-signal-lime' : 'text-ash hover:text-chalk'
            }`}
          >
            {allLocked ? <Lock size={16} /> : <Unlock size={16} />}
          </button>

          <button
            onClick={() => toggleWidgetsVisibility(instanceIds)}
            data-testid="multi-widget-visible-btn"
            title={
              allVisible
                ? t('editor.properties.hide_all', 'Ocultar Todos')
                : t('editor.properties.show_all', 'Exibir Todos')
            }
            className={`p-1.5 rounded-xs hover:bg-graphite transition-colors cursor-pointer ${
              allVisible ? 'text-ash hover:text-chalk' : 'text-fog'
            }`}
          >
            {allVisible ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>

          <button
            onClick={() => removeWidgets(instanceIds)}
            data-testid="multi-widget-delete-btn"
            title={t('editor.properties.delete_all', 'Excluir Widgets Selecionados')}
            className="p-1.5 rounded-xs hover:bg-red-500/20 text-ash hover:text-red-400 transition-colors cursor-pointer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6 flex-1">
        {isSameCategory ? (
          <div className="p-3 bg-signal-lime/10 border border-signal-lime/30 rounded-xs space-y-1">
            <div className="flex items-center gap-1.5 text-signal-lime font-inter-tight font-semibold text-eyebrow uppercase tracking-wider">
              <CategoryIcon size={14} />
              <span>{catMeta.label}</span>
            </div>
            <p className="text-[11px] text-ash font-inter-tight leading-relaxed">
              {t(
                'editor.properties.same_category_desc',
                'Todos os widgets pertencem à mesma categoria. Controles avançados compartilhados estão disponíveis abaixo.'
              )}
            </p>
          </div>
        ) : (
          <div className="p-3 bg-graphite/40 border border-graphite rounded-xs space-y-1">
            <div className="flex items-center gap-1.5 text-chalk font-inter-tight font-semibold text-eyebrow uppercase tracking-wider">
              <Layers size={14} className="text-ash" />
              <span>{t('editor.properties.mixed_categories', 'Categorias Mistas')}</span>
            </div>
            <p className="text-[11px] text-ash font-inter-tight leading-relaxed">
              {t(
                'editor.properties.mixed_categories_desc',
                'Propriedades comuns (cores, bordas, dimensões, alinhamento e animações) serão aplicadas a todos simultaneamente.'
              )}
            </p>
          </div>
        )}

        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-2 text-ash font-inter-tight text-eyebrow uppercase tracking-wider font-medium">
            <AlignJustify size={14} />
            <span>{t('editor.properties.alignment_title', 'Alinhamento & Distribuição')}</span>
          </div>

          <div className="grid grid-cols-6 gap-1 bg-graphite/40 p-1.5 rounded-xs border border-graphite">
            <button
              type="button"
              onClick={() => alignWidgets(instanceIds, 'left')}
              title={t('editor.properties.align_left', 'Alinhar à Esquerda')}
              className="p-2 rounded-xs hover:bg-graphite hover:text-signal-lime text-ash transition-colors flex items-center justify-center cursor-pointer"
            >
              <AlignLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => alignWidgets(instanceIds, 'center')}
              title={t('editor.properties.align_center', 'Alinhar ao Centro Horizontal')}
              className="p-2 rounded-xs hover:bg-graphite hover:text-signal-lime text-ash transition-colors flex items-center justify-center cursor-pointer"
            >
              <AlignCenter size={16} />
            </button>
            <button
              type="button"
              onClick={() => alignWidgets(instanceIds, 'right')}
              title={t('editor.properties.align_right', 'Alinhar à Direita')}
              className="p-2 rounded-xs hover:bg-graphite hover:text-signal-lime text-ash transition-colors flex items-center justify-center cursor-pointer"
            >
              <AlignRight size={16} />
            </button>
            <button
              type="button"
              onClick={() => alignWidgets(instanceIds, 'top')}
              title={t('editor.properties.align_top', 'Alinhar ao Topo')}
              className="p-2 rounded-xs hover:bg-graphite hover:text-signal-lime text-ash transition-colors flex items-center justify-center cursor-pointer"
            >
              <AlignStartVertical size={16} />
            </button>
            <button
              type="button"
              onClick={() => alignWidgets(instanceIds, 'middle')}
              title={t('editor.properties.align_middle', 'Alinhar ao Meio Vertical')}
              className="p-2 rounded-xs hover:bg-graphite hover:text-signal-lime text-ash transition-colors flex items-center justify-center cursor-pointer"
            >
              <AlignVerticalJustifyCenter size={16} />
            </button>
            <button
              type="button"
              onClick={() => alignWidgets(instanceIds, 'bottom')}
              title={t('editor.properties.align_bottom', 'Alinhar à Base')}
              className="p-2 rounded-xs hover:bg-graphite hover:text-signal-lime text-ash transition-colors flex items-center justify-center cursor-pointer"
            >
              <AlignEndVertical size={16} />
            </button>
          </div>

          {selectedWidgets.length >= 3 && (
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => distributeWidgets(instanceIds, 'vertical')}
                className="py-1.5 px-2 bg-graphite border border-graphite hover:border-slate text-ash hover:text-chalk rounded-xs text-[11px] font-inter-tight flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <AlignVerticalDistributeCenter size={14} />
                <span>{t('editor.properties.distribute_v', 'Distribuir Vertical')}</span>
              </button>
              <button
                type="button"
                onClick={() => distributeWidgets(instanceIds, 'horizontal')}
                className="py-1.5 px-2 bg-graphite border border-graphite hover:border-slate text-ash hover:text-chalk rounded-xs text-[11px] font-inter-tight flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <AlignHorizontalDistributeCenter size={14} />
                <span>{t('editor.properties.distribute_h', 'Distribuir Horizontal')}</span>
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3 pt-3 border-t border-graphite">
          <div className="flex items-center gap-2 text-ash font-inter-tight text-eyebrow uppercase tracking-wider font-medium">
            <Palette size={14} />
            <span>{t('editor.properties.colors_theme', 'Cores & Tema (Múltiplos)')}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ColorPicker
              label="Background"
              align="left"
              value={currentBg}
              onChange={(color) => updateWidgetsConfig(instanceIds, { backgroundColor: color })}
            />

            <ColorPicker
              label={t('editor.properties.color_destaque', 'Cor de Destaque')}
              align="right"
              value={currentAccent}
              onChange={(color) => updateWidgetsConfig(instanceIds, { accentColor: color })}
            />

            <ColorPicker
              label={t('editor.properties.color_secundaria', 'Cor Secundária')}
              align="left"
              value={currentSecondary}
              onChange={(color) => updateWidgetsConfig(instanceIds, { secondaryColor: color })}
            />

            <ColorPicker
              label={t('editor.properties.color_texto', 'Cor do Texto')}
              align="right"
              value={currentText}
              onChange={(color) => updateWidgetsConfig(instanceIds, { textColor: color })}
            />

            <ColorPicker
              label={t('editor.properties.color_borda', 'Cor da Borda')}
              align="left"
              value={currentBorder}
              onChange={(color) => updateWidgetsConfig(instanceIds, { borderColor: color })}
            />
          </div>

          <div className="flex items-center justify-between p-2 bg-graphite rounded-sm border border-graphite mt-3">
            <label
              className="text-eyebrow text-chalk font-inter-tight cursor-pointer"
              onClick={() => updateWidgetsConfig(instanceIds, { hideBorder: !allHideBorder })}
            >
              {t('editor.properties.hide_border', 'Sem Borda')}
            </label>
            <button
              type="button"
              className={`w-9 h-5 rounded-full transition-colors relative flex items-center shrink-0 ${
                allHideBorder ? 'bg-signal-lime' : 'bg-zinc-700'
              } focus:outline-none`}
              onClick={() => updateWidgetsConfig(instanceIds, { hideBorder: !allHideBorder })}
            >
              <span
                className={`absolute left-0.5 w-4 h-4 rounded-full transition-transform ${
                  allHideBorder ? 'bg-graphite translate-x-4' : 'bg-chalk translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-2 bg-graphite rounded-sm border border-graphite mt-2">
            <label
              className="text-eyebrow text-chalk font-inter-tight cursor-pointer"
              onClick={() =>
                updateWidgetsConfig(instanceIds, { hideDecorations: !allHideDecorations })
              }
            >
              {t('editor.properties.hide_decorations', 'Sem Detalhes (+)')}
            </label>
            <button
              type="button"
              className={`w-9 h-5 rounded-full transition-colors relative flex items-center shrink-0 ${
                allHideDecorations ? 'bg-signal-lime' : 'bg-zinc-700'
              } focus:outline-none`}
              onClick={() =>
                updateWidgetsConfig(instanceIds, { hideDecorations: !allHideDecorations })
              }
            >
              <span
                className={`absolute left-0.5 w-4 h-4 rounded-full transition-transform ${
                  allHideDecorations ? 'bg-graphite translate-x-4' : 'bg-chalk translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-2 bg-graphite rounded-sm border border-graphite mt-2">
            <label
              className="text-eyebrow text-chalk font-inter-tight cursor-pointer"
              onClick={() => updateWidgetsConfig(instanceIds, { showTitle: !allShowTitle })}
            >
              {t('editor.properties.show_title', 'Exibir Título do Widget')}
            </label>
            <button
              type="button"
              className={`w-9 h-5 rounded-full transition-colors relative flex items-center shrink-0 ${
                allShowTitle ? 'bg-signal-lime' : 'bg-zinc-700'
              } focus:outline-none`}
              onClick={() => updateWidgetsConfig(instanceIds, { showTitle: !allShowTitle })}
            >
              <span
                className={`absolute left-0.5 w-4 h-4 rounded-full transition-transform ${
                  allShowTitle ? 'bg-graphite translate-x-4' : 'bg-chalk translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {isSameCategory && primaryCategory === WIDGET_CATEGORIES.PREMIUM_ASCII && (
          <div className="space-y-3 pt-3 border-t border-graphite font-mono">
            <div className="flex items-center gap-2 text-[#3fb950] text-eyebrow uppercase tracking-wider font-semibold">
              <Terminal size={14} />
              <span>{t('editor.ascii_premium.color_presets', 'ASCII Premium Theme Presets')}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {ASCII_PREMIUM_COLOR_THEMES.map((th) => {
                const isActive =
                  currentAccent.toLowerCase() === th.primary.toLowerCase() &&
                  currentSecondary.toLowerCase() === th.secondary.toLowerCase()

                return (
                  <button
                    key={th.name}
                    type="button"
                    onClick={() =>
                      updateWidgetsConfig(instanceIds, {
                        accentColor: th.primary,
                        secondaryColor: th.secondary,
                        borderColor: th.border,
                        backgroundColor: th.background,
                        transparentBackground: th.background === 'transparent',
                      })
                    }
                    className={`py-1.5 px-1 rounded-xs text-[10px] font-mono transition-all cursor-pointer border text-center truncate flex items-center justify-center gap-1.5 ${
                      isActive
                        ? 'border-chalk font-bold shadow-xs'
                        : 'bg-graphite text-ash border-graphite hover:border-slate hover:text-chalk'
                    }`}
                    style={
                      isActive
                        ? {
                            backgroundColor: `${th.primary}20`,
                            color: th.primary,
                            borderColor: th.primary,
                          }
                        : {}
                    }
                  >
                    <span
                      className="w-2 h-2 rounded-full inline-block shrink-0 border border-black/40"
                      style={{ backgroundColor: th.primary }}
                    />
                    <span className="truncate">{th.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {isSameCategory && primaryCategory === WIDGET_CATEGORIES.SURVEILLANCE && (
          <div className="space-y-3 pt-3 border-t border-graphite font-mono">
            <div className="flex items-center gap-2 text-[#55ffff] text-eyebrow uppercase tracking-wider font-semibold">
              <Radio size={14} />
              <span>{t('editor.surveillance.color_presets', 'Surveillance Theme Presets')}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {SURVEILLANCE_COLOR_THEMES.map((th) => {
                const isActive =
                  currentAccent.toLowerCase() === th.primary.toLowerCase() &&
                  currentSecondary.toLowerCase() === th.secondary.toLowerCase()

                return (
                  <button
                    key={th.name}
                    type="button"
                    onClick={() =>
                      updateWidgetsConfig(instanceIds, {
                        accentColor: th.primary,
                        secondaryColor: th.secondary,
                        ledColor: th.led,
                      })
                    }
                    className={`py-1.5 px-1 rounded-xs text-[10px] font-mono transition-all cursor-pointer border text-center truncate flex items-center justify-center gap-1.5 ${
                      isActive
                        ? 'border-chalk font-bold shadow-xs'
                        : 'bg-graphite text-ash border-graphite hover:border-slate hover:text-chalk'
                    }`}
                    style={
                      isActive
                        ? {
                            backgroundColor: `${th.primary}20`,
                            color: th.primary,
                            borderColor: th.primary,
                          }
                        : {}
                    }
                  >
                    <span
                      className="w-2 h-2 rounded-full inline-block shrink-0 border border-black/40"
                      style={{ backgroundColor: th.primary }}
                    />
                    <span className="truncate">{th.name}</span>
                  </button>
                )
              })}
            </div>

            <div>
              <label className="text-eyebrow text-ash block mb-1.5">
                {t('editor.surveillance.mode_preset', 'System Mode Tag')}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {['198X MODE', 'CYBER SURV', 'RETRO CRT'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => updateWidgetsConfig(instanceIds, { modeTag: mode })}
                    className="py-1 rounded-xs text-[10px] transition-all cursor-pointer border text-center bg-graphite text-ash border-graphite hover:border-[#55ffff] hover:text-chalk"
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {isSameCategory && primaryCategory === WIDGET_CATEGORIES.CONTROLPLANE && (
          <div className="space-y-3 pt-3 border-t border-graphite">
            <div className="flex items-center gap-2 text-signal-lime font-inter-tight text-eyebrow uppercase tracking-wider font-semibold">
              <Cpu size={14} />
              <span>{t('editor.controlplane.title', 'Control Plane Toolkit')}</span>
            </div>

            <div>
              <label className="text-eyebrow text-ash block mb-1.5">
                {t('editor.controlplane.speed_factor', 'Velocidade da Animação')}
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: '0.5x', val: 0.5 },
                  { label: '1.0x', val: 1.0 },
                  { label: '1.5x', val: 1.5 },
                  { label: '2.0x', val: 2.0 },
                ].map((sp) => (
                  <button
                    key={sp.label}
                    type="button"
                    onClick={() => updateWidgetsConfig(instanceIds, { speedFactor: sp.val })}
                    className="py-1 rounded-xs text-[11px] font-mono transition-all cursor-pointer border text-center bg-graphite text-ash border-graphite hover:border-signal-lime hover:text-chalk"
                  >
                    {sp.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {isSameCategory && primaryCategory === WIDGET_CATEGORIES.CODEWEB_DEV && (
          <div className="space-y-3 pt-3 border-t border-graphite">
            <div className="flex items-center gap-2 text-signal-lime font-inter-tight text-eyebrow uppercase tracking-wider font-semibold">
              <Sparkles size={14} />
              <span>{t('editor.codeweb.banner_title', 'Codeweb Aura Settings')}</span>
            </div>

            <div>
              <label className="text-eyebrow text-ash block mb-1.5">
                {t('editor.codeweb.badge_display_mode', 'Modo de Exibição das Badges')}
              </label>
              <div className="grid grid-cols-3 gap-1 bg-void-black p-1 rounded-xs border border-graphite">
                <button
                  type="button"
                  onClick={() => updateWidgetsConfig(instanceIds, { displayMode: 'both' })}
                  className="py-1 rounded-xs text-[10px] text-ash hover:text-chalk border border-transparent hover:bg-graphite"
                >
                  {t('editor.codeweb.badge_name_logo', 'Nome + Logo')}
                </button>
                <button
                  type="button"
                  onClick={() => updateWidgetsConfig(instanceIds, { displayMode: 'logo' })}
                  className="py-1 rounded-xs text-[10px] text-ash hover:text-chalk border border-transparent hover:bg-graphite"
                >
                  {t('editor.codeweb.badge_logo_only', 'Apenas Logo')}
                </button>
                <button
                  type="button"
                  onClick={() => updateWidgetsConfig(instanceIds, { displayMode: 'name' })}
                  className="py-1 rounded-xs text-[10px] text-ash hover:text-chalk border border-transparent hover:bg-graphite"
                >
                  {t('editor.codeweb.badge_name_only', 'Apenas Nome')}
                </button>
              </div>
            </div>
          </div>
        )}

        {isSameCategory && primaryCategory === WIDGET_CATEGORIES.ASCIIPROFILE && (
          <div className="space-y-3 pt-3 border-t border-graphite">
            <div className="flex items-center gap-2 text-[#ffa657] font-inter-tight text-eyebrow uppercase tracking-wider font-semibold">
              <Terminal size={14} />
              <span>{t('editor.asciiprofile.title', 'ASCII Profile Kit')}</span>
            </div>

            <div className="flex items-center justify-between p-2 bg-graphite rounded-sm border border-graphite">
              <label className="text-eyebrow text-chalk font-inter-tight cursor-pointer">
                {t('editor.asciiprofile.static_mode', 'Modo Estático (Sem Digitação)')}
              </label>
              <Switch
                checked={selectedWidgets.every((w) => Boolean(w.config.staticMode))}
                onChange={(checked) => updateWidgetsConfig(instanceIds, { staticMode: checked })}
              />
            </div>
          </div>
        )}

        {isSameCategory && primaryCategory === WIDGET_CATEGORIES.PREMIUM_ASCII && (
          <div className="space-y-3 pt-3 border-t border-graphite">
            <div className="flex items-center gap-2 text-signal-lime font-inter-tight text-eyebrow uppercase tracking-wider font-semibold">
              <Terminal size={14} />
              <span>{t('editor.premiumascii.title', 'ASCII Premium Kit')}</span>
            </div>

            <div className="space-y-2">
              <div className="text-eyebrow text-ash font-inter-tight">
                {t('editor.animation.title', 'Animação de Entrada')}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => updateWidgetsConfig(instanceIds, { animated: false })}
                  className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-xs text-center cursor-pointer transition-all border text-[10px] font-inter-tight leading-tight ${
                    selectedWidgets.every((w) => !w.config.animated)
                      ? 'bg-signal-lime text-black border-signal-lime font-bold'
                      : 'bg-graphite text-ash border-graphite hover:border-ash hover:text-chalk'
                  }`}
                >
                  <Ban className="w-[18px] h-[18px] mb-1" />
                  <span>{t('editor.animation.none', 'Sem animação')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateWidgetsConfig(instanceIds, { animated: true })}
                  className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-xs text-center cursor-pointer transition-all border text-[10px] font-inter-tight leading-tight ${
                    selectedWidgets.every((w) => Boolean(w.config.animated))
                      ? 'bg-signal-lime text-black border-signal-lime font-bold'
                      : 'bg-graphite text-ash border-graphite hover:border-ash hover:text-chalk'
                  }`}
                >
                  <Sparkles className="w-[18px] h-[18px] mb-1" />
                  <span>{t('editor.premiumascii.animatedTitle', 'Animar Números e Barras')}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {(!isSameCategory ||
          (primaryCategory !== WIDGET_CATEGORIES.ASCIIPROFILE &&
            primaryCategory !== WIDGET_CATEGORIES.PREMIUM_ASCII)) && (
          <div className="space-y-4 pt-3 border-t border-graphite">
            <div className="flex items-center gap-2 text-signal-lime font-inter-tight text-eyebrow uppercase tracking-wider font-medium">
              <Zap size={14} />
              <span>{t('editor.animation.title', 'Animação de Entrada (Múltiplos)')}</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {ANIMATION_PRESETS.map((preset) => {
                const Icon = preset.icon
                const isCurrent = currentAnimType === preset.id
                return (
                  <button
                    key={preset.id}
                    type="button"
                    title={preset.description}
                    onClick={() =>
                      updateWidgetsConfig(instanceIds, {
                        animationType: preset.id,
                        animationPreviewKey: Date.now(),
                      })
                    }
                    className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-xs text-center cursor-pointer transition-all border text-[10px] font-inter-tight leading-tight ${
                      isCurrent
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

            {currentAnimType !== 'none' && (
              <div className="space-y-3 pt-1">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-eyebrow">
                    <span className="text-ash font-inter-tight">
                      {t('editor.animation.duration', 'Duração')}
                    </span>
                    <span className="text-chalk font-jetbrains-mono">{currentAnimDuration}ms</span>
                  </div>
                  <div className="flex gap-1">
                    {ANIMATION_DURATION_PRESETS.map((dp) => (
                      <button
                        key={dp.value}
                        type="button"
                        onClick={() =>
                          updateWidgetsConfig(instanceIds, { animationDuration: dp.value })
                        }
                        className={`flex-1 py-1 rounded-xs text-[10px] font-jetbrains-mono cursor-pointer transition-all border ${
                          currentAnimDuration === dp.value
                            ? 'bg-signal-lime text-black border-signal-lime font-bold'
                            : 'bg-graphite text-ash border-graphite hover:border-ash hover:text-chalk'
                        }`}
                      >
                        {dp.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-eyebrow text-ash font-inter-tight block">
                    {t('editor.animation.easing', 'Curva de aceleração')}
                  </span>
                  <div className="grid grid-cols-3 gap-1">
                    {ANIMATION_EASING_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          updateWidgetsConfig(instanceIds, { animationEasing: opt.id })
                        }
                        className={`py-1 rounded-xs text-[10px] font-jetbrains-mono cursor-pointer transition-all border ${
                          currentAnimEasing === opt.id
                            ? 'bg-signal-lime text-black border-signal-lime font-bold'
                            : 'bg-graphite text-ash border-graphite hover:border-ash hover:text-chalk'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4 pt-3 border-t border-graphite">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-signal-lime font-inter-tight text-eyebrow uppercase tracking-wider font-semibold">
              <Maximize2 size={14} />
              <span>
                {t('editor.properties.proportional_resize', 'Redimensionamento Proporcional')}
              </span>
            </div>
            <span className="text-caption text-signal-lime font-jetbrains-mono">
              [ 1x UNIFIED ]
            </span>
          </div>

          <p className="text-[11px] text-ash font-inter-tight leading-relaxed">
            {t(
              'editor.properties.proportional_resize_desc',
              'Altera a escala de todos os widgets selecionados simultaneamente na mesma proporção.'
            )}
          </p>

          <div className="grid grid-cols-4 gap-1.5">
            {[
              { label: '-20%', factor: 0.8 },
              { label: '-10%', factor: 0.9 },
              { label: '+10%', factor: 1.1 },
              { label: '+20%', factor: 1.2 },
            ].map((btn) => (
              <button
                key={btn.label}
                type="button"
                onClick={() => {
                  scaleWidgets(instanceIds, btn.factor, true)
                }}
                className="py-1.5 rounded-xs text-eyebrow font-jetbrains-mono transition-all cursor-pointer border bg-graphite text-chalk border-graphite hover:border-signal-lime hover:text-signal-lime text-center font-bold"
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-eyebrow">
              <span className="text-ash font-inter-tight">
                {t('editor.properties.scale_slider', 'Escala Proporcional')}
              </span>
              <span className="text-chalk font-jetbrains-mono">100%</span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              step="5"
              defaultValue="100"
              onChange={(e) => {
                const val = parseInt(e.target.value, 10)
                const factor = val / 100
                scaleWidgets(instanceIds, factor, false)
              }}
              onMouseUp={() => recordHistorySnapshot()}
              onTouchEnd={() => recordHistorySnapshot()}
              className="w-full accent-signal-lime h-1 bg-graphite rounded cursor-pointer"
            />
          </div>
        </div>
      </div>
    </aside>
  )
}
