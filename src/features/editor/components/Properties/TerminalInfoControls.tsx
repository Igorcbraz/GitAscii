'use client'

import {
  BarChart2,
  CheckSquare,
  ChevronDown,
  Edit3,
  Globe,
  Sparkles,
  Terminal,
  User,
} from 'lucide-react'
import React, { useState } from 'react'

import { Switch } from '@/components/ui/Switch'
import { GLOBAL_COLOR_THEMES } from '@/constants'
import { useI18n } from '@/i18n'

import { useEditorStore } from '../../store/editorStore'
import { ColorPicker } from './ColorPicker'

interface TerminalInfoControlsProps {
  instanceId: string
  config: Record<string, unknown>
}

export function TerminalInfoControls({ instanceId, config }: TerminalInfoControlsProps) {
  const { t } = useI18n()
  const { githubData, updateWidgetConfig } = useEditorStore()
  const [activeTab, setActiveTab] = useState<'toggles' | 'custom'>('toggles')
  const [openAccordion, setOpenAccordion] = useState<'profile' | 'contact' | 'stats'>('profile')
  const [selectedThemeCategory, setSelectedThemeCategory] = useState<string>('all')

  const user = githubData?.user

  const showMainSection = config.showMainSection !== false
  const showContactSection = config.showContactSection !== false
  const showStatsSection = config.showStatsSection !== false

  const showUptime = config.showUptime !== false
  const showLocation = config.showLocation !== false
  const showCompany = config.showCompany !== false
  const showLanguages = config.showLanguages !== false
  const showJoined = Boolean(config.showJoined)
  const showStatus = Boolean(config.showStatus)
  const showPronouns = Boolean(config.showPronouns)
  const showTimezone = Boolean(config.showTimezone)
  const showAchievements = Boolean(config.showAchievements)
  const showHighlights = Boolean(config.showHighlights)

  const showWebsite = config.showWebsite !== false
  const showGithub = config.showGithub !== false
  const showTwitter = Boolean(config.showTwitter)
  const showEmail = Boolean(config.showEmail)
  const showOrgs = Boolean(config.showOrgs)

  const showRepos = config.showRepos !== false
  const showStars = config.showStars !== false
  const showCommits = config.showCommits !== false
  const showFollowers = config.showFollowers !== false
  const showFollowing = Boolean(config.showFollowing)
  const showGists = Boolean(config.showGists)

  const dotLeaders = config.dotLeaders !== false

  const customContactTitle = (config.customContactTitle as string) || ''
  const customStatsTitle = (config.customStatsTitle as string) || ''

  const customUptime = (config.customUptime as string) || ''
  const customLocation = (config.customLocation as string) || ''
  const customCompany = (config.customCompany as string) || ''
  const customLanguages = (config.customLanguages as string) || ''
  const customStatus = (config.customStatus as string) || ''
  const customAchievements = (config.customAchievements as string) || ''
  const customHighlights = (config.customHighlights as string) || ''

  const customWebsite = (config.customWebsite as string) || ''
  const customGithub = (config.customGithub as string) || ''
  const customTwitter = (config.customTwitter as string) || ''
  const customEmail = (config.customEmail as string) || ''
  const customOrgs = (config.customOrgs as string) || ''

  const customCommits = (config.customCommits as string) || ''
  const customFollowing = (config.customFollowing as string) || ''
  const customGists = (config.customGists as string) || ''

  const headerColor = (config.headerColor as string) || '#58a6ff'
  const labelColor = (config.labelColor as string) || '#ffa657'
  const dotColor = (config.dotColor as string) || '#484f58'
  const valueColor = (config.valueColor as string) || '#c9d1d9'
  const statsValColor = (config.statsValColor as string) || '#79c0ff'
  const dividerColor = (config.dividerColor as string) || '#3d444d'

  const filteredThemes =
    selectedThemeCategory === 'all'
      ? GLOBAL_COLOR_THEMES
      : GLOBAL_COLOR_THEMES.filter((thm) => thm.category === selectedThemeCategory)

  const applyColorTheme = (theme: (typeof GLOBAL_COLOR_THEMES)[number]) => {
    updateWidgetConfig(instanceId, {
      headerColor: theme.headerColor || theme.accent,
      labelColor: theme.labelColor || theme.secondary,
      dotColor: theme.dotColor || '#484f58',
      valueColor: theme.valueColor || theme.text,
      statsValColor: theme.statsValColor || theme.accent,
      dividerColor: theme.dividerColor || theme.border,
    })
  }

  const renderToggleChip = (key: string, label: string, isActive: boolean) => (
    <button
      key={key}
      type="button"
      onClick={() => updateWidgetConfig(instanceId, { [key]: !isActive })}
      className={`px-2.5 py-1.5 rounded-xs border text-eyebrow font-medium flex items-center justify-between transition-all cursor-pointer ${
        isActive
          ? 'bg-signal-lime/15 border-signal-lime text-signal-lime font-semibold shadow-xs'
          : 'bg-graphite/40 border-graphite/80 text-ash hover:text-chalk hover:border-slate'
      }`}
    >
      <span className="truncate mr-1">{label}</span>
      <div
        className={`w-3.5 h-3.5 rounded-[2px] flex items-center justify-center text-[10px] ${
          isActive
            ? 'bg-signal-lime text-black font-bold'
            : 'border border-graphite text-transparent'
        }`}
      >
        ✓
      </div>
    </button>
  )

  const flatInputClass =
    'w-full bg-graphite border border-graphite text-chalk text-[11px] px-2.5 py-1.5 rounded-xs focus:border-signal-lime focus:outline-none shadow-none font-jetbrains-mono'
  const flatInputClassText =
    'w-full bg-graphite border border-graphite text-ash text-[10px] px-2.5 py-1.5 rounded-xs focus:border-signal-lime focus:outline-none shadow-none'

  return (
    <div className="space-y-4 pt-3 border-t border-graphite font-inter-tight">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-signal-lime text-eyebrow uppercase tracking-wider font-semibold">
          <Terminal size={14} />
          <span>{t('editor.terminal.title', 'Configuração do Terminal')}</span>
        </div>
      </div>

      <div className="p-3 bg-carbon rounded-sm border border-graphite space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-signal-lime text-eyebrow font-semibold uppercase tracking-wider">
            <Sparkles size={13} />
            <span>{t('editor.terminal.color_presets', 'Presets de Cores & Estilo')}</span>
          </div>
          <div className="flex gap-1">
            {['all', 'terminal', 'dracula', 'cyberpunk', 'synthwave'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedThemeCategory(cat)}
                className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-xs font-semibold cursor-pointer border ${
                  selectedThemeCategory === cat
                    ? 'bg-signal-lime text-black border-signal-lime'
                    : 'bg-graphite text-ash border-graphite hover:text-chalk'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {filteredThemes.map((thm) => {
            const isMatch =
              thm.headerColor === headerColor &&
              thm.labelColor === labelColor &&
              thm.valueColor === valueColor
            return (
              <button
                key={thm.name}
                type="button"
                onClick={() => applyColorTheme(thm)}
                className={`p-2 rounded-xs border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                  isMatch
                    ? 'bg-signal-lime/10 border-signal-lime shadow-xs'
                    : 'bg-graphite/50 border-graphite hover:border-ash/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[11px] font-semibold truncate ${
                      isMatch ? 'text-signal-lime' : 'text-chalk'
                    }`}
                  >
                    {thm.name}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <span
                      className="w-2 h-2 rounded-full border border-black/40"
                      style={{ backgroundColor: thm.accent }}
                    />
                    <span
                      className="w-2 h-2 rounded-full border border-black/40"
                      style={{ backgroundColor: thm.secondary }}
                    />
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="pt-2 border-t border-graphite/60 space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <ColorPicker
              label={t('editor.terminal.color_headers', 'Títulos')}
              align="left"
              value={headerColor}
              onChange={(c) => updateWidgetConfig(instanceId, { headerColor: c })}
            />
            <ColorPicker
              label={t('editor.terminal.color_labels', 'Rótulos (. Key)')}
              align="right"
              value={labelColor}
              onChange={(c) => updateWidgetConfig(instanceId, { labelColor: c })}
            />
            <ColorPicker
              label={t('editor.terminal.color_dots', 'Pontos (...)')}
              align="left"
              value={dotColor}
              onChange={(c) => updateWidgetConfig(instanceId, { dotColor: c })}
            />
            <ColorPicker
              label={t('editor.terminal.color_values', 'Valores')}
              align="right"
              value={valueColor}
              onChange={(c) => updateWidgetConfig(instanceId, { valueColor: c })}
            />
            <ColorPicker
              label={t('editor.terminal.color_metrics', 'Métricas')}
              align="left"
              value={statsValColor}
              onChange={(c) => updateWidgetConfig(instanceId, { statsValColor: c })}
            />
            <ColorPicker
              label={t('editor.terminal.color_dividers', 'Divisores')}
              align="right"
              value={dividerColor}
              onChange={(c) => updateWidgetConfig(instanceId, { dividerColor: c })}
            />
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-graphite/40">
            <div>
              <span className="text-eyebrow text-chalk font-medium block">
                {t('editor.terminal.dot_leaders', 'Preencher Espaços com Pontos')}
              </span>
              <span className="text-[10px] text-ash block">
                {t('editor.terminal.dot_leaders_desc', 'Ajusta pontilhado automático (...)')}
              </span>
            </div>
            <Switch
              checked={dotLeaders}
              onChange={(checkedValue) =>
                updateWidgetConfig(instanceId, { dotLeaders: checkedValue })
              }
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1 bg-carbon p-1 rounded-sm border border-graphite">
        <button
          type="button"
          onClick={() => setActiveTab('toggles')}
          className={`py-1.5 text-caption font-medium rounded-xs transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'toggles'
              ? 'bg-graphite text-signal-lime border border-signal-lime/40 font-semibold shadow-xs'
              : 'text-ash hover:text-chalk'
          }`}
        >
          <CheckSquare size={12} className="shrink-0" />
          <span>{t('editor.terminal.tab_fields', 'Ativar Campos')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('custom')}
          className={`py-1.5 text-caption font-medium rounded-xs transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'custom'
              ? 'bg-graphite text-signal-lime border border-signal-lime/40 font-semibold shadow-xs'
              : 'text-ash hover:text-chalk'
          }`}
        >
          <Edit3 size={12} className="shrink-0" />
          <span>{t('editor.terminal.tab_texts', 'Textos/Valores')}</span>
        </button>
      </div>

      {activeTab === 'toggles' && (
        <div className="space-y-4">
          <div className="space-y-1.5 bg-carbon p-2.5 rounded-sm border border-graphite">
            <div className="label-stamp text-caption text-ash mb-1">
              {t('editor.terminal.sections_displayed', '[ SEÇÕES EXIBIDAS ]')}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() =>
                  updateWidgetConfig(instanceId, { showMainSection: !showMainSection })
                }
                className={`py-1 px-2 rounded-xs text-caption border transition-all text-center cursor-pointer ${
                  showMainSection
                    ? 'bg-signal-lime/15 border-signal-lime text-signal-lime font-semibold'
                    : 'bg-graphite text-ash border-graphite line-through opacity-60'
                }`}
              >
                {t('editor.terminal.section_profile', 'Perfil / Info')}
              </button>
              <button
                type="button"
                onClick={() =>
                  updateWidgetConfig(instanceId, { showContactSection: !showContactSection })
                }
                className={`py-1 px-2 rounded-xs text-caption border transition-all text-center cursor-pointer ${
                  showContactSection
                    ? 'bg-signal-lime/15 border-signal-lime text-signal-lime font-semibold'
                    : 'bg-graphite text-ash border-graphite line-through opacity-60'
                }`}
              >
                {t('editor.terminal.section_contact', 'Contatos')}
              </button>
              <button
                type="button"
                onClick={() =>
                  updateWidgetConfig(instanceId, { showStatsSection: !showStatsSection })
                }
                className={`py-1 px-2 rounded-xs text-caption border transition-all text-center cursor-pointer ${
                  showStatsSection
                    ? 'bg-signal-lime/15 border-signal-lime text-signal-lime font-semibold'
                    : 'bg-graphite text-ash border-graphite line-through opacity-60'
                }`}
              >
                {t('editor.terminal.section_stats', 'Métricas')}
              </button>
            </div>
          </div>

          {showMainSection && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-eyebrow font-medium text-chalk">
                <span className="flex items-center gap-1.5 text-signal-lime">
                  <User size={13} />
                  <span>{t('editor.terminal.profile_info', 'Informações do Perfil')}</span>
                </span>
                <span className="text-caption text-ash font-jetbrains-mono">
                  {t('editor.terminal.profile_info_hint', '(ON por padrão / extras OFF)')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {renderToggleChip('showUptime', '. Uptime', showUptime)}
                {renderToggleChip('showLocation', '. Location', showLocation)}
                {renderToggleChip('showCompany', '. Company', showCompany)}
                {renderToggleChip('showLanguages', '. Languages', showLanguages)}

                {renderToggleChip('showFollowing', '. Following', showFollowing)}
                {renderToggleChip('showJoined', '. Joined', showJoined)}
                {renderToggleChip('showStatus', '. Status', showStatus)}
                {renderToggleChip('showTimezone', '. Timezone', showTimezone)}
                {renderToggleChip('showPronouns', '. Pronouns', showPronouns)}
                {renderToggleChip('showAchievements', '. Achievements', showAchievements)}
                {renderToggleChip('showHighlights', '. Highlights', showHighlights)}
              </div>
            </div>
          )}

          {showContactSection && (
            <div className="space-y-2 pt-2 border-t border-graphite/50">
              <div className="flex items-center justify-between text-eyebrow font-medium text-chalk">
                <span className="flex items-center gap-1.5 text-signal-lime">
                  <Globe size={13} />
                  <span>{t('editor.terminal.contact_networks', 'Contatos & Redes')}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {renderToggleChip('showWebsite', '. Website', showWebsite)}
                {renderToggleChip('showGithub', '. GitHub', showGithub)}
                {renderToggleChip('showTwitter', '. Twitter / X', showTwitter)}
                {renderToggleChip('showEmail', '. Email', showEmail)}
                {renderToggleChip('showOrgs', '. Orgs', showOrgs)}
              </div>
            </div>
          )}

          {showStatsSection && (
            <div className="space-y-2 pt-2 border-t border-graphite/50">
              <div className="flex items-center justify-between text-eyebrow font-medium text-chalk">
                <span className="flex items-center gap-1.5 text-signal-lime">
                  <BarChart2 size={13} />
                  <span>{t('editor.terminal.metrics_stats', 'Métricas & Stats')}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {renderToggleChip('showRepos', '. Repos', showRepos)}
                {renderToggleChip('showStars', '. Stars', showStars)}
                {renderToggleChip('showCommits', '. Commits', showCommits)}
                {renderToggleChip('showFollowers', '. Followers', showFollowers)}
                {renderToggleChip('showGists', '. Gists', showGists)}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'custom' && (
        <div className="space-y-3">
          <p className="text-eyebrow text-ash">
            {t(
              'editor.terminal.custom_desc',
              'Altere os títulos das seções ou valores das linhas se quiser personalizar além dos dados automáticos do GitHub.'
            )}
          </p>

          <div className="bg-carbon border border-graphite rounded-sm overflow-hidden">
            <button
              type="button"
              onClick={() =>
                setOpenAccordion(openAccordion === 'profile' ? ('' as any) : 'profile')
              }
              className="w-full p-2.5 flex items-center justify-between text-left hover:bg-graphite/40 transition-colors cursor-pointer"
            >
              <span className="text-eyebrow font-semibold text-chalk flex items-center gap-2">
                <User size={13} className="text-signal-lime" />
                <span>{t('editor.terminal.profile_texts', 'Textos do Perfil')}</span>
              </span>
              <ChevronDown
                size={14}
                className={`text-ash transition-transform ${openAccordion === 'profile' ? 'rotate-180' : ''}`}
              />
            </button>

            {openAccordion === 'profile' && (
              <div className="p-3 border-t border-graphite/60 space-y-2.5 bg-void-black/40">
                <div>
                  <label className="text-caption text-ash block mb-0.5">
                    {t('editor.terminal.custom_uptime', 'Custom Uptime')}
                  </label>
                  <input
                    type="text"
                    value={customUptime}
                    onChange={(e) =>
                      updateWidgetConfig(instanceId, { customUptime: e.target.value })
                    }
                    placeholder={t(
                      'editor.terminal.auto_uptime',
                      'Automático (ex: 5 years, 3 months...)'
                    )}
                    className={flatInputClassText}
                  />
                </div>

                <div>
                  <label className="text-caption text-ash block mb-0.5">
                    {t('editor.terminal.custom_location', 'Custom Location')}
                  </label>
                  <input
                    type="text"
                    value={customLocation}
                    onChange={(e) =>
                      updateWidgetConfig(instanceId, { customLocation: e.target.value })
                    }
                    placeholder={user?.location || 'São Paulo'}
                    className={flatInputClassText}
                  />
                </div>

                <div>
                  <label className="text-caption text-ash block mb-0.5">
                    {t('editor.terminal.custom_company', 'Custom Company')}
                  </label>
                  <input
                    type="text"
                    value={customCompany}
                    onChange={(e) =>
                      updateWidgetConfig(instanceId, { customCompany: e.target.value })
                    }
                    placeholder={user?.company || '@Empresa'}
                    className={flatInputClassText}
                  />
                </div>

                <div>
                  <label className="text-caption text-ash block mb-0.5">
                    {t('editor.terminal.custom_languages', 'Custom Languages')}
                  </label>
                  <input
                    type="text"
                    value={customLanguages}
                    onChange={(e) =>
                      updateWidgetConfig(instanceId, { customLanguages: e.target.value })
                    }
                    placeholder="TypeScript, JavaScript, Vue..."
                    className={flatInputClassText}
                  />
                </div>

                <div>
                  <label className="text-caption text-ash block mb-0.5">
                    {t('editor.terminal.custom_status', 'Custom Status')}
                  </label>
                  <input
                    type="text"
                    value={customStatus}
                    onChange={(e) =>
                      updateWidgetConfig(instanceId, { customStatus: e.target.value })
                    }
                    placeholder="🚀 Building awesome tools"
                    className={flatInputClassText}
                  />
                </div>

                <div>
                  <label className="text-caption text-ash block mb-0.5">
                    {t('editor.terminal.custom_achievements', 'Custom Achievements')}
                  </label>
                  <input
                    type="text"
                    value={customAchievements}
                    onChange={(e) =>
                      updateWidgetConfig(instanceId, { customAchievements: e.target.value })
                    }
                    placeholder="Arctic Vault, PR Shark, Pro"
                    className={flatInputClassText}
                  />
                </div>

                <div>
                  <label className="text-caption text-ash block mb-0.5">
                    {t('editor.terminal.custom_highlights', 'Custom Highlights')}
                  </label>
                  <input
                    type="text"
                    value={customHighlights}
                    onChange={(e) =>
                      updateWidgetConfig(instanceId, { customHighlights: e.target.value })
                    }
                    placeholder="GitHub Star, Pro Developer"
                    className={flatInputClassText}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-carbon border border-graphite rounded-sm overflow-hidden">
            <button
              type="button"
              onClick={() =>
                setOpenAccordion(openAccordion === 'contact' ? ('' as any) : 'contact')
              }
              className="w-full p-2.5 flex items-center justify-between text-left hover:bg-graphite/40 transition-colors cursor-pointer"
            >
              <span className="text-eyebrow font-semibold text-chalk flex items-center gap-2">
                <Globe size={13} className="text-signal-lime" />
                <span>{t('editor.terminal.contact_texts', 'Textos de Contato & Links')}</span>
              </span>
              <ChevronDown
                size={14}
                className={`text-ash transition-transform ${openAccordion === 'contact' ? 'rotate-180' : ''}`}
              />
            </button>

            {openAccordion === 'contact' && (
              <div className="p-3 border-t border-graphite/60 space-y-2.5 bg-void-black/40">
                <div>
                  <label className="text-caption text-ash block mb-0.5">
                    {t('editor.terminal.contact_title', 'Título da Seção de Contatos')}
                  </label>
                  <input
                    type="text"
                    value={customContactTitle}
                    onChange={(e) =>
                      updateWidgetConfig(instanceId, { customContactTitle: e.target.value })
                    }
                    placeholder="contact"
                    className={flatInputClass}
                  />
                </div>

                <div>
                  <label className="text-caption text-ash block mb-0.5">
                    {t('editor.terminal.custom_website', 'Custom Website')}
                  </label>
                  <input
                    type="text"
                    value={customWebsite}
                    onChange={(e) =>
                      updateWidgetConfig(instanceId, { customWebsite: e.target.value })
                    }
                    placeholder={user?.blog || 'https://meusite.com'}
                    className={flatInputClassText}
                  />
                </div>

                <div>
                  <label className="text-caption text-ash block mb-0.5">
                    {t('editor.terminal.custom_github', 'Custom GitHub')}
                  </label>
                  <input
                    type="text"
                    value={customGithub}
                    onChange={(e) =>
                      updateWidgetConfig(instanceId, { customGithub: e.target.value })
                    }
                    placeholder={
                      user?.login ? `https://github.com/${user.login}` : 'https://github.com/user'
                    }
                    className={flatInputClassText}
                  />
                </div>

                <div>
                  <label className="text-caption text-ash block mb-0.5">
                    {t('editor.terminal.custom_twitter', 'Custom Twitter')}
                  </label>
                  <input
                    type="text"
                    value={customTwitter}
                    onChange={(e) =>
                      updateWidgetConfig(instanceId, { customTwitter: e.target.value })
                    }
                    placeholder={user?.twitter_username ? `@${user.twitter_username}` : '@user'}
                    className={flatInputClassText}
                  />
                </div>

                <div>
                  <label className="text-caption text-ash block mb-0.5">
                    {t('editor.terminal.custom_email', 'Custom Email')}
                  </label>
                  <input
                    type="text"
                    value={customEmail}
                    onChange={(e) =>
                      updateWidgetConfig(instanceId, { customEmail: e.target.value })
                    }
                    placeholder={user?.email || 'user@domain.com'}
                    className={flatInputClassText}
                  />
                </div>

                <div>
                  <label className="text-caption text-ash block mb-0.5">
                    {t('editor.terminal.custom_orgs', 'Custom Organizations')}
                  </label>
                  <input
                    type="text"
                    value={customOrgs}
                    onChange={(e) => updateWidgetConfig(instanceId, { customOrgs: e.target.value })}
                    placeholder="@org1, @org2"
                    className={flatInputClassText}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-carbon border border-graphite rounded-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenAccordion(openAccordion === 'stats' ? ('' as any) : 'stats')}
              className="w-full p-2.5 flex items-center justify-between text-left hover:bg-graphite/40 transition-colors cursor-pointer"
            >
              <span className="text-eyebrow font-semibold text-chalk flex items-center gap-2">
                <BarChart2 size={13} className="text-signal-lime" />
                <span>{t('editor.terminal.stats_texts', 'Textos de Métricas / Stats')}</span>
              </span>
              <ChevronDown
                size={14}
                className={`text-ash transition-transform ${openAccordion === 'stats' ? 'rotate-180' : ''}`}
              />
            </button>

            {openAccordion === 'stats' && (
              <div className="p-3 border-t border-graphite/60 space-y-2.5 bg-void-black/40">
                <div>
                  <label className="text-caption text-ash block mb-0.5">
                    {t('editor.terminal.stats_title', 'Título da Seção de Métricas')}
                  </label>
                  <input
                    type="text"
                    value={customStatsTitle}
                    onChange={(e) =>
                      updateWidgetConfig(instanceId, { customStatsTitle: e.target.value })
                    }
                    placeholder="stats"
                    className={flatInputClass}
                  />
                </div>

                <div>
                  <label className="text-caption text-ash block mb-0.5">
                    {t('editor.terminal.custom_commits', 'Custom Commits Count')}
                  </label>
                  <input
                    type="text"
                    value={customCommits}
                    onChange={(e) =>
                      updateWidgetConfig(instanceId, { customCommits: e.target.value })
                    }
                    placeholder="1,420"
                    className={flatInputClassText}
                  />
                </div>

                <div>
                  <label className="text-caption text-ash block mb-0.5">
                    {t('editor.terminal.custom_following', 'Custom Following Count')}
                  </label>
                  <input
                    type="text"
                    value={customFollowing}
                    onChange={(e) =>
                      updateWidgetConfig(instanceId, { customFollowing: e.target.value })
                    }
                    placeholder="42"
                    className={flatInputClassText}
                  />
                </div>

                <div>
                  <label className="text-caption text-ash block mb-0.5">
                    {t('editor.terminal.custom_gists', 'Custom Gists Count')}
                  </label>
                  <input
                    type="text"
                    value={customGists}
                    onChange={(e) =>
                      updateWidgetConfig(instanceId, { customGists: e.target.value })
                    }
                    placeholder="12"
                    className={flatInputClassText}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
