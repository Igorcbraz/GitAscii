'use client'

import { Eye, EyeOff, Lock, Maximize2, Palette, Sliders, Trash2, Type, Unlock } from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n'

import { useEditorStore } from '../../store/editorStore'
import { AsciiArtControls } from './AsciiArtControls'
import { AsciiTextControls } from './AsciiTextControls'
import { ColorPicker } from './ColorPicker'
import { IntegrationsControls } from './IntegrationsControls'
import { SocialMediaControls } from './SocialMediaControls'
import { TechStackControls } from './TechStackControls'
import { TerminalInfoControls } from './TerminalInfoControls'

const WIDTH_PRESETS = [
  { label: '100%', val: 800 },
  { label: '75%', val: 600 },
  { label: '50%', val: 392 },
  { label: '33%', val: 256 },
]

export function PropertiesPanel() {
  const { t } = useI18n()
  const {
    config,
    selectedInstanceId,
    updateWidgetConfig,
    updateWidgetSize,
    updateWidgetPosition,
    toggleWidgetVisibility,
    toggleWidgetLock,
    removeWidget,
  } = useEditorStore()

  if (!config || !selectedInstanceId) {
    return (
      <aside className="w-[320px] h-full bg-onyx border-l border-graphite p-6 flex flex-col items-center justify-center text-center shrink-0">
        <Sliders className="w-8 h-8 text-ash mb-3 stroke-[1.5px]" />
        <h4 className="font-inter-tight font-medium text-base text-chalk mb-1">
          {t('editor.properties.none_selected_title', 'Nenhum Widget Selecionado')}
        </h4>
        <p className="font-inter-tight text-note text-ash max-w-50">
          {t(
            'editor.properties.none_selected_desc',
            'Clique em qualquer widget no canvas para inspecionar e editar suas propriedades.'
          )}
        </p>
      </aside>
    )
  }

  const selectedWidget = config.widgets.find((w) => w.instanceId === selectedInstanceId)

  if (!selectedWidget) return null

  const cfg = selectedWidget.config
  const displayName = selectedWidget.name || `${selectedWidget.widgetId.toUpperCase()} Widget`

  return (
    <aside className="w-[320px] h-full bg-onyx border-l border-graphite flex flex-col shrink-0 overflow-y-auto">
      <div className="p-4 border-b border-graphite flex items-center justify-between bg-void-black">
        <div>
          <span className="label-stamp">{t('editor.properties.title', '[ PROPRIEDADES ]')}</span>
          <h3 className="font-inter-tight font-medium text-base text-chalk capitalize mt-0.5">
            {displayName}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleWidgetLock(selectedWidget.instanceId)}
            title={
              selectedWidget.locked
                ? t('editor.properties.unlock', 'Desbloquear Widget')
                : t('editor.properties.lock', 'Bloquear Widget')
            }
            className={`p-1.5 rounded-xs hover:bg-graphite transition-colors cursor-pointer ${
              selectedWidget.locked ? 'text-signal-lime' : 'text-ash hover:text-chalk'
            }`}
          >
            {selectedWidget.locked ? <Lock size={16} /> : <Unlock size={16} />}
          </button>

          <button
            onClick={() => toggleWidgetVisibility(selectedWidget.instanceId)}
            title={
              selectedWidget.visible
                ? t('editor.properties.hide', 'Ocultar Widget')
                : t('editor.properties.show', 'Exibir Widget')
            }
            className="p-1.5 rounded-xs hover:bg-graphite text-ash hover:text-chalk transition-colors cursor-pointer"
          >
            {selectedWidget.visible ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>

          <button
            onClick={() => removeWidget(selectedWidget.instanceId)}
            title={t('editor.properties.delete', 'Excluir Widget')}
            className="p-1.5 rounded-xs hover:bg-red-500/20 text-ash hover:text-red-400 transition-colors cursor-pointer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6 flex-1">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-ash font-inter-tight text-eyebrow uppercase tracking-wider font-medium">
            <Palette size={14} />
            <span>{t('editor.properties.colors_theme', 'Cores & Tema')}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ColorPicker
              label="Background"
              align="left"
              value={
                (cfg.backgroundColor as string) || config.globalStyles.backgroundColor || '#1f1f1f'
              }
              onChange={(color) =>
                updateWidgetConfig(selectedWidget.instanceId, { backgroundColor: color })
              }
            />

            <ColorPicker
              label={t('editor.properties.color_destaque', 'Cor de Destaque')}
              align="right"
              value={(cfg.accentColor as string) || config.globalStyles.accentColor || '#c5ff4a'}
              onChange={(color) =>
                updateWidgetConfig(selectedWidget.instanceId, { accentColor: color })
              }
            />

            <ColorPicker
              label={t('editor.properties.color_texto', 'Cor do Texto')}
              align="left"
              value={(cfg.textColor as string) || config.globalStyles.textColor || '#ffffff'}
              onChange={(color) =>
                updateWidgetConfig(selectedWidget.instanceId, { textColor: color })
              }
            />

            <ColorPicker
              label={t('editor.properties.color_borda', 'Cor da Borda')}
              align="right"
              value={(cfg.borderColor as string) || config.globalStyles.borderColor || '#252525'}
              onChange={(color) =>
                updateWidgetConfig(selectedWidget.instanceId, { borderColor: color })
              }
            />
          </div>
        </div>

        {selectedWidget.widgetId === 'bio' && (
          <div className="space-y-3 pt-3 border-t border-graphite">
            <div className="flex items-center gap-2 text-signal-lime font-inter-tight text-eyebrow uppercase tracking-wider font-medium">
              <Type size={14} />
              <span>{t('editor.properties.bio_title', 'Edit Bio & Links')}</span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-eyebrow text-ash font-inter-tight">
                  {t('editor.properties.bio_label', 'Biography Text')}
                </label>
                <span className="text-caption text-ash font-jetbrains-mono">
                  {t('editor.properties.bio_suggestion', '(Profile suggestion)')}
                </span>
              </div>
              <textarea
                rows={3}
                value={
                  cfg.customBio !== undefined
                    ? (cfg.customBio as string)
                    : useEditorStore.getState().githubData?.user.bio || ''
                }
                onChange={(e) =>
                  updateWidgetConfig(selectedWidget.instanceId, { customBio: e.target.value })
                }
                placeholder={t(
                  'editor.properties.bio_placeholder',
                  'Digite qualquer biografia livremente...'
                )}
                className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note p-2 rounded-xs focus:border-signal-lime focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
                {t('editor.properties.location', 'Localização')}
              </label>
              <input
                type="text"
                value={
                  cfg.customLocation !== undefined
                    ? (cfg.customLocation as string)
                    : useEditorStore.getState().githubData?.user.location || ''
                }
                onChange={(e) =>
                  updateWidgetConfig(selectedWidget.instanceId, { customLocation: e.target.value })
                }
                placeholder={t('editor.properties.location_placeholder', 'Ex: São Paulo, Brasil')}
                className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note px-2 py-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
              />
            </div>

            <div>
              <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
                {t('editor.properties.website', 'Website / Blog (Link Clicável)')}
              </label>
              <input
                type="text"
                value={
                  cfg.customBlog !== undefined
                    ? (cfg.customBlog as string)
                    : useEditorStore.getState().githubData?.user.blog || ''
                }
                onChange={(e) =>
                  updateWidgetConfig(selectedWidget.instanceId, { customBlog: e.target.value })
                }
                placeholder={t('editor.properties.website_placeholder', 'Ex: https://meusite.com')}
                className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note px-2 py-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
              />
            </div>
          </div>
        )}

        {selectedWidget.widgetId === 'avatar' && (
          <div className="space-y-3 pt-3 border-t border-graphite">
            <div className="flex items-center gap-2 text-signal-lime font-inter-tight text-eyebrow uppercase tracking-wider font-medium">
              <Type size={14} />
              <span>{t('editor.properties.avatar_title', 'URL da Imagem do Avatar')}</span>
            </div>

            <div>
              <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
                {t('editor.properties.avatar_label', 'URL da Imagem')}
              </label>
              <input
                type="text"
                value={
                  cfg.avatarUrl !== undefined
                    ? (cfg.avatarUrl as string)
                    : useEditorStore.getState().githubData?.user.avatar_url || ''
                }
                onChange={(e) =>
                  updateWidgetConfig(selectedWidget.instanceId, { avatarUrl: e.target.value })
                }
                placeholder="https://..."
                className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note px-2 py-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
              />
            </div>
          </div>
        )}

        {selectedWidget.widgetId === 'ascii-art' && (
          <AsciiArtControls instanceId={selectedWidget.instanceId} config={cfg} />
        )}

        {selectedWidget.widgetId === 'ascii-text' && (
          <AsciiTextControls instanceId={selectedWidget.instanceId} config={cfg} />
        )}

        {(selectedWidget.widgetId === 'terminal-info' ||
          selectedWidget.widgetId === 'terminal-card') && (
          <TerminalInfoControls instanceId={selectedWidget.instanceId} config={cfg} />
        )}

        {selectedWidget.widgetId === 'tech-stack' && (
          <TechStackControls instanceId={selectedWidget.instanceId} config={cfg} />
        )}

        {selectedWidget.widgetId === 'social-media' && (
          <SocialMediaControls instanceId={selectedWidget.instanceId} config={cfg} />
        )}

        {[
          'gitfest-lineup',
          'github-readme-stats',
          'streak-stats',
          'profile-trophy',
          'activity-graph',
          'contribution-snake',
          'metrics-card',
          'views-counter',
          'readme-quotes',
          'awesome-badge',
        ].includes(selectedWidget.widgetId) && (
          <IntegrationsControls
            instanceId={selectedWidget.instanceId}
            widgetId={selectedWidget.widgetId}
            config={cfg}
          />
        )}

        <div className="space-y-4 pt-3 border-t border-graphite">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-ash font-inter-tight text-eyebrow uppercase tracking-wider font-medium">
              <Maximize2 size={14} />
              <span>{t('editor.properties.size_title', 'Largura & Altura')}</span>
            </div>
            <span className="text-caption text-signal-lime font-jetbrains-mono">[ RESIZE ]</span>
          </div>

          <div className="flex items-center justify-between p-2 bg-graphite rounded-sm border border-graphite">
            <label className="text-eyebrow text-chalk font-inter-tight cursor-pointer">
              {t('editor.properties.size_aspect', 'Manter proporção quadrada (1:1)')}
            </label>
            <input
              type="checkbox"
              checked={
                cfg.lockAspectRatio !== undefined
                  ? Boolean(cfg.lockAspectRatio)
                  : selectedWidget.widgetId === 'avatar'
              }
              onChange={(e) =>
                updateWidgetConfig(selectedWidget.instanceId, { lockAspectRatio: e.target.checked })
              }
              className="w-4 h-4 accent-signal-lime cursor-pointer"
            />
          </div>

          <div>
            <label className="text-eyebrow text-ash block mb-1.5 font-inter-tight">
              {t('editor.properties.size_shortcuts', 'Atalhos de Largura (Width)')}
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {WIDTH_PRESETS.map((preset) => {
                const isAspectLocked =
                  cfg.lockAspectRatio !== undefined
                    ? Boolean(cfg.lockAspectRatio)
                    : selectedWidget.widgetId === 'avatar'

                return (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() =>
                      updateWidgetSize(selectedWidget.instanceId, {
                        width: preset.val,
                        height: isAspectLocked ? preset.val : selectedWidget.size.height,
                      })
                    }
                    className={`py-1 rounded-xs text-eyebrow font-jetbrains-mono transition-all cursor-pointer border ${
                      selectedWidget.size.width === preset.val
                        ? 'bg-signal-lime text-black border-signal-lime font-bold'
                        : 'bg-graphite text-ash border-graphite hover:border-slate hover:text-chalk'
                    }`}
                  >
                    {preset.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-eyebrow">
              <span className="text-ash font-inter-tight">Width</span>
              <span className="text-chalk font-jetbrains-mono">{selectedWidget.size.width}px</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="40"
                max="800"
                step="4"
                value={selectedWidget.size.width}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10)
                  const isAspectLocked =
                    cfg.lockAspectRatio !== undefined
                      ? Boolean(cfg.lockAspectRatio)
                      : selectedWidget.widgetId === 'avatar'
                  updateWidgetSize(
                    selectedWidget.instanceId,
                    { width: val, height: isAspectLocked ? val : selectedWidget.size.height },
                    false
                  )
                }}
                onMouseUp={() => useEditorStore.getState().recordHistorySnapshot()}
                onTouchEnd={() => useEditorStore.getState().recordHistorySnapshot()}
                className="flex-1 accent-signal-lime h-1 bg-graphite rounded cursor-pointer"
              />
              <input
                type="number"
                min="40"
                max="800"
                value={selectedWidget.size.width}
                onChange={(e) => {
                  const val = Math.max(40, Math.min(800, parseInt(e.target.value, 10) || 40))
                  const isAspectLocked =
                    cfg.lockAspectRatio !== undefined
                      ? Boolean(cfg.lockAspectRatio)
                      : selectedWidget.widgetId === 'avatar'
                  updateWidgetSize(selectedWidget.instanceId, {
                    width: val,
                    height: isAspectLocked ? val : selectedWidget.size.height,
                  })
                }}
                className="w-16 bg-graphite border border-graphite focus:border-signal-lime px-2 py-0.5 text-eyebrow font-jetbrains-mono text-chalk rounded-xs text-right focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-eyebrow">
              <span className="text-ash font-inter-tight">Height</span>
              <span className="text-chalk font-jetbrains-mono">{selectedWidget.size.height}px</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="40"
                max="800"
                step="4"
                value={selectedWidget.size.height}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10)
                  const isAspectLocked =
                    cfg.lockAspectRatio !== undefined
                      ? Boolean(cfg.lockAspectRatio)
                      : selectedWidget.widgetId === 'avatar'
                  updateWidgetSize(
                    selectedWidget.instanceId,
                    { width: isAspectLocked ? val : selectedWidget.size.width, height: val },
                    false
                  )
                }}
                onMouseUp={() => useEditorStore.getState().recordHistorySnapshot()}
                onTouchEnd={() => useEditorStore.getState().recordHistorySnapshot()}
                className="flex-1 accent-signal-lime h-1 bg-graphite rounded cursor-pointer"
              />
              <input
                type="number"
                min="40"
                max="800"
                value={selectedWidget.size.height}
                onChange={(e) => {
                  const val = Math.max(40, Math.min(800, parseInt(e.target.value, 10) || 40))
                  const isAspectLocked =
                    cfg.lockAspectRatio !== undefined
                      ? Boolean(cfg.lockAspectRatio)
                      : selectedWidget.widgetId === 'avatar'
                  updateWidgetSize(selectedWidget.instanceId, {
                    width: isAspectLocked ? val : selectedWidget.size.width,
                    height: val,
                  })
                }}
                className="w-16 bg-graphite border border-graphite focus:border-signal-lime px-2 py-0.5 text-eyebrow font-jetbrains-mono text-chalk rounded-xs text-right focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 text-eyebrow">
            <div>
              <label className="text-ash block mb-1 font-inter-tight">
                {t('editor.properties.pos_x', 'Posição X')}
              </label>
              <input
                type="number"
                value={selectedWidget.position.x}
                onChange={(e) =>
                  updateWidgetPosition(selectedWidget.instanceId, {
                    x: parseInt(e.target.value, 10) || 0,
                    y: selectedWidget.position.y,
                  })
                }
                className="w-full bg-graphite border border-graphite focus:border-signal-lime px-2 py-1 font-jetbrains-mono text-chalk rounded-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="text-ash block mb-1 font-inter-tight">
                {t('editor.properties.pos_y', 'Posição Y')}
              </label>
              <input
                type="number"
                value={selectedWidget.position.y}
                onChange={(e) =>
                  updateWidgetPosition(selectedWidget.instanceId, {
                    x: selectedWidget.position.x,
                    y: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-full bg-graphite border border-graphite focus:border-signal-lime px-2 py-1 font-jetbrains-mono text-chalk rounded-xs focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
