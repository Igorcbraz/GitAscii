'use client'

import {
  ArrowUpDown,
  Award,
  Ban,
  BarChart2,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Code2,
  Cpu,
  ExternalLink,
  Flame,
  FolderGit2,
  Search,
  Sparkles,
  Star,
  Terminal,
  TrendingUp,
  User,
  Users,
  X,
  Zap,
} from 'lucide-react'
import Image from 'next/image'
import React, { useState } from 'react'

import { Switch } from '@/components/ui/Switch'
import { EXTERNAL_LINKS, WIDGET_IDS } from '@/constants'
import { TECH_CATALOG } from '@/data/techCatalog'
import { useI18n } from '@/i18n'

import { useEditorStore } from '../../store/editorStore'

interface PremiumAsciiControlsProps {
  instanceId: string
  widgetId: string
  config: Record<string, unknown>
}

const SCORECARD_METRICS = [
  { id: 'activity', label: 'Activity', icon: Flame },
  { id: 'open-source', label: 'Open Source', icon: Code2 },
  { id: 'community', label: 'Community', icon: Users },
  { id: 'consistency', label: 'Consistency', icon: Clock },
  { id: 'impact', label: 'Impact', icon: Star },
  { id: 'growth', label: 'Growth', icon: TrendingUp },
  { id: 'maintenance', label: 'Maintenance', icon: Terminal },
  { id: 'project-health', label: 'Project Health', icon: Award },
] as const

const DNA_TRAITS = [
  { id: 'builder', label: 'Builder', icon: Cpu },
  { id: 'maintainer', label: 'Maintainer', icon: Terminal },
  { id: 'open source', label: 'Open Source', icon: Code2 },
  { id: 'community', label: 'Community', icon: Users },
  { id: 'explorer', label: 'Explorer', icon: Sparkles },
] as const

const VELOCITY_METRICS = [
  { id: 'commits', label: 'Commits/mês', icon: Flame },
  { id: 'prs', label: 'Pull Requests/mês', icon: Code2 },
  { id: 'issues', label: 'Issues/mês', icon: Terminal },
] as const

