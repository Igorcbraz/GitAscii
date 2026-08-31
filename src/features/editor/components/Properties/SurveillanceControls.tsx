'use client'

import {
  Cpu,
  Heading,
  Plus,
  Radio,
  Search,
  Share2,
  Terminal,
  Tv,
  User,
  Video,
  X,
} from 'lucide-react'
import React, { useState } from 'react'

import { Switch } from '@/components/ui/Switch'
import { LED_COLORS, PRESET_QUOTES, TITLE_PRESETS, WIDGET_IDS } from '@/constants'
import { getTechInfo, TECH_CATALOG } from '@/data/techCatalog'
import { useI18n } from '@/i18n'

import { useEditorStore } from '../../store/editorStore'
interface SurveillanceControlsProps {
  instanceId: string
  widgetId: string
  config: Record<string, unknown>
}

export function SurveillanceControls({ instanceId, widgetId, config }: SurveillanceControlsProps) {
  const { t } = useI18n()
  const updateWidgetConfig = useEditorStore((state) => state.updateWidgetConfig)
  const updateWidgetSize = useEditorStore((state) => state.updateWidgetSize)
  const githubData = useEditorStore((state) => state.githubData)

  const [newWorkflowInput, setNewWorkflowInput] = useState('')
  const [newLangInput, setNewLangInput] = useState('')
  const [activeTechCategory, setActiveTechCategory] = useState<string>('all')
  const [techSearchTerm, setTechSearchTerm] = useState('')

  const handleUpdate = (patch: Record<string, unknown>) => {
    updateWidgetConfig(instanceId, patch)
  }

  if (widgetId === WIDGET_IDS.SURVEILLANCE_HEADER) {
    const displayName =
      (config.displayName as string) || githubData?.user.name || githubData?.user.login || ''
    const username = (config.username as string) || githubData?.user.login || ''
    const modeTag = (config.modeTag as string) || '198X MODE'
    const roleTag = (config.roleTag as string) || 'Developer'
    const customBio = (config.customBio as string) || githubData?.user.bio || ''
    const quoteText =
      (config.quoteText as string) ||
      '“Once I told the computer to do something and it did it exactly how I told it to.”'
    const coords = (config.coords as string) || '◎ 12.911210, 79.132685'

    return (
      <div className="space-y-4 pt-3 border-t border-graphite font-mono">
        <div className="flex items-center gap-2 text-[#55ffff] text-eyebrow uppercase tracking-wider font-semibold">
          <Tv size={14} />
          <span>{t('editor.surveillance.header_title', 'Surveillance Header Settings')}</span>
        </div>

        <div>
          <label className="text-eyebrow text-ash block mb-1">
            {t('editor.surveillance.display_name', 'Display Name (Chromatic Mark)')}
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => handleUpdate({ displayName: e.target.value })}
            placeholder="Ex: Oxide 1-6"
            className="w-full bg-graphite border border-graphite text-chalk text-note px-2 py-1.5 rounded-xs focus:border-[#55ffff] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-eyebrow text-ash block mb-1">
              {t('editor.surveillance.handle', 'Handle / Username')}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => handleUpdate({ username: e.target.value })}
              placeholder="Ex: rugbedbugg"
              className="w-full bg-graphite border border-graphite text-chalk text-note px-2 py-1.5 rounded-xs focus:border-[#55ffff] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-eyebrow text-ash block mb-1">
              {t('editor.surveillance.role', 'Role Tag')}
            </label>
            <input
              type="text"
              value={roleTag}
              onChange={(e) => handleUpdate({ roleTag: e.target.value })}
              placeholder="Ex: Linux Ricer"
              className="w-full bg-graphite border border-graphite text-chalk text-note px-2 py-1.5 rounded-xs focus:border-[#55ffff] focus:outline-none"
            />
          </div>
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
                onClick={() => handleUpdate({ modeTag: mode })}
                className={`py-1 rounded-xs text-[10px] transition-all cursor-pointer border text-center ${
                  modeTag === mode
                    ? 'bg-[#55ffff] text-black border-[#55ffff] font-bold'
                    : 'bg-graphite text-ash border-graphite hover:border-slate hover:text-chalk'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-eyebrow text-ash block mb-1">
            {t('editor.surveillance.bio', 'Bio / System Message')}
          </label>
          <textarea
            rows={2}
            value={customBio}
            onChange={(e) => handleUpdate({ customBio: e.target.value })}
            placeholder="Ex: Building minimal systems & terminals..."
            className="w-full bg-graphite border border-graphite text-chalk text-note p-2 rounded-xs focus:border-[#55ffff] focus:outline-none resize-none"
          />
        </div>

        <div>
          <label className="text-eyebrow text-ash block mb-1">
            {t('editor.surveillance.quote', 'Terminal Philosophy Quote')}
          </label>
          <input
            type="text"
            value={quoteText}
            onChange={(e) => handleUpdate({ quoteText: e.target.value })}
            className="w-full bg-graphite border border-graphite text-chalk text-note px-2 py-1.5 rounded-xs focus:border-[#55ffff] focus:outline-none"
          />
        </div>

        <div>
          <label className="text-eyebrow text-ash block mb-1">
            {t('editor.surveillance.coordinates', 'OSD Coordinates')}
          </label>
          <input
            type="text"
            value={coords}
            onChange={(e) => handleUpdate({ coords: e.target.value })}
            placeholder="Ex: ◎ 12.911210, 79.132685"
            className="w-full bg-graphite border border-graphite text-chalk text-note px-2 py-1.5 rounded-xs focus:border-[#55ffff] focus:outline-none"
          />
        </div>
      </div>
    )
  }

  if (widgetId === WIDGET_IDS.SURVEILLANCE_DOSSIER) {
    const displayName =
      (config.displayName as string) || githubData?.user.name || githubData?.user.login || ''
    const username = (config.username as string) || githubData?.user.login || ''
    const classRole = (config.classRole as string) || 'Linux/Windows Power-User'
    const rigInfo =
      (config.rigInfo as string) || 'Arch Linux · Hyprland | Windows · WSL · Powershell'
    const habitInfo = (config.habitInfo as string) || 'Watches build logs from the terminal'
    const statusInfo = (config.statusInfo as string) || '● ONLINE & RICED'
    const location = (config.location as string) || githubData?.user.location || 'Localhost'

    return (
      <div className="space-y-4 pt-3 border-t border-graphite font-mono">
        <div className="flex items-center gap-2 text-[#55ffff] text-eyebrow uppercase tracking-wider font-semibold">
          <User size={14} />
          <span>{t('editor.surveillance.dossier_title', 'Subject Dossier Telemetry')}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-eyebrow text-ash block mb-1">
              {t('editor.surveillance.subject_name', 'Subject Name')}
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => handleUpdate({ displayName: e.target.value })}
              className="w-full bg-graphite border border-graphite text-chalk text-note px-2 py-1.5 rounded-xs focus:border-[#55ffff] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-eyebrow text-ash block mb-1">
              {t('editor.surveillance.handle', 'Handle')}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => handleUpdate({ username: e.target.value })}
              className="w-full bg-graphite border border-graphite text-chalk text-note px-2 py-1.5 rounded-xs focus:border-[#55ffff] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-eyebrow text-ash block mb-1">
            {t('editor.surveillance.class_role', 'Class / Specialty')}
          </label>
          <input
            type="text"
            value={classRole}
            onChange={(e) => handleUpdate({ classRole: e.target.value })}
            placeholder="Ex: Full-Stack Engineer"
            className="w-full bg-graphite border border-graphite text-chalk text-note px-2 py-1.5 rounded-xs focus:border-[#55ffff] focus:outline-none"
          />
        </div>

        <div>
          <label className="text-eyebrow text-ash block mb-1">
            {t('editor.surveillance.rig_hardware', 'Rig / Hardware / OS')}
          </label>
          <input
            type="text"
            value={rigInfo}
            onChange={(e) => handleUpdate({ rigInfo: e.target.value })}
            placeholder="Ex: Arch Linux · Caelestia · Hyprland"
            className="w-full bg-graphite border border-graphite text-chalk text-note px-2 py-1.5 rounded-xs focus:border-[#55ffff] focus:outline-none"
          />
        </div>

        <div>
          <label className="text-eyebrow text-ash block mb-1">
            {t('editor.surveillance.habit', 'Habit')}
          </label>
          <input
            type="text"
            value={habitInfo}
            onChange={(e) => handleUpdate({ habitInfo: e.target.value })}
            placeholder="Ex: Commits before coffee"
            className="w-full bg-graphite border border-graphite text-chalk text-note px-2 py-1.5 rounded-xs focus:border-[#55ffff] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-eyebrow text-ash block mb-1">
              {t('editor.surveillance.status', 'Status')}
            </label>
            <input
              type="text"
              value={statusInfo}
              onChange={(e) => handleUpdate({ statusInfo: e.target.value })}
              className="w-full bg-graphite border border-graphite text-chalk text-note px-2 py-1.5 rounded-xs focus:border-[#55ffff] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-eyebrow text-ash block mb-1">
              {t('editor.surveillance.location', 'Location')}
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => handleUpdate({ location: e.target.value })}
              className="w-full bg-graphite border border-graphite text-chalk text-note px-2 py-1.5 rounded-xs focus:border-[#55ffff] focus:outline-none"
            />
          </div>
        </div>
      </div>
    )
  }

  if (widgetId === WIDGET_IDS.SURVEILLANCE_LOADOUT) {
    const displayMode = (config.displayMode as 'both' | 'logo' | 'name') || 'both'
    const defaultTools = [
      'VS Code',
      'Git',
      'Docker',
      'Terminal',
      'PowerShell',
      'Linux',
      'Postman',
      'Figma',
    ]
    const workflow =
      Array.isArray(config.workflow) && config.workflow.length > 0
        ? (config.workflow as string[])
        : defaultTools

    const defaultLangs =
      githubData?.languages &&
      typeof githubData.languages === 'object' &&
      Object.keys(githubData.languages).length > 0
        ? Object.keys(githubData.languages).slice(0, 8)
        : ['Rust', 'C++', 'Python', 'TypeScript', 'Go', 'Bash']
    const languages =
      Array.isArray(config.languages) && config.languages.length > 0
        ? (config.languages as string[])
        : defaultLangs

    const addWorkflowTool = (item: string) => {
      const trimmed = item.trim()
      if (!trimmed || workflow.includes(trimmed)) return
      handleUpdate({ workflow: [...workflow, trimmed] })
      setNewWorkflowInput('')
    }

    const removeWorkflowTool = (tool: string) => {
      handleUpdate({ workflow: workflow.filter((t) => t !== tool) })
    }

    const addLanguage = (item: string) => {
      const trimmed = item.trim()
      if (!trimmed || languages.includes(trimmed)) return
      handleUpdate({ languages: [...languages, trimmed] })
      setNewLangInput('')
    }

    const removeLanguage = (lang: string) => {
      handleUpdate({ languages: languages.filter((l) => l !== lang) })
    }

    const filteredCatalog = TECH_CATALOG.filter((tech) => {
      const matchesCategory = activeTechCategory === 'all' || tech.category === activeTechCategory
      const matchesSearch =
        tech.name.toLowerCase().includes(techSearchTerm.toLowerCase()) ||
        tech.id.toLowerCase().includes(techSearchTerm.toLowerCase())
      return matchesCategory && matchesSearch
    })

    return (
      <div className="space-y-4 pt-3 border-t border-graphite font-mono">
        <div className="flex items-center gap-2 text-[#55ffff] text-eyebrow uppercase tracking-wider font-semibold">
          <Cpu size={14} />
          <span>{t('editor.surveillance.loadout_title', 'Daily Loadout Editor')}</span>
        </div>

        <div className="space-y-1.5">
          <label className="text-eyebrow text-ash font-medium block">
            {t('editor.codeweb.badge_display_mode', 'Modo de Exibição das Badges')}
          </label>
          <div className="grid grid-cols-3 gap-1 bg-[#050308] p-1 rounded-xs border border-graphite">
            <button
              type="button"
              onClick={() => handleUpdate({ displayMode: 'both' })}
              className={`py-1.5 rounded-xs text-[11px] font-medium transition-all cursor-pointer border text-center ${
                displayMode === 'both'
                  ? 'bg-graphite text-[#55ffff] border-[#55ffff]/40 font-bold'
                  : 'text-ash hover:text-chalk border-transparent'
              }`}
            >
              {t('editor.codeweb.badge_name_logo', 'Nome + Logo')}
            </button>
            <button
              type="button"
              onClick={() => handleUpdate({ displayMode: 'logo' })}
              className={`py-1.5 rounded-xs text-[11px] font-medium transition-all cursor-pointer border text-center ${
                displayMode === 'logo'
                  ? 'bg-graphite text-[#55ffff] border-[#55ffff]/40 font-bold'
                  : 'text-ash hover:text-chalk border-transparent'
              }`}
            >
              {t('editor.codeweb.badge_logo_only', 'Apenas Logo')}
            </button>
            <button
              type="button"
              onClick={() => handleUpdate({ displayMode: 'name' })}
              className={`py-1.5 rounded-xs text-[11px] font-medium transition-all cursor-pointer border text-center ${
                displayMode === 'name'
                  ? 'bg-graphite text-[#55ffff] border-[#55ffff]/40 font-bold'
                  : 'text-ash hover:text-chalk border-transparent'
              }`}
            >
              {t('editor.codeweb.badge_name_only', 'Apenas Nome')}
            </button>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-eyebrow text-ash font-medium">
              Workflow Tools ({workflow.length})
            </label>
            {workflow.length > 0 && (
              <button
                type="button"
                onClick={() => handleUpdate({ workflow: [] })}
                className="text-[10px] text-red-400 hover:underline cursor-pointer"
              >
                {t('editor.surveillance.clear', 'Limpar')}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {workflow.map((item: string) => {
              const info = getTechInfo(item)
              return (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 bg-[#050308] border border-[#55ffff]/30 px-2 py-0.5 text-[10px] text-[#e6fbfb]"
                >
                  <img
                    src={`https://skillicons.dev/icons?i=${info.id === 'reactnative' ? 'react' : info.id}&theme=dark`}
                    alt=""
                    className="w-3.5 h-3.5 object-contain"
                    onError={(e) => {
                      ;(e.target as HTMLElement).style.display = 'none'
                    }}
                  />
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => removeWorkflowTool(item)}
                    className="text-ash hover:text-red-400 cursor-pointer ml-0.5"
                  >
                    <X size={10} />
                  </button>
                </span>
              )
            })}
          </div>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={newWorkflowInput}
              onChange={(e) => setNewWorkflowInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addWorkflowTool(newWorkflowInput)}
              placeholder={t(
                'editor.surveillance.add_custom_tool',
                'Adicionar ferramenta personalizada...'
              )}
              className="flex-1 bg-graphite border border-graphite text-chalk text-note px-2 py-1 rounded-xs focus:border-[#55ffff] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => addWorkflowTool(newWorkflowInput)}
              className="px-2.5 py-1 bg-[#55ffff]/10 border border-[#55ffff]/30 text-[#55ffff] text-caption hover:bg-[#55ffff]/20 cursor-pointer"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-eyebrow text-ash font-medium">
              Programming Languages ({languages.length})
            </label>
            {languages.length > 0 && (
              <button
                type="button"
                onClick={() => handleUpdate({ languages: [] })}
                className="text-[10px] text-red-400 hover:underline cursor-pointer"
              >
                {t('editor.surveillance.clear', 'Limpar')}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {languages.map((item: string) => {
              const info = getTechInfo(item)
              return (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 bg-[#050308] border border-[#c084fc]/30 px-2 py-0.5 text-[10px] text-[#d8b4fe]"
                >
                  <img
                    src={`https://skillicons.dev/icons?i=${info.id === 'reactnative' ? 'react' : info.id}&theme=dark`}
                    alt=""
                    className="w-3.5 h-3.5 object-contain"
                    onError={(e) => {
                      ;(e.target as HTMLElement).style.display = 'none'
                    }}
                  />
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => removeLanguage(item)}
                    className="text-ash hover:text-red-400 cursor-pointer ml-0.5"
                  >
                    <X size={10} />
                  </button>
                </span>
              )
            })}
          </div>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={newLangInput}
              onChange={(e) => setNewLangInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addLanguage(newLangInput)}
              placeholder={t(
                'editor.surveillance.add_custom_lang',
                'Adicionar linguagem personalizada...'
              )}
              className="flex-1 bg-graphite border border-graphite text-chalk text-note px-2 py-1 rounded-xs focus:border-[#c084fc] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => addLanguage(newLangInput)}
              className="px-2.5 py-1 bg-[#c084fc]/10 border border-[#c084fc]/30 text-[#c084fc] text-caption hover:bg-[#c084fc]/20 cursor-pointer"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-graphite space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-eyebrow text-ash font-medium">
              {t('editor.surveillance.tech_catalog', 'Catálogo de Tecnologias')}
            </label>
            <span className="text-[10px] text-ash">
              {t('editor.surveillance.click_to_add', 'Clique para adicionar')}
            </span>
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: t('editor.surveillance.cat_all', 'Todas') },
              { id: 'languages', label: t('editor.surveillance.cat_languages', 'Linguagens') },
              { id: 'frontend', label: t('editor.surveillance.cat_frontend', 'Frontend') },
              { id: 'backend', label: t('editor.surveillance.cat_backend', 'Backend') },
              { id: 'devops', label: t('editor.surveillance.cat_devops', 'DevOps') },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveTechCategory(cat.id)}
                className={`px-2 py-1 rounded-xs text-[10px] transition-all cursor-pointer whitespace-nowrap border ${
                  activeTechCategory === cat.id
                    ? 'bg-[#55ffff]/15 text-[#55ffff] border-[#55ffff]/40 font-bold'
                    : 'bg-graphite text-ash border-transparent hover:text-chalk'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-2 text-ash" size={13} />
            <input
              type="text"
              value={techSearchTerm}
              onChange={(e) => setTechSearchTerm(e.target.value)}
              placeholder={t(
                'editor.surveillance.search_catalog',
                'Buscar no catálogo (ex: React, Rust, Docker)...'
              )}
              className="w-full bg-graphite border border-graphite text-chalk text-[11px] pl-8 pr-2 py-1.5 rounded-xs focus:border-[#55ffff] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-1 max-h-36 overflow-y-auto p-1 bg-[#050308] border border-graphite rounded-xs">
            {filteredCatalog.slice(0, 36).map((tech) => {
              const isSelectedTool = workflow.includes(tech.name) || workflow.includes(tech.id)
              const isSelectedLang = languages.includes(tech.name) || languages.includes(tech.id)
              const isSelected = isSelectedTool || isSelectedLang

              return (
                <button
                  key={tech.id}
                  type="button"
                  onClick={() => {
                    if (tech.category === 'languages') {
                      if (isSelectedLang) {
                        removeLanguage(tech.name)
                        removeLanguage(tech.id)
                      } else {
                        addLanguage(tech.name)
                      }
                    } else {
                      if (isSelectedTool) {
                        removeWorkflowTool(tech.name)
                        removeWorkflowTool(tech.id)
                      } else {
                        addWorkflowTool(tech.name)
                      }
                    }
                  }}
                  className={`flex items-center gap-1.5 p-1 rounded-xs text-[10px] transition-all cursor-pointer border text-left truncate ${
                    isSelected
                      ? 'bg-[#55ffff]/20 text-[#55ffff] border-[#55ffff]/50 font-bold'
                      : 'bg-graphite/40 text-ash border-graphite/30 hover:border-slate hover:text-chalk'
                  }`}
                >
                  <img
                    src={`https://skillicons.dev/icons?i=${tech.id === 'reactnative' ? 'react' : tech.id}&theme=dark`}
                    alt=""
                    className="w-3.5 h-3.5 object-contain shrink-0"
                    onError={(e) => {
                      ;(e.target as HTMLElement).style.display = 'none'
                    }}
                  />
                  <span className="truncate">{tech.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  if (widgetId === WIDGET_IDS.SURVEILLANCE_TELEMETRY) {
    const username = (config.username as string) || githubData?.user.login || ''

    return (
      <div className="space-y-4 pt-3 border-t border-graphite font-mono">
        <div className="flex items-center gap-2 text-[#55ffff] text-eyebrow uppercase tracking-wider font-semibold">
          <Terminal size={14} />
          <span>{t('editor.surveillance.telemetry_title', 'Terminal Telemetry Settings')}</span>
        </div>

        <div>
          <label className="text-eyebrow text-ash block mb-1">
            {t('editor.surveillance.prompt_user', 'Terminal Session Username')}
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => handleUpdate({ username: e.target.value })}
            placeholder="Ex: operator"
            className="w-full bg-graphite border border-graphite text-chalk text-note px-2 py-1.5 rounded-xs focus:border-[#55ffff] focus:outline-none"
          />
        </div>

        <div className="p-2.5 bg-[#050308] border border-[#55ffff]/20 text-[11px] text-ash space-y-1">
          <div className="text-[#55ffff] font-bold">» Live Session Metrics:</div>
          <div>• Repos: {githubData?.user.public_repos ?? 0}</div>
          <div>• Stars: {githubData?.totalStars ?? 0}</div>
          <div>• Followers: {githubData?.user.followers ?? 0}</div>
          <div>• 2D Matrix: 53×7 Contribution Cells</div>
        </div>
      </div>
    )
  }

  if (widgetId === WIDGET_IDS.SURVEILLANCE_TRANSMISSION) {
    const quoteText =
      (config.quoteText as string) ||
      githubData?.user.bio ||
      'Programs must be written for people to read, and only incidentally for machines to execute.'
    const customTitle = (config.customTitle as string) || 'TRANSMISSION'
    const customSubtitle = (config.customSubtitle as string) || 'INCOMING · SENSIBLE WORDS'

    const setRandomQuote = () => {
      const pick = PRESET_QUOTES[Math.floor(Math.random() * PRESET_QUOTES.length)]
      handleUpdate({ quoteText: pick })
    }

    return (
      <div className="space-y-4 pt-3 border-t border-graphite font-mono">
        <div className="flex items-center gap-2 text-[#55ffff] text-eyebrow uppercase tracking-wider font-semibold">
          <Radio size={14} />
          <span>{t('editor.surveillance.tx_title', 'Incoming Transmission Settings')}</span>
        </div>

        <div>
          <label className="text-eyebrow text-ash block mb-1">
            {t('editor.surveillance.panel_title', 'Panel Title')}
          </label>
          <input
            type="text"
            value={customTitle}
            onChange={(e) => handleUpdate({ customTitle: e.target.value })}
            className="w-full bg-graphite border border-graphite text-chalk text-note px-2 py-1.5 rounded-xs focus:border-[#55ffff] focus:outline-none"
          />
        </div>

        <div>
          <label className="text-eyebrow text-ash block mb-1">
            {t('editor.surveillance.incoming_subtitle', 'Incoming Subtitle')}
          </label>
          <input
            type="text"
            value={customSubtitle}
            onChange={(e) => handleUpdate({ customSubtitle: e.target.value })}
            className="w-full bg-graphite border border-graphite text-chalk text-note px-2 py-1.5 rounded-xs focus:border-[#55ffff] focus:outline-none"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-eyebrow text-ash">
              {t('editor.surveillance.tx_quote', 'Transmission Quote')}
            </label>
            <button
              type="button"
              onClick={setRandomQuote}
              className="text-[10px] text-[#55ffff] hover:underline cursor-pointer"
            >
              {t('editor.surveillance.random_quote', '🎲 Random Quote')}
            </button>
          </div>
          <textarea
            rows={3}
            value={quoteText}
            onChange={(e) => handleUpdate({ quoteText: e.target.value })}
            className="w-full bg-graphite border border-graphite text-chalk text-note p-2 rounded-xs focus:border-[#55ffff] focus:outline-none resize-none"
          />
        </div>
      </div>
    )
  }

  if (widgetId === WIDGET_IDS.SURVEILLANCE_FIELD) {
    const quoteText = (config.quoteText as string) || '“If it isn’t riced, it isn’t mine.”'
    const workspaceTag = (config.workspaceTag as string) || 'CAELESTIA // HYPRLAND'

    return (
      <div className="space-y-4 pt-3 border-t border-graphite font-mono">
        <div className="flex items-center gap-2 text-[#55ffff] text-eyebrow uppercase tracking-wider font-semibold">
          <Video size={14} />
          <span>{t('editor.surveillance.field_title', 'Field Recording VHS Settings')}</span>
        </div>

        <div>
          <label className="text-eyebrow text-ash block mb-1">
            {t('editor.surveillance.top_quote', 'Top Quote / Slogan')}
          </label>
          <input
            type="text"
            value={quoteText}
            onChange={(e) => handleUpdate({ quoteText: e.target.value })}
            className="w-full bg-graphite border border-graphite text-chalk text-note px-2 py-1.5 rounded-xs focus:border-[#55ffff] focus:outline-none"
          />
        </div>

        <div>
          <label className="text-eyebrow text-ash block mb-1">
            {t('editor.surveillance.bottom_workspace_tag', 'Bottom Workspace Tag')}
          </label>
          <input
            type="text"
            value={workspaceTag}
            onChange={(e) => handleUpdate({ workspaceTag: e.target.value })}
            className="w-full bg-graphite border border-graphite text-chalk text-note px-2 py-1.5 rounded-xs focus:border-[#55ffff] focus:outline-none"
          />
        </div>
      </div>
    )
  }

  if (widgetId === WIDGET_IDS.SURVEILLANCE_FEEDS) {
    const renderMode = (config.renderMode as 'grid' | 'single') || 'grid'
    const selectedFeed = (config.selectedFeed as 'linkedin' | 'email' | 'discord') || 'linkedin'

    const handleModeChange = (mode: 'grid' | 'single') => {
      handleUpdate({ renderMode: mode })
      if (mode === 'single') {
        updateWidgetSize(instanceId, { width: 244, height: 183 })
      } else {
        updateWidgetSize(instanceId, { width: 780, height: 190 })
      }
    }

    return (
      <div className="space-y-4 pt-3 border-t border-graphite font-mono">
        <div className="flex items-center gap-2 text-[#55ffff] text-eyebrow uppercase tracking-wider font-semibold">
          <Share2 size={14} />
          <span>{t('editor.surveillance.feeds_title', 'Surveillance CCTV Feeds')}</span>
        </div>

        <div>
          <label className="text-eyebrow text-ash block mb-1.5">
            {t('editor.surveillance.layout_mode', 'Display Layout Mode')}
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => handleModeChange('grid')}
              className={`py-1.5 rounded-xs text-[11px] transition-all cursor-pointer border text-center ${
                renderMode === 'grid'
                  ? 'bg-[#55ffff] text-black border-[#55ffff] font-bold'
                  : 'bg-graphite text-ash border-graphite hover:border-slate hover:text-chalk'
              }`}
            >
              {t('editor.surveillance.grid_mode', 'Grid (3 Feeds Row)')}
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('single')}
              className={`py-1.5 rounded-xs text-[11px] transition-all cursor-pointer border text-center ${
                renderMode === 'single'
                  ? 'bg-[#55ffff] text-black border-[#55ffff] font-bold'
                  : 'bg-graphite text-ash border-graphite hover:border-slate hover:text-chalk'
              }`}
            >
              {t('editor.surveillance.single_mode', 'Single Tile (4:3)')}
            </button>
          </div>
        </div>

        {renderMode === 'single' && (
          <div>
            <label className="text-eyebrow text-ash block mb-1.5">
              {t('editor.surveillance.active_feed_channel', 'Active Feed Channel')}
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'linkedin', label: 'LinkedIn' },
                { id: 'email', label: 'Email' },
                { id: 'discord', label: 'Discord' },
              ].map((feed) => (
                <button
                  key={feed.id}
                  type="button"
                  onClick={() => handleUpdate({ selectedFeed: feed.id })}
                  className={`py-1 rounded-xs text-[10px] transition-all cursor-pointer border text-center ${
                    selectedFeed === feed.id
                      ? 'bg-[#55ffff] text-black border-[#55ffff] font-bold'
                      : 'bg-graphite text-ash border-graphite hover:border-slate hover:text-chalk'
                  }`}
                >
                  {feed.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (widgetId === WIDGET_IDS.SURVEILLANCE_TITLE) {
    const title = (config.customTitle as string) || (config.title as string) || 'ESTABLISH UPLINK'
    const ref =
      (config.customRef as string) || (config.referenceTag as string) || 'REF://CONTACT.SYS'
    const ledColor = (config.ledColor as string) || '#ff5555'
    const showLed = config.showLed !== false
    const showRef = config.showRef !== false

    return (
      <div className="space-y-4 pt-3 border-t border-graphite font-mono">
        <div className="flex items-center gap-2 text-[#55ffff] text-eyebrow uppercase tracking-wider font-semibold">
          <Heading size={14} />
          <span>{t('editor.surveillance.title_bar_settings', 'Surveillance Section Title')}</span>
        </div>

        <div>
          <label className="text-eyebrow text-ash block mb-1.5">Quick Presets</label>
          <div className="grid grid-cols-2 gap-1.5">
            {TITLE_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() =>
                  handleUpdate({
                    customTitle: p.label,
                    title: p.label,
                    customRef: p.ref,
                    referenceTag: p.ref,
                  })
                }
                className={`py-1.5 px-2 rounded-xs text-[10px] transition-all cursor-pointer border text-left truncate ${
                  title === p.label
                    ? 'bg-[#55ffff]/15 text-[#55ffff] border-[#55ffff] font-bold'
                    : 'bg-graphite text-ash border-graphite hover:border-slate hover:text-chalk'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-eyebrow text-ash block mb-1">
            {t('editor.surveillance.title_label', 'Title Label')}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleUpdate({ customTitle: e.target.value, title: e.target.value })}
            placeholder="Ex: ESTABLISH UPLINK"
            className="w-full bg-graphite border border-graphite text-chalk text-note px-2 py-1.5 rounded-xs focus:border-[#55ffff] focus:outline-none"
          />
        </div>

        <div>
          <label className="text-eyebrow text-ash block mb-1">
            {t('editor.surveillance.ref_label', 'Right Reference Tag')}
          </label>
          <input
            type="text"
            value={ref}
            onChange={(e) =>
              handleUpdate({ customRef: e.target.value, referenceTag: e.target.value })
            }
            placeholder="Ex: REF://CONTACT.SYS"
            className="w-full bg-graphite border border-graphite text-chalk text-note px-2 py-1.5 rounded-xs focus:border-[#55ffff] focus:outline-none"
          />
        </div>

        <div>
          <label className="text-eyebrow text-ash block mb-1.5">LED Status Indicator Color</label>
          <div className="flex gap-2">
            {LED_COLORS.map((c) => (
              <button
                key={c.color}
                type="button"
                onClick={() => handleUpdate({ ledColor: c.color })}
                title={c.name}
                className={`w-5 h-5 rounded-xs border-2 transition-all cursor-pointer ${
                  ledColor === c.color
                    ? 'border-white scale-110'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.color }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-graphite">
          <div className="flex items-center justify-between">
            <label className="text-eyebrow text-ash font-medium cursor-pointer">
              {t('editor.surveillance.show_led', 'Exibir Indicador LED')}
            </label>
            <Switch checked={showLed} onChange={(checked) => handleUpdate({ showLed: checked })} />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-eyebrow text-ash font-medium cursor-pointer">
              {t('editor.surveillance.show_ref', 'Exibir Tag de Referência (Direita)')}
            </label>
            <Switch checked={showRef} onChange={(checked) => handleUpdate({ showRef: checked })} />
          </div>
        </div>
      </div>
    )
  }

  return null
}
