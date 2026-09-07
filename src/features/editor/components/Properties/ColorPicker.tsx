'use client'

import { Check, ChevronDown, Copy, Pipette, Sparkles } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

import { GITHUB_THEME_KEYS, GITHUB_THEME_SWATCHES, isGitHubAdaptiveTheme } from '@/constants'
import { useI18n } from '@/i18n'
import { copyToClipboard } from '@/utils/clipboard'

interface ColorPickerProps {
  label?: string
  value: string
  onChange: (color: string) => void
  align?: 'left' | 'right'
}

const RECENT_COLORS_STORAGE_KEY = 'gitascii_recent_colors'
const MAX_RECENT_COLORS = 12

function getRecentColors(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(RECENT_COLORS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveRecentColor(color: string): void {
  if (typeof window === 'undefined') return
  const normalized = color.trim()
  if (!normalized) return
  try {
    const existing = getRecentColors().filter((c) => c.toLowerCase() !== normalized.toLowerCase())
    const updated = [normalized, ...existing].slice(0, MAX_RECENT_COLORS)
    localStorage.setItem(RECENT_COLORS_STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // Non-blocking storage error
  }
}

const PRESET_SWATCHES = [
  'transparent',
  '#c5ff4a',
  '#00ffff',
  '#ff00ff',
  '#bd93f9',
  '#88c0d0',
  '#ffb800',
  '#ff4a4a',
  '#060606',
  '#1f1f1f',
  '#7a7a7a',
  '#f0f0f0',
]

export function ColorPicker({
  label,
  value = '#1f1f1f',
  onChange,
  align = 'left',
}: ColorPickerProps) {
  const { t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const [hexInput, setHexInput] = useState(value)
  const [copied, setCopied] = useState(false)
  const [recentColors, setRecentColors] = useState<string[]>([])
  const popoverRef = useRef<HTMLDivElement>(null)

  const isAuto = isGitHubAdaptiveTheme(value)
  const isTransparent = value.toLowerCase() === 'transparent'

  useEffect(() => {
    if (value.toLowerCase() !== hexInput.toLowerCase()) {
      setHexInput(value)
    }
  }, [value, hexInput])

  useEffect(() => {
    if (isOpen) {
      setRecentColors(getRecentColors())
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const commitColor = (newColor: string) => {
    onChange(newColor)
    saveRecentColor(newColor)
  }

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value
    setHexInput(rawVal)
    const trimmed = rawVal.trim()
    const normalized = trimmed.toLowerCase()
    const isAdaptive = isGitHubAdaptiveTheme(normalized)

    if (isAdaptive) {
      commitColor(GITHUB_THEME_KEYS.AUTO)
      return
    }

    if (normalized === 'transparent') {
      commitColor('transparent')
      return
    }

    let candidate = trimmed
    if (!candidate.startsWith('#') && /^[0-9A-Fa-f]{3,8}$/.test(candidate)) {
      candidate = `#${candidate}`
    }

    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(candidate)) {
      if (candidate.toLowerCase() !== value.toLowerCase()) {
        commitColor(candidate)
      }
    }
  }

  const handleHexBlur = () => {
    const trimmed = hexInput.trim()
    let candidate = trimmed
    if (!candidate.startsWith('#') && /^[0-9A-Fa-f]{3,8}$/.test(candidate)) {
      candidate = `#${candidate}`
    }
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(candidate)) {
      setHexInput(candidate)
      if (candidate.toLowerCase() !== value.toLowerCase()) {
        commitColor(candidate)
      }
    } else if (isGitHubAdaptiveTheme(trimmed)) {
      setHexInput(GITHUB_THEME_KEYS.AUTO)
    } else if (trimmed.toLowerCase() === 'transparent') {
      setHexInput('transparent')
    } else {
      setHexInput(value)
    }
  }

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const textToCopy = isAuto ? GITHUB_THEME_KEYS.DARK : value
    const success = await copyToClipboard(textToCopy)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  const displayLabel = isAuto ? 'GITHUB AUTO' : isTransparent ? 'TRANSPARENT' : value

  return (
    <div className="relative" ref={popoverRef}>
      {label && (
        <label className="text-eyebrow text-ash block mb-1 font-inter-tight font-medium">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 bg-graphite border border-graphite hover:border-slate p-1.5 rounded-sm transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-5 h-5 rounded-[3px] border border-white/20 shadow-inner flex items-center justify-center shrink-0 relative overflow-hidden"
            style={
              isAuto
                ? {
                    background: `linear-gradient(135deg, ${GITHUB_THEME_KEYS.DARK} 50%, ${GITHUB_THEME_KEYS.LIGHT} 50%)`,
                  }
                : isTransparent
                  ? {
                      backgroundImage:
                        'conic-gradient(#555 25%, #333 25%, #333 50%, #555 50%, #555 75%, #333 75%)',
                      backgroundSize: '8px 8px',
                    }
                  : { backgroundColor: value }
            }
          >
            {isTransparent && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[140%] h-[1.5px] bg-red-500/80 -rotate-45" />
              </div>
            )}
            {isAuto && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={10} className="text-signal-lime drop-shadow-xs" />
              </div>
            )}
          </div>
          <span className="font-jetbrains-mono text-eyebrow text-chalk uppercase tracking-wider truncate">
            {displayLabel}
          </span>
        </div>
        <ChevronDown
          size={14}
          className={`text-ash transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            align === 'left' ? 'left-0' : 'right-0'
          } top-full mt-1 w-64 bg-onyx border border-slate p-3 rounded-md shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100`}
        >
          <div className="text-caption uppercase font-inter-tight font-semibold tracking-wider text-ash mb-2 flex items-center justify-between">
            <span>
              {t('editor.properties.color_picker.github_themes', 'GitHub Profile Themes')}
            </span>
            <button
              onClick={handleCopy}
              className="text-ash hover:text-signal-lime transition-colors flex items-center gap-1 cursor-pointer"
              title={t('editor.properties.color_picker.copy_hex', 'Copy Hex')}
            >
              {copied ? <Check size={12} className="text-signal-lime" /> : <Copy size={12} />}
              <span className="text-caption">
                {copied
                  ? t('common.copied', 'Copied')
                  : t('editor.properties.color_picker.copy', 'Copy')}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              commitColor(GITHUB_THEME_KEYS.AUTO)
              setHexInput(GITHUB_THEME_KEYS.AUTO)
            }}
            className={`w-full p-2 mb-2.5 rounded-sm border transition-all flex items-center justify-between text-left cursor-pointer group ${
              isAuto
                ? 'border-signal-lime bg-signal-lime/10 ring-1 ring-signal-lime/40'
                : 'border-graphite bg-graphite/60 hover:border-slate hover:bg-graphite'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-[3px] border border-white/20 shadow-inner flex items-center justify-center shrink-0 relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${GITHUB_THEME_KEYS.DARK} 50%, ${GITHUB_THEME_KEYS.LIGHT} 50%)`,
                }}
              >
                <Sparkles size={11} className="text-signal-lime" />
              </div>
              <div>
                <div className="font-inter-tight font-semibold text-eyebrow text-chalk leading-none flex items-center gap-1.5">
                  <span>
                    {t('editor.properties.color_picker.github_auto', 'Auto (Viewer Theme)')}
                  </span>
                </div>
                <div className="font-jetbrains-mono text-[10px] text-ash mt-0.5 leading-tight">
                  #0D1117 / #FFFFFF
                </div>
              </div>
            </div>
            {isAuto && <Check size={14} className="text-signal-lime shrink-0" />}
          </button>

          <div className="space-y-1 mb-3">
            <div className="grid grid-cols-3 gap-1.5">
              {GITHUB_THEME_SWATCHES.map((th) => {
                const isActive = value.toLowerCase() === th.hex.toLowerCase()
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => {
                      if (th.hex.toLowerCase() !== value.toLowerCase()) {
                        commitColor(th.hex)
                      }
                      setHexInput(th.hex)
                    }}
                    className={`py-1.5 px-1 rounded-sm border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      isActive
                        ? 'border-signal-lime ring-1 ring-signal-lime/40 bg-signal-lime/10'
                        : 'border-graphite bg-graphite/40 hover:border-slate hover:bg-graphite'
                    }`}
                    title={t(th.labelKey, th.fallback)}
                  >
                    <div
                      className="w-4 h-4 rounded-[2px] border border-white/20 shrink-0"
                      style={{ backgroundColor: th.hex }}
                    />
                    <span className="font-jetbrains-mono text-[9px] uppercase text-chalk leading-none truncate w-full text-center">
                      {th.hex}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="text-caption uppercase font-inter-tight font-semibold tracking-wider text-ash mb-1.5 pt-2 border-t border-graphite">
            <span>{t('editor.properties.color_picker.swatches', 'Palette Presets')}</span>
          </div>

          <div className="grid grid-cols-6 gap-1.5 mb-3">
            {PRESET_SWATCHES.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => {
                  if (color.toLowerCase() !== value.toLowerCase()) {
                    commitColor(color)
                  }
                  setHexInput(color)
                }}
                className={`w-6 h-6 rounded-[3px] border transition-transform hover:scale-110 cursor-pointer relative overflow-hidden ${
                  value.toLowerCase() === color.toLowerCase()
                    ? 'border-signal-lime ring-2 ring-signal-lime/40 scale-105'
                    : 'border-white/10 hover:border-white/40'
                }`}
                style={
                  color === 'transparent'
                    ? {
                        backgroundImage:
                          'conic-gradient(#555 25%, #333 25%, #333 50%, #555 50%, #555 75%, #333 75%)',
                        backgroundSize: '8px 8px',
                      }
                    : { backgroundColor: color }
                }
                title={
                  color === 'transparent'
                    ? t('editor.properties.color_picker.transparent', 'Transparent')
                    : color
                }
              >
                {color === 'transparent' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[140%] h-[1.5px] bg-red-500/80 -rotate-45" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {recentColors.length > 0 && (
            <>
              <div className="text-caption uppercase font-inter-tight font-semibold tracking-wider text-ash mb-1.5 pt-2 border-t border-graphite flex items-center justify-between">
                <span>{t('editor.properties.color_picker.recent', 'Cores Recentes')}</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap mb-3">
                {recentColors.map((color) => (
                  <button
                    key={`recent-${color}`}
                    type="button"
                    onClick={() => {
                      if (color.toLowerCase() !== value.toLowerCase()) {
                        commitColor(color)
                      }
                      setHexInput(color)
                    }}
                    className={`w-5 h-5 rounded-[3px] border transition-transform hover:scale-110 cursor-pointer relative overflow-hidden ${
                      value.toLowerCase() === color.toLowerCase()
                        ? 'border-signal-lime ring-2 ring-signal-lime/40 scale-105'
                        : 'border-white/10 hover:border-white/40'
                    }`}
                    style={
                      color === 'transparent'
                        ? {
                            backgroundImage:
                              'conic-gradient(#555 25%, #333 25%, #333 50%, #555 50%, #555 75%, #333 75%)',
                            backgroundSize: '8px 8px',
                          }
                        : isGitHubAdaptiveTheme(color)
                          ? {
                              background: `linear-gradient(135deg, ${GITHUB_THEME_KEYS.DARK} 50%, ${GITHUB_THEME_KEYS.LIGHT} 50%)`,
                            }
                          : { backgroundColor: color }
                    }
                    title={color}
                  />
                ))}
              </div>
            </>
          )}

          <div className="flex items-center gap-2 pt-2 border-t border-graphite">
            <div className="relative w-8 h-8 rounded-sm overflow-hidden border border-slate shrink-0 group cursor-pointer">
              <input
                type="color"
                value={value.startsWith('#') && value.length === 7 ? value : '#1f1f1f'}
                onChange={(e) => {
                  const val = e.target.value
                  if (val.toLowerCase() !== value.toLowerCase()) {
                    commitColor(val)
                  }
                  setHexInput(val)
                }}
                className="absolute -inset-2.5 w-[200%] h-[200%] cursor-pointer opacity-0"
              />
              <div
                className="w-full h-full flex items-center justify-center"
                style={
                  isAuto
                    ? {
                        background: `linear-gradient(135deg, ${GITHUB_THEME_KEYS.DARK} 50%, ${GITHUB_THEME_KEYS.LIGHT} 50%)`,
                      }
                    : isTransparent
                      ? {
                          backgroundImage:
                            'conic-gradient(#555 25%, #333 25%, #333 50%, #555 50%, #555 75%, #333 75%)',
                          backgroundSize: '8px 8px',
                        }
                      : { backgroundColor: value }
                }
              >
                <Pipette
                  size={12}
                  className="text-white drop-shadow opacity-75 group-hover:opacity-100"
                />
              </div>
            </div>

            <div className="flex-1">
              <input
                type="text"
                value={hexInput}
                onChange={handleHexChange}
                onBlur={handleHexBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleHexBlur()
                  }
                }}
                placeholder="#000000"
                className="w-full bg-graphite border border-graphite focus:border-signal-lime px-2 py-1 text-eyebrow font-jetbrains-mono uppercase text-chalk rounded-sm focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
