'use client'

import { ChevronDown, Type } from 'lucide-react'
import React, { useEffect, useState } from 'react'

import { ASCII_TEXT_CHARSET_OPTIONS } from '@/constants'
import { type AsciiFontName, convertTextToAscii } from '@/engine/ascii/textConverter'
import { useI18n } from '@/i18n'

import { useEditorStore } from '../../store/editorStore'

interface AsciiTextControlsProps {
  instanceId: string
  config: Record<string, unknown>
}

const CHARSET_OPTIONS = ASCII_TEXT_CHARSET_OPTIONS

export function AsciiTextControls({ instanceId, config }: AsciiTextControlsProps) {
  const { t } = useI18n()
  const { updateWidgetConfig } = useEditorStore()

  const [isCharsetMenuOpen, setIsCharsetMenuOpen] = useState(false)

  const customText = (config.customText as string) || 'GITAscii'
  const asciiFont = (config.asciiFont as AsciiFontName) || 'block'
  const charSpacing = config.charSpacing !== undefined ? Number(config.charSpacing) : 1
  const charset = (config.charset as string) || 'default'
  const customCharset = (config.customCharset as string) || ''

  const detail = (config.detail as 'low' | 'medium' | 'high' | 'ultra' | 'custom') || 'medium'
  const cols =
    Number(config.cols) ||
    (detail === 'low' ? 28 : detail === 'medium' ? 45 : detail === 'high' ? 85 : 150)

  useEffect(() => {
    const lines = convertTextToAscii(customText, asciiFont, charSpacing, charset, customCharset)
    const storedLines = config.asciiLines as string[]
    const isSame =
      storedLines &&
      storedLines.length === lines.length &&
      storedLines.every((val, idx) => val === lines[idx])

    if (!isSame) {
      updateWidgetConfig(instanceId, {
        asciiLines: lines,
      })
    }
  }, [
    customText,
    asciiFont,
    charSpacing,
    charset,
    customCharset,
    instanceId,
    config.asciiLines,
    updateWidgetConfig,
  ])

  const selectedCharsetObj = CHARSET_OPTIONS.find((c) => c.id === charset) || CHARSET_OPTIONS[0]

  return (
    <div className="space-y-4 pt-3 border-t border-graphite font-inter-tight">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-signal-lime text-eyebrow uppercase tracking-wider font-semibold">
          <Type size={14} />
          <span>{t('editor.ascii.text_title', 'Texto em ASCII')}</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-eyebrow text-ash font-medium block">
          {t('editor.ascii.text_label', 'Texto Personalizado')}
        </label>
        <textarea
          rows={3}
          value={customText}
          onChange={(e) => updateWidgetConfig(instanceId, { customText: e.target.value })}
          placeholder="EX: HELLO"
          className="w-full bg-graphite border border-graphite text-chalk text-note p-2 rounded focus:border-signal-lime focus:outline-none resize-none font-jetbrains-mono"
        />
      </div>

      <div className="space-y-2 pt-2 border-t border-graphite/50 relative">
        <label className="text-eyebrow text-ash font-medium block">
          {t('editor.ascii.charset_base_label', 'Conjunto de Caracteres (Base)')}
        </label>

        <button
          type="button"
          onClick={() => setIsCharsetMenuOpen(!isCharsetMenuOpen)}
          className="w-full bg-graphite border border-graphite hover:border-signal-lime/50 p-2.5 rounded text-left flex items-center justify-between transition-all"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="font-jetbrains-mono bg-carbon text-signal-lime text-eyebrow px-2 py-0.5 rounded border border-graphite font-bold shrink-0">
              {selectedCharsetObj.preview}
            </span>
            <div className="truncate">
              <div className="text-eyebrow text-chalk font-semibold leading-tight">
                {selectedCharsetObj.name}
              </div>
              <div className="text-[9px] text-ash">{selectedCharsetObj.info}</div>
            </div>
          </div>
          <ChevronDown
            size={14}
            className={`text-ash transition-transform shrink-0 ${isCharsetMenuOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isCharsetMenuOpen && (
          <div className="absolute z-50 left-0 right-0 top-15 bg-carbon border border-graphite rounded shadow-xl max-h-60 overflow-y-auto p-1 space-y-1">
            {CHARSET_OPTIONS.map((item) => {
              const isSelected = item.id === charset
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    updateWidgetConfig(instanceId, { charset: item.id })
                    setIsCharsetMenuOpen(false)
                  }}
                  className={`w-full text-left p-2 rounded flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-graphite text-signal-lime border border-signal-lime/40'
                      : 'hover:bg-graphite/60 text-chalk'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="font-jetbrains-mono bg-void-black text-signal-lime text-eyebrow px-2 py-0.5 rounded border border-graphite font-semibold shrink-0">
                      {item.preview}
                    </span>
                    <span className="text-eyebrow font-medium truncate">{item.name}</span>
                  </div>
                  <span className="text-[9px] text-ash shrink-0">{item.info}</span>
                </button>
              )
            })}
          </div>
        )}

        {charset === 'custom' && (
          <input
            type="text"
            value={customCharset}
            onChange={(e) => updateWidgetConfig(instanceId, { customCharset: e.target.value })}
            placeholder="Ex:  .-+*#@"
            className="w-full bg-graphite border border-graphite text-chalk text-note px-2.5 py-1.5 rounded focus:border-signal-lime focus:outline-none font-jetbrains-mono mt-1"
          />
        )}
      </div>

      <div className="space-y-1.5 pt-2 border-t border-graphite/50">
        <div className="flex justify-between text-eyebrow">
          <span className="text-ash font-medium">
            {t('editor.ascii.spacing_label', 'Espaçamento de Letras')}
          </span>
          <span className="text-signal-lime font-mono font-semibold">{charSpacing} px</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="4"
            step="1"
            value={charSpacing}
            onChange={(e) =>
              updateWidgetConfig(instanceId, { charSpacing: parseInt(e.target.value, 10) })
            }
            className="flex-1 accent-signal-lime h-1 bg-graphite rounded cursor-pointer"
          />
        </div>
      </div>

      <div className="space-y-3 pt-2 border-t border-graphite/50">
        <div className="flex items-center justify-between">
          <label className="text-eyebrow text-ash font-medium">
            {t('editor.ascii.detail_level', 'Nível de Detalhe (Colunas)')}
          </label>
          <span className="text-eyebrow text-signal-lime font-mono font-semibold">{cols} cols</span>
        </div>

        <div className="grid grid-cols-4 gap-1">
          {[
            { id: 'low', label: t('editor.ascii.low', 'Baixo'), c: 28 },
            { id: 'medium', label: t('editor.ascii.medium', 'Médio'), c: 45 },
            { id: 'high', label: t('editor.ascii.high', 'Alto'), c: 85 },
            { id: 'ultra', label: t('editor.ascii.ultra', 'Ultra'), c: 150 },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => updateWidgetConfig(instanceId, { detail: item.id, cols: item.c })}
              className={`py-1 text-caption font-medium rounded border transition-all ${
                cols === item.c || detail === item.id
                  ? 'bg-signal-lime text-black border-signal-lime font-semibold'
                  : 'bg-graphite text-ash border-graphite hover:text-chalk'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <input
          type="range"
          min={16}
          max={150}
          step={2}
          value={cols}
          onChange={(e) =>
            updateWidgetConfig(instanceId, { cols: Number(e.target.value), detail: 'custom' })
          }
          className="w-full accent-signal-lime bg-graphite h-1.5 rounded cursor-pointer"
        />
      </div>
    </div>
  )
}
