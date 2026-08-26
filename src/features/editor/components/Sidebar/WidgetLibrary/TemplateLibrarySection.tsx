'use client'

import { Download, GitFork, Sparkles, Upload, X, Zap } from 'lucide-react'
import React, { useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { useToast } from '@/components/ui/toast'
import { USER_SPECIFIC_FIELDS, WIDGET_CATEGORIES } from '@/constants'
import { TEMPLATE_PRESETS, type TemplatePreset } from '@/engine/core/TemplateRenderer'
import type { SavedConfiguration } from '@/engine/types'
import { useI18n } from '@/i18n'

import { useEditorStore } from '../../../store/editorStore'
import { TemplatePreviewTooltip } from '../TemplatePreviewTooltip'
import { ContributeTemplateModal } from './ContributeTemplateModal'

interface TemplateLibrarySectionProps {
  config: SavedConfiguration
  applyTemplate: (templateId: string) => void
  importLayout: (widgets: any[], globalStyles: any, templateId: string) => void
}

/** Map of widgetCategory value → human-readable label shown in the picker */
const WIDGET_CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Nenhuma (GitAscii Native)' },
  { value: WIDGET_CATEGORIES.SURVEILLANCE, label: 'rugbedbugg' },
  { value: WIDGET_CATEGORIES.WINDOWS_XP, label: 'Windows XP' },
  { value: WIDGET_CATEGORIES.ASCIIPROFILE, label: 'ASCII Profile Kit' },
  { value: WIDGET_CATEGORIES.GODPROFILE, label: 'GodProfile' },
  { value: WIDGET_CATEGORIES.CONTROLPLANE, label: 'Control Plane' },
  { value: WIDGET_CATEGORIES.CODEWEB_DEV, label: 'Codeweb-dev' },
  { value: WIDGET_CATEGORIES.EXTERNAL, label: 'Externos' },
]

