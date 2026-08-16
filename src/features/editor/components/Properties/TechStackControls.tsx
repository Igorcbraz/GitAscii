'use client'

import { Check, Moon, Search, Sparkles, Sun, X } from 'lucide-react'
import Image from 'next/image'
import React, { useState } from 'react'

import { Switch } from '@/components/ui/Switch'
import { TECH_STACK_PRESETS } from '@/constants'
import { TECH_CATALOG, type TechItem } from '@/data/techCatalog'
import { useI18n } from '@/i18n'

import { useEditorStore } from '../../store/editorStore'
import { detectTechStackFromProfile } from '../../utils/profileAutoDetection'

export { TECH_CATALOG, type TechItem }

const PRESETS = TECH_STACK_PRESETS

interface TechStackControlsProps {
  instanceId: string
  config: Record<string, unknown>
}

export function TechStackControls({ instanceId, config }: TechStackControlsProps) {
  const { t } = useI18n()
  const showTitle = config.showTitle !== false
  const customTitle = (config.customTitle as string) || ''
  const updateWidgetConfig = useEditorStore((state) => state.updateWidgetConfig)
  const githubData = useEditorStore((state) => state.githubData)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'languages' | 'frontend' | 'backend' | 'devops'
  >('all')

  const defaultTechs = detectTechStackFromProfile(githubData)

  const selectedTechs = Array.isArray(config.selectedTechs)
    ? (config.selectedTechs as string[])
    : defaultTechs

  const theme = (config.theme as string) || 'dark'
  const perLine = Number(config.perLine) || 12

  const toggleTech = (id: string) => {
    let updated: string[]
    if (selectedTechs.includes(id)) {
      updated = selectedTechs.filter((t) => t !== id)
    } else {
      updated = [...selectedTechs, id]
    }
    updateWidgetConfig(instanceId, { selectedTechs: updated })
  }

  const applyPreset = (presetItems: readonly string[] | string[]) => {
    updateWidgetConfig(instanceId, { selectedTechs: [...presetItems] })
  }

  const clearAll = () => {
    updateWidgetConfig(instanceId, { selectedTechs: [] })
  }

  const filteredCatalog = TECH_CATALOG.filter((tech) => {
    const matchesCategory = activeCategory === 'all' || tech.category === activeCategory
    const matchesSearch =
      tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.id.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-4 pt-3 border-t border-graphite font-inter-tight">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-signal-lime text-eyebrow uppercase tracking-wider font-semibold">
          <Sparkles size={14} />
          <span>{t('editor.tech.title', 'Tecnologias & Skills')}</span>
        </div>
        <span className="text-caption font-jetbrains-mono text-ash bg-carbon px-1.5 py-0.5 rounded border border-graphite">
          {t('editor.tech.selected_count', '{count} selecionadas', {
            count: String(selectedTechs.length),
          })}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-eyebrow text-ash font-medium">
            {t('editor.properties.show_title_label', 'Exibir Título')}
          </label>
          <Switch
            checked={showTitle}
            onChange={(checkedValue) => updateWidgetConfig(instanceId, { showTitle: checkedValue })}
          />
        </div>

        {showTitle && (
          <input
            type="text"
            value={customTitle}
            onChange={(e) => updateWidgetConfig(instanceId, { customTitle: e.target.value })}
            placeholder="Ex: [ TECH STACK ]"
            className="w-full bg-graphite border border-graphite text-chalk text-note px-2.5 py-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
          />
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-eyebrow text-ash font-medium">
            {t('editor.tech.active_techs', 'Tecnologias Ativas')}
          </span>
          {selectedTechs.length > 0 && (
            <button
              onClick={clearAll}
              className="text-caption text-red-400 hover:underline cursor-pointer"
            >
              {t('editor.tech.clear_all', 'Limpar todas')}
            </button>
          )}
        </div>

        {selectedTechs.length === 0 ? (
          <div className="p-3 text-center border border-dashed border-graphite rounded-xs text-eyebrow text-ash">
            {t(
              'editor.tech.none_selected',
              'Nenhuma tecnologia selecionada. Clique no catálogo abaixo para adicionar.'
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1 max-h-27.5 overflow-y-auto p-1.5 bg-void-black border border-graphite rounded-xs">
            {selectedTechs.map((techId) => {
              const info = TECH_CATALOG.find((t) => t.id === techId)
              return (
                <div
                  key={techId}
                  onClick={() => toggleTech(techId)}
                  className="group flex items-center gap-1 bg-graphite border border-signal-lime/40 text-signal-lime px-2 py-0.5 rounded-xs text-eyebrow font-jetbrains-mono cursor-pointer hover:bg-red-500/20 hover:border-red-500 hover:text-red-400 transition-colors"
                >
                  <Image
                    src={`https://skillicons.dev/icons?i=${techId === 'reactnative' ? 'react' : techId}&theme=${theme}`}
                    alt={techId}
                    width={14}
                    height={14}
                    className="w-3.5 h-3.5 object-contain"
                    unoptimized
                  />
                  <span>{info ? info.name : techId}</span>
                  <X size={10} className="opacity-60 group-hover:opacity-100" />
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div>
        <label className="text-eyebrow text-ash block mb-1.5 font-medium">
          {t('editor.tech.presets', 'Atalhos de Stacks Populares')}
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {PRESETS.map((preset) => {
            const Icon = preset.icon
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset.items)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-graphite border border-graphite hover:border-signal-lime/60 hover:bg-iron text-chalk text-eyebrow rounded-xs text-left transition-all cursor-pointer font-medium"
              >
                <Icon size={13} className="text-signal-lime shrink-0" />
                <span className="truncate">{preset.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-3 pt-2 border-t border-graphite/50">
        <div>
          <label className="text-eyebrow text-ash block mb-1.5 font-medium">
            {t('editor.tech.icon_theme', 'Tema dos Ícones')}
          </label>
          <div className="grid grid-cols-2 gap-1 bg-carbon p-1 rounded-xs border border-graphite">
            <button
              type="button"
              onClick={() => updateWidgetConfig(instanceId, { theme: 'dark' })}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xs text-eyebrow font-medium transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-graphite text-signal-lime border border-signal-lime/40 font-semibold shadow-sm'
                  : 'text-ash hover:text-chalk'
              }`}
            >
              <Moon size={13} />
              <span>{t('editor.tech.theme_dark', 'Escuro (Dark)')}</span>
            </button>
            <button
              type="button"
              onClick={() => updateWidgetConfig(instanceId, { theme: 'light' })}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xs text-eyebrow font-medium transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-graphite text-signal-lime border border-signal-lime/40 font-semibold shadow-sm'
                  : 'text-ash hover:text-chalk'
              }`}
            >
              <Sun size={13} />
              <span>{t('editor.tech.theme_light', 'Claro (Light)')}</span>
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-eyebrow">
            <span className="text-ash font-medium">
              {t('editor.tech.icons_per_line', 'Ícones por Linha')}
            </span>
            <span className="text-signal-lime font-jetbrains-mono font-bold bg-carbon px-2 py-0.5 rounded border border-graphite">
              {t('editor.tech.per_line_count', '{count} / linha', { count: String(perLine) })}
            </span>
          </div>
          <input
            type="range"
            min={4}
            max={16}
            step={1}
            value={perLine}
            onChange={(e) => updateWidgetConfig(instanceId, { perLine: Number(e.target.value) })}
            className="w-full accent-signal-lime bg-graphite h-1.5 rounded cursor-pointer"
          />
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-graphite">
        <div className="flex items-center justify-between">
          <label className="text-eyebrow text-chalk font-medium">
            {t('editor.tech.catalog_title', 'Catálogo de Ícones (Clique para selecionar)')}
          </label>
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-2.5 text-ash" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t(
              'editor.tech.search_placeholder',
              'Buscar tecnologia (ex: React, Docker, Python)...'
            )}
            className="w-full bg-graphite border border-graphite text-chalk text-eyebrow pl-8 pr-2 py-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
          />
        </div>

        <div className="flex gap-1 overflow-x-auto pb-1 text-caption">
          {(['all', 'languages', 'frontend', 'backend', 'devops'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2 py-0.5 rounded-xs capitalize shrink-0 transition-colors cursor-pointer border ${
                activeCategory === cat
                  ? 'border-signal-lime bg-signal-lime/10 text-signal-lime font-medium'
                  : 'border-transparent text-ash hover:text-chalk'
              }`}
            >
              {cat === 'all' ? t('editor.tech.cat_all', 'Todas') : cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-1.5 max-h-55 overflow-y-auto p-1 bg-void-black border border-graphite rounded-xs">
          {filteredCatalog.map((tech) => {
            const isSelected = selectedTechs.includes(tech.id)
            return (
              <div
                key={tech.id}
                onClick={() => toggleTech(tech.id)}
                className={`p-2 rounded-xs border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-150 relative ${
                  isSelected
                    ? 'border-signal-lime bg-signal-lime/10 text-signal-lime shadow-sm'
                    : 'border-graphite bg-onyx text-ash hover:border-slate hover:text-chalk'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-signal-lime text-black flex items-center justify-center">
                    <Check size={9} strokeWidth={3} />
                  </div>
                )}
                <Image
                  src={`https://skillicons.dev/icons?i=${tech.id === 'reactnative' ? 'react' : tech.id}&theme=${theme}`}
                  alt={tech.name}
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain"
                  unoptimized
                />
                <span className="text-caption font-medium line-clamp-1 text-center">
                  {tech.name}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
