'use client'

import {
  AlertTriangle,
  AppWindow,
  ArrowUpDown,
  Bomb,
  Monitor,
  Music,
  Palette,
  Search,
  Sparkles,
  X,
} from 'lucide-react'
import React, { useState } from 'react'

import { Switch } from '@/components/ui/Switch'
import { COMMON_LANGUAGES, WIDGET_IDS, WINXP_COLOR_THEMES } from '@/constants'
import { useI18n } from '@/i18n'

import { useEditorStore } from '../../store/editorStore'

interface WinXPControlsProps {
  instanceId: string
  widgetId: string
  config: Record<string, unknown>
}

export function WinXPControls({ instanceId, widgetId, config }: WinXPControlsProps) {
  const { t } = useI18n()
  const updateWidgetConfig = useEditorStore((state) => state.updateWidgetConfig)
  const githubData = useEditorStore((state) => state.githubData)

  const [repoSearchQuery, setRepoSearchQuery] = useState('')
  const [langCustomInput, setLangCustomInput] = useState('')

  const handleUpdate = (patch: Record<string, unknown>) => {
    updateWidgetConfig(instanceId, patch)
  }

  const selectedThemePreset = (config.themePreset as string) || 'Luna Blue (Default)'

  const renderThemePresets = () => (
    <div className="space-y-1.5">
      <label className="text-caption font-sans font-medium text-chalk/80">
        Tema Visual do Windows XP
      </label>
      <div className="grid grid-cols-2 gap-1.5">
        {WINXP_COLOR_THEMES.map((theme) => {
          const isSelected = selectedThemePreset === theme.name
          return (
            <button
              key={theme.name}
              type="button"
              onClick={() =>
                handleUpdate({
                  themePreset: theme.name,
                  titleGradientStart: theme.titleGradientStart,
                  titleGradientEnd: theme.titleGradientEnd,
                })
              }
              className={`p-2 text-left rounded-xs border text-caption font-sans transition-all flex items-center gap-2 ${
                isSelected
                  ? 'border-[#2989f5] bg-[#2989f5]/15 text-chalk font-semibold shadow-xs'
                  : 'border-graphite bg-void-black text-ash hover:border-slate hover:text-chalk'
              }`}
            >
              <div
                className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/30"
                style={{
                  background: `linear-gradient(135deg, ${theme.titleGradientStart} 0%, ${theme.titleGradientEnd} 100%)`,
                }}
              />
              <span className="truncate text-[11px]">{theme.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )

  if (widgetId === WIDGET_IDS.WINXP_WINDOW) {
    const windowTitle = (config.windowTitle as string) || ''
    const displayName =
      (config.displayName as string) || githubData?.user.name || githubData?.user.login || ''
    const customBio = (config.customBio as string) || githubData?.user.bio || ''
    const customLocation = (config.customLocation as string) || githubData?.user.location || ''
    const customCompany = (config.customCompany as string) || githubData?.user.company || ''
    const hardDriveLabel = (config.hardDriveLabel as string) || 'Local Disk (C:)'
    const starFolderLabel = (config.starFolderLabel as string) || 'Stars & Badges'
    const networkFolderLabel = (config.networkFolderLabel as string) || 'Workgroup'

    return (
      <div className="space-y-4 pt-3 border-t border-graphite font-sans">
        <div className="flex items-center gap-2 text-[#60a5fa] text-eyebrow uppercase tracking-wider font-semibold">
          <AppWindow size={14} />
          <span>Configurações XP Window Explorer</span>
        </div>

        {renderThemePresets()}

        <div className="space-y-1.5">
          <label className="text-caption font-medium text-chalk/80">
            Título da Janela / Caminho
          </label>
          <input
            type="text"
            value={windowTitle}
            onChange={(e) => handleUpdate({ windowTitle: e.target.value })}
            placeholder={`C:\\Documents and Settings\\${githubData?.user.login || 'user'}`}
            className="w-full bg-void-black text-chalk text-note px-2.5 py-1.5 border border-graphite rounded-xs focus:outline-none focus:border-[#2989f5]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-caption font-medium text-chalk/80">
            Nome de Exibição do Usuário
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => handleUpdate({ displayName: e.target.value })}
            placeholder="Nome do Usuário..."
            className="w-full bg-void-black text-chalk text-note px-2.5 py-1.5 border border-graphite rounded-xs focus:outline-none focus:border-[#2989f5]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-caption font-medium text-chalk/80">Biografia do Perfil</label>
          <textarea
            rows={3}
            value={customBio}
            onChange={(e) => handleUpdate({ customBio: e.target.value })}
            placeholder="Biografia do perfil..."
            className="w-full bg-void-black text-chalk text-note px-2.5 py-1.5 border border-graphite rounded-xs focus:outline-none focus:border-[#2989f5] resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label className="text-caption font-medium text-chalk/80">Localização</label>
            <input
              type="text"
              value={customLocation}
              onChange={(e) => handleUpdate({ customLocation: e.target.value })}
              placeholder="Ex: São Paulo, Brasil"
              className="w-full bg-void-black text-chalk text-note px-2.5 py-1.5 border border-graphite rounded-xs focus:outline-none focus:border-[#2989f5]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-caption font-medium text-chalk/80">Empresa / Afiliação</label>
            <input
              type="text"
              value={customCompany}
              onChange={(e) => handleUpdate({ customCompany: e.target.value })}
              placeholder="Ex: Open Source"
              className="w-full bg-void-black text-chalk text-note px-2.5 py-1.5 border border-graphite rounded-xs focus:outline-none focus:border-[#2989f5]"
            />
          </div>
        </div>

        <div className="border-t border-graphite/60 pt-3 space-y-2">
          <label className="text-caption font-medium text-chalk/80 block">
            Rótulos dos Drives / Pastas
          </label>
          <div className="space-y-1.5">
            <input
              type="text"
              value={hardDriveLabel}
              onChange={(e) => handleUpdate({ hardDriveLabel: e.target.value })}
              placeholder="Local Disk (C:)"
              className="w-full bg-void-black text-chalk text-note px-2.5 py-1.5 border border-graphite rounded-xs focus:outline-none focus:border-[#2989f5]"
            />
            <input
              type="text"
              value={starFolderLabel}
              onChange={(e) => handleUpdate({ starFolderLabel: e.target.value })}
              placeholder="Stars & Badges"
              className="w-full bg-void-black text-chalk text-note px-2.5 py-1.5 border border-graphite rounded-xs focus:outline-none focus:border-[#2989f5]"
            />
            <input
              type="text"
              value={networkFolderLabel}
              onChange={(e) => handleUpdate({ networkFolderLabel: e.target.value })}
              placeholder="Workgroup"
              className="w-full bg-void-black text-chalk text-note px-2.5 py-1.5 border border-graphite rounded-xs focus:outline-none focus:border-[#2989f5]"
            />
          </div>
        </div>
      </div>
    )
  }

  if (widgetId === WIDGET_IDS.WINXP_MINESWEEPER) {
    const customTitle = (config.customTitle as string) || 'Minesweeper - GitHub Activity Mode'
    const customVictoryText = (config.customVictoryText as string) || ''
    const customMinesCount = (config.customMinesCount as string) || ''
    const customTimerCount = (config.customTimerCount as string) || ''

    return (
      <div className="space-y-4 pt-3 border-t border-graphite font-sans">
        <div className="flex items-center gap-2 text-[#60a5fa] text-eyebrow uppercase tracking-wider font-semibold">
          <Bomb size={14} />
          <span>Configurações XP Minesweeper</span>
        </div>

        {renderThemePresets()}

        <div className="space-y-1.5">
          <label className="text-caption font-medium text-chalk/80">Título da Janela</label>
          <input
            type="text"
            value={customTitle}
            onChange={(e) => handleUpdate({ customTitle: e.target.value })}
            placeholder="Minesweeper - GitHub Activity Mode"
            className="w-full bg-void-black text-chalk text-note px-2.5 py-1.5 border border-graphite rounded-xs focus:outline-none focus:border-[#2989f5]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-caption font-medium text-chalk/80">
            Texto de Vitória do Rodapé
          </label>
          <input
            type="text"
            value={customVictoryText}
            onChange={(e) => handleUpdate({ customVictoryText: e.target.value })}
            placeholder="Ex: 🏆 Victory! Commits Swept without detonating bugs."
            className="w-full bg-void-black text-chalk text-note px-2.5 py-1.5 border border-graphite rounded-xs focus:outline-none focus:border-[#2989f5]"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label className="text-caption font-medium text-chalk/80">
              Display LED Minas (Esq.)
            </label>
            <input
              type="text"
              value={customMinesCount}
              onChange={(e) => handleUpdate({ customMinesCount: e.target.value })}
              placeholder="Auto (Repos)"
              className="w-full bg-void-black text-chalk text-note px-2.5 py-1.5 border border-graphite rounded-xs focus:outline-none focus:border-[#2989f5]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-caption font-medium text-chalk/80">
              Display LED Tempo (Dir.)
            </label>
            <input
              type="text"
              value={customTimerCount}
              onChange={(e) => handleUpdate({ customTimerCount: e.target.value })}
              placeholder="Auto (Commits)"
              className="w-full bg-void-black text-chalk text-note px-2.5 py-1.5 border border-graphite rounded-xs focus:outline-none focus:border-[#2989f5]"
            />
          </div>
        </div>
      </div>
    )
  }

  if (widgetId === WIDGET_IDS.WINXP_MEDIA_PLAYER) {
    const windowTitle = (config.windowTitle as string) || 'Windows Media Player'
    const trackTitle =
      (config.trackTitle as string) ||
      `${githubData?.user.login || 'Dev'} - Full Stack Symphonies (2001-2026)`
    const visualizerMode = (config.visualizerMode as string) || 'Ambience : Water'
    const customTime = (config.customTime as string) || '03:42 / 04:20'

    return (
      <div className="space-y-4 pt-3 border-t border-graphite font-sans">
        <div className="flex items-center gap-2 text-[#60a5fa] text-eyebrow uppercase tracking-wider font-semibold">
          <Music size={14} />
          <span>Configurações Windows Media Player</span>
        </div>

        {renderThemePresets()}

        <div className="space-y-1.5">
          <label className="text-caption font-medium text-chalk/80">Título da Janela</label>
          <input
            type="text"
            value={windowTitle}
            onChange={(e) => handleUpdate({ windowTitle: e.target.value })}
            placeholder="Windows Media Player"
            className="w-full bg-void-black text-chalk text-note px-2.5 py-1.5 border border-graphite rounded-xs focus:outline-none focus:border-[#2989f5]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-caption font-medium text-chalk/80">Título da Música / Faixa</label>
          <input
            type="text"
            value={trackTitle}
            onChange={(e) => handleUpdate({ trackTitle: e.target.value })}
            placeholder="Nome da faixa tocando..."
            className="w-full bg-void-black text-chalk text-note px-2.5 py-1.5 border border-graphite rounded-xs focus:outline-none focus:border-[#2989f5]"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label className="text-caption font-medium text-chalk/80">Nome da Visualização</label>
            <input
              type="text"
              value={visualizerMode}
              onChange={(e) => handleUpdate({ visualizerMode: e.target.value })}
              placeholder="Ambience : Water"
              className="w-full bg-void-black text-chalk text-note px-2.5 py-1.5 border border-graphite rounded-xs focus:outline-none focus:border-[#2989f5]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-caption font-medium text-chalk/80">Tempo da Faixa</label>
            <input
              type="text"
              value={customTime}
              onChange={(e) => handleUpdate({ customTime: e.target.value })}
              placeholder="03:42 / 04:20"
              className="w-full bg-void-black text-chalk text-note px-2.5 py-1.5 border border-graphite rounded-xs focus:outline-none focus:border-[#2989f5]"
            />
          </div>
        </div>
      </div>
    )
  }

  if (widgetId === WIDGET_IDS.WINXP_PAINT) {
    const windowTitle = (config.windowTitle as string) || 'untitled - Paint'
    const artworkHeading = (config.artworkHeading as string) || 'My GitHub Artwork 🎨'
    const sortBy = (config.repoSortBy as string) || 'stars'

    const selectedRepos: string[] = Array.isArray(config.selectedRepos)
      ? (config.selectedRepos as string[])
      : []

    const allRepos = githubData?.repos ? [...githubData.repos].filter((r) => !r.fork) : []

    const sortedRepos = [...allRepos].sort((a, b) => {
      if (sortBy === 'updated')
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      if (sortBy === 'forks') return b.forks_count - a.forks_count
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return b.stargazers_count - a.stargazers_count
    })

    const filteredRepos = sortedRepos.filter((r) =>
      r.name.toLowerCase().includes(repoSearchQuery.toLowerCase())
    )

    const toggleRepo = (repoName: string) => {
      const isSelected = selectedRepos.includes(repoName)
      const next = isSelected
        ? selectedRepos.filter((name) => name !== repoName)
        : [...selectedRepos, repoName]
      handleUpdate({ selectedRepos: next })
    }

    return (
      <div className="space-y-4 pt-3 border-t border-graphite font-sans">
        <div className="flex items-center gap-2 text-[#60a5fa] text-eyebrow uppercase tracking-wider font-semibold">
          <Palette size={14} />
          <span>Configurações XP Paint Canvas</span>
        </div>

        {renderThemePresets()}

        <div className="space-y-1.5">
          <label className="text-caption font-medium text-chalk/80">
            Título da Janela do Paint
          </label>
          <input
            type="text"
            value={windowTitle}
            onChange={(e) => handleUpdate({ windowTitle: e.target.value })}
            placeholder="untitled - Paint"
            className="w-full bg-void-black text-chalk text-note px-2.5 py-1.5 border border-graphite rounded-xs focus:outline-none focus:border-[#2989f5]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-caption font-medium text-chalk/80">
            Título do Cabeçalho do Canvas
          </label>
          <input
            type="text"
            value={artworkHeading}
            onChange={(e) => handleUpdate({ artworkHeading: e.target.value })}
            placeholder="My GitHub Artwork 🎨"
            className="w-full bg-void-black text-chalk text-note px-2.5 py-1.5 border border-graphite rounded-xs focus:outline-none focus:border-[#2989f5]"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-caption text-chalk/80 mb-1">
            <ArrowUpDown size={11} />
            Ordenar Repositórios por
          </label>
          <select
            value={sortBy}
            onChange={(e) => handleUpdate({ repoSortBy: e.target.value })}
            className="w-full bg-void-black border border-graphite text-chalk text-note p-1.5 rounded-xs focus:border-[#2989f5] focus:outline-none"
          >
            <option value="stars">Mais Estrelados</option>
            <option value="updated">Atualizado Recentemente</option>
            <option value="forks">Mais Forkados</option>
            <option value="name">Nome (A–Z)</option>
          </select>
        </div>

        <div className="space-y-2 border-t border-graphite/60 pt-3">
          <div className="flex items-center justify-between">
            <label className="text-caption font-medium text-chalk/80">
              Selecionar Repositórios (Excluir / Incluir)
            </label>
            {selectedRepos.length > 0 && (
              <button
                type="button"
                onClick={() => handleUpdate({ selectedRepos: [] })}
                className="text-[10px] text-[#60a5fa] hover:underline"
              >
                Limpar seleção
              </button>
            )}
          </div>

          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ash" />
            <input
              type="text"
              value={repoSearchQuery}
              onChange={(e) => setRepoSearchQuery(e.target.value)}
              placeholder="Filtrar repositório..."
              className="w-full pl-7 pr-2 py-1.5 bg-void-black border border-graphite rounded-xs text-caption text-chalk focus:border-[#2989f5] focus:outline-none"
            />
          </div>

          <div className="max-h-40 overflow-y-auto space-y-1 p-1 bg-void-black border border-graphite rounded-xs scrollbar-thin">
            {filteredRepos.map((repo) => {
              const isChecked = selectedRepos.includes(repo.name)
              return (
                <div
                  key={repo.name}
                  onClick={() => toggleRepo(repo.name)}
                  className={`flex items-center justify-between p-1.5 rounded-xs cursor-pointer text-caption transition-colors ${
                    isChecked
                      ? 'bg-[#2989f5]/20 text-chalk'
                      : 'text-ash hover:bg-graphite/50 hover:text-chalk'
                  }`}
                >
                  <span className="truncate">{repo.name}</span>
                  <span className="text-[10px] text-[#93c5fd]">★ {repo.stargazers_count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  if (widgetId === WIDGET_IDS.WINXP_TASKBAR) {
    const customTime = (config.customTime as string) || '04:20 PM'
    const startButtonLabel = (config.startButtonLabel as string) || 'start'
    const activeWindowLabel =
      (config.activeWindowLabel as string) || `${githubData?.user.login || 'User'} - GitAscii`
    const inactiveWindowLabel = (config.inactiveWindowLabel as string) || 'Minesweeper'

    return (
      <div className="space-y-4 pt-3 border-t border-graphite font-sans">
        <div className="flex items-center gap-2 text-[#60a5fa] text-eyebrow uppercase tracking-wider font-semibold">
          <Sparkles size={14} />
          <span>Configurações XP Start Taskbar</span>
        </div>

        <div className="space-y-1.5">
          <label className="text-caption font-medium text-chalk/80">Texto do Botão Start</label>
          <input
            type="text"
            value={startButtonLabel}
            onChange={(e) => handleUpdate({ startButtonLabel: e.target.value })}
            placeholder="start"
            className="w-full bg-void-black text-chalk text-note px-2.5 py-1.5 border border-graphite rounded-xs focus:outline-none focus:border-[#2989f5]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-caption font-medium text-chalk/80">
            Nome da Janela Ativa na Barra
          </label>
          <input
            type="text"
            value={activeWindowLabel}
            onChange={(e) => handleUpdate({ activeWindowLabel: e.target.value })}
            placeholder="User - GitAscii"
            className="w-full bg-void-black text-chalk text-note px-2.5 py-1.5 border border-graphite rounded-xs focus:outline-none focus:border-[#2989f5]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-caption font-medium text-chalk/80">
            Nome da Janela Secundária
          </label>
          <input
            type="text"
            value={inactiveWindowLabel}
            onChange={(e) => handleUpdate({ inactiveWindowLabel: e.target.value })}
            placeholder="Minesweeper"
            className="w-full bg-void-black text-chalk text-note px-2.5 py-1.5 border border-graphite rounded-xs focus:outline-none focus:border-[#2989f5]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-caption font-medium text-chalk/80">
            Horário do Relógio da Bandeja
          </label>
          <input
            type="text"
            value={customTime}
            onChange={(e) => handleUpdate({ customTime: e.target.value })}
            placeholder="Ex: 04:20 PM"
            className="w-full bg-void-black text-chalk text-note px-2.5 py-1.5 border border-graphite rounded-xs focus:outline-none focus:border-[#2989f5]"
          />
        </div>
      </div>
    )
  }

  if (widgetId === WIDGET_IDS.WINXP_ERROR_DIALOG) {
    const errorTitle = (config.errorTitle as string) || 'CommitOverflow.exe - System Error'
    const errorMessage =
      (config.errorMessage as string) ||
      'An unhandled git commit overload has occurred at 0x004A9F21. The developer profile cannot stop coding.'
    const errorCode = (config.errorCode as string) || 'Error Code: 0x80004005 (E_FAIL_PERFECTION)'
    const okButtonLabel = (config.okButtonLabel as string) || 'OK'
    const cancelButtonLabel = (config.cancelButtonLabel as string) || 'Cancel'

    return (
      <div className="space-y-4 pt-3 border-t border-graphite font-sans">
        <div className="flex items-center gap-2 text-[#ef4444] text-eyebrow uppercase tracking-wider font-semibold">
          <AlertTriangle size={14} />
          <span>Configurações XP Critical Error Dialog</span>
        </div>

        {renderThemePresets()}

        <div className="space-y-1.5">
          <label className="text-caption font-medium text-chalk/80">Título da Janela de Erro</label>
          <input
            type="text"
            value={errorTitle}
            onChange={(e) => handleUpdate({ errorTitle: e.target.value })}
            placeholder="Título do erro..."
            className="w-full bg-void-black text-chalk text-note px-2.5 py-1.5 border border-graphite rounded-xs focus:outline-none focus:border-[#2989f5]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-caption font-medium text-chalk/80">Mensagem de Erro</label>
          <textarea
            rows={3}
            value={errorMessage}
            onChange={(e) => handleUpdate({ errorMessage: e.target.value })}
            placeholder="Descrição do erro..."
            className="w-full bg-void-black text-chalk text-note px-2.5 py-1.5 border border-graphite rounded-xs focus:outline-none focus:border-[#2989f5] resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-caption font-medium text-chalk/80">Código de Erro</label>
          <input
            type="text"
            value={errorCode}
            onChange={(e) => handleUpdate({ errorCode: e.target.value })}
            placeholder="Ex: Error Code: 0x80004005"
            className="w-full bg-void-black text-chalk text-note px-2.5 py-1.5 border border-graphite rounded-xs focus:outline-none focus:border-[#2989f5]"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label className="text-caption font-medium text-chalk/80">Botão Primário</label>
            <input
              type="text"
              value={okButtonLabel}
              onChange={(e) => handleUpdate({ okButtonLabel: e.target.value })}
              placeholder="OK"
              className="w-full bg-void-black text-chalk text-note px-2.5 py-1.5 border border-graphite rounded-xs focus:outline-none focus:border-[#2989f5]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-caption font-medium text-chalk/80">Botão Secundário</label>
            <input
              type="text"
              value={cancelButtonLabel}
              onChange={(e) => handleUpdate({ cancelButtonLabel: e.target.value })}
              placeholder="Cancel"
              className="w-full bg-void-black text-chalk text-note px-2.5 py-1.5 border border-graphite rounded-xs focus:outline-none focus:border-[#2989f5]"
            />
          </div>
        </div>
      </div>
    )
  }

  if (widgetId === WIDGET_IDS.WINXP_SYSTEM_PROPERTIES) {
    const windowTitle = (config.windowTitle as string) || 'System Properties'
    const activeTab = (config.activeTab as string) || 'Languages'
    const layout = (config.langsLayout as string) || 'bars'
    const displayMode =
      (config.langDisplayMode as 'icon_name' | 'icon_only' | 'name_only') || 'icon_name'
    const langsCount = Number(config.langsCount) || 5
    const showPercentage = config.showPercentage !== false

    const hideLangs: string[] = Array.isArray(config.hideLangsArr)
      ? (config.hideLangsArr as string[])
      : typeof config.hideLangs === 'string' && config.hideLangs
        ? (config.hideLangs as string)
            .split(',')
            .map((l) => l.trim())
            .filter(Boolean)
        : []

    const updateHideLangs = (langs: string[]) => {
      handleUpdate({
        hideLangsArr: langs,
        hideLangs: langs.join(','),
      })
    }

    const addHideLang = (lang: string) => {
      const trimmed = lang.trim()
      if (!trimmed || hideLangs.some((l) => l.toLowerCase() === trimmed.toLowerCase())) return
      updateHideLangs([...hideLangs, trimmed])
    }

    const removeHideLang = (lang: string) => {
      updateHideLangs(hideLangs.filter((l) => l !== lang))
    }

    return (
      <div className="space-y-4 pt-3 border-t border-graphite font-sans">
        <div className="flex items-center gap-2 text-[#60a5fa] text-eyebrow uppercase tracking-wider font-semibold">
          <Monitor size={14} />
          <span>Configurações XP System Properties</span>
        </div>

        {renderThemePresets()}

        <div className="space-y-1.5">
          <label className="text-caption font-medium text-chalk/80">Título da Janela</label>
          <input
            type="text"
            value={windowTitle}
            onChange={(e) => handleUpdate({ windowTitle: e.target.value })}
            placeholder="System Properties"
            className="w-full bg-void-black text-chalk text-note px-2.5 py-1.5 border border-graphite rounded-xs focus:outline-none focus:border-[#2989f5]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-caption font-medium text-chalk/80">Aba Ativa</label>
          <input
            type="text"
            value={activeTab}
            onChange={(e) => handleUpdate({ activeTab: e.target.value })}
            placeholder="Languages"
            className="w-full bg-void-black text-chalk text-note px-2.5 py-1.5 border border-graphite rounded-xs focus:outline-none focus:border-[#2989f5]"
          />
        </div>

        <div>
          <label className="text-caption text-chalk/80 block mb-1">
            Modo de Exibição das Linguagens
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'icon_name', label: 'Ícone + Nome' },
              { id: 'icon_only', label: 'Somente Ícone' },
              { id: 'name_only', label: 'Somente Nome' },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => handleUpdate({ langDisplayMode: mode.id })}
                className={`py-1.5 px-1.5 rounded-xs text-[11px] transition-all border text-center ${
                  displayMode === mode.id
                    ? 'bg-[#2989f5] text-white border-[#2989f5] font-semibold shadow-xs'
                    : 'bg-void-black text-ash border-graphite hover:text-chalk hover:border-slate'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between text-caption mb-1">
            <span className="text-chalk/80">Qtd. de Linguagens Visíveis</span>
            <span className="text-chalk font-mono">{langsCount}</span>
          </div>
          <input
            type="range"
            min="1"
            max="8"
            value={langsCount}
            onChange={(e) => handleUpdate({ langsCount: parseInt(e.target.value, 10) })}
            className="w-full accent-[#2989f5] h-1 bg-graphite rounded cursor-pointer"
          />
        </div>

        <div>
          <label className="text-caption text-chalk/80 block mb-1">Modo de Layout</label>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'bars', label: 'Barras de Progresso' },
              { id: 'list', label: 'Lista de Drivers' },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => handleUpdate({ langsLayout: mode.id })}
                className={`py-1.5 px-2 rounded-xs text-caption transition-all border ${
                  layout === mode.id
                    ? 'bg-[#2989f5] text-white border-[#2989f5] font-semibold'
                    : 'bg-void-black text-ash border-graphite hover:text-chalk hover:border-slate'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-2 bg-void-black rounded-xs border border-graphite">
          <label className="text-caption text-chalk cursor-pointer">Exibir Porcentagem (%)</label>
          <Switch
            checked={showPercentage}
            onChange={(checked) => handleUpdate({ showPercentage: checked })}
          />
        </div>

        <div className="space-y-2 border-t border-graphite/60 pt-3">
          <label className="text-caption font-medium text-chalk/80 block">
            {t('editor.langs.hide_langs', 'Linguagens Ocultas')}
          </label>

          {hideLangs.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {hideLangs.map((lang) => (
                <span
                  key={lang}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-graphite text-chalk text-[11px] rounded-xs border border-slate"
                >
                  {lang}
                  <X
                    size={10}
                    className="cursor-pointer hover:text-red-400"
                    onClick={() => removeHideLang(lang)}
                  />
                </span>
              ))}
            </div>
          )}

          <div>
            <p className="text-[11px] text-ash/80 mb-1.5">
              {t('editor.langs.quick_hide', 'Ocultar rapidamente:')}
            </p>
            <div className="flex flex-wrap gap-1">
              {COMMON_LANGUAGES.filter(
                (l) => !hideLangs.some((h) => h.toLowerCase() === l.toLowerCase())
              )
                .slice(0, 14)
                .map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => addHideLang(lang)}
                    className="text-[10px] bg-void-black border border-graphite hover:border-[#2989f5] hover:text-chalk text-ash px-1.5 py-0.5 rounded-xs transition-colors cursor-pointer"
                  >
                    {lang}
                  </button>
                ))}
            </div>
          </div>

          <div className="flex gap-1.5">
            <input
              type="text"
              value={langCustomInput}
              onChange={(e) => setLangCustomInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addHideLang(langCustomInput)
                  setLangCustomInput('')
                }
              }}
              placeholder="Ex: HTML, Markdown, Shell..."
              className="flex-1 bg-void-black text-chalk text-caption px-2.5 py-1 border border-graphite rounded-xs focus:border-[#2989f5] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                addHideLang(langCustomInput)
                setLangCustomInput('')
              }}
              className="px-2.5 py-1 bg-[#2989f5] hover:bg-[#1d4ed8] text-white text-caption rounded-xs font-semibold"
            >
              Adicionar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
