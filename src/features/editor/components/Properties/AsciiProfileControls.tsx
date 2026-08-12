'use client'

import { LayoutGrid, Sliders } from 'lucide-react'
import React from 'react'

import { Switch } from '@/components/ui/Switch'

import { useEditorStore } from '../../store/editorStore'

interface AsciiProfileControlsProps {
  instanceId: string
  widgetId: string
  config: Record<string, unknown>
}

export function AsciiProfileControls({ instanceId, widgetId, config }: AsciiProfileControlsProps) {
  const updateWidgetConfig = useEditorStore((state) => state.updateWidgetConfig)
  const user = useEditorStore((state) => state.githubData?.user)

  const rowDur = Number(config.rowDur !== undefined ? config.rowDur : 0.11)
  const stagger = Number(config.stagger !== undefined ? config.stagger : 0.11)
  const staticMode = Boolean(config.staticMode)
  const customTitle = (config.customTitle as string) || ''
  const customWhoami = (config.customWhoami as string) || ''

  const TIMING_PRESETS = [
    { label: 'Muito Rápido', val: 0.05 },
    { label: 'Rápido', val: 0.08 },
    { label: 'Médio', val: 0.11 },
    { label: 'Lento', val: 0.18 },
    { label: 'Muito Lento', val: 0.25 },
  ]

  const infoHost = (config.infoHost as string) || ''

  const showNow = config.showNow !== false
  const showAlso = config.showAlso !== false
  const showLoc = config.showLoc !== false
  const showSite = config.showSite !== false

  const customNow = (config.customNow as string) || ''
  const customAlso = (config.customAlso as string) || ''
  const customLoc = (config.customLoc as string) || ''
  const customSite = (config.customSite as string) || ''

  const showLangs = config.showLangs !== false
  const showFrontend = config.showFrontend !== false
  const showBackend = config.showBackend !== false

  const customLangs = (config.customLangs as string) || ''
  const customFrontend = (config.customFrontend as string) || ''
  const customBackend = (config.customBackend as string) || ''

  const showBullet1 = config.showBullet1 !== false
  const showBullet2 = config.showBullet2 !== false

  const customBullet1 = (config.customBullet1 as string) || ''
  const customBullet2 = (config.customBullet2 as string) || ''

  const paletteIndex = Number(config.paletteIndex || 0)
  const PALETTES = [
    ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353', '#69f0a0'],
    ['#161b22', '#301934', '#5e2f62', '#8c4f91', '#ba71c0', '#e894ef'],
    ['#161b22', '#1f2937', '#3b82f6', '#60a5fa', '#93c5fd', '#c084fc'],
    ['#161b22', '#450a0a', '#7f1d1d', '#b91c1c', '#ef4444', '#f87171'],
  ]

  const flatInputClass =
    'w-full bg-graphite border border-graphite text-chalk text-[11px] px-2 py-1 rounded focus:border-signal-lime focus:outline-none'

  return (
    <div className="space-y-4 pt-3 border-t border-graphite font-inter-tight">
      <div className="flex items-center gap-2 text-signal-lime text-eyebrow uppercase tracking-wider font-semibold">
        <LayoutGrid size={14} />
        <span>ASCII Profile Customization</span>
      </div>

      {widgetId === 'asciiprofile-portrait' && (
        <div className="space-y-3">
          <div>
            <label className="text-eyebrow text-ash block mb-1">Título do Terminal</label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => updateWidgetConfig(instanceId, { customTitle: e.target.value })}
              placeholder={`${user?.login || 'user'}@github: ~$ ./portrait.sh`}
              className={flatInputClass}
            />
          </div>

          <div>
            <label className="text-eyebrow text-ash block mb-1">Nome (whoami)</label>
            <input
              type="text"
              value={customWhoami}
              onChange={(e) => updateWidgetConfig(instanceId, { customWhoami: e.target.value })}
              placeholder={user?.name || 'Seu Nome'}
              className={flatInputClass}
            />
          </div>

          <div className="space-y-3.5 pt-2 border-t border-graphite/40">
            <div className="flex items-center gap-1 text-ash text-eyebrow font-medium">
              <Sliders size={13} />
              <span>Velocidade de Digitação</span>
            </div>

            <div>
              <label className="text-[10px] text-ash block mb-1">Atalhos de Velocidade</label>
              <div className="grid grid-cols-5 gap-1">
                {TIMING_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() =>
                      updateWidgetConfig(instanceId, {
                        stagger: preset.val,
                        rowDur: preset.val,
                      })
                    }
                    className={`py-1 text-[9px] font-semibold rounded border transition-all ${
                      stagger === preset.val
                        ? 'bg-signal-lime text-black border-signal-lime font-bold'
                        : 'bg-graphite text-ash border-graphite hover:text-chalk'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-eyebrow">
                <span className="text-ash">Stagger Linha (Intervalo)</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="1.0"
                    value={stagger}
                    onChange={(e) =>
                      updateWidgetConfig(instanceId, { stagger: Number(e.target.value) })
                    }
                    className="w-12 bg-graphite text-chalk text-[10px] text-right font-jetbrains-mono border border-graphite focus:outline-none focus:border-signal-lime px-1 rounded"
                  />
                  <span className="text-ash/60">s</span>
                </div>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.5"
                step="0.01"
                value={stagger}
                onChange={(e) =>
                  updateWidgetConfig(instanceId, { stagger: Number(e.target.value) })
                }
                className="w-full accent-signal-lime bg-graphite h-1 rounded cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-eyebrow">
                <span className="text-ash">Duração da Linha (Digitação)</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="1.0"
                    value={rowDur}
                    onChange={(e) =>
                      updateWidgetConfig(instanceId, { rowDur: Number(e.target.value) })
                    }
                    className="w-12 bg-graphite text-chalk text-[10px] text-right font-jetbrains-mono border border-graphite focus:outline-none focus:border-signal-lime px-1 rounded"
                  />
                  <span className="text-ash/60">s</span>
                </div>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.5"
                step="0.01"
                value={rowDur}
                onChange={(e) => updateWidgetConfig(instanceId, { rowDur: Number(e.target.value) })}
                className="w-full accent-signal-lime bg-graphite h-1 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-graphite/40">
            <span className="text-eyebrow text-chalk font-medium">
              Modo de Visualização Estático
            </span>
            <Switch
              checked={staticMode}
              onChange={(checkedValue) =>
                updateWidgetConfig(instanceId, { staticMode: checkedValue })
              }
            />
          </div>
        </div>
      )}

      {widgetId === 'asciiprofile-info' && (
        <div className="space-y-3">
          <div>
            <label className="text-eyebrow text-ash block mb-1">Nome do Terminal (Host)</label>
            <input
              type="text"
              value={infoHost}
              onChange={(e) => updateWidgetConfig(instanceId, { infoHost: e.target.value })}
              placeholder={user?.login || 'username'}
              className={flatInputClass}
            />
          </div>

          <div className="flex items-center justify-between pt-1 pb-2 border-b border-graphite/40">
            <span className="text-eyebrow text-chalk font-medium">
              Modo de Visualização Estático
            </span>
            <Switch
              checked={staticMode}
              onChange={(checkedValue) =>
                updateWidgetConfig(instanceId, { staticMode: checkedValue })
              }
            />
          </div>

          <div className="space-y-3.5">
            <div className="label-stamp text-caption text-ash mb-1">[ INFORMAÇÕES TERMINAL ]</div>

            <div className="space-y-1.5 p-2 bg-carbon/40 rounded border border-graphite/30">
              <div className="flex items-center justify-between">
                <span className="text-eyebrow text-chalk font-medium">. Now (Cargo/Bio)</span>
                <Switch
                  checked={showNow}
                  onChange={(val) => updateWidgetConfig(instanceId, { showNow: val })}
                />
              </div>
              {showNow && (
                <input
                  type="text"
                  value={customNow}
                  onChange={(e) => updateWidgetConfig(instanceId, { customNow: e.target.value })}
                  placeholder={user?.bio || 'Python Developer'}
                  className={flatInputClass}
                />
              )}
            </div>

            <div className="space-y-1.5 p-2 bg-carbon/40 rounded border border-graphite/30">
              <div className="flex items-center justify-between">
                <span className="text-eyebrow text-chalk font-medium">. Also (Empresa/Extra)</span>
                <Switch
                  checked={showAlso}
                  onChange={(val) => updateWidgetConfig(instanceId, { showAlso: val })}
                />
              </div>
              {showAlso && (
                <input
                  type="text"
                  value={customAlso}
                  onChange={(e) => updateWidgetConfig(instanceId, { customAlso: e.target.value })}
                  placeholder={user?.company ? `@${user.company}` : 'Co-Founder'}
                  className={flatInputClass}
                />
              )}
            </div>

            <div className="space-y-1.5 p-2 bg-carbon/40 rounded border border-graphite/30">
              <div className="flex items-center justify-between">
                <span className="text-eyebrow text-chalk font-medium">. Loc (Localização)</span>
                <Switch
                  checked={showLoc}
                  onChange={(val) => updateWidgetConfig(instanceId, { showLoc: val })}
                />
              </div>
              {showLoc && (
                <input
                  type="text"
                  value={customLoc}
                  onChange={(e) => updateWidgetConfig(instanceId, { customLoc: e.target.value })}
                  placeholder={user?.location || 'Ramanagara, India'}
                  className={flatInputClass}
                />
              )}
            </div>

            <div className="space-y-1.5 p-2 bg-carbon/40 rounded border border-graphite/30">
              <div className="flex items-center justify-between">
                <span className="text-eyebrow text-chalk font-medium">. Site (Link)</span>
                <Switch
                  checked={showSite}
                  onChange={(val) => updateWidgetConfig(instanceId, { showSite: val })}
                />
              </div>
              {showSite && (
                <input
                  type="text"
                  value={customSite}
                  onChange={(e) => updateWidgetConfig(instanceId, { customSite: e.target.value })}
                  placeholder={user?.blog || 'mithungowda.in'}
                  className={flatInputClass}
                />
              )}
            </div>

            <div className="label-stamp text-caption text-ash pt-2 mb-1 border-t border-graphite/40">
              [ STACK (TECNOLOGIAS) ]
            </div>

            <div className="space-y-1.5 p-2 bg-carbon/40 rounded border border-graphite/30">
              <div className="flex items-center justify-between">
                <span className="text-eyebrow text-chalk font-medium">. Langs (Linguagens)</span>
                <Switch
                  checked={showLangs}
                  onChange={(val) => updateWidgetConfig(instanceId, { showLangs: val })}
                />
              </div>
              {showLangs && (
                <input
                  type="text"
                  value={customLangs}
                  onChange={(e) => updateWidgetConfig(instanceId, { customLangs: e.target.value })}
                  placeholder="Python, Flask, FastAPI"
                  className={flatInputClass}
                />
              )}
            </div>

            <div className="space-y-1.5 p-2 bg-carbon/40 rounded border border-graphite/30">
              <div className="flex items-center justify-between">
                <span className="text-eyebrow text-chalk font-medium">. Frontend</span>
                <Switch
                  checked={showFrontend}
                  onChange={(val) => updateWidgetConfig(instanceId, { showFrontend: val })}
                />
              </div>
              {showFrontend && (
                <input
                  type="text"
                  value={customFrontend}
                  onChange={(e) =>
                    updateWidgetConfig(instanceId, { customFrontend: e.target.value })
                  }
                  placeholder="Dart, CSS, HTML"
                  className={flatInputClass}
                />
              )}
            </div>

            <div className="space-y-1.5 p-2 bg-carbon/40 rounded border border-graphite/30">
              <div className="flex items-center justify-between">
                <span className="text-eyebrow text-chalk font-medium">. Backend</span>
                <Switch
                  checked={showBackend}
                  onChange={(val) => updateWidgetConfig(instanceId, { showBackend: val })}
                />
              </div>
              {showBackend && (
                <input
                  type="text"
                  value={customBackend}
                  onChange={(e) =>
                    updateWidgetConfig(instanceId, { customBackend: e.target.value })
                  }
                  placeholder="Pandas, NumPy, Flask"
                  className={flatInputClass}
                />
              )}
            </div>

            <div className="label-stamp text-caption text-ash pt-2 mb-1 border-t border-graphite/40">
              [ HIGHLIGHTS (DESTAQUES) ]
            </div>

            <div className="space-y-1.5 p-2 bg-carbon/40 rounded border border-graphite/30">
              <div className="flex items-center justify-between">
                <span className="text-eyebrow text-chalk font-medium">. Bullet 1</span>
                <Switch
                  checked={showBullet1}
                  onChange={(val) => updateWidgetConfig(instanceId, { showBullet1: val })}
                />
              </div>
              {showBullet1 && (
                <input
                  type="text"
                  value={customBullet1}
                  onChange={(e) =>
                    updateWidgetConfig(instanceId, { customBullet1: e.target.value })
                  }
                  placeholder="Published packages on PyPI"
                  className={flatInputClass}
                />
              )}
            </div>

            <div className="space-y-1.5 p-2 bg-carbon/40 rounded border border-graphite/30">
              <div className="flex items-center justify-between">
                <span className="text-eyebrow text-chalk font-medium">. Bullet 2</span>
                <Switch
                  checked={showBullet2}
                  onChange={(val) => updateWidgetConfig(instanceId, { showBullet2: val })}
                />
              </div>
              {showBullet2 && (
                <input
                  type="text"
                  value={customBullet2}
                  onChange={(e) =>
                    updateWidgetConfig(instanceId, { customBullet2: e.target.value })
                  }
                  placeholder="112 public repos, 266 followers"
                  className={flatInputClass}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {widgetId === 'asciiprofile-heatmap' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between pt-1">
            <span className="text-eyebrow text-chalk font-medium">
              Modo de Visualização Estático
            </span>
            <Switch
              checked={staticMode}
              onChange={(checkedValue) =>
                updateWidgetConfig(instanceId, { staticMode: checkedValue })
              }
            />
          </div>

          <div>
            <label className="text-eyebrow text-ash block mb-2">
              Paleta de Cores (Pré-visualização)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Classic Green', 'Purple Hues', 'Ocean Blue', 'Warm Reds'].map((pName, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    updateWidgetConfig(instanceId, {
                      paletteIndex: idx,
                      palette: PALETTES[idx],
                    })
                  }
                  className={`p-2 rounded text-caption font-medium transition-all border flex flex-col items-center gap-1.5 cursor-pointer ${
                    paletteIndex === idx
                      ? 'bg-signal-lime/10 text-signal-lime border-signal-lime'
                      : 'bg-graphite/40 text-ash border-graphite hover:border-slate hover:text-chalk'
                  }`}
                >
                  <div className="flex gap-0.5 justify-center">
                    {PALETTES[idx].slice(1).map((color, cIdx) => (
                      <span
                        key={cIdx}
                        className="w-2 h-2 rounded-xs border border-void-black/50"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold uppercase truncate">{pName}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
