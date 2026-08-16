'use client'

import { LayoutGrid, Plus, Trash2 } from 'lucide-react'
import Image from 'next/image'
import React, { useState } from 'react'

import { Switch } from '@/components/ui/Switch'
import { useI18n } from '@/i18n'
import { API_ENDPOINTS } from '@/services/endpoints'

import { useEditorStore } from '../../store/editorStore'
import { TECH_CATALOG } from './TechStackControls'

interface GodProfileControlsProps {
  instanceId: string
  widgetId: string
  config: Record<string, unknown>
}

export function GodProfileControls({ instanceId, widgetId, config }: GodProfileControlsProps) {
  const { t } = useI18n()
  const updateWidgetConfig = useEditorStore((state) => state.updateWidgetConfig)

  const terminalCommands = Array.isArray(config.terminalCommands)
    ? (config.terminalCommands as string[])
    : ['$ whoami', 'user', '$ uname -a', 'Linux GitAscii']

  const updateTerminalCommands = (newCmds: string[]) => {
    updateWidgetConfig(instanceId, { terminalCommands: newCmds })
  }

  const selectedMarqueeLangs = Array.isArray(config.marqueeLangs)
    ? (config.marqueeLangs as string[])
    : ['react', 'ts', 'js', 'html', 'css', 'nodejs', 'python', 'git', 'docker', 'linux']

  const toggleMarqueeLang = (id: string) => {
    let updated: string[]
    if (selectedMarqueeLangs.includes(id)) {
      updated = selectedMarqueeLangs.filter((t) => t !== id)
    } else {
      updated = [...selectedMarqueeLangs, id]
    }
    updateWidgetConfig(instanceId, { marqueeLangs: updated })
  }

  const neuralTechs =
    typeof config.neuralTechs === 'object' && config.neuralTechs !== null
      ? (config.neuralTechs as Record<string, string[]>)
      : {
          Frontend: ['react', 'nextjs', 'tailwind'],
          Backend: ['nodejs', 'postgres', 'docker'],
          DevOps: ['git', 'github', 'linux'],
        }

  const toggleNeuralTech = (category: string, techId: string) => {
    const current = neuralTechs[category] || []
    let updated: string[]
    if (current.includes(techId)) {
      updated = current.filter((t) => t !== techId)
    } else {
      updated = [...current, techId]
    }
    updateWidgetConfig(instanceId, {
      neuralTechs: {
        ...neuralTechs,
        [category]: updated,
      },
    })
  }

  const disabledTrophies = Array.isArray(config.disabledTrophies)
    ? (config.disabledTrophies as string[])
    : []

  const toggleTrophy = (trophyId: string) => {
    let updated: string[]
    if (disabledTrophies.includes(trophyId)) {
      updated = disabledTrophies.filter((t) => t !== trophyId)
    } else {
      updated = [...disabledTrophies, trophyId]
    }
    updateWidgetConfig(instanceId, { disabledTrophies: updated })
  }

  const hiddenWakatimeLangs = Array.isArray(config.hiddenWakatimeLangs)
    ? (config.hiddenWakatimeLangs as string[])
    : []

  const toggleWakatimeLang = (lang: string) => {
    let updated: string[]
    if (hiddenWakatimeLangs.includes(lang)) {
      updated = hiddenWakatimeLangs.filter((l) => l !== lang)
    } else {
      updated = [...hiddenWakatimeLangs, lang]
    }
    updateWidgetConfig(instanceId, { hiddenWakatimeLangs: updated })
  }

  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="space-y-4 pt-3 border-t border-graphite font-inter-tight">
      <div className="flex items-center gap-2 text-signal-lime text-eyebrow uppercase tracking-wider font-semibold">
        <LayoutGrid size={14} />
        <span>{t('editor.godprofile.title', 'GodProfile Customization')}</span>
      </div>

      {widgetId === 'godprofile-terminal' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-eyebrow text-ash font-medium">
              {t('editor.godprofile.terminal_lines', 'Terminal Lines')}
            </label>
            <button
              onClick={() => updateTerminalCommands([...terminalCommands, ''])}
              className="text-caption text-signal-lime flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Plus size={12} /> {t('editor.godprofile.add_line', 'Add Line')}
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {terminalCommands.map((cmd, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-caption font-jetbrains-mono text-ash">{i + 1}.</span>
                <input
                  type="text"
                  value={cmd}
                  onChange={(e) => {
                    const copy = [...terminalCommands]
                    copy[i] = e.target.value
                    updateTerminalCommands(copy)
                  }}
                  placeholder={i % 2 === 0 ? '$ command' : 'output line'}
                  className="flex-1 bg-graphite border border-graphite text-chalk text-note px-2 py-1 rounded-xs focus:border-signal-lime focus:outline-none"
                />
                <button
                  onClick={() => {
                    const copy = terminalCommands.filter((_, idx) => idx !== i)
                    updateTerminalCommands(copy)
                  }}
                  className="text-red-400 hover:text-red-500 p-1 cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {widgetId === 'godprofile-marquee' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-eyebrow text-ash font-medium">
              {t('editor.godprofile.marquee_techs', 'Select Marquee Technologies')}
            </label>
            <span className="text-caption text-ash font-jetbrains-mono bg-carbon px-1.5 py-0.5 rounded border border-graphite">
              {t('editor.godprofile.active_count', '{count} active', {
                count: String(selectedMarqueeLangs.length),
              })}
            </span>
          </div>
          <input
            type="text"
            placeholder={t('editor.godprofile.search_placeholder', 'Search stack...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-graphite border border-graphite text-chalk text-note px-2 py-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
          />
          <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto p-1.5 bg-void-black border border-graphite rounded-xs">
            {TECH_CATALOG.filter((tech) =>
              tech.name.toLowerCase().includes(searchTerm.toLowerCase())
            ).map((tech) => {
              const active = selectedMarqueeLangs.includes(tech.id)
              const iconCode = tech.id === 'reactnative' ? 'react' : tech.id
              return (
                <button
                  key={tech.id}
                  onClick={() => toggleMarqueeLang(tech.id)}
                  className={`flex items-center gap-1.5 p-1.5 rounded-xs border text-eyebrow text-left font-medium transition-all cursor-pointer ${
                    active
                      ? 'bg-graphite border-signal-lime/40 text-signal-lime'
                      : 'bg-carbon border-transparent text-ash hover:text-chalk'
                  }`}
                >
                  <Image
                    src={API_ENDPOINTS.SKILL_ICONS.GET(iconCode)}
                    alt={tech.name}
                    width={14}
                    height={14}
                    className="w-3.5 h-3.5 object-contain"
                    unoptimized
                  />
                  <span className="truncate">{tech.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {widgetId === 'godprofile-neural' && (
        <div className="space-y-4">
          {Object.keys(neuralTechs).map((category) => (
            <div key={category} className="space-y-2">
              <label className="text-eyebrow text-ash font-semibold uppercase tracking-wider">
                {t('editor.godprofile.column', '{category} Column', { category })}
              </label>
              <div className="grid grid-cols-3 gap-1.5 max-h-32 overflow-y-auto p-1.5 bg-void-black border border-graphite rounded-xs">
                {TECH_CATALOG.map((tech) => {
                  const active = (neuralTechs[category] || []).includes(tech.id)
                  const iconCode = tech.id === 'reactnative' ? 'react' : tech.id
                  return (
                    <button
                      key={tech.id}
                      onClick={() => toggleNeuralTech(category, tech.id)}
                      className={`flex items-center gap-1.5 p-1.5 rounded-xs border text-eyebrow text-left font-medium transition-all cursor-pointer ${
                        active
                          ? 'bg-graphite border-signal-lime/40 text-signal-lime'
                          : 'bg-carbon border-transparent text-ash hover:text-chalk'
                      }`}
                    >
                      <Image
                        src={API_ENDPOINTS.SKILL_ICONS.GET(iconCode)}
                        alt={tech.name}
                        width={14}
                        height={14}
                        className="w-3.5 h-3.5 object-contain"
                        unoptimized
                      />
                      <span className="truncate">{tech.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {widgetId === 'godprofile-trophies' && (
        <div className="space-y-3">
          <label className="text-eyebrow text-ash font-medium">
            {t('editor.godprofile.trophy_visibility', 'Configure Trophy Visibility')}
          </label>
          <div className="space-y-2 bg-void-black border border-graphite rounded-xs p-2">
            {['Stars', 'Commits', 'PRs', 'Issues', 'Repos', 'Followers'].map((trophy) => {
              const active = !disabledTrophies.includes(trophy)
              return (
                <div
                  key={trophy}
                  className="flex items-center justify-between py-1 border-b border-graphite/40 last:border-0"
                >
                  <span className="text-eyebrow text-chalk">
                    {t('editor.godprofile.trophy_label', '{trophy} Trophy', { trophy })}
                  </span>
                  <Switch checked={active} onChange={() => toggleTrophy(trophy)} />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {widgetId === 'godprofile-wakatime' && (
        <div className="space-y-3">
          <label className="text-eyebrow text-ash font-medium">
            {t('editor.godprofile.wakatime_exclude', 'Exclude Languages from WakaTime')}
          </label>
          <div className="grid grid-cols-2 gap-2 bg-void-black border border-graphite rounded-xs p-2">
            {[
              'Python',
              'TypeScript',
              'JavaScript',
              'HTML',
              'CSS',
              'Rust',
              'Go',
              'PHP',
              'Ruby',
              'Java',
            ].map((lang) => {
              const hidden = hiddenWakatimeLangs.includes(lang)
              return (
                <div key={lang} className="flex items-center justify-between">
                  <span className="text-caption text-chalk">{lang}</span>
                  <Switch checked={!hidden} onChange={() => toggleWakatimeLang(lang)} />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