export function TemplateLibrarySection({
  config,
  applyTemplate,
  importLayout,
}: TemplateLibrarySectionProps) {
  const { t } = useI18n()
  const { error } = useToast()
  const githubData = useEditorStore((state) => state.githubData)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false)
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [pendingWidgetCategory, setPendingWidgetCategory] = useState('')
  const [hoveredTemplate, setHoveredTemplate] = useState<{
    template: TemplatePreset
    rect: DOMRect
  } | null>(null)

  const handleHover = (tmpl: TemplatePreset, rect: DOMRect) => {
    setHoveredTemplate({ template: tmpl, rect })
  }

  const handleLeave = () => {
    setHoveredTemplate(null)
  }

  const handleExport = (widgetCategory?: string) => {
    try {
      const sanitizedWidgets = (config.widgets || []).map((w, idx) => {
        const rawPos = (w.position || {}) as unknown as Record<string, unknown>
        const rawSize = (w.size || {}) as unknown as Record<string, unknown>
        const position = {
          x: Math.max(-200, Math.min(2000, Number(rawPos.x) || 0)),
          y: Math.max(0, Math.min(10000, Number(rawPos.y) || 0)),
        }
        const size = {
          width: Math.max(20, Math.min(1200, Number(rawSize.width) || 400)),
          height: Math.max(20, Math.min(3000, Number(rawSize.height) || 200)),
        }

        const cleanCfg = w.config && typeof w.config === 'object' ? { ...w.config } : {}
        USER_SPECIFIC_FIELDS.forEach((field) => {
          delete cleanCfg[field]
        })
        delete cleanCfg.socialUrls
        delete cleanCfg.asciiText
        delete cleanCfg.asciiColors
        delete cleanCfg.imageUrl
        delete cleanCfg.src
        delete cleanCfg.url

        return {
          instanceId: w.instanceId || `widget-${Date.now()}-${idx}`,
          widgetId: w.widgetId,
          name: w.name,
          position,
          size,
          config: cleanCfg,
          locked: Boolean(w.locked),
          visible: w.visible !== false,
          zIndex: Number(w.zIndex) || 1,
        }
      })

      const exportData: Record<string, unknown> = {
        widgets: sanitizedWidgets,
        globalStyles: config.globalStyles,
        templateId: config.templateId,
      }

      if (widgetCategory) {
        exportData.widgetCategory = widgetCategory
      }

      const jsonString = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `template_${config.templateId || 'custom'}.json`
      document.body.appendChild(link)
      link.click()

      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to export template:', err)
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onerror = () => {
      error(t('editor.sidebar.import.read_error', 'Erro ao ler arquivo selecionado.'))
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
    reader.onload = (event) => {
      try {
        const result = event.target?.result
        if (typeof result !== 'string') return

        const data = JSON.parse(result)
        if (!data || !Array.isArray(data.widgets)) {
          error(
            t(
              'editor.sidebar.import.invalid_format',
              'Formato de arquivo inválido: lista de widgets não encontrada.'
            )
          )
          return
        }

        const sanitizedWidgets = data.widgets
          .filter((w: unknown) => w && typeof w === 'object')
          .map((w: Record<string, unknown>, idx: number) => {
            const rawId =
              typeof w.instanceId === 'string' ? w.instanceId : `widget-${Date.now()}-${idx}`
            const safeInstanceId = rawId.replace(/[^a-zA-Z0-9_-]/g, '') || `widget-${idx}`
            const rawWidgetId = typeof w.widgetId === 'string' ? w.widgetId : 'unknown'
            const safeWidgetId = rawWidgetId.replace(/[^a-zA-Z0-9_-]/g, '')

            const rawPos = (
              w.position && typeof w.position === 'object' ? w.position : {}
            ) as Record<string, unknown>
            const rawSize = (w.size && typeof w.size === 'object' ? w.size : {}) as Record<
              string,
              unknown
            >

            const position = {
              x: Math.max(-200, Math.min(2000, Number(rawPos.x) || 0)),
              y: Math.max(0, Math.min(10000, Number(rawPos.y) || 0)),
            }
            const size = {
              width: Math.max(20, Math.min(1200, Number(rawSize.width) || 400)),
              height: Math.max(20, Math.min(3000, Number(rawSize.height) || 200)),
            }

            const { config: widgetCfg } = w as {
              config?: Record<string, unknown>
            }

            const cleanCfg = widgetCfg && typeof widgetCfg === 'object' ? { ...widgetCfg } : {}
            USER_SPECIFIC_FIELDS.forEach((field) => {
              delete cleanCfg[field]
            })

            return {
              instanceId: safeInstanceId,
              widgetId: safeWidgetId,
              position,
              size,
              config: cleanCfg,
              locked: Boolean(w.locked),
              visible: w.visible !== false,
              zIndex: Math.max(0, Math.min(999, Number(w.zIndex) || 1)),
            }
          })

        const rawStyles = (
          data.globalStyles && typeof data.globalStyles === 'object' ? data.globalStyles : {}
        ) as Record<string, unknown>
        const safeGlobalStyles = {
          backgroundColor:
            typeof rawStyles.backgroundColor === 'string'
              ? rawStyles.backgroundColor.replace(/[^#a-zA-Z0-9(),\s.-]/g, '').slice(0, 50)
              : '#060606',
          borderColor:
            typeof rawStyles.borderColor === 'string'
              ? rawStyles.borderColor.replace(/[^#a-zA-Z0-9(),\s.-]/g, '').slice(0, 50)
              : '#252525',
          textColor:
            typeof rawStyles.textColor === 'string'
              ? rawStyles.textColor.replace(/[^#a-zA-Z0-9(),\s.-]/g, '').slice(0, 50)
              : '#ffffff',
          accentColor:
            typeof rawStyles.accentColor === 'string'
              ? rawStyles.accentColor.replace(/[^#a-zA-Z0-9(),\s.-]/g, '').slice(0, 50)
              : '#c5ff4a',
          fontFamily:
            typeof rawStyles.fontFamily === 'string'
              ? rawStyles.fontFamily.replace(/[^a-zA-Z0-9\s,'"-]/g, '').slice(0, 100)
              : "'Inter Tight', sans-serif",
          borderRadius: Math.max(0, Math.min(64, Number(rawStyles.borderRadius) || 0)),
          transparentBackground: Boolean(rawStyles.transparentBackground),
          templateStyle:
            typeof rawStyles.templateStyle === 'string'
              ? rawStyles.templateStyle.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50)
              : 'terminal',
        }

        const safeTemplateId =
          typeof data.templateId === 'string'
            ? data.templateId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50)
            : 'custom'

        importLayout(sanitizedWidgets, safeGlobalStyles, safeTemplateId)

        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } catch (err) {
        console.error('Failed to parse import file:', err)
        error(
          t(
            'editor.sidebar.import.invalid_json',
            'Falha ao processar arquivo JSON. Verifique se é um arquivo JSON válido.'
          )
        )
      }
    }
    reader.readAsText(file)
  }

  return (
    <>
      <div className="label-stamp mb-2">{t('editor.sidebar.portability', '[ PORTABILITY ]')}</div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportFile}
        accept=".json"
        className="hidden"
      />
      <div className="space-y-2 mb-4">
        <div
          onClick={handleImportClick}
          data-testid="import-layout-btn"
          className="group relative p-2.5 border border-graphite hover:border-pearl bg-void-black/60 hover:bg-onyx transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-xs cursor-pointer flex items-center justify-between shadow-xs hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-xs bg-graphite group-hover:bg-slate text-pearl group-hover:text-chalk transition-colors duration-300 shrink-0">
              <Upload size={14} />
            </div>
            <div>
              <h4 className="font-inter-tight font-medium text-note text-chalk group-hover:text-white transition-colors duration-300">
                {t('editor.sidebar.import_template', 'Importar Template')}
              </h4>
              <p className="font-inter-tight text-caption text-ash line-clamp-1">
                {t('editor.sidebar.import_template_desc', 'Carregar template de arquivo JSON')}
              </p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setShowCategoryPicker(true)}
          data-testid="export-layout-btn"
          className="group relative p-2.5 border border-graphite hover:border-pearl bg-void-black/60 hover:bg-onyx transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-xs cursor-pointer flex items-center justify-between shadow-xs hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-xs bg-graphite group-hover:bg-slate text-pearl group-hover:text-chalk transition-colors duration-300 shrink-0">
              <Download size={14} />
            </div>
            <div>
              <h4 className="font-inter-tight font-medium text-note text-chalk group-hover:text-white transition-colors duration-300">
                {t('editor.sidebar.export_template', 'Exportar Template')}
              </h4>
              <p className="font-inter-tight text-caption text-ash line-clamp-1">
                {t(
                  'editor.sidebar.export_template_desc',
                  'Exportar layout atual como template reutilizável'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="label-stamp mb-2">
        {t('editor.sidebar.preset_templates', '[ PRESET TEMPLATES ]')}
      </div>
      <p className="text-note text-ash font-inter-tight mb-4">
        {t(
          'editor.sidebar.templates_desc',
          'Switching templates updates colors and layout while preserving your GitHub data.'
        )}
      </p>

      {(() => {
        const allPresets = Object.values(TEMPLATE_PRESETS)
        const nativePresets = allPresets.filter(
          (p) =>
            !p.widgetCategory ||
            p.widgetCategory === 'essential' ||
            p.widgetCategory === 'native' ||
            p.id === 'blank'
        )
        const surveillancePresets = allPresets.filter(
          (p) => p.widgetCategory === WIDGET_CATEGORIES.SURVEILLANCE
        )
        const asciiPresets = allPresets.filter(
          (p) => p.widgetCategory === WIDGET_CATEGORIES.ASCIIPROFILE
        )
        const codewebPresets = allPresets.filter(
          (p) => p.widgetCategory === WIDGET_CATEGORIES.CODEWEB_DEV
        )
        const godprofilePresets = allPresets.filter(
          (p) => p.widgetCategory === WIDGET_CATEGORIES.GODPROFILE
        )
        const controlplanePresets = allPresets.filter(
          (p) => p.widgetCategory === WIDGET_CATEGORIES.CONTROLPLANE
        )

        return (
          <div className="space-y-5">
            {nativePresets.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2 px-0.5">
                  <Zap size={10} className="text-signal-lime shrink-0" />
                  <span className="font-inter-tight text-caption font-medium text-signal-lime uppercase tracking-[0.16em]">
                    {t('editor.sidebar.native_category', 'GitAscii Native')}
                  </span>
                  <span className="ml-auto font-inter-tight text-caption text-ash/50">
                    {nativePresets.length}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {nativePresets.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      onClick={() => applyTemplate(tmpl.id)}
                      onMouseEnter={(e) =>
                        handleHover(tmpl, e.currentTarget.getBoundingClientRect())
                      }
                      onMouseLeave={handleLeave}
                      data-testid={`template-${tmpl.id}`}
                      className={`group relative p-3 border rounded-xs cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 flex flex-col justify-between ${
                        config.templateId === tmpl.id
                          ? 'border-signal-lime bg-signal-lime/10 shadow-[0_0_15px_rgba(197,255,74,0.1)]'
                          : 'border-graphite bg-void-black/60 hover:bg-onyx hover:border-pearl'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-inter-tight font-medium text-note text-chalk group-hover:text-white transition-colors duration-300">
                            {tmpl.name}
                          </h4>
                        </div>
                        {config.templateId === tmpl.id ? (
                          <span className="text-[9px] uppercase font-inter-tight font-bold text-signal-lime px-2 py-0.5 border border-signal-lime rounded-[9999px] bg-signal-lime/10">
                            {t('editor.sidebar.active', 'Active')}
                          </span>
                        ) : (
                          <div className="flex gap-1.5">
                            <div
                              className="h-2.5 w-2.5 rounded-full border border-graphite"
                              style={{ backgroundColor: tmpl.colors.background }}
                            />
                            <div
                              className="h-2.5 w-2.5 rounded-full border border-graphite"
                              style={{ backgroundColor: tmpl.colors.accent }}
                            />
                          </div>
                        )}
                      </div>
                      <p className="font-inter-tight text-caption text-ash line-clamp-1">
                        {tmpl.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {asciiPresets.length > 0 && (
              <div>
                <div className="border-t border-graphite/50 my-3" />
                <div className="flex items-center gap-1.5 mb-2 px-0.5">
                  <span className="font-inter-tight text-caption font-medium text-[#ffa657] uppercase tracking-[0.16em]">
                    {t('editor.sidebar.asciiprofile_category', 'ASCII Profile Kit')}
                  </span>
                  <span className="ml-auto font-inter-tight text-caption text-ash/50">
                    {asciiPresets.length}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {asciiPresets.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      onClick={() => applyTemplate(tmpl.id)}
                      onMouseEnter={(e) =>
                        handleHover(tmpl, e.currentTarget.getBoundingClientRect())
                      }
                      onMouseLeave={handleLeave}
                      data-testid={`template-${tmpl.id}`}
                      className={`group relative border bg-[#0d1117] hover:bg-[#161b22] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-xs cursor-pointer shadow-xs hover:-translate-y-0.5 overflow-hidden flex flex-col ${
                        config.templateId === tmpl.id
                          ? 'border-[#ffa657] shadow-[0_4px_15px_rgba(255,166,87,0.25)]'
                          : 'border-[#30363d] hover:border-[#ffa657]/60'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-[#161b22] border-b border-[#30363d] font-mono text-[9px] text-[#7d8590]">
                        <div className="flex gap-0.5 text-[8px] font-bold">
                          <span className="text-[#ff5f56]">[o]</span>
                          <span className="text-[#ffbd2e]">[o]</span>
                          <span className="text-[#27c93f]">[o]</span>
                        </div>
                        <span className="ml-1 text-[#ffa657]/80 font-semibold truncate">
                          tpl://{tmpl.id}
                        </span>
                        {config.templateId === tmpl.id && (
                          <span className="ml-auto text-[8px] uppercase font-mono font-bold text-[#ffa657] px-1.5 py-0.5 border border-[#ffa657]/40 bg-[#ffa657]/10">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="p-3 flex items-center justify-between">
                        <div>
                          <h4 className="font-mono font-medium text-[11px] text-[#e6edf3] group-hover:text-[#ffa657] transition-colors">
                            {tmpl.name}
                          </h4>
                          <p className="font-mono text-[9px] text-[#7d8590] line-clamp-1 mt-0.5">
                            {tmpl.description}
                          </p>
                        </div>
                        <div className="flex gap-1.5 ml-2 shrink-0">
                          <div
                            className="h-2.5 w-2.5 rounded-full border border-graphite"
                            style={{ backgroundColor: tmpl.colors.background }}
                          />
                          <div
                            className="h-2.5 w-2.5 rounded-full border border-graphite"
                            style={{ backgroundColor: tmpl.colors.accent }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {codewebPresets.length > 0 && (
              <div>
                <div className="border-t border-graphite/50 my-3" />
                <div className="flex items-center gap-1.5 mb-2 px-0.5">
                  <span
                    className="font-mono text-caption font-semibold text-[#6cc382] uppercase tracking-[0.16em]"
                    style={{ textShadow: '0 0 8px rgba(108,195,130,0.4)' }}
                  >
                    {t('editor.sidebar.codeweb_category', 'Codeweb Studio')}
                  </span>
                  <span className="ml-auto font-mono text-caption text-[#6b6b8a]">
                    {codewebPresets.length}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {codewebPresets.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      onClick={() => applyTemplate(tmpl.id)}
                      onMouseEnter={(e) =>
                        handleHover(tmpl, e.currentTarget.getBoundingClientRect())
                      }
                      onMouseLeave={handleLeave}
                      data-testid={`template-${tmpl.id}`}
                      className={`group relative p-3 border bg-[#0a0a14] hover:bg-[#121224] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-xs cursor-pointer flex items-center justify-between shadow-xs hover:-translate-y-0.5 overflow-hidden ${
                        config.templateId === tmpl.id
                          ? 'border-[#6cc382] shadow-[0_0_15px_rgba(108,195,130,0.25)]'
                          : 'border-[#1e1e38] hover:border-[#6cc382]/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-1.5 h-1.5 bg-[#6cc382] rounded-full group-hover:shadow-[0_0_8px_#6cc382] transition-all" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-mono font-medium text-[11px] text-[#d6e0f0] group-hover:text-[#6cc382] transition-colors">
                              {tmpl.name}
                            </h4>
                            {config.templateId === tmpl.id && (
                              <span className="text-[8px] font-mono font-bold text-[#6cc382] bg-[#6cc382]/10 border border-[#6cc382]/30 px-1 py-0.2 rounded-xs">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <p className="font-mono text-[9px] text-[#6b6b8a] group-hover:text-[#a0a0c0] transition-colors line-clamp-1 mt-0.5">
                            {tmpl.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1.5 ml-2 shrink-0">
                        <div
                          className="h-2.5 w-2.5 rounded-full border border-graphite"
                          style={{ backgroundColor: tmpl.colors.background }}
                        />
                        <div
                          className="h-2.5 w-2.5 rounded-full border border-graphite"
                          style={{ backgroundColor: tmpl.colors.accent }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {surveillancePresets.length > 0 && (
              <div>
                <div className="border-t border-graphite/50 my-3" />
                <div className="flex items-center gap-1.5 mb-2 px-0.5">
                  <span
                    className="font-mono text-caption font-semibold text-[#55ffff] uppercase tracking-[0.16em]"
                    style={{ textShadow: '0 0 8px rgba(85,255,255,0.4)' }}
                  >
                    {t('editor.sidebar.surveillance_category', 'rugbedbugg')}
                  </span>
                  <span className="ml-auto font-mono text-caption text-[#6f6478]">
                    {surveillancePresets.length}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {surveillancePresets.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      onClick={() => applyTemplate(tmpl.id)}
                      onMouseEnter={(e) =>
                        handleHover(tmpl, e.currentTarget.getBoundingClientRect())
                      }
                      onMouseLeave={handleLeave}
                      data-testid={`template-${tmpl.id}`}
                      className={`group relative p-3 border bg-[#050308] hover:bg-[#0c0814] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-none cursor-pointer flex items-center justify-between shadow-xs hover:-translate-y-0.5 overflow-hidden ${
                        config.templateId === tmpl.id
                          ? 'border-[#55ffff] shadow-[0_0_15px_rgba(85,255,255,0.25)]'
                          : 'border-[#1a1424] hover:border-[#55ffff]/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-caption text-[#55ffff] font-bold">»</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-mono font-medium text-[11px] text-[#f2e6f9] group-hover:text-[#55ffff] transition-colors">
                              {tmpl.name}
                            </h4>
                            {config.templateId === tmpl.id && (
                              <span className="text-[8px] font-mono font-bold text-[#55ffff] bg-[#55ffff]/10 border border-[#55ffff]/30 px-1 py-0.2 rounded-none">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <p className="font-mono text-[9px] text-[#6f6478] group-hover:text-[#a89cb3] transition-colors line-clamp-1 mt-0.5">
                            {tmpl.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1.5 ml-2 shrink-0">
                        <div
                          className="h-2.5 w-2.5 rounded-full border border-graphite"
                          style={{ backgroundColor: tmpl.colors.background }}
                        />
                        <div
                          className="h-2.5 w-2.5 rounded-full border border-graphite"
                          style={{ backgroundColor: tmpl.colors.accent }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {godprofilePresets.length > 0 && (
              <div>
                <div className="border-t border-graphite/50 my-3" />
                <div className="flex items-center gap-1.5 mb-2 px-0.5">
                  <Sparkles size={10} className="text-[#b6a891] shrink-0" />
                  <span className="font-inter-tight text-caption font-medium text-[#d4d4d8] uppercase tracking-[0.16em]">
                    {t('editor.sidebar.godprofile_category', 'God Profile (B&W Edition)')}
                  </span>
                  <span className="ml-auto font-inter-tight text-caption text-ash/50">
                    {godprofilePresets.length}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {godprofilePresets.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      onClick={() => applyTemplate(tmpl.id)}
                      onMouseEnter={(e) =>
                        handleHover(tmpl, e.currentTarget.getBoundingClientRect())
                      }
                      onMouseLeave={handleLeave}
                      data-testid={`template-${tmpl.id}`}
                      className={`group relative p-3 border bg-[#09090b] hover:bg-[#121215] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-xs cursor-pointer flex items-center justify-between shadow-xs hover:-translate-y-0.5 overflow-hidden ${
                        config.templateId === tmpl.id
                          ? 'border-[#b6a891] shadow-[0_0_15px_rgba(182,168,145,0.2)]'
                          : 'border-[#27272a] hover:border-[#b6a891]/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-serif italic font-medium text-[12px] text-[#e4e4e7] group-hover:text-[#b6a891] transition-colors">
                            {tmpl.name}
                          </h4>
                          {config.templateId === tmpl.id && (
                            <span className="text-[8px] font-mono font-bold text-[#b6a891] bg-[#b6a891]/10 border border-[#b6a891]/30 px-1 py-0.2 rounded-xs">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <p className="font-inter-tight text-[9px] text-[#71717a] line-clamp-1 mt-0.5">
                          {tmpl.description}
                        </p>
                      </div>
                      <div className="flex gap-1.5 ml-2 shrink-0">
                        <div
                          className="h-2.5 w-2.5 rounded-full border border-graphite"
                          style={{ backgroundColor: tmpl.colors.background }}
                        />
                        <div
                          className="h-2.5 w-2.5 rounded-full border border-graphite"
                          style={{ backgroundColor: tmpl.colors.accent }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {controlplanePresets.length > 0 && (
              <div>
                <div className="border-t border-graphite/50 my-3" />
                <div className="flex items-center gap-1.5 mb-2 px-0.5">
                  <span
                    className="font-mono text-caption font-semibold text-[#00E5FF] uppercase tracking-[0.16em]"
                    style={{ textShadow: '0 0 8px rgba(0,229,255,0.4)' }}
                  >
                    {t('editor.sidebar.controlplane_category', 'Control Plane Toolkit')}
                  </span>
                  <span className="ml-auto font-mono text-caption text-[#4A6B8C]">
                    {controlplanePresets.length}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {controlplanePresets.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      onClick={() => applyTemplate(tmpl.id)}
                      onMouseEnter={(e) =>
                        handleHover(tmpl, e.currentTarget.getBoundingClientRect())
                      }
                      onMouseLeave={handleLeave}
                      data-testid={`template-${tmpl.id}`}
                      className={`group relative p-3 border bg-[#020617] hover:bg-[#031024] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-none cursor-pointer flex items-center justify-between shadow-xs hover:-translate-y-0.5 overflow-hidden ${
                        config.templateId === tmpl.id
                          ? 'border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.25)]'
                          : 'border-[#0A1929] hover:border-[#00E5FF]/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-caption text-[#00E5FF] font-bold">»</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-mono font-medium text-[11px] text-[#B2D8FF] group-hover:text-[#00E5FF] transition-colors">
                              {tmpl.name}
                            </h4>
                            {config.templateId === tmpl.id && (
                              <span className="text-[8px] font-mono font-bold text-[#00E5FF] bg-[#00E5FF]/10 border border-[#00E5FF]/30 px-1 py-0.2 rounded-none">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <p className="font-mono text-[9px] text-[#4A6B8C] group-hover:text-[#66B2FF] transition-colors line-clamp-1 mt-0.5">
                            {tmpl.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1.5 ml-2 shrink-0">
                        <div
                          className="h-2.5 w-2.5 rounded-full border border-graphite"
                          style={{ backgroundColor: tmpl.colors.background }}
                        />
                        <div
                          className="h-2.5 w-2.5 rounded-full border border-graphite"
                          style={{ backgroundColor: tmpl.colors.accent }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })()}

      <button
        type="button"
        onClick={() => setIsContributeModalOpen(true)}
        className="w-full text-left group block p-2.5 border border-signal-lime/60 bg-signal-lime/5 hover:bg-signal-lime/15 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-none cursor-pointer hover:shadow-[0_0_20px_rgba(197,255,74,0.15)] hover:-translate-y-0.5"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xs bg-signal-lime text-black shrink-0">
            <GitFork size={14} />
          </div>
          <div>
            <h4 className="font-inter-tight font-medium text-note text-signal-lime leading-tight">
              {t('editor.sidebar.contribute_template', 'Crie seu próprio Template!')}
            </h4>
            <p className="font-inter-tight text-caption text-chalk/50 leading-tight">
              {t(
                'editor.sidebar.contribute_template_desc',
                'Faça um fork e compartilhe com a comunidade'
              )}
            </p>
          </div>
        </div>
      </button>

      <ContributeTemplateModal
        isOpen={isContributeModalOpen}
        onClose={() => setIsContributeModalOpen(false)}
        onExportTemplate={(cat) => handleExport(cat)}
      />

      {showCategoryPicker &&
        typeof document !== 'undefined' &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-100 bg-black/70 backdrop-blur-sm transition-opacity duration-200"
              onClick={() => setShowCategoryPicker(false)}
            />
            <div className="fixed z-101 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 bg-onyx border border-graphite rounded-lg shadow-2xl">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-graphite">
                <h3 className="font-inter-tight font-semibold text-body text-chalk">
                  {t(
                    'editor.sidebar.export_select_category_title',
                    'Categoria do Widget / Template'
                  )}
                </h3>
                <button
                  onClick={() => setShowCategoryPicker(false)}
                  className="p-1 rounded text-ash hover:text-chalk transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-note text-ash font-inter-tight mb-4">
                {t(
                  'editor.sidebar.export_select_category_desc',
                  'Selecione a categoria correspondente à aba de widgets que melhor representa este template (opcional):'
                )}
              </p>

              <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
                {WIDGET_CATEGORY_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    onClick={() => setPendingWidgetCategory(opt.value)}
                    className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-all ${
                      pendingWidgetCategory === opt.value
                        ? 'border-signal-lime bg-signal-lime/10 text-white'
                        : 'border-graphite bg-carbon/60 hover:bg-carbon text-ash hover:text-chalk'
                    }`}
                  >
                    <input
                      type="radio"
                      name="widgetCategory"
                      value={opt.value}
                      checked={pendingWidgetCategory === opt.value}
                      onChange={() => setPendingWidgetCategory(opt.value)}
                      className="accent-[#c5ff4a]"
                    />
                    <span className="font-inter-tight text-label font-medium">{opt.label}</span>
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-graphite">
                <button
                  type="button"
                  onClick={() => setShowCategoryPicker(false)}
                  className="px-3.5 py-2 bg-graphite hover:bg-iron border border-iron rounded-md text-note text-chalk font-inter-tight font-medium transition-colors cursor-pointer"
                >
                  {t('common.cancel', 'Cancelar')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleExport(pendingWidgetCategory)
                    setShowCategoryPicker(false)
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-signal-lime text-black rounded-md text-note font-inter-tight font-semibold glow-lime hover:brightness-110 transition-all cursor-pointer"
                >
                  <Download size={14} />
                  <span>{t('editor.sidebar.export_confirm_btn', 'Exportar JSON')}</span>
                </button>
              </div>
            </div>
          </>,
          document.body
        )}

      {hoveredTemplate && (
        <TemplatePreviewTooltip
          template={hoveredTemplate.template}
          targetRect={hoveredTemplate.rect}
          githubData={githubData}
        />
      )}
    </>
  )
}