export function PremiumAsciiControls({ instanceId, widgetId, config }: PremiumAsciiControlsProps) {
  const { t } = useI18n()
  const updateWidgetConfig = useEditorStore((state) => state.updateWidgetConfig)
  const githubData = useEditorStore((state) => state.githubData)

  const animated = config.animated !== false

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    identity: true,
    metrics: true,
    repos: true,
    languages: true,
    velocity: true,
    scorecard: true,
    dna: true,
    insights: true,
  })

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const [repoSearch, setRepoSearch] = useState('')
  const [langSearch, setLangSearch] = useState('')
  const [activeLangTab, setActiveLangTab] = useState<'profile' | 'catalog'>('profile')

  const customName = (config.customName as string) || ''
  const customLocation = (config.customLocation as string) || ''
  const customWebsite = (config.customWebsite as string) || ''
  const customRoles = (config.customRoles as string) || ''

  const showRoles = config.showRoles !== false
  const showLocation = config.showLocation !== false
  const showWebsite = config.showWebsite !== false
  const showUptime = config.showUptime !== false

  const showMetrics = config.showMetrics !== false
  const hideMetricsArr: string[] = Array.isArray(config.hideMetrics)
    ? (config.hideMetrics as string[])
    : []
  const showStars = !hideMetricsArr.includes('stars') && config.showStars !== false
  const showRepos = !hideMetricsArr.includes('repos') && config.showRepos !== false
  const showFollowers = !hideMetricsArr.includes('followers') && config.showFollowers !== false
  const showActivity = !hideMetricsArr.includes('activity') && config.showActivity !== false

  const showTopRepos = config.showTopRepos !== false
  const maxRepos = Number(config.maxRepos) || 3
  const repoSortBy = (config.repoSortBy as string) || 'stars'
  const selectedRepos: string[] = React.useMemo(() => {
    return Array.isArray(config.selectedRepos) ? (config.selectedRepos as string[]) : []
  }, [config.selectedRepos])

  const showLanguages = config.showLanguages !== false
  const langsCount = Number(config.langsCount) || 5
  const hideLangs: string[] = React.useMemo(() => {
    if (Array.isArray(config.hideLangsArr)) return config.hideLangsArr as string[]
    if (typeof config.hideLangs === 'string' && config.hideLangs) {
      return (config.hideLangs as string)
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean)
    }
    return []
  }, [config.hideLangsArr, config.hideLangs])

  const showTerminalPrompt = config.showTerminalPrompt !== false

  const showTotalScore = config.showTotalScore !== false

  const showKeyInsights = config.showKeyInsights !== false
  const showTemporalProductivity = config.showTemporalProductivity !== false
  const showPeakCadence = config.showPeakCadence !== false

  const hideTraits: string[] = Array.isArray(config.hideTraits)
    ? (config.hideTraits as string[])
    : []
  const showArchetype = config.showArchetype !== false

  const hideVelocityMetrics: string[] = Array.isArray(config.hideVelocityMetrics)
    ? (config.hideVelocityMetrics as string[])
    : []
  const showAvgCommits = config.showAvgCommits !== false

  const allRepos = React.useMemo(() => {
    if (!githubData?.repos) return []
    return [...githubData.repos]
      .filter((r) => !r.fork)
      .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
  }, [githubData?.repos])

  const displayedRepos = React.useMemo(() => {
    const base =
      selectedRepos.length > 0
        ? [
            ...allRepos.filter((r) => selectedRepos.includes(r.name)),
            ...allRepos.filter((r) => !selectedRepos.includes(r.name)),
          ]
        : allRepos

    if (!repoSearch.trim()) return base
    const q = repoSearch.toLowerCase()
    return base.filter((r) => r.name.toLowerCase().includes(q))
  }, [allRepos, selectedRepos, repoSearch])

  const profileLanguages = React.useMemo(() => {
    return Object.keys(githubData?.languages || {})
  }, [githubData?.languages])

  const filteredTechCatalog = React.useMemo(() => {
    return TECH_CATALOG.filter((tech) => {
      const q = langSearch.toLowerCase()
      return (
        tech.category === 'languages' ||
        tech.name.toLowerCase().includes(q) ||
        tech.id.toLowerCase().includes(q)
      )
    })
  }, [langSearch])

  const toggleRepoSelection = (repoName: string) => {
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

  const toggleMetricHide = (
    field: 'hideMetrics' | 'hideTraits' | 'hideVelocityMetrics',
    id: string,
    currentlyVisible: boolean
  ) => {
    const list = Array.isArray(config[field]) ? [...(config[field] as string[])] : []
    const updated = currentlyVisible
      ? [...list, id.toLowerCase()]
      : list.filter((item) => item.toLowerCase() !== id.toLowerCase())
    updateWidgetConfig(instanceId, { [field]: updated })
  }

  const updateHideLangs = (langs: string[]) => {
    updateWidgetConfig(instanceId, {
      hideLangsArr: langs,
      hideLangs: langs.join(','),
    })
  }

  const toggleHideLang = (lang: string) => {
    const isHidden = hideLangs.some((l) => l.toLowerCase() === lang.toLowerCase())
    if (isHidden) {
      updateHideLangs(hideLangs.filter((l) => l.toLowerCase() !== lang.toLowerCase()))
    } else {
      updateHideLangs([...hideLangs, lang])
    }
  }

  return (
    <div className="space-y-4 pt-3 border-t border-graphite" data-testid="premium-ascii-controls">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-signal-lime font-inter-tight text-eyebrow uppercase tracking-wider font-medium">
          <Terminal size={14} />
          <span>ASCII Premium Kit</span>
        </div>
        <a
          href={EXTERNAL_LINKS.COMMUNITY_REPOS.PEDRO_FONSECA}
          target="_blank"
          rel="noopener noreferrer"
          title="Ver perfil de Pedro Fonseca (@PedroFnseca)"
          className="flex items-center gap-1 text-caption font-jetbrains-mono text-ash hover:text-signal-lime transition-colors"
        >
          <ExternalLink size={11} />
          <span>PedroFnseca</span>
        </a>
      </div>

      {widgetId === WIDGET_IDS.PREMIUM_ASCII_PROFILE_CARD && (
        <div className="space-y-2">
          <div className="rounded-xs border border-graphite bg-void-black overflow-hidden">
            <div
              role="button"
              tabIndex={0}
              onClick={() => toggleSection('identity')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') toggleSection('identity')
              }}
              className="w-full flex items-center justify-between p-2.5 bg-onyx hover:bg-graphite/40 transition-colors text-left cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <User size={13} className="text-signal-lime" />
                <span className="text-eyebrow font-jetbrains-mono uppercase tracking-wider text-chalk font-medium">
                  Identidade & Informações
                </span>
              </div>
              {openSections.identity ? (
                <ChevronDown size={14} className="text-ash" />
              ) : (
                <ChevronRight size={14} className="text-ash" />
              )}
            </div>

            {openSections.identity && (
              <div className="p-2.5 space-y-2.5 border-t border-graphite/40">
                <div>
                  <label className="text-caption font-jetbrains-mono text-ash block mb-1">
                    Nome de Exibição
                  </label>
                  <input
                    type="text"
                    value={customName}
                    placeholder="Developer Name"
                    onChange={(e) => updateWidgetConfig(instanceId, { customName: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-xs bg-graphite border border-graphite text-chalk font-jetbrains-mono text-body-sm focus:border-signal-lime focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="text-caption font-jetbrains-mono text-ash block mb-1">
                    Cargos / Roles (separados por vírgula)
                  </label>
                  <input
                    type="text"
                    value={customRoles}
                    placeholder="Full Stack Developer, Software Architecture"
                    onChange={(e) =>
                      updateWidgetConfig(instanceId, { customRoles: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 rounded-xs bg-graphite border border-graphite text-chalk font-jetbrains-mono text-body-sm focus:border-signal-lime focus:outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-caption font-jetbrains-mono text-ash block mb-1">
                      Localização
                    </label>
                    <input
                      type="text"
                      value={customLocation}
                      placeholder="San Francisco, CA"
                      onChange={(e) =>
                        updateWidgetConfig(instanceId, { customLocation: e.target.value })
                      }
                      className="w-full px-2 py-1.5 rounded-xs bg-graphite border border-graphite text-chalk font-jetbrains-mono text-body-sm focus:border-signal-lime focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-caption font-jetbrains-mono text-ash block mb-1">
                      Website / Link
                    </label>
                    <input
                      type="text"
                      value={customWebsite}
                      placeholder="developer.io"
                      onChange={(e) =>
                        updateWidgetConfig(instanceId, { customWebsite: e.target.value })
                      }
                      className="w-full px-2 py-1.5 rounded-xs bg-graphite border border-graphite text-chalk font-jetbrains-mono text-body-sm focus:border-signal-lime focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <div className="flex items-center justify-between p-1.5 bg-onyx rounded-xs border border-graphite">
                    <span className="text-caption text-ash">Roles</span>
                    <Switch
                      checked={showRoles}
                      onChange={(checked: boolean) =>
                        updateWidgetConfig(instanceId, { showRoles: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-1.5 bg-onyx rounded-xs border border-graphite">
                    <span className="text-caption text-ash">Localização</span>
                    <Switch
                      checked={showLocation}
                      onChange={(checked: boolean) =>
                        updateWidgetConfig(instanceId, { showLocation: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-1.5 bg-onyx rounded-xs border border-graphite">
                    <span className="text-caption text-ash">Website</span>
                    <Switch
                      checked={showWebsite}
                      onChange={(checked: boolean) =>
                        updateWidgetConfig(instanceId, { showWebsite: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-1.5 bg-onyx rounded-xs border border-graphite">
                    <span className="text-caption text-ash">Uptime</span>
                    <Switch
                      checked={showUptime}
                      onChange={(checked: boolean) =>
                        updateWidgetConfig(instanceId, { showUptime: checked })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 bg-onyx rounded-xs border border-graphite">
                  <span className="text-caption text-chalk font-jetbrains-mono">
                    Prompt (`@user:~$ █`)
                  </span>
                  <Switch
                    checked={showTerminalPrompt}
                    onChange={(checked: boolean) =>
                      updateWidgetConfig(instanceId, { showTerminalPrompt: checked })
                    }
                  />
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xs border border-graphite bg-void-black overflow-hidden">
            <div
              role="button"
              tabIndex={0}
              onClick={() => toggleSection('metrics')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') toggleSection('metrics')
              }}
              className="w-full flex items-center justify-between p-2.5 bg-onyx hover:bg-graphite/40 transition-colors text-left cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <BarChart2 size={13} className="text-signal-lime" />
                <span className="text-eyebrow font-jetbrains-mono uppercase tracking-wider text-chalk font-medium">
                  Métricas do GitHub
                </span>
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Switch
                  checked={showMetrics}
                  onChange={(checked: boolean) =>
                    updateWidgetConfig(instanceId, { showMetrics: checked })
                  }
                  aria-label="Ativar métricas"
                />
                <button
                  type="button"
                  onClick={() => toggleSection('metrics')}
                  className="text-ash hover:text-chalk cursor-pointer"
                >
                  {openSections.metrics ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
              </div>
            </div>

            {openSections.metrics && showMetrics && (
              <div className="p-2.5 border-t border-graphite/40">
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="flex items-center justify-between p-1.5 bg-onyx rounded-xs border border-graphite">
                    <span className="text-caption text-chalk">Stars</span>
                    <Switch
                      checked={showStars}
                      onChange={() => toggleMetricHide('hideMetrics', 'stars', showStars)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-1.5 bg-onyx rounded-xs border border-graphite">
                    <span className="text-caption text-chalk">Repos</span>
                    <Switch
                      checked={showRepos}
                      onChange={() => toggleMetricHide('hideMetrics', 'repos', showRepos)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-1.5 bg-onyx rounded-xs border border-graphite">
                    <span className="text-caption text-chalk">Followers</span>
                    <Switch
                      checked={showFollowers}
                      onChange={() => toggleMetricHide('hideMetrics', 'followers', showFollowers)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-1.5 bg-onyx rounded-xs border border-graphite">
                    <span className="text-caption text-chalk">Activity</span>
                    <Switch
                      checked={showActivity}
                      onChange={() => toggleMetricHide('hideMetrics', 'activity', showActivity)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xs border border-graphite bg-void-black overflow-hidden">
            <div
              role="button"
              tabIndex={0}
              onClick={() => toggleSection('repos')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') toggleSection('repos')
              }}
              className="w-full flex items-center justify-between p-2.5 bg-onyx hover:bg-graphite/40 transition-colors text-left cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <FolderGit2 size={13} className="text-signal-lime" />
                <span className="text-eyebrow font-jetbrains-mono uppercase tracking-wider text-chalk font-medium">
                  Top Repositórios
                </span>
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Switch
                  checked={showTopRepos}
                  onChange={(checked: boolean) =>
                    updateWidgetConfig(instanceId, { showTopRepos: checked })
                  }
                  aria-label="Ativar repositórios"
                />
                <button
                  type="button"
                  onClick={() => toggleSection('repos')}
                  className="text-ash hover:text-chalk cursor-pointer"
                >
                  {openSections.repos ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
              </div>
            </div>

            {openSections.repos && showTopRepos && (
              <div className="p-2.5 space-y-2.5 border-t border-graphite/40">
                <div className="flex items-center justify-between text-eyebrow">
                  <span className="text-ash font-inter-tight">Qtd. de Repositórios</span>
                  <span className="text-chalk font-jetbrains-mono">{maxRepos}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={maxRepos}
                  onChange={(e) =>
                    updateWidgetConfig(instanceId, { maxRepos: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-signal-lime h-1 bg-graphite rounded cursor-pointer"
                />

                {selectedRepos.length === 0 && (
                  <div>
                    <label className="flex items-center gap-1.5 text-eyebrow text-ash mb-1 font-inter-tight">
                      <ArrowUpDown size={11} />
                      Ordenar por
                    </label>
                    <select
                      value={repoSortBy}
                      onChange={(e) =>
                        updateWidgetConfig(instanceId, { repoSortBy: e.target.value })
                      }
                      className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note p-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
                    >
                      <option value="stars">Mais Estrelados</option>
                      <option value="updated">Atualizado Recentemente</option>
                      <option value="forks">Mais Forkados</option>
                      <option value="name">Nome (A–Z)</option>
                    </select>
                  </div>
                )}

                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-caption text-ash font-inter-tight">
                      Fixar / Selecionar Repos ({selectedRepos.length}/{maxRepos})
                    </label>
                    {selectedRepos.length > 0 && (
                      <button
                        type="button"
                        onClick={() => updateWidgetConfig(instanceId, { selectedRepos: [] })}
                        className="text-caption text-ash hover:text-signal-lime font-inter-tight transition-colors cursor-pointer"
                      >
                        Limpar fixados
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <Search
                      size={11}
                      className="absolute left-2 top-1/2 -translate-y-1/2 text-ash/60 pointer-events-none"
                    />
                    <input
                      type="text"
                      value={repoSearch}
                      onChange={(e) => setRepoSearch(e.target.value)}
                      placeholder="Buscar repositório..."
                      className="w-full pl-6 pr-2 py-1 bg-graphite border border-graphite rounded-xs text-caption font-inter-tight text-chalk placeholder:text-ash/40 focus:border-signal-lime focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 max-h-36 overflow-y-auto pr-0.5">
                    {displayedRepos.slice(0, 10).map((repo) => {
                      const isSelected = selectedRepos.includes(repo.name)
                      const isDisabled = !isSelected && selectedRepos.length >= maxRepos
                      return (
                        <button
                          key={repo.name}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => toggleRepoSelection(repo.name)}
                          className={`w-full text-left px-2 py-1 rounded-xs border transition-all cursor-pointer text-caption flex items-center justify-between gap-1.5 ${
                            isSelected
                              ? 'bg-signal-lime/10 border-signal-lime/50 text-chalk'
                              : isDisabled
                                ? 'bg-graphite border-graphite text-ash/40 cursor-not-allowed'
                                : 'bg-graphite border-graphite text-ash hover:border-slate hover:text-chalk'
                          }`}
                        >
                          <span className="truncate font-mono">
                            {isSelected && <span className="text-signal-lime mr-1">★</span>}
                            {repo.name}
                          </span>
                          <span className="text-[10px] text-ash shrink-0">
                            ★ {repo.stargazers_count || 0}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xs border border-graphite bg-void-black overflow-hidden">
            <div
              role="button"
              tabIndex={0}
              onClick={() => toggleSection('languages')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') toggleSection('languages')
              }}
              className="w-full flex items-center justify-between p-2.5 bg-onyx hover:bg-graphite/40 transition-colors text-left cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <Code2 size={13} className="text-signal-lime" />
                <span className="text-eyebrow font-jetbrains-mono uppercase tracking-wider text-chalk font-medium">
                  Linguagens & Tecnologias
                </span>
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Switch
                  checked={showLanguages}
                  onChange={(checked: boolean) =>
                    updateWidgetConfig(instanceId, { showLanguages: checked })
                  }
                  aria-label="Ativar linguagens"
                />
                <button
                  type="button"
                  onClick={() => toggleSection('languages')}
                  className="text-ash hover:text-chalk cursor-pointer"
                >
                  {openSections.languages ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
              </div>
            </div>

            {openSections.languages && showLanguages && (
              <div className="p-2.5 space-y-2.5 border-t border-graphite/40">
                <div className="flex items-center justify-between text-eyebrow">
                  <span className="text-ash font-inter-tight">Qtd. de Linguagens</span>
                  <span className="text-chalk font-jetbrains-mono">{langsCount}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={langsCount}
                  onChange={(e) =>
                    updateWidgetConfig(instanceId, { langsCount: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-signal-lime h-1 bg-graphite rounded cursor-pointer"
                />

                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-caption">
                    <span className="text-ash font-inter-tight">Exclusão e Filtros Visuais</span>
                    {hideLangs.length > 0 && (
                      <button
                        type="button"
                        onClick={() => updateHideLangs([])}
                        className="text-ash hover:text-signal-lime cursor-pointer transition-colors"
                      >
                        Restaurar todas
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-1 bg-carbon p-0.5 rounded-xs border border-graphite">
                    <button
                      type="button"
                      onClick={() => setActiveLangTab('profile')}
                      className={`py-1 text-[11px] rounded-xs font-inter-tight transition-all cursor-pointer ${
                        activeLangTab === 'profile'
                          ? 'bg-graphite text-signal-lime font-medium border border-signal-lime/40'
                          : 'text-ash hover:text-chalk'
                      }`}
                    >
                      Do seu Perfil ({profileLanguages.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveLangTab('catalog')}
                      className={`py-1 text-[11px] rounded-xs font-inter-tight transition-all cursor-pointer ${
                        activeLangTab === 'catalog'
                          ? 'bg-graphite text-signal-lime font-medium border border-signal-lime/40'
                          : 'text-ash hover:text-chalk'
                      }`}
                    >
                      Catálogo Completo
                    </button>
                  </div>

                  {activeLangTab === 'catalog' && (
                    <div className="relative">
                      <Search
                        size={11}
                        className="absolute left-2 top-1/2 -translate-y-1/2 text-ash"
                      />
                      <input
                        type="text"
                        value={langSearch}
                        onChange={(e) => setLangSearch(e.target.value)}
                        placeholder="Buscar linguagem (ex: Rust, Python, Go)..."
                        className="w-full pl-6 pr-2 py-1 bg-graphite border border-graphite rounded-xs text-caption text-chalk focus:border-signal-lime focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-1 max-h-44 overflow-y-auto p-1 bg-void-black border border-graphite rounded-xs">
                    {(activeLangTab === 'profile'
                      ? profileLanguages
                      : filteredTechCatalog.map((t) => t.name)
                    ).map((langName) => {
                      const isHidden = hideLangs.some(
                        (l) => l.toLowerCase() === langName.toLowerCase()
                      )
                      const techItem = TECH_CATALOG.find(
                        (t) => t.name.toLowerCase() === langName.toLowerCase()
                      )
                      const iconKey = techItem
                        ? techItem.id
                        : langName.toLowerCase().replace(/[^a-z0-9]/g, '')

                      return (
                        <button
                          key={langName}
                          type="button"
                          onClick={() => toggleHideLang(langName)}
                          className={`p-1.5 rounded-xs border flex items-center gap-1.5 transition-all cursor-pointer text-left ${
                            !isHidden
                              ? 'border-signal-lime/60 bg-signal-lime/10 text-chalk font-medium'
                              : 'border-graphite bg-onyx text-ash/50 line-through hover:border-slate'
                          }`}
                        >
                          <Image
                            src={`https://skillicons.dev/icons?i=${iconKey}&theme=dark`}
                            alt={langName}
                            width={14}
                            height={14}
                            className={`w-3.5 h-3.5 object-contain shrink-0 ${isHidden ? 'opacity-30 grayscale' : ''}`}
                            unoptimized
                          />
                          <span className="text-[11px] truncate flex-1 font-mono">{langName}</span>
                          {!isHidden ? (
                            <Check size={10} className="text-signal-lime shrink-0" />
                          ) : (
                            <X size={10} className="text-red-400 shrink-0" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {widgetId === WIDGET_IDS.PREMIUM_ASCII_DEV_SCORE && (
        <div className="rounded-xs border border-graphite bg-void-black overflow-hidden">
          <div
            role="button"
            tabIndex={0}
            onClick={() => toggleSection('scorecard')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') toggleSection('scorecard')
            }}
            className="w-full flex items-center justify-between p-2.5 bg-onyx hover:bg-graphite/40 transition-colors text-left cursor-pointer select-none"
          >
            <div className="flex items-center gap-2">
              <Award size={13} className="text-signal-lime" />
              <span className="text-eyebrow font-jetbrains-mono uppercase tracking-wider text-chalk font-medium">
                Métricas do Scorecard (0-100)
              </span>
            </div>
            {openSections.scorecard ? (
              <ChevronDown size={14} className="text-ash" />
            ) : (
              <ChevronRight size={14} className="text-ash" />
            )}
          </div>

          {openSections.scorecard && (
            <div className="p-2.5 space-y-2 border-t border-graphite/40">
              <div className="grid grid-cols-2 gap-1.5">
                {SCORECARD_METRICS.map((m) => {
                  const isVisible = !hideMetricsArr.includes(m.id)
                  const Icon = m.icon
                  return (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-1.5 bg-onyx rounded-xs border border-graphite"
                    >
                      <label className="flex items-center gap-1.5 text-caption text-chalk font-inter-tight cursor-pointer truncate">
                        <Icon size={12} className="text-ash shrink-0" />
                        <span className="truncate">{m.label}</span>
                      </label>
                      <Switch
                        checked={isVisible}
                        onChange={() => toggleMetricHide('hideMetrics', m.id, isVisible)}
                      />
                    </div>
                  )
                })}
              </div>

              <div className="pt-2 border-t border-graphite/40">
                <div className="flex items-center justify-between p-2 bg-onyx rounded-xs border border-graphite">
                  <label className="text-caption text-chalk font-inter-tight cursor-pointer">
                    Exibir Resumo Total Score (TOTAL SCORE [A+])
                  </label>
                  <Switch
                    checked={showTotalScore}
                    onChange={(checked: boolean) =>
                      updateWidgetConfig(instanceId, { showTotalScore: checked })
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {widgetId === WIDGET_IDS.PREMIUM_ASCII_INSIGHTS && (
        <div className="rounded-xs border border-graphite bg-void-black overflow-hidden">
          <div
            role="button"
            tabIndex={0}
            onClick={() => toggleSection('insights')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') toggleSection('insights')
            }}
            className="w-full flex items-center justify-between p-2.5 bg-onyx hover:bg-graphite/40 transition-colors text-left cursor-pointer select-none"
          >
            <div className="flex items-center gap-2">
              <Sparkles size={13} className="text-signal-lime" />
              <span className="text-eyebrow font-jetbrains-mono uppercase tracking-wider text-chalk font-medium">
                Seções de Insights & Hábitos
              </span>
            </div>
            {openSections.insights ? (
              <ChevronDown size={14} className="text-ash" />
            ) : (
              <ChevronRight size={14} className="text-ash" />
            )}
          </div>

          {openSections.insights && (
            <div className="p-2.5 space-y-1.5 border-t border-graphite/40">
              <div className="flex items-center justify-between p-2 bg-onyx rounded-xs border border-graphite">
                <label className="text-caption text-chalk font-inter-tight cursor-pointer">
                  Key Insights (Diagnósticos Comportamentais)
                </label>
                <Switch
                  checked={showKeyInsights}
                  onChange={(checked: boolean) =>
                    updateWidgetConfig(instanceId, { showKeyInsights: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-2 bg-onyx rounded-xs border border-graphite">
                <label className="text-caption text-chalk font-inter-tight cursor-pointer">
                  Produtividade Temporal (Morning, Aft, Eve, Night)
                </label>
                <Switch
                  checked={showTemporalProductivity}
                  onChange={(checked: boolean) =>
                    updateWidgetConfig(instanceId, { showTemporalProductivity: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-2 bg-onyx rounded-xs border border-graphite">
                <label className="text-caption text-chalk font-inter-tight cursor-pointer">
                  Pico de Atividade (Dia da semana & Mês)
                </label>
                <Switch
                  checked={showPeakCadence}
                  onChange={(checked: boolean) =>
                    updateWidgetConfig(instanceId, { showPeakCadence: checked })
                  }
                />
              </div>
            </div>
          )}
        </div>
      )}

      {widgetId === WIDGET_IDS.PREMIUM_ASCII_DNA && (
        <div className="rounded-xs border border-graphite bg-void-black overflow-hidden">
          <div
            role="button"
            tabIndex={0}
            onClick={() => toggleSection('dna')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') toggleSection('dna')
            }}
            className="w-full flex items-center justify-between p-2.5 bg-onyx hover:bg-graphite/40 transition-colors text-left cursor-pointer select-none"
          >
            <div className="flex items-center gap-2">
              <Cpu size={13} className="text-signal-lime" />
              <span className="text-eyebrow font-jetbrains-mono uppercase tracking-wider text-chalk font-medium">
                Traços de Desenvolvedor (DNA)
              </span>
            </div>
            {openSections.dna ? (
              <ChevronDown size={14} className="text-ash" />
            ) : (
              <ChevronRight size={14} className="text-ash" />
            )}
          </div>

          {openSections.dna && (
            <div className="p-2.5 space-y-2 border-t border-graphite/40">
              <div className="grid grid-cols-2 gap-1.5">
                {DNA_TRAITS.map((tItem) => {
                  const isVisible = !hideTraits.includes(tItem.id)
                  const Icon = tItem.icon
                  return (
                    <div
                      key={tItem.id}
                      className="flex items-center justify-between p-1.5 bg-onyx rounded-xs border border-graphite"
                    >
                      <label className="flex items-center gap-1.5 text-caption text-chalk font-inter-tight cursor-pointer truncate">
                        <Icon size={12} className="text-ash shrink-0" />
                        <span className="truncate">{tItem.label}</span>
                      </label>
                      <Switch
                        checked={isVisible}
                        onChange={() => toggleMetricHide('hideTraits', tItem.id, isVisible)}
                      />
                    </div>
                  )
                })}
              </div>

              <div className="pt-2 border-t border-graphite/40">
                <div className="flex items-center justify-between p-2 bg-onyx rounded-xs border border-graphite">
                  <label className="text-caption text-chalk font-inter-tight cursor-pointer">
                    Classificação de Arquétipo (&gt; THE BUILDER)
                  </label>
                  <Switch
                    checked={showArchetype}
                    onChange={(checked: boolean) =>
                      updateWidgetConfig(instanceId, { showArchetype: checked })
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {widgetId === WIDGET_IDS.PREMIUM_ASCII_CODING_VELOCITY && (
        <div className="rounded-xs border border-graphite bg-void-black overflow-hidden">
          <div
            role="button"
            tabIndex={0}
            onClick={() => toggleSection('velocity')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') toggleSection('velocity')
            }}
            className="w-full flex items-center justify-between p-2.5 bg-onyx hover:bg-graphite/40 transition-colors text-left cursor-pointer select-none"
          >
            <div className="flex items-center gap-2">
              <TrendingUp size={13} className="text-signal-lime" />
              <span className="text-eyebrow font-jetbrains-mono uppercase tracking-wider text-chalk font-medium">
                Métricas de Throughput & Cadência
              </span>
            </div>
            {openSections.velocity ? (
              <ChevronDown size={14} className="text-ash" />
            ) : (
              <ChevronRight size={14} className="text-ash" />
            )}
          </div>

          {openSections.velocity && (
            <div className="p-2.5 space-y-2 border-t border-graphite/40">
              <div className="grid grid-cols-2 gap-1.5">
                {VELOCITY_METRICS.map((vm) => {
                  const isVisible = !hideVelocityMetrics.includes(vm.id)
                  const Icon = vm.icon
                  return (
                    <div
                      key={vm.id}
                      className="flex items-center justify-between p-1.5 bg-onyx rounded-xs border border-graphite"
                    >
                      <label className="flex items-center gap-1.5 text-caption text-chalk font-inter-tight cursor-pointer truncate">
                        <Icon size={12} className="text-ash shrink-0" />
                        <span className="truncate">{vm.label}</span>
                      </label>
                      <Switch
                        checked={isVisible}
                        onChange={() => toggleMetricHide('hideVelocityMetrics', vm.id, isVisible)}
                      />
                    </div>
                  )
                })}
              </div>

              <div className="pt-2 border-t border-graphite/40">
                <div className="flex items-center justify-between p-2 bg-onyx rounded-xs border border-graphite">
                  <label className="text-caption text-chalk font-inter-tight cursor-pointer">
                    Média Diária (Avg. commits/day)
                  </label>
                  <Switch
                    checked={showAvgCommits}
                    onChange={(checked: boolean) =>
                      updateWidgetConfig(instanceId, { showAvgCommits: checked })
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2 pt-3 border-t border-graphite">
        <div className="flex items-center gap-2 text-signal-lime font-inter-tight text-eyebrow uppercase tracking-wider font-medium">
          <Zap size={14} />
          <span>{t('editor.animation.title', 'Animação de Entrada')}</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            title="Widget aparece instantaneamente em modo estático"
            onClick={() => updateWidgetConfig(instanceId, { animated: false })}
            className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-xs text-center cursor-pointer transition-all border text-[10px] font-inter-tight leading-tight ${
              !animated
                ? 'bg-signal-lime text-black border-signal-lime font-bold'
                : 'bg-graphite text-ash border-graphite hover:border-ash hover:text-chalk'
            }`}
          >
            <Ban className="w-[18px] h-[18px] mb-1" />
            <span>{t('editor.animation.none', 'Sem animação')}</span>
          </button>
          <button
            type="button"
            title="Efeito progressivo de contagem de números e preenchimento de barras ASCII"
            onClick={() => updateWidgetConfig(instanceId, { animated: true })}
            className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-xs text-center cursor-pointer transition-all border text-[10px] font-inter-tight leading-tight ${
              animated
                ? 'bg-signal-lime text-black border-signal-lime font-bold'
                : 'bg-graphite text-ash border-graphite hover:border-ash hover:text-chalk'
            }`}
          >
            <Sparkles className="w-[18px] h-[18px] mb-1" />
            <span>{t('editor.premiumascii.animatedTitle', 'Animar Números e Barras')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
