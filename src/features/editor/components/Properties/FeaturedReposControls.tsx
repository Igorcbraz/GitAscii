'use client'

import {
  AlignJustify,
  ArrowUpDown,
  Clock,
  FolderGit2,
  GitFork,
  LayoutGrid,
  List,
  Search,
  Star,
  Tag,
} from 'lucide-react'
import React from 'react'

import { Switch } from '@/components/ui/Switch'
import type { WidgetConfig } from '@/engine/types'
import { useI18n } from '@/i18n'

import { useEditorStore } from '../../store/editorStore'

interface FeaturedReposControlsProps {
  instanceId: string
  config: WidgetConfig
}

function computeWidgetHeight(maxRepos: number, viewMode: string): number {
  if (viewMode === 'grid') {
    const rows = Math.ceil(maxRepos / 2)
    return 48 + rows * (80 + 12) + 16
  }
  return 48 + maxRepos * 64 + 16
}

function computeRepoCardHeight(showUpdated: boolean): number {
  let h = 52
  if (showUpdated) h += 14
  return h
}

export function FeaturedReposControls({ instanceId, config }: FeaturedReposControlsProps) {
  const { t } = useI18n()
  const { updateWidgetConfig, updateWidgetSize, config: savedConfig, githubData } = useEditorStore()

  const [searchQuery, setSearchQuery] = React.useState('')

  const selectedRepos = React.useMemo<string[]>(() => {
    return Array.isArray(config.selectedRepos) ? (config.selectedRepos as string[]) : []
  }, [config.selectedRepos])

  const maxRepos = Number(config.maxRepos) || 3
  const viewMode = (config.repoViewMode as string) || 'list'
  const sortBy = (config.repoSortBy as string) || 'stars'

  const showLanguage = config.showRepoLanguage !== false
  const showForks = Boolean(config.showRepoForks)
  const showStars = config.showRepoStars !== false
  const showDesc = config.showRepoDesc !== false
  const showUpdated = Boolean(config.showRepoUpdated)

  const allRepos = React.useMemo(() => {
    if (!githubData?.repos) return []
    return [...githubData.repos]
      .filter((r) => !r.fork)
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
  }, [githubData])

  const displayedRepos = React.useMemo(() => {
    const base =
      selectedRepos.length > 0
        ? [
            ...allRepos.filter((r) => selectedRepos.includes(r.name)),
            ...allRepos.filter((r) => !selectedRepos.includes(r.name)),
          ]
        : allRepos

    if (!searchQuery.trim()) return base
    const q = searchQuery.toLowerCase()
    return base.filter((r) => r.name.toLowerCase().includes(q))
  }, [allRepos, selectedRepos, searchQuery])

  const widget = React.useMemo(() => {
    return savedConfig?.widgets?.find((w) => w.instanceId === instanceId)
  }, [savedConfig, instanceId])

  const widgetId = widget?.widgetId
  const currentWidth = widget?.size?.width ?? 320

  const isControlPlane = widgetId?.startsWith('controlplane-')
  const showViewMode = !isControlPlane
  const showLanguageToggle = !isControlPlane
  const showForksToggle = !isControlPlane
  const showUpdatedToggle = !isControlPlane

  const layoutType =
    (config.layoutType as 'hero' | 'closed-loop') || (isControlPlane ? 'hero' : 'closed-loop')

  const showStarsToggle =
    !isControlPlane ||
    ((widgetId === 'controlplane-cartograph' || widgetId === 'controlplane-foundry') &&
      layoutType === 'closed-loop')

  const showDescToggle =
    !isControlPlane ||
    ((widgetId === 'controlplane-bento' ||
      widgetId === 'controlplane-cartograph' ||
      widgetId === 'controlplane-foundry') &&
      layoutType === 'hero')

  React.useEffect(() => {
    if (widgetId?.startsWith('controlplane-')) return
    const height = computeWidgetHeight(maxRepos, viewMode)
    updateWidgetSize(instanceId, { width: currentWidth, height }, false)
  }, [maxRepos, viewMode, instanceId, currentWidth, updateWidgetSize, widgetId])

  React.useEffect(() => {
    if (widgetId?.startsWith('controlplane-')) return
    const cardHeight = computeRepoCardHeight(showUpdated)
    updateWidgetConfig(instanceId, { repoCardHeight: cardHeight })
  }, [showUpdated, instanceId, updateWidgetConfig, widgetId])

  const repoLanguages = (config.repoLanguages as Record<string, string>) || {}
  const handleUpdateLanguage = (repoName: string, lang: string) => {
    updateWidgetConfig(instanceId, {
      repoLanguages: {
        ...repoLanguages,
        [repoName]: lang,
      },
    })
  }

  const toggleRepo = (repoName: string) => {
    if (selectedRepos.includes(repoName)) {
      updateWidgetConfig(instanceId, {
        selectedRepos: selectedRepos.filter((r) => r !== repoName),
      })
    } else {
      if (selectedRepos.length >= maxRepos) return
      updateWidgetConfig(instanceId, {
        selectedRepos: [...selectedRepos, repoName],
      })
    }
  }

  const handleMaxReposChange = (val: number) => {
    const patch: Record<string, unknown> = { maxRepos: val }
    if (selectedRepos.length > val) {
      patch.selectedRepos = selectedRepos.slice(0, val)
    }
    updateWidgetConfig(instanceId, patch)
  }

  const handleToggle = (field: string, current: boolean) => {
    updateWidgetConfig(instanceId, { [field]: !current })
  }

  return (
    <div className="space-y-4 pt-3 border-t border-graphite">
      <div className="flex items-center gap-2 text-signal-lime font-inter-tight text-eyebrow uppercase tracking-wider font-medium">
        <FolderGit2 size={14} />
        <span>{t('editor.repos.title', 'Configurações de Repositórios')}</span>
      </div>

      {showViewMode && (
        <div>
          <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
            {t('editor.repos.view_mode', 'Modo de Visualização')}
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => updateWidgetConfig(instanceId, { repoViewMode: 'list' })}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xs text-eyebrow font-inter-tight transition-all cursor-pointer border ${
                viewMode === 'list'
                  ? 'bg-signal-lime text-black border-signal-lime font-bold'
                  : 'bg-graphite text-ash border-graphite hover:border-slate hover:text-chalk'
              }`}
            >
              <List size={12} />
              {t('editor.repos.list', 'Lista')}
            </button>
            <button
              type="button"
              onClick={() => updateWidgetConfig(instanceId, { repoViewMode: 'grid' })}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xs text-eyebrow font-inter-tight transition-all cursor-pointer border ${
                viewMode === 'grid'
                  ? 'bg-signal-lime text-black border-signal-lime font-bold'
                  : 'bg-graphite text-ash border-graphite hover:border-slate hover:text-chalk'
              }`}
            >
              <LayoutGrid size={12} />
              {t('editor.repos.grid', 'Grid')}
            </button>
          </div>
        </div>
      )}

      <div>
        <div className="flex justify-between text-eyebrow mb-1">
          <span className="text-ash font-inter-tight">
            {t('editor.repos.max', 'Qtd. de Repos')}
          </span>
          <span className="text-chalk font-jetbrains-mono">{maxRepos}</span>
        </div>
        <input
          type="range"
          min="1"
          max="6"
          value={maxRepos}
          onChange={(e) => handleMaxReposChange(parseInt(e.target.value, 10))}
          className="w-full accent-signal-lime h-1 bg-graphite rounded cursor-pointer"
        />
      </div>

      {selectedRepos.length === 0 && (
        <div>
          <label className="flex items-center gap-1.5 text-eyebrow text-ash mb-1 font-inter-tight">
            <ArrowUpDown size={11} />
            {t('editor.repos.sort_by', 'Ordenar por')}
          </label>
          <select
            value={sortBy}
            onChange={(e) => updateWidgetConfig(instanceId, { repoSortBy: e.target.value })}
            className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note p-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
          >
            <option value="stars">{t('editor.repos.sort_stars', 'Mais Estrelados')}</option>
            <option value="updated">
              {t('editor.repos.sort_updated', 'Atualizado Recentemente')}
            </option>
            <option value="forks">{t('editor.repos.sort_forks', 'Mais Forkados')}</option>
            <option value="name">{t('editor.repos.sort_name', 'Nome (A–Z)')}</option>
          </select>
        </div>
      )}

      {(showLanguageToggle ||
        showForksToggle ||
        showStarsToggle ||
        showDescToggle ||
        showUpdatedToggle) && (
        <div className="space-y-1">
          {showLanguageToggle && (
            <div className="flex items-center justify-between p-2 bg-graphite rounded-sm border border-graphite">
              <label className="flex items-center gap-1.5 text-eyebrow text-chalk font-inter-tight cursor-pointer">
                <Tag size={11} className="text-ash" />
                {t('editor.repos.show_language', 'Linguagem')}
              </label>
              <Switch
                checked={showLanguage}
                onChange={() => handleToggle('showRepoLanguage', showLanguage)}
              />
            </div>
          )}

          {showForksToggle && (
            <div className="flex items-center justify-between p-2 bg-graphite rounded-sm border border-graphite">
              <label className="flex items-center gap-1.5 text-eyebrow text-chalk font-inter-tight cursor-pointer">
                <GitFork size={11} className="text-ash" />
                {t('editor.repos.show_forks', 'Forks')}
              </label>
              <Switch
                checked={showForks}
                onChange={() => handleToggle('showRepoForks', showForks)}
              />
            </div>
          )}

          {showStarsToggle && (
            <div className="flex items-center justify-between p-2 bg-graphite rounded-sm border border-graphite">
              <label className="flex items-center gap-1.5 text-eyebrow text-chalk font-inter-tight cursor-pointer">
                <Star size={11} className="text-ash" />
                {t('editor.repos.show_stars', 'Estrelas')}
              </label>
              <Switch
                checked={showStars}
                onChange={() => handleToggle('showRepoStars', showStars)}
              />
            </div>
          )}

          {showDescToggle && (
            <div className="flex items-center justify-between p-2 bg-graphite rounded-sm border border-graphite">
              <label className="flex items-center gap-1.5 text-eyebrow text-chalk font-inter-tight cursor-pointer">
                <AlignJustify size={11} className="text-ash" />
                {t('editor.repos.show_desc', 'Descrição')}
              </label>
              <Switch checked={showDesc} onChange={() => handleToggle('showRepoDesc', showDesc)} />
            </div>
          )}

          {showUpdatedToggle && (
            <div className="flex items-center justify-between p-2 bg-graphite rounded-sm border border-graphite">
              <label className="flex items-center gap-1.5 text-eyebrow text-chalk font-inter-tight cursor-pointer">
                <Clock size={11} className="text-ash" />
                {t('editor.repos.show_updated', 'Última Atualização')}
              </label>
              <Switch
                checked={showUpdated}
                onChange={() => handleToggle('showRepoUpdated', showUpdated)}
              />
            </div>
          )}
        </div>
      )}

      {selectedRepos.length > 0 && widgetId?.startsWith('controlplane-') && (
        <div className="space-y-2 border-t border-graphite/40 pt-3">
          <label className="text-eyebrow text-ash font-inter-tight block">
            {t('editor.repos.customize_techs', 'Customizar Tecnologias / Tags')}
          </label>
          <div className="space-y-1.5">
            {selectedRepos.map((repoName) => (
              <div key={repoName} className="flex items-center gap-2">
                <span className="text-caption text-chalk truncate w-1/2" title={repoName}>
                  {repoName}
                </span>
                <input
                  type="text"
                  value={repoLanguages[repoName] || ''}
                  onChange={(e) => handleUpdateLanguage(repoName, e.target.value)}
                  placeholder={t('editor.repos.original_language', 'Original language')}
                  className="w-1/2 bg-graphite border border-graphite rounded-xs text-caption font-inter-tight text-chalk px-2 py-1 placeholder:text-ash/40 focus:border-signal-lime focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-eyebrow text-ash font-inter-tight">
            {t('editor.repos.select', 'Selecionar Repositórios')}
          </label>
          {selectedRepos.length > 0 && (
            <button
              type="button"
              onClick={() => updateWidgetConfig(instanceId, { selectedRepos: [] })}
              className="text-caption text-ash hover:text-signal-lime font-inter-tight transition-colors cursor-pointer"
            >
              {t('editor.repos.clear', 'Limpar seleção')}
            </button>
          )}
        </div>

        <p className="text-caption text-ash/60 font-inter-tight">
          {selectedRepos.length === 0
            ? t('editor.repos.auto_hint', 'Nenhum selecionado – exibe automaticamente os top repos')
            : t('editor.repos.selected_hint', `${selectedRepos.length}/${maxRepos} selecionados`)}
        </p>

        <div className="relative">
          <Search
            size={12}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-ash/60 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('editor.repos.search_placeholder', 'Buscar repositório...')}
            className="w-full pl-6 pr-2 py-1.5 bg-graphite border border-graphite rounded-xs text-eyebrow font-inter-tight text-chalk placeholder:text-ash/40 focus:border-signal-lime focus:outline-none"
          />
        </div>

        {allRepos.length === 0 ? (
          <p className="text-caption text-ash/50 font-inter-tight italic">
            {t('editor.repos.no_repos', 'Carregando repositórios...')}
          </p>
        ) : (
          <div className="space-y-1 max-h-72 overflow-y-auto pr-0.5">
            {displayedRepos.map((repo) => {
              const isSelected = selectedRepos.includes(repo.name)
              const isDisabled = !isSelected && selectedRepos.length >= maxRepos
              return (
                <button
                  key={repo.name}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => toggleRepo(repo.name)}
                  className={`w-full text-left p-2 rounded-xs border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-signal-lime/10 border-signal-lime/50 text-chalk'
                      : isDisabled
                        ? 'bg-graphite border-graphite text-ash/40 cursor-not-allowed'
                        : 'bg-graphite border-graphite text-ash hover:border-slate hover:text-chalk'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-inter-tight text-eyebrow truncate">
                      {isSelected && (
                        <span className="text-signal-lime mr-1">
                          {selectedRepos.indexOf(repo.name) + 1}.{' '}
                        </span>
                      )}
                      {repo.name}
                    </span>
                    <span className="flex items-center gap-1 text-caption text-ash/70 shrink-0">
                      <Star size={10} />
                      {repo.stargazers_count}
                    </span>
                  </div>
                  {repo.description && (
                    <p className="text-caption text-ash/60 truncate mt-0.5 font-inter-tight">
                      {repo.description}
                    </p>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
