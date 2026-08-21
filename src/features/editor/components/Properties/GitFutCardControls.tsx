import { ExternalLink, Globe, RotateCcw, Shield, Sparkles, Trophy } from 'lucide-react'
import React, { useRef, useState } from 'react'

import { Switch } from '@/components/ui/Switch'
import { ALL_COUNTRY_FLAGS, DEFAULT_GITFUT_BASE_URL } from '@/constants'
import { useI18n } from '@/i18n'

import { renderGitFutCard } from '../../../widgets/renderers/GitFutCardRenderer'
import { useEditorStore } from '../../store/editorStore'

export function GitFutCardControls({ instanceId, config }: { instanceId: string; config: any }) {
  const { t } = useI18n()
  const updateWidgetConfig = useEditorStore((state) => state.updateWidgetConfig)
  const githubData = useEditorStore((state) => state.githubData)

  const activeCountry = ((config.country as string) || '').toUpperCase()
  const [showSignals, setShowSignals] = useState(false)

  const enableHolo = config.enableHolo === true

  const [rotateX, setRotateX] = useState(Number(config.rotateX) || 0)
  const [rotateY, setRotateY] = useState(Number(config.rotateY) || 0)
  const [glareX, setGlareX] = useState(Number(config.glareX) || 50)
  const [glareY, setGlareY] = useState(Number(config.glareY) || 50)
  const [shineX, setShineX] = useState(Number(config.shineX) || 50)
  const [shineY, setShineY] = useState(Number(config.shineY) || 50)

  const cardRef = useRef<HTMLDivElement>(null)

  const handleCountrySelect = (code: string) => {
    updateWidgetConfig(instanceId, { country: code })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rx = -((y - centerY) / centerY) * 16
    const ry = ((x - centerX) / centerX) * 16

    const px = (x / rect.width) * 100
    const py = (y / rect.height) * 100

    setRotateX(rx)
    setRotateY(ry)
    setGlareX(px)
    setGlareY(py)
    setShineX(100 - px)
    setShineY(100 - py)
  }

  const handleMouseLeave = () => {
    setRotateX(Number(config.rotateX) || 0)
    setRotateY(Number(config.rotateY) || 0)
    setGlareX(Number(config.glareX) || 50)
    setGlareY(Number(config.glareY) || 50)
    setShineX(Number(config.shineX) || 50)
    setShineY(Number(config.shineY) || 50)
  }

  const resetVisualState = () => {
    setRotateX(0)
    setRotateY(0)
    setGlareX(50)
    setGlareY(50)
    setShineX(50)
    setShineY(50)
    updateWidgetConfig(instanceId, {
      rotateX: 0,
      rotateY: 0,
      glareX: 50,
      glareY: 50,
      shineX: 50,
      shineY: 50,
      intensity: 1,
      scale: 1,
    })
  }

  const saveVisualState = () => {
    updateWidgetConfig(instanceId, {
      rotateX,
      rotateY,
      glareX,
      glareY,
      shineX,
      shineY,
      intensity: 1,
      scale: 1,
    })
  }

  const username = (githubData?.user?.login || 'user').trim()
  const currentFlagObj = ALL_COUNTRY_FLAGS.find((c) => c.code === activeCountry)
  const scoutReportUrl = `${DEFAULT_GITFUT_BASE_URL}/${encodeURIComponent(username)}${activeCountry ? `?country=${encodeURIComponent(activeCountry)}` : ''}`

  return (
    <div className="space-y-4 pt-4 border-t border-graphite">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-ash font-inter-tight text-eyebrow uppercase tracking-wider font-medium">
            <Shield size={14} className="text-amber-400" />
            <span>{t('editor.gitfut.country_title', 'Bandeira')}</span>
          </div>
          <span className="text-[10px] font-jetbrains-mono text-ash/80 flex items-center gap-1">
            {activeCountry ? (
              <>
                <img
                  src={`https://flagcdn.com/20x15/${activeCountry.toLowerCase()}.png`}
                  alt={currentFlagObj?.name || activeCountry}
                  className="w-4 h-3 object-cover rounded-2xs inline-block"
                />
                <span>{currentFlagObj?.name || activeCountry}</span>
              </>
            ) : (
              'Auto (GitHub)'
            )}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 p-1.5 bg-graphite/60 rounded-xs border border-graphite max-h-44 overflow-y-auto custom-scrollbar">
          {ALL_COUNTRY_FLAGS.map((c) => {
            const isSelected = activeCountry === c.code
            return (
              <button
                key={c.code || 'auto'}
                type="button"
                onClick={() => handleCountrySelect(c.code)}
                title={c.name}
                className={`h-8 flex items-center justify-center rounded-xs transition-all cursor-pointer overflow-hidden p-1 ${
                  isSelected
                    ? 'bg-amber-400/25 border-2 border-amber-400 scale-105 shadow-xs'
                    : 'bg-graphite hover:bg-zinc-700/80 border border-graphite/80 hover:border-zinc-500'
                }`}
              >
                {c.code ? (
                  <img
                    src={`https://flagcdn.com/32x24/${c.code.toLowerCase()}.png`}
                    alt={c.name}
                    className="w-5 h-3.5 object-cover rounded-2xs shadow-2xs"
                    loading="lazy"
                  />
                ) : (
                  <Globe size={16} className="text-zinc-400 hover:text-white" />
                )}
              </button>
            )
          })}
        </div>

        {activeCountry && (
          <div className="flex justify-end pt-0.5">
            <button
              type="button"
              onClick={() => handleCountrySelect('')}
              className="text-[11px] font-inter-tight text-ash hover:text-amber-300 underline cursor-pointer"
            >
              {t('editor.gitfut.reset_country', 'Remover override')}
            </button>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-graphite/60 space-y-2">
        <div className="flex items-center justify-between p-2 bg-graphite rounded-sm border border-graphite">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-emerald-400" />
            <label className="text-eyebrow text-chalk font-inter-tight cursor-pointer">
              {t('editor.gitfut.enable_holo', 'Efeito 3D Holográfico')}
            </label>
          </div>
          <Switch
            checked={enableHolo}
            onChange={(checked) => updateWidgetConfig(instanceId, { enableHolo: checked })}
          />
        </div>

        {enableHolo && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-ash font-inter-tight text-eyebrow uppercase tracking-wider font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {t('editor.gitfut.interactive_preview', 'Preview Holográfico')}
              </span>
              <button
                type="button"
                onClick={resetVisualState}
                className="flex items-center gap-1 text-emerald-400 hover:underline cursor-pointer text-[11px]"
              >
                <RotateCcw size={12} /> {t('editor.gitfut.reset', 'Resetar Ângulo')}
              </button>
            </div>

            <div className="flex justify-center py-1">
              <div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={saveVisualState}
                className="relative w-55 h-77.5 cursor-crosshair select-none"
              >
                <svg
                  width="220"
                  height="310"
                  viewBox="0 0 220 310"
                  style={{ overflow: 'visible' }}
                  dangerouslySetInnerHTML={{
                    __html: renderGitFutCard(
                      {
                        instanceId: instanceId + '-preview',
                        config: {
                          ...config,
                          enableHolo: true,
                          country: activeCountry,
                          rotateX,
                          rotateY,
                          glareX,
                          glareY,
                          shineX,
                          shineY,
                        },
                      } as any,
                      githubData || ({} as any),
                      {} as any,
                      220,
                      310
                    ),
                  }}
                />
              </div>
            </div>

            <p className="text-caption text-ash text-center font-inter-tight">
              {t(
                'editor.gitfut.instruction_start',
                'Passe o mouse sobre o card para inclinar o brilho holográfico e '
              )}
              <strong className="text-emerald-400">
                {t('editor.gitfut.instruction_click', 'CLIQUE')}
              </strong>
              {t('editor.gitfut.instruction_end', ' para fixar a perspectiva.')}
            </p>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-graphite/60">
        <button
          type="button"
          onClick={() => setShowSignals(!showSignals)}
          className="w-full flex items-center justify-between text-eyebrow font-inter-tight text-ash hover:text-emerald-400 cursor-pointer py-1"
        >
          <span className="flex items-center gap-1.5">
            <Trophy size={13} className="text-emerald-400" />
            {t('editor.gitfut.how_scouting_works', 'Como funciona o cálculo das notas (/99)')}
          </span>
          <span className="font-jetbrains-mono text-[10px] text-emerald-400">
            {showSignals ? '[-]' : '[+]'}
          </span>
        </button>

        {showSignals && (
          <div className="mt-2 p-2.5 rounded-xs bg-[#05140b] border border-emerald-500/20 space-y-2 text-[11px] font-jetbrains-mono text-ash/90">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-1.5 rounded bg-black/40 border border-emerald-500/10">
                <span className="text-emerald-400 font-bold">PAC (Pace):</span> Commits no último
                ano
              </div>
              <div className="p-1.5 rounded bg-black/40 border border-emerald-500/10">
                <span className="text-emerald-400 font-bold">SHO (Shooting):</span> Estrelas em
                repos
              </div>
              <div className="p-1.5 rounded bg-black/40 border border-emerald-500/10">
                <span className="text-emerald-400 font-bold">PAS (Passing):</span> PRs + Seguidores
              </div>
              <div className="p-1.5 rounded bg-black/40 border border-emerald-500/10">
                <span className="text-emerald-400 font-bold">DRI (Dribbling):</span> Diversidade de
                linguagens
              </div>
              <div className="p-1.5 rounded bg-black/40 border border-emerald-500/10">
                <span className="text-emerald-400 font-bold">DEF (Defending):</span> Reviews +
                Issues
              </div>
              <div className="p-1.5 rounded bg-black/40 border border-emerald-500/10">
                <span className="text-emerald-400 font-bold">PHY (Physical):</span> Contribuições
                vitalícias
              </div>
            </div>
            <p className="text-[10px] text-emerald-300/80 pt-1 border-t border-emerald-500/10">
              * Cartas especiais: Bronze (≤64), Silver (65–74), Gold (75–84), TOTY (85–89), Icon
              (90+).
            </p>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-graphite/60 flex justify-center">
        <a
          href={scoutReportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-jetbrains-mono text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 rounded-xs transition-colors"
        >
          <Trophy size={13} />
          <span>{t('editor.gitfut.view_full_report', 'Ver Scout Report Completo no GitFut')}</span>
          <ExternalLink size={11} />
        </a>
      </div>
    </div>
  )
}
