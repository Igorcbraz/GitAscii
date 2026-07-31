'use client'

import { ChevronDown, Type } from 'lucide-react'
import React, { useEffect, useState } from 'react'

import { type AsciiFontName, convertTextToAscii } from '@/engine/ascii/textConverter'
import { useI18n } from '@/i18n'

import { useEditorStore } from '../../store/editorStore'

interface AsciiTextControlsProps {
  instanceId: string
  config: Record<string, unknown>
}

const CHARSET_OPTIONS = [
  { id: 'default', name: 'NATURAL / FONTE', preview: 'Native', info: 'Original do estilo' },
  { id: 'dense', name: 'DENSE GRADIENT', preview: '"$@B%8&WM#*oahk', info: '67 chars' },
  { id: 'standard', name: 'STANDARD', preview: ' .:-=+*#%@', info: '10 chars' },
  { id: 'blocks', name: 'BLOCKS / SHADING', preview: ' ░▒▓█', info: '5 chars' },
  { id: 'dots', name: 'BRAILLE / DOTS', preview: ' ⠁⠃⠇⡇⣇⣿', info: '7 chars' },
  { id: 'matrix', name: 'MATRIX / HEX', preview: ' 0123456789ABCDEF', info: '16 chars' },
  { id: 'ascii', name: 'CLASSIC ASCII', preview: " .',:;!|/>(){}", info: '13 chars' },
  { id: 'binary', name: 'BINARY', preview: ' 01010101', info: '2 chars' },
  { id: 'slash', name: 'SLASH PATTERN', preview: ' \\/|/\\/|', info: '3 chars' },
  { id: 'retro', name: 'RETRO ORBS', preview: ' .oO@Oop', info: '5 chars' },
  { id: 'minimal', name: 'MINIMAL', preview: ' .*#*.*#', info: '4 chars' },
  { id: 'custom', name: 'CUSTOMIZADO', preview: ' [ Digitar... ]', info: 'Personalizado' },
]

export function AsciiTextControls({ instanceId, config }: AsciiTextControlsProps) {
  const { t } = useI18n()
  const { updateWidgetConfig } = useEditorStore()

  const [isCharsetMenuOpen, setIsCharsetMenuOpen] = useState(false)

  const customText = (config.customText as string) || 'GITAscii'
  const asciiFont = (config.asciiFont as AsciiFontName) || 'block'
  const charSpacing = config.charSpacing !== undefined ? Number(config.charSpacing) : 1
  const fontSize = Number(config.fontSize) || 12
  const charset = (config.charset as string) || 'default'
  const customCharset = (config.customCharset as string) || ''

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

  const FONT_OPTIONS: Array<{ id: AsciiFontName; name: string; info: string }> = [
    { id: 'block', name: t('editor.ascii.font.block', 'Block Solid'), info: '5 lines high' },
    { id: 'slant', name: t('editor.ascii.font.slant', 'Slant Banner'), info: '5 lines high' },
    { id: 'thin', name: t('editor.ascii.font.thin', 'Thin Outline'), info: '3 lines high' },
  ]

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

      <div className="space-y-2">
        <label className="text-eyebrow text-ash font-medium block">
          {t('editor.ascii.font_label', 'Estilo da Fonte ASCII')}
        </label>
        <div className="grid grid-cols-3 gap-1 bg-carbon p-1 rounded border border-graphite">
          {FONT_OPTIONS.map((opt) => {
            const isSelected = asciiFont === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateWidgetConfig(instanceId, { asciiFont: opt.id })}
                className={`py-1.5 px-2 rounded text-caption font-medium transition-all text-center truncate ${
                  isSelected
                    ? 'bg-graphite text-signal-lime border border-signal-lime/40'
                    : 'text-ash hover:text-chalk'
                }`}
                title={opt.info}
              >
                {opt.name}
              </button>
            )
          })}
        </div>
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

      <div className="space-y-1.5 pt-2 border-t border-graphite/50">
        <div className="flex justify-between text-eyebrow">
          <span className="text-ash font-medium">
            {t('editor.ascii.fontsize_label', 'Tamanho do Caractere')}
          </span>
          <span className="text-signal-lime font-mono font-semibold">{fontSize} px</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="6"
            max="24"
            step="1"
            value={fontSize}
            onChange={(e) =>
              updateWidgetConfig(instanceId, { fontSize: parseInt(e.target.value, 10) })
            }
            className="flex-1 accent-signal-lime h-1 bg-graphite rounded cursor-pointer"
          />
        </div>
      </div>
    </div>
  )
}
