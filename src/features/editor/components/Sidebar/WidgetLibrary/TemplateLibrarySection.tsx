'use client'

import { Download, GitFork, Upload } from 'lucide-react'
import React, { useRef } from 'react'

import { useToast } from '@/components/ui/toast'
import { EXTERNAL_LINKS, USER_SPECIFIC_FIELDS } from '@/constants'
import { TEMPLATE_PRESETS } from '@/engine/core/TemplateRenderer'
import type { SavedConfiguration } from '@/engine/types'
import { useI18n } from '@/i18n'

interface TemplateLibrarySectionProps {
  config: SavedConfiguration
  applyTemplate: (templateId: string) => void
  importLayout: (widgets: any[], globalStyles: any, templateId: string) => void
}

export function TemplateLibrarySection({
  config,
  applyTemplate,
  importLayout,
}: TemplateLibrarySectionProps) {
  const { t } = useI18n()
  const { error } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    try {
      const exportData = {
        widgets: config.widgets,
        globalStyles: config.globalStyles,
        templateId: config.templateId,
      }
      const jsonString = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `gitascii_layout_${config.username}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to export layout:', err)
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
                {t('editor.sidebar.import_layout', 'Import Layout')}
              </h4>
              <p className="font-inter-tight text-caption text-ash line-clamp-1">
                {t('editor.sidebar.import_layout_desc', 'Carregar layout de arquivo JSON')}
              </p>
            </div>
          </div>
        </div>

        <div
          onClick={handleExport}
          data-testid="export-layout-btn"
          className="group relative p-2.5 border border-graphite hover:border-pearl bg-void-black/60 hover:bg-onyx transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-xs cursor-pointer flex items-center justify-between shadow-xs hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-xs bg-graphite group-hover:bg-slate text-pearl group-hover:text-chalk transition-colors duration-300 shrink-0">
              <Download size={14} />
            </div>
            <div>
              <h4 className="font-inter-tight font-medium text-note text-chalk group-hover:text-white transition-colors duration-300">
                {t('editor.sidebar.export_layout', 'Export Layout')}
              </h4>
              <p className="font-inter-tight text-caption text-ash line-clamp-1">
                {t('editor.sidebar.export_layout_desc', 'Salvar layout atual em arquivo JSON')}
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
      {Object.values(TEMPLATE_PRESETS).map((tmpl) => (
        <div
          key={tmpl.id}
          onClick={() => applyTemplate(tmpl.id)}
          data-testid={`template-${tmpl.id}`}
          className={`p-4 border rounded-none cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 ${
            config.templateId === tmpl.id
              ? 'border-signal-lime bg-iron shadow-sm'
              : 'border-graphite bg-graphite hover:border-slate'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-inter-tight font-medium text-body text-chalk">{tmpl.name}</h4>
            {config.templateId === tmpl.id && (
              <span className="text-caption uppercase font-inter-tight font-medium text-signal-lime px-2 py-0.5 border border-signal-lime rounded-[9999px]">
                {t('editor.sidebar.active', 'Active')}
              </span>
            )}
          </div>
          <p className="font-inter-tight text-note text-ash mb-3">{tmpl.description}</p>
          <div className="flex gap-2">
            <div
              className="h-4 w-4 rounded-full border border-slate"
              style={{ backgroundColor: tmpl.colors.background }}
            />
            <div
              className="h-4 w-4 rounded-full border border-slate"
              style={{ backgroundColor: tmpl.colors.accent }}
            />
            <div
              className="h-4 w-4 rounded-full border border-slate"
              style={{ backgroundColor: tmpl.colors.cardBackground }}
            />
          </div>
        </div>
      ))}

      <a
        href={EXTERNAL_LINKS.GITHUB_FORK}
        target="_blank"
        rel="noopener noreferrer"
        className="group block p-2.5 border border-signal-lime/60 bg-signal-lime/5 hover:bg-signal-lime/15 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-none cursor-pointer hover:shadow-[0_0_20px_rgba(197,255,74,0.15)] hover:-translate-y-0.5"
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
      </a>
    </>
  )
}
