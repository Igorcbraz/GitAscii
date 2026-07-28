'use client';

import React, { useState } from 'react';
import {
  Terminal,
  Palette,
  Sliders,
  ChevronDown,
  User,
  Globe,
  BarChart2,
  CheckSquare,
  Edit3,
  Sparkles,
} from 'lucide-react';
import { ColorPicker } from './ColorPicker';
import { useEditorStore } from '../../store/editorStore';

interface TerminalInfoControlsProps {
  instanceId: string;
  config: Record<string, unknown>;
}

export function TerminalInfoControls({ instanceId, config }: TerminalInfoControlsProps) {
  const { githubData, updateWidgetConfig } = useEditorStore();
  const [activeTab, setActiveTab] = useState<'toggles' | 'custom' | 'style'>('toggles');
  const [openAccordion, setOpenAccordion] = useState<'profile' | 'contact' | 'stats'>('profile');

  const user = githubData?.user;

  const showMainSection = config.showMainSection !== false;
  const showContactSection = config.showContactSection !== false;
  const showStatsSection = config.showStatsSection !== false;

  const showUptime = config.showUptime !== false;
  const showLocation = config.showLocation !== false;
  const showCompany = config.showCompany !== false;
  const showLanguages = config.showLanguages !== false;
  const showJoined = Boolean(config.showJoined);
  const showStatus = Boolean(config.showStatus);
  const showPronouns = Boolean(config.showPronouns);
  const showTimezone = Boolean(config.showTimezone);
  const showAchievements = Boolean(config.showAchievements);
  const showHighlights = Boolean(config.showHighlights);

  const showWebsite = config.showWebsite !== false;
  const showGithub = config.showGithub !== false;
  const showTwitter = Boolean(config.showTwitter);
  const showEmail = Boolean(config.showEmail);
  const showOrgs = Boolean(config.showOrgs);

  const showRepos = config.showRepos !== false;
  const showStars = config.showStars !== false;
  const showCommits = config.showCommits !== false;
  const showFollowers = config.showFollowers !== false;
  const showFollowing = Boolean(config.showFollowing);
  const showGists = Boolean(config.showGists);

  const dotLeaders = config.dotLeaders !== false;

  const customTitle = (config.customTitle as string) || '';
  const customContactTitle = (config.customContactTitle as string) || '';
  const customStatsTitle = (config.customStatsTitle as string) || '';

  const customUptime = (config.customUptime as string) || '';
  const customLocation = (config.customLocation as string) || '';
  const customCompany = (config.customCompany as string) || '';
  const customLanguages = (config.customLanguages as string) || '';
  const customJoined = (config.customJoined as string) || '';
  const customStatus = (config.customStatus as string) || '';
  const customPronouns = (config.customPronouns as string) || '';
  const customTimezone = (config.customTimezone as string) || '';
  const customAchievements = (config.customAchievements as string) || '';
  const customHighlights = (config.customHighlights as string) || '';

  const customWebsite = (config.customWebsite as string) || '';
  const customGithub = (config.customGithub as string) || '';
  const customTwitter = (config.customTwitter as string) || '';
  const customEmail = (config.customEmail as string) || '';
  const customOrgs = (config.customOrgs as string) || '';

  const customCommits = (config.customCommits as string) || '';
  const customFollowing = (config.customFollowing as string) || '';
  const customGists = (config.customGists as string) || '';

  const headerColor = (config.headerColor as string) || '#58a6ff';
  const labelColor = (config.labelColor as string) || '#ffa657';
  const dotColor = (config.dotColor as string) || '#484f58';
  const valueColor = (config.valueColor as string) || '#c9d1d9';
  const statsValColor = (config.statsValColor as string) || '#79c0ff';
  const dividerColor = (config.dividerColor as string) || '#3d444d';

  const renderToggleChip = (
    key: string,
    label: string,
    isActive: boolean
  ) => (
    <button
      key={key}
      type="button"
      onClick={() => updateWidgetConfig(instanceId, { [key]: !isActive })}
      className={`px-2.5 py-1.5 rounded-sm border text-eyebrow font-medium flex items-center justify-between transition-all cursor-pointer ${isActive
        ? 'bg-signal-lime/10 border-signal-lime text-signal-lime font-semibold'
        : 'bg-graphite/60 border-graphite text-ash hover:text-chalk hover:border-slate'
        }`}
    >
      <span className="truncate mr-1">{label}</span>
      <div
        className={`w-3.5 h-3.5 rounded flex items-center justify-center text-caption ${isActive ? 'bg-signal-lime text-black font-bold' : 'border border-graphite text-transparent'
          }`}
      >
        ✓
      </div>
    </button>
  );

  const flatInputClass =
    'w-full bg-graphite border border-graphite text-chalk text-[11px] px-2 py-1 rounded focus:border-signal-lime focus:outline-none shadow-none focus:shadow-none focus:ring-0 font-jetbrains-mono';
  const flatInputClassText =
    'w-full bg-graphite border border-graphite text-ash text-[10px] px-2 py-1 rounded focus:border-signal-lime focus:outline-none shadow-none focus:shadow-none focus:ring-0';

  return (
    <div className="space-y-4 pt-3 border-t border-graphite font-inter-tight">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-signal-lime text-eyebrow uppercase tracking-wider font-semibold">
          <Terminal size={14} />
          <span>Configuração do Terminal</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1 bg-carbon p-1 rounded border border-graphite">
        <button
          type="button"
          onClick={() => setActiveTab('toggles')}
          className={`py-1.5 text-caption font-medium rounded transition-all text-center flex items-center justify-center gap-1.5 ${activeTab === 'toggles'
            ? 'bg-graphite text-signal-lime border border-signal-lime/40 font-semibold'
            : 'text-ash hover:text-chalk'
            }`}
        >
          <CheckSquare size={12} className="shrink-0" />
          <span>Ativar Campos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('custom')}
          className={`py-1.5 text-caption font-medium rounded transition-all text-center flex items-center justify-center gap-1.5 ${activeTab === 'custom'
            ? 'bg-graphite text-signal-lime border border-signal-lime/40 font-semibold'
            : 'text-ash hover:text-chalk'
            }`}
        >
          <Edit3 size={12} className="shrink-0" />
          <span>Textos/Valores</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('style')}
          className={`py-1.5 text-caption font-medium rounded transition-all text-center flex items-center justify-center gap-1.5 ${activeTab === 'style'
            ? 'bg-graphite text-signal-lime border border-signal-lime/40 font-semibold'
            : 'text-ash hover:text-chalk'
            }`}
        >
          <Palette size={12} className="shrink-0" />
          <span>Estilo & Cores</span>
        </button>
      </div>

      {activeTab === 'toggles' && (
        <div className="space-y-4">
          <div className="space-y-1.5 bg-carbon p-2.5 rounded border border-graphite">
            <div className="label-stamp text-caption text-ash mb-1">[ SEÇÕES EXIBIDAS ]</div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => updateWidgetConfig(instanceId, { showMainSection: !showMainSection })}
                className={`py-1 px-2 rounded text-caption border transition-all text-center ${showMainSection
                  ? 'bg-signal-lime/15 border-signal-lime text-signal-lime font-semibold'
                  : 'bg-graphite text-ash border-graphite line-through opacity-60'
                  }`}
              >
                Perfil / Info
              </button>
              <button
                type="button"
                onClick={() => updateWidgetConfig(instanceId, { showContactSection: !showContactSection })}
                className={`py-1 px-2 rounded text-caption border transition-all text-center ${showContactSection
                  ? 'bg-signal-lime/15 border-signal-lime text-signal-lime font-semibold'
                  : 'bg-graphite text-ash border-graphite line-through opacity-60'
                  }`}
              >
                Contatos
              </button>
              <button
                type="button"
                onClick={() => updateWidgetConfig(instanceId, { showStatsSection: !showStatsSection })}
                className={`py-1 px-2 rounded text-caption border transition-all text-center ${showStatsSection
                  ? 'bg-signal-lime/15 border-signal-lime text-signal-lime font-semibold'
                  : 'bg-graphite text-ash border-graphite line-through opacity-60'
                  }`}
              >
                Métricas
              </button>
            </div>
          </div>

          {showMainSection && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-eyebrow font-medium text-chalk">
                <span className="flex items-center gap-1.5 text-signal-lime">
                  <User size={13} />
                  <span>Informações do Perfil</span>
                </span>
                <span className="text-caption text-ash font-jetbrains-mono">(ON por padrão / extras OFF)</span>
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
                  <span>Contatos & Redes</span>
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
                  <span>Métricas & Stats</span>
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
            Altere os títulos das seções ou valores das linhas se quiser personalizar além dos dados automáticos do GitHub.
          </p>

          <div className="bg-carbon border border-graphite rounded overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenAccordion(openAccordion === 'profile' ? ('' as any) : 'profile')}
              className="w-full p-2.5 flex items-center justify-between text-left hover:bg-graphite/40 transition-colors"
            >
              <span className="text-eyebrow font-semibold text-chalk flex items-center gap-2">
                <User size={13} className="text-signal-lime" />
                <span>Textos do Perfil</span>
              </span>
              <ChevronDown size={14} className={`text-ash transition-transform ${openAccordion === 'profile' ? 'rotate-180' : ''}`} />
            </button>

            {openAccordion === 'profile' && (
              <div className="p-3 border-t border-graphite/60 space-y-2.5 bg-void-black/40">
                <div>
                  <label className="text-caption text-ash block mb-0.5">Título da Seção</label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => updateWidgetConfig(instanceId, { customTitle: e.target.value })}
                    placeholder={user ? `${user.login}@github` : 'username@github'}
                    className={flatInputClass}
                  />
                </div>

                <div>
                  <label className="text-caption text-ash block mb-0.5">Custom Uptime</label>
                  <input
                    type="text"
                    value={customUptime}
                    onChange={(e) => updateWidgetConfig(instanceId, { customUptime: e.target.value })}
                    placeholder="Automático (ex: 5 years, 3 months...)"
                    className={flatInputClassText}
                  />
                </div>

                <div>
                  <label className="text-caption text-ash block mb-0.5">Custom Location</label>
                  <input
                    type="text"
                    value={customLocation}
                    onChange={(e) => updateWidgetConfig(instanceId, { customLocation: e.target.value })}
                    placeholder={user?.location || 'São Paulo'}
                    className={flatInputClassText}
                  />
                </div>

                <div>
                  <label className="text-caption text-ash block mb-0.5">Custom Company</label>
                  <input
                    type="text"
                    value={customCompany}
                    onChange={(e) => updateWidgetConfig(instanceId, { customCompany: e.target.value })}
                    placeholder={user?.company || '@Empresa'}
                    className={flatInputClassText}
                  />
                </div>

                <div>
                  <label className="text-caption text-ash block mb-0.5">Custom Languages</label>
                  <input
                    type="text"
                    value={customLanguages}
                    onChange={(e) => updateWidgetConfig(instanceId, { customLanguages: e.target.value })}
                    placeholder="TypeScript, JavaScript, Vue..."
                    className={flatInputClassText}
                  />
                </div>

                <div>
                  <label className="text-caption text-ash block mb-0.5">Custom Status</label>
                  <input
                    type="text"
                    value={customStatus}
                    onChange={(e) => updateWidgetConfig(instanceId, { customStatus: e.target.value })}
                    placeholder="🚀 Building awesome tools"
                    className={flatInputClassText}
                  />
                </div>

                <div>
                  <label className="text-caption text-ash block mb-0.5">Custom Achievements</label>
                  <input
                    type="text"
                    value={customAchievements}
                    onChange={(e) => updateWidgetConfig(instanceId, { customAchievements: e.target.value })}
                    placeholder="Arctic Vault, PR Shark, Pro"
                    className={flatInputClassText}
                  />
                </div>

                <div>
                  <label className="text-caption text-ash block mb-0.5">Custom Highlights</label>
                  <input
                    type="text"
                    value={customHighlights}
                    onChange={(e) => updateWidgetConfig(instanceId, { customHighlights: e.target.value })}
                    placeholder="GitHub Star, Pro Developer"
                    className={flatInputClassText}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-carbon border border-graphite rounded overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenAccordion(openAccordion === 'contact' ? ('' as any) : 'contact')}
              className="w-full p-2.5 flex items-center justify-between text-left hover:bg-graphite/40 transition-colors"
            >
              <span className="text-eyebrow font-semibold text-chalk flex items-center gap-2">
                <Globe size={13} className="text-signal-lime" />
                <span>Textos de Contato & Links</span>
              </span>
              <ChevronDown size={14} className={`text-ash transition-transform ${openAccordion === 'contact' ? 'rotate-180' : ''}`} />
            </button>

            {openAccordion === 'contact' && (
              <div className="p-3 border-t border-graphite/60 space-y-2.5 bg-void-black/40">
                <div>
                  <label className="text-caption text-ash block mb-0.5">Título da Seção Contato</label>
                  <input
                    type="text"
                    value={customContactTitle}
                    onChange={(e) => updateWidgetConfig(instanceId, { customContactTitle: e.target.value })}
                    placeholder="Contact"
                    className={flatInputClass}
                  />
                </div>

                <div>
                  <label className="text-caption text-ash block mb-0.5">Custom Website</label>
                  <input
                    type="text"
                    value={customWebsite}
                    onChange={(e) => updateWidgetConfig(instanceId, { customWebsite: e.target.value })}
                    placeholder={user?.blog || 'https://seu-site.com'}
                    className={flatInputClassText}
                  />
                </div>

                <div>
                  <label className="text-caption text-ash block mb-0.5">Custom GitHub</label>
                  <input
                    type="text"
                    value={customGithub}
                    onChange={(e) => updateWidgetConfig(instanceId, { customGithub: e.target.value })}
                    placeholder={user ? `github.com/${user.login}` : 'github.com/user'}
                    className={flatInputClassText}
                  />
                </div>

                <div>
                  <label className="text-caption text-ash block mb-0.5">Custom Twitter / X</label>
                  <input
                    type="text"
                    value={customTwitter}
                    onChange={(e) => updateWidgetConfig(instanceId, { customTwitter: e.target.value })}
                    placeholder={user?.twitter_username ? `@${user.twitter_username}` : '@user'}
                    className={flatInputClass}
                  />
                </div>

                <div>
                  <label className="text-caption text-ash block mb-0.5">Custom Email</label>
                  <input
                    type="text"
                    value={customEmail}
                    onChange={(e) => updateWidgetConfig(instanceId, { customEmail: e.target.value })}
                    placeholder="contato@empresa.com"
                    className={flatInputClassText}
                  />
                </div>

                <div>
                  <label className="text-caption text-ash block mb-0.5">Custom Orgs</label>
                  <input
                    type="text"
                    value={customOrgs}
                    onChange={(e) => updateWidgetConfig(instanceId, { customOrgs: e.target.value })}
                    placeholder="@github, @vercel"
                    className={flatInputClassText}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-carbon border border-graphite rounded overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenAccordion(openAccordion === 'stats' ? ('' as any) : 'stats')}
              className="w-full p-2.5 flex items-center justify-between text-left hover:bg-graphite/40 transition-colors"
            >
              <span className="text-eyebrow font-semibold text-chalk flex items-center gap-2">
                <BarChart2 size={13} className="text-signal-lime" />
                <span>Textos de Métricas & Stats</span>
              </span>
              <ChevronDown size={14} className={`text-ash transition-transform ${openAccordion === 'stats' ? 'rotate-180' : ''}`} />
            </button>

            {openAccordion === 'stats' && (
              <div className="p-3 border-t border-graphite/60 space-y-2.5 bg-void-black/40">
                <div>
                  <label className="text-caption text-ash block mb-0.5">Título da Seção Stats</label>
                  <input
                    type="text"
                    value={customStatsTitle}
                    onChange={(e) => updateWidgetConfig(instanceId, { customStatsTitle: e.target.value })}
                    placeholder="GitHub Stats"
                    className={flatInputClass}
                  />
                </div>

                <div>
                  <label className="text-caption text-ash block mb-0.5">Custom Commits</label>
                  <input
                    type="text"
                    value={customCommits}
                    onChange={(e) => updateWidgetConfig(instanceId, { customCommits: e.target.value })}
                    placeholder="Ex: 1,280"
                    className={flatInputClass}
                  />
                </div>

                <div>
                  <label className="text-caption text-ash block mb-0.5">Custom Following</label>
                  <input
                    type="text"
                    value={customFollowing}
                    onChange={(e) => updateWidgetConfig(instanceId, { customFollowing: e.target.value })}
                    placeholder="Ex: 42"
                    className={flatInputClass}
                  />
                </div>

                <div>
                  <label className="text-caption text-ash block mb-0.5">Custom Gists</label>
                  <input
                    type="text"
                    value={customGists}
                    onChange={(e) => updateWidgetConfig(instanceId, { customGists: e.target.value })}
                    placeholder="Ex: 12"
                    className={flatInputClass}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'style' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-2.5 bg-carbon rounded border border-graphite">
            <div>
              <span className="text-eyebrow text-chalk font-semibold block">Preencher Espaços com Pontos</span>
              <span className="text-caption text-ash block">Ajusta pontilhado automático (...)</span>
            </div>
            <input
              type="checkbox"
              checked={dotLeaders}
              onChange={(e) => updateWidgetConfig(instanceId, { dotLeaders: e.target.checked })}
              className="w-4 h-4 accent-signal-lime cursor-pointer rounded"
            />
          </div>

          <div className="space-y-3 pt-2 border-t border-graphite/50">
            <div className="flex items-center gap-1.5 text-ash text-eyebrow font-medium">
              <Palette size={13} />
              <span>Cores Customizadas das Linhas Terminal</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <ColorPicker
                label="Cor dos Títulos"
                align="left"
                value={headerColor}
                onChange={(c) => updateWidgetConfig(instanceId, { headerColor: c })}
              />
              <ColorPicker
                label="Cor dos Rótulos (. Key)"
                align="right"
                value={labelColor}
                onChange={(c) => updateWidgetConfig(instanceId, { labelColor: c })}
              />
              <ColorPicker
                label="Cor dos Pontos (....)"
                align="left"
                value={dotColor}
                onChange={(c) => updateWidgetConfig(instanceId, { dotColor: c })}
              />
              <ColorPicker
                label="Cor dos Valores"
                align="right"
                value={valueColor}
                onChange={(c) => updateWidgetConfig(instanceId, { valueColor: c })}
              />
              <ColorPicker
                label="Cor das Métricas"
                align="left"
                value={statsValColor}
                onChange={(c) => updateWidgetConfig(instanceId, { statsValColor: c })}
              />
              <ColorPicker
                label="Cor dos Divisores"
                align="right"
                value={dividerColor}
                onChange={(c) => updateWidgetConfig(instanceId, { dividerColor: c })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
