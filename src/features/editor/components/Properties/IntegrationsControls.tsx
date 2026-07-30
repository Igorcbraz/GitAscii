'use client';

import React from 'react';
import { Sliders, User, Palette, Layout, Shield, Type, Layers, Globe, Code } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import type { WidgetConfig } from '@/engine/types';
import { useI18n } from '@/i18n';

function DebouncedInput({
  value,
  onChange,
  placeholder,
  className
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [localVal, setLocalVal] = React.useState(value);

  React.useEffect(() => {
    setLocalVal(value);
  }, [value]);

  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localVal !== value) {
        onChangeRef.current(localVal);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localVal, value]);

  return (
    <input
      type="text"
      value={localVal}
      onChange={(e) => setLocalVal(e.target.value)}
      placeholder={placeholder}
      className={className}
    />
  );
}

interface IntegrationsControlsProps {
  instanceId: string;
  widgetId: string;
  config: WidgetConfig;
}

export function IntegrationsControls({
  instanceId,
  widgetId,
  config,
}: IntegrationsControlsProps) {
  const { t } = useI18n();
  const { updateWidgetConfig, githubData } = useEditorStore();
  const defaultUsername = githubData?.user.login || '';

  const handleUpdate = (patch: Record<string, unknown>) => {
    updateWidgetConfig(instanceId, patch);
  };

  const showTitle = config.showTitle !== false;
  const customTitle = (config.customTitle as string) || '';
  const username = (config.username as string) ?? defaultUsername;

  return (
    <div className="space-y-4 pt-3 border-t border-graphite">
      {/* Section Header */}
      <div className="flex items-center gap-2 text-signal-lime font-inter-tight text-eyebrow uppercase tracking-wider font-medium">
        <Sliders size={14} />
        <span>{t('editor.integrations.title', 'Configurações da Integração')}</span>
      </div>

      {/* Title Toggle & Custom Title Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between p-2 bg-graphite rounded-sm border border-graphite">
          <label className="text-eyebrow text-chalk font-inter-tight cursor-pointer">
            {t('editor.integrations.show_title', 'Exibir Título do Widget')}
          </label>
          <input
            type="checkbox"
            checked={showTitle}
            onChange={(e) => handleUpdate({ showTitle: e.target.checked })}
            className="w-4 h-4 accent-signal-lime cursor-pointer"
          />
        </div>

        {showTitle && (
          <div>
            <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
              {t('editor.integrations.custom_title', 'Título Personalizado')}
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => handleUpdate({ customTitle: e.target.value })}
              placeholder="Ex: [ GITHUB STATS ]"
              className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note px-2 py-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* GitHub Username Override (for user-based widgets) */}
      {widgetId !== 'readme-quotes' && widgetId !== 'awesome-badge' && (
        <div>
          <label className="text-eyebrow text-ash mb-1 font-inter-tight flex items-center gap-1">
            <User size={12} />
            <span>{t('editor.integrations.github_user', 'Usuário do GitHub')}</span>
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => handleUpdate({ username: e.target.value })}
            placeholder={defaultUsername || 'username'}
            className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note px-2 py-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
          />
        </div>
      )}

      {widgetId === 'gitfest-lineup' && (
        <div className="space-y-3 pt-2">
          <div>
            <label className="text-eyebrow text-ash block mb-1 font-inter-tight">Theme</label>
            <select
              value={(config.theme as string) || 'dark'}
              onChange={(e) => handleUpdate({ theme: e.target.value })}
              className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note p-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
            >
              <option value="dark">Dark</option>
              <option value="gitfest-rio">GitFest Rio</option>
            </select>
          </div>
          
          <div>
            <label className="text-eyebrow text-ash block mb-1 font-inter-tight">Sort By</label>
            <select
              value={(config.sort as string) || 'stars'}
              onChange={(e) => handleUpdate({ sort: e.target.value })}
              className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note p-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
            >
              <option value="stars">Stars</option>
              <option value="created">Created</option>
              <option value="updated">Updated</option>
              <option value="full_name">Name</option>
            </select>
          </div>

          <div>
            <label className="text-eyebrow text-ash block mb-1 font-inter-tight">Order</label>
            <select
              value={(config.order as string) || 'asc'}
              onChange={(e) => handleUpdate({ order: e.target.value })}
              className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note p-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          <div>
            <label className="text-eyebrow text-ash block mb-1 font-inter-tight">Type</label>
            <select
              value={(config.type as string) || 'owner'}
              onChange={(e) => handleUpdate({ type: e.target.value })}
              className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note p-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
            >
              <option value="owner">Owner</option>
              <option value="all">All</option>
            </select>
          </div>

          <div>
            <label className="text-eyebrow text-ash block mb-1 font-inter-tight">Ocultar Repositórios (Separados por vírgula)</label>
            <DebouncedInput
              value={(config.hideRepos as string) || ''}
              onChange={(val) => handleUpdate({ hideRepos: val })}
              placeholder="Ex: repo1, repo2"
              className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note px-2 py-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={Boolean(config.invertColors)}
                  onChange={(e) => handleUpdate({ invertColors: e.target.checked })}
                  className="peer sr-only"
                />
                <div className="w-8 h-4 bg-void-black border border-graphite rounded-full peer-checked:bg-signal-lime/20 peer-checked:border-signal-lime transition-colors"></div>
                <div className="absolute left-1 top-1 w-2 h-2 bg-ash rounded-full transition-all peer-checked:translate-x-4 peer-checked:bg-signal-lime"></div>
              </div>
              <span className="text-note text-ash group-hover:text-chalk transition-colors font-inter-tight">
                Invert Colors
              </span>
            </label>
          </div>
        </div>
      )}

      {/* 1. GitHub Readme Stats */}
      {widgetId === 'github-readme-stats' && (
        <div className="space-y-3 pt-2">
          <div>
            <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
              {t('editor.integrations.card_type', 'Tipo de Card')}
            </label>
            <select
              value={(config.statType as string) || 'stats'}
              onChange={(e) => handleUpdate({ statType: e.target.value })}
              className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note p-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
            >
              <option value="stats">{t('editor.integrations.stats_card', 'Estatísticas Gerais (Stats Card)')}</option>
              <option value="top-langs">{t('editor.integrations.top_languages', 'Top Linguagens (Top Languages)')}</option>
              <option value="pin">{t('editor.integrations.pinned_repo', 'Repositório Fixado (Pinned Repo)')}</option>
            </select>
          </div>

          <div>
            <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
              {t('editor.integrations.visual_theme', 'Tema Visual')}
            </label>
            <select
              value={(config.theme as string) || 'dark'}
              onChange={(e) => handleUpdate({ theme: e.target.value })}
              className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note p-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
            >
              <option value="dark">Dark</option>
              <option value="tokyonight">Tokyo Night</option>
              <option value="dracula">Dracula</option>
              <option value="radical">Radical</option>
              <option value="merko">Merko</option>
              <option value="gruvbox">Gruvbox</option>
              <option value="onedark">One Dark</option>
              <option value="synthwave">Synthwave</option>
              <option value="cyberpunk">Cyberpunk</option>
              <option value="nord">Nord</option>
              <option value="catppuccin">Catppuccin</option>
              <option value="vue">Vue</option>
            </select>
          </div>

          {(config.statType as string) === 'pin' && (
            <div>
              <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
                {t('editor.integrations.repo_name', 'Nome do Repositório')}
              </label>
              <input
                type="text"
                value={(config.repoName as string) || ''}
                onChange={(e) => handleUpdate({ repoName: e.target.value })}
                placeholder="Ex: my-awesome-repo"
                className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note px-2 py-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
              />
            </div>
          )}

          {(config.statType as string) === 'top-langs' && (
            <>
              <div>
                <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
                  {t('editor.integrations.layout_style', 'Estilo do Layout')}
                </label>
                <select
                  value={(config.layout as string) || 'compact'}
                  onChange={(e) => handleUpdate({ layout: e.target.value })}
                  className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note p-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
                >
                  <option value="compact">{t('editor.integrations.layout_compact', 'Compacto (Lista)')}</option>
                  <option value="normal">{t('editor.integrations.layout_normal', 'Normal (Barras)')}</option>
                  <option value="donut">{t('editor.integrations.layout_donut', 'Donut (Gráfico Rosca)')}</option>
                  <option value="pie">{t('editor.integrations.layout_pie', 'Pie (Gráfico Pizza)')}</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-eyebrow mb-1">
                  <span className="text-ash font-inter-tight">{t('editor.integrations.max_languages', 'Qtd. Máxima de Linguagens')}</span>
                  <span className="text-chalk font-jetbrains-mono">{Number(config.langsCount) || 5}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={Number(config.langsCount) || 5}
                  onChange={(e) => handleUpdate({ langsCount: parseInt(e.target.value, 10) })}
                  className="w-full accent-signal-lime h-1 bg-graphite rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
                  {t('editor.integrations.hide_languages', 'Ocultar Linguagens (Separadas por vírgula)')}
                </label>
                <input
                  type="text"
                  value={(config.hideLangs as string) || ''}
                  onChange={(e) => handleUpdate({ hideLangs: e.target.value })}
                  placeholder="Ex: html,css,scss"
                  className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note px-2 py-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
                />
              </div>
            </>
          )}

          {((config.statType as string) || 'stats') === 'stats' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-graphite rounded-sm border border-graphite">
                <label className="text-eyebrow text-chalk font-inter-tight cursor-pointer">
                  {t('editor.integrations.show_metric_icons', 'Exibir Ícones de Métricas')}
                </label>
                <input
                  type="checkbox"
                  checked={config.showIcons !== false}
                  onChange={(e) => handleUpdate({ showIcons: e.target.checked })}
                  className="w-4 h-4 accent-signal-lime cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-2 bg-graphite rounded-sm border border-graphite">
                <label className="text-eyebrow text-chalk font-inter-tight cursor-pointer">
                  {t('editor.integrations.include_private_commits', 'Incluir Commits Privados')}
                </label>
                <input
                  type="checkbox"
                  checked={Boolean(config.countPrivate)}
                  onChange={(e) => handleUpdate({ countPrivate: e.target.checked })}
                  className="w-4 h-4 accent-signal-lime cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-2 bg-graphite rounded-sm border border-graphite">
                <label className="text-eyebrow text-chalk font-inter-tight cursor-pointer">
                  {t('editor.integrations.include_all_commits', 'Incluir Todos os Commits (Ano Todo)')}
                </label>
                <input
                  type="checkbox"
                  checked={Boolean(config.includeAllCommits)}
                  onChange={(e) => handleUpdate({ includeAllCommits: e.target.checked })}
                  className="w-4 h-4 accent-signal-lime cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-2 bg-graphite rounded-sm border border-graphite">
                <label className="text-eyebrow text-chalk font-inter-tight cursor-pointer">
                  {t('editor.integrations.hide_rank', 'Ocultar Ranking (Rank Badge)')}
                </label>
                <input
                  type="checkbox"
                  checked={Boolean(config.hideRank)}
                  onChange={(e) => handleUpdate({ hideRank: e.target.checked })}
                  className="w-4 h-4 accent-signal-lime cursor-pointer"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-2 bg-graphite rounded-sm border border-graphite">
            <label className="text-eyebrow text-chalk font-inter-tight cursor-pointer">
              {t('editor.integrations.hide_border', 'Ocultar Borda Padrão')}
            </label>
            <input
              type="checkbox"
              checked={Boolean(config.hideBorder)}
              onChange={(e) => handleUpdate({ hideBorder: e.target.checked })}
              className="w-4 h-4 accent-signal-lime cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* 2. GitHub Streak Stats */}
      {widgetId === 'streak-stats' && (
        <div className="space-y-3 pt-2">
          <div>
            <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
              {t('editor.integrations.visual_theme', 'Tema Visual')}
            </label>
            <select
              value={(config.theme as string) || 'dark'}
              onChange={(e) => handleUpdate({ theme: e.target.value })}
              className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note p-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
            >
              <option value="dark">Dark</option>
              <option value="dracula">Dracula</option>
              <option value="tokyonight">Tokyo Night</option>
              <option value="radical">Radical</option>
              <option value="synthwave">Synthwave</option>
              <option value="gruvbox">Gruvbox</option>
              <option value="nord">Nord</option>
              <option value="highcontrast">High Contrast</option>
              <option value="black-ice">Black Ice</option>
              <option value="fire">Fire</option>
              <option value="lucario">Lucario</option>
              <option value="dark-violet">Dark Violet</option>
            </select>
          </div>

          <div>
            <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
              {t('editor.integrations.streak_mode', 'Modo de Sequência')}
            </label>
            <select
              value={(config.mode as string) || 'daily'}
              onChange={(e) => handleUpdate({ mode: e.target.value })}
              className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note p-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
            >
              <option value="daily">{t('editor.integrations.streak_daily', 'Diário (Daily Streaks)')}</option>
              <option value="weekly">{t('editor.integrations.streak_weekly', 'Semanal (Weekly Streaks)')}</option>
            </select>
          </div>

          <div>
            <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
              {t('editor.integrations.date_format', 'Formato de Data')}
            </label>
            <select
              value={(config.dateFormat as string) || 'M j, Y'}
              onChange={(e) => handleUpdate({ dateFormat: e.target.value })}
              className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note p-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
            >
              <option value="M j, Y">Ex: Aug 28, 2026 (M j, Y)</option>
              <option value="Y-m-d">Ex: 2026-08-28 (Y-m-d)</option>
              <option value="j M Y">Ex: 28 Aug 2026 (j M Y)</option>
              <option value="M j">Ex: Aug 28 (M j)</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-eyebrow mb-1">
              <span className="text-ash font-inter-tight">{t('editor.integrations.border_radius', 'Raio do Canto (Border Radius)')}</span>
              <span className="text-chalk font-jetbrains-mono">{Number(config.streakBorderRadius) || 4}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={Number(config.streakBorderRadius) || 4}
              onChange={(e) => handleUpdate({ streakBorderRadius: parseInt(e.target.value, 10) })}
              className="w-full accent-signal-lime h-1 bg-graphite rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-2 bg-graphite rounded-sm border border-graphite">
            <label className="text-eyebrow text-chalk font-inter-tight cursor-pointer">
              {t('editor.integrations.hide_border', 'Ocultar Borda Padrão')}
            </label>
            <input
              type="checkbox"
              checked={Boolean(config.hideBorder)}
              onChange={(e) => handleUpdate({ hideBorder: e.target.checked })}
              className="w-4 h-4 accent-signal-lime cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* 3. GitHub Profile Trophy */}
      {widgetId === 'profile-trophy' && (
        <div className="space-y-3 pt-2">
          <div>
            <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
              {t('editor.integrations.visual_theme', 'Tema Visual')}
            </label>
            <select
              value={(config.theme as string) || 'flat'}
              onChange={(e) => handleUpdate({ theme: e.target.value })}
              className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note p-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
            >
              <option value="flat">Flat</option>
              <option value="onedark">One Dark</option>
              <option value="gruvbox">Gruvbox</option>
              <option value="dracula">Dracula</option>
              <option value="nord">Nord</option>
              <option value="deuteranopia">Deuteranopia</option>
              <option value="darkhub">Darkhub</option>
              <option value="juicy">Juicy</option>
              <option value="bgr">BGR</option>
              <option value="discord">Discord</option>
              <option value="gitdimmed">Git Dimmed</option>
              <option value="algolia">Algolia</option>
              <option value="radical">Radical</option>
              <option value="monokai">Monokai</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-eyebrow mb-1">
              <span className="text-ash font-inter-tight">{t('editor.integrations.num_columns', 'Número de Colunas')}</span>
              <span className="text-chalk font-jetbrains-mono">{Number(config.column) || 6}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={Number(config.column) || 6}
              onChange={(e) => handleUpdate({ column: parseInt(e.target.value, 10) })}
              className="w-full accent-signal-lime h-1 bg-graphite rounded cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-eyebrow mb-1">
              <span className="text-ash font-inter-tight">{t('editor.integrations.num_rows', 'Número de Linhas')}</span>
              <span className="text-chalk font-jetbrains-mono">{Number(config.row) || 1}</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={Number(config.row) || 1}
              onChange={(e) => handleUpdate({ row: parseInt(e.target.value, 10) })}
              className="w-full accent-signal-lime h-1 bg-graphite rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-2 bg-graphite rounded-sm border border-graphite">
            <label className="text-eyebrow text-chalk font-inter-tight cursor-pointer">
              {t('editor.integrations.remove_trophy_frame', 'Remover Moldura das Troféus')}
            </label>
            <input
              type="checkbox"
              checked={Boolean(config.noFrame)}
              onChange={(e) => handleUpdate({ noFrame: e.target.checked })}
              className="w-4 h-4 accent-signal-lime cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-2 bg-graphite rounded-sm border border-graphite">
            <label className="text-eyebrow text-chalk font-inter-tight cursor-pointer">
              {t('editor.integrations.transparent_bg', 'Fundo Transparente')}
            </label>
            <input
              type="checkbox"
              checked={Boolean(config.noBg)}
              onChange={(e) => handleUpdate({ noBg: e.target.checked })}
              className="w-4 h-4 accent-signal-lime cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* 4. GitHub Readme Activity Graph */}
      {widgetId === 'activity-graph' && (
        <div className="space-y-3 pt-2">
          <div>
            <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
              {t('editor.integrations.visual_theme', 'Tema Visual')}
            </label>
            <select
              value={(config.theme as string) || 'github-dark'}
              onChange={(e) => handleUpdate({ theme: e.target.value })}
              className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note p-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
            >
              <option value="github-dark">GitHub Dark</option>
              <option value="react-dark">React Dark</option>
              <option value="dracula">Dracula</option>
              <option value="tokyo-night">Tokyo Night</option>
              <option value="ocean-dark">Ocean Dark</option>
              <option value="synthwave">Synthwave</option>
              <option value="nord">Nord</option>
              <option value="monokai">Monokai</option>
              <option value="gruvbox">Gruvbox</option>
              <option value="rogue">Rogue</option>
              <option value="xcode">Xcode</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-eyebrow mb-1">
              <span className="text-ash font-inter-tight">{t('editor.integrations.activity_period', 'Período de Atividade (Dias)')}</span>
              <span className="text-chalk font-jetbrains-mono">{Number(config.days) || 31} dias</span>
            </div>
            <input
              type="range"
              min="7"
              max="31"
              value={Number(config.days) || 31}
              onChange={(e) => handleUpdate({ days: parseInt(e.target.value, 10) })}
              className="w-full accent-signal-lime h-1 bg-graphite rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-2 bg-graphite rounded-sm border border-graphite">
            <label className="text-eyebrow text-chalk font-inter-tight cursor-pointer">
              {t('editor.integrations.gradient_fill', 'Preenchimento de Gradiente Sob a Linha')}
            </label>
            <input
              type="checkbox"
              checked={config.showArea !== false}
              onChange={(e) => handleUpdate({ showArea: e.target.checked })}
              className="w-4 h-4 accent-signal-lime cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-2 bg-graphite rounded-sm border border-graphite">
            <label className="text-eyebrow text-chalk font-inter-tight cursor-pointer">
              {t('editor.integrations.hide_border_only', 'Ocultar Borda')}
            </label>
            <input
              type="checkbox"
              checked={Boolean(config.hideBorder)}
              onChange={(e) => handleUpdate({ hideBorder: e.target.checked })}
              className="w-4 h-4 accent-signal-lime cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* 5. Snake (GitHub Contribution Snake) */}
      {widgetId === 'contribution-snake' && (
        <div className="space-y-3 pt-2">
          <div>
            <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
              {t('editor.integrations.snake_theme', 'Tema Visual da Snake')}
            </label>
            <select
              value={(config.theme as string) || 'dark'}
              onChange={(e) => handleUpdate({ theme: e.target.value })}
              className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note p-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
            >
              <option value="dark">{t('editor.integrations.snake_dark', 'Dark Theme (Padrão)')}</option>
              <option value="light">Light Theme</option>
              <option value="ocean">Ocean Blue</option>
            </select>
          </div>

          <div>
            <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
              {t('editor.integrations.repo_branch', 'Branch do Repositório (Action Output)')}
            </label>
            <select
              value={(config.branch as string) || 'output'}
              onChange={(e) => handleUpdate({ branch: e.target.value })}
              className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note p-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
            >
              <option value="output">{t('editor.integrations.branch_output', 'Branch `output` (Recomendado)')}</option>
              <option value="main">Branch `main`</option>
              <option value="master">Branch `master`</option>
            </select>
          </div>
        </div>
      )}

      {/* 6. Metrics (lowlighter/metrics) */}
      {widgetId === 'metrics-card' && (
        <div className="space-y-3 pt-2">
          <div>
            <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
              {t('editor.integrations.metrics_template', 'Template do Metrics')}
            </label>
            <select
              value={(config.template as string) || 'classic'}
              onChange={(e) => handleUpdate({ template: e.target.value })}
              className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note p-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
            >
              <option value="classic">Classic (Padrão)</option>
              <option value="terminal">Terminal</option>
              <option value="community">Community</option>
              <option value="repository">Repository</option>
            </select>
          </div>

          <div>
            <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
              {t('editor.integrations.content_sections', 'Seções de Conteúdo (Base)')}
            </label>
            <select
              value={(config.baseSections as string) || 'header,activity,community,repositories'}
              onChange={(e) => handleUpdate({ baseSections: e.target.value })}
              className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note p-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
            >
              <option value="header,activity,community,repositories">{t('editor.integrations.metrics_full', 'Completo (Header, Activity, Community, Repos)')}</option>
              <option value="header,activity">{t('editor.integrations.metrics_summary', 'Resumido (Header & Activity)')}</option>
              <option value="header,repositories">{t('editor.integrations.metrics_repos', 'Apenas Repositórios')}</option>
              <option value="header">{t('editor.integrations.metrics_header', 'Apenas Cabeçalho')}</option>
            </select>
          </div>
        </div>
      )}

      {/* 7. GitHub Profile Views Counter */}
      {widgetId === 'views-counter' && (
        <div className="space-y-3 pt-2">
          <div>
            <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
              {t('editor.integrations.label_text', 'Texto do Label')}
            </label>
            <input
              type="text"
              value={(config.label as string) || 'PROFILE VIEWS'}
              onChange={(e) => handleUpdate({ label: e.target.value })}
              placeholder="Ex: PROFILE VIEWS"
              className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note px-2 py-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
            />
          </div>

          <div>
            <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
              {t('editor.integrations.badge_style_label', 'Estilo da Badge')}
            </label>
            <select
              value={(config.style as string) || 'for-the-badge'}
              onChange={(e) => handleUpdate({ style: e.target.value })}
              className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note p-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
            >
              <option value="for-the-badge">For The Badge</option>
              <option value="flat">Flat</option>
              <option value="flat-square">Flat Square</option>
              <option value="plastic">Plastic</option>
            </select>
          </div>

          <div>
            <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
              {t('editor.integrations.counter_color', 'Cor do Contador')}
            </label>
            <select
              value={(config.color as string) || '00f0ff'}
              onChange={(e) => handleUpdate({ color: e.target.value })}
              className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note p-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
            >
              <option value="00f0ff">Cyan Neon (00f0ff)</option>
              <option value="brightgreen">Lime (brightgreen)</option>
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="yellow">Yellow</option>
              <option value="orange">Orange</option>
              <option value="red">Red</option>
              <option value="violet">Violet</option>
              <option value="181717">Onyx Dark (181717)</option>
            </select>
          </div>

          <div>
            <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
              {t('editor.integrations.initial_value', 'Valor Inicial do Contador (Offset)')}
            </label>
            <input
              type="number"
              value={Number(config.baseVal) || 0}
              onChange={(e) => handleUpdate({ baseVal: parseInt(e.target.value, 10) || 0 })}
              placeholder="Ex: 1000"
              className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note px-2 py-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* 8. GitHub Readme Quotes */}
      {widgetId === 'readme-quotes' && (
        <div className="space-y-3 pt-2">
          <div>
            <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
              {t('editor.integrations.quote_mode', 'Modo da Citação')}
            </label>
            <select
              value={(config.quoteType as string) || 'random'}
              onChange={(e) => handleUpdate({ quoteType: e.target.value })}
              className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note p-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
            >
              <option value="random">{t('editor.integrations.quote_random', 'Citação Aleatória (Random Quote)')}</option>
              <option value="quote-day">{t('editor.integrations.quote_day', 'Citação do Dia (Quote of the Day)')}</option>
            </select>
          </div>

          <div>
            <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
              {t('editor.integrations.visual_theme', 'Tema Visual')}
            </label>
            <select
              value={(config.theme as string) || 'dark'}
              onChange={(e) => handleUpdate({ theme: e.target.value })}
              className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note p-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
            >
              <option value="dark">Dark</option>
              <option value="dracula">Dracula</option>
              <option value="radical">Radical</option>
              <option value="tokyonight">Tokyo Night</option>
              <option value="gruvbox">Gruvbox</option>
              <option value="onedark">One Dark</option>
              <option value="catppuccin">Catppuccin</option>
              <option value="synthwave">Synthwave</option>
            </select>
          </div>

          <div>
            <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
              {t('editor.integrations.card_layout', 'Layout do Cartão')}
            </label>
            <select
              value={(config.layout as string) || 'horizontal'}
              onChange={(e) => handleUpdate({ layout: e.target.value })}
              className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note p-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
            >
              <option value="horizontal">Horizontal</option>
              <option value="vertical">Vertical</option>
            </select>
          </div>
        </div>
      )}

      {/* 9. Awesome GitHub Profile README */}
      {widgetId === 'awesome-badge' && (
        <div className="space-y-3 pt-2">
          <div>
            <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
              {t('editor.integrations.badge_text_label', 'Texto da Badge')}
            </label>
            <input
              type="text"
              value={(config.label as string) || 'Awesome GitHub Profile'}
              onChange={(e) => handleUpdate({ label: e.target.value })}
              placeholder="Ex: Awesome GitHub Profile"
              className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note px-2 py-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
            />
          </div>

          <div>
            <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
              {t('editor.integrations.badge_style_label', 'Estilo da Badge')}
            </label>
            <select
              value={(config.badgeStyle as string) || 'for-the-badge'}
              onChange={(e) => handleUpdate({ badgeStyle: e.target.value })}
              className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note p-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
            >
              <option value="for-the-badge">For The Badge</option>
              <option value="flat">Flat</option>
              <option value="flat-square">Flat Square</option>
            </select>
          </div>

          <div>
            <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
              {t('editor.integrations.badge_color_label', 'Cor da Badge')}
            </label>
            <select
              value={(config.badgeColor as string) || 'brightgreen'}
              onChange={(e) => handleUpdate({ badgeColor: e.target.value })}
              className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note p-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
            >
              <option value="brightgreen">Bright Green (Verde)</option>
              <option value="00f0ff">Cyan Neon (00f0ff)</option>
              <option value="blue">Blue</option>
              <option value="orange">Orange</option>
              <option value="violet">Violet</option>
              <option value="red">Red</option>
            </select>
          </div>

          <div>
            <label className="text-eyebrow text-ash block mb-1 font-inter-tight">
              {t('editor.integrations.logo_icon', 'Ícone do Logo')}
            </label>
            <select
              value={(config.logo as string) || 'github'}
              onChange={(e) => handleUpdate({ logo: e.target.value })}
              className="w-full bg-graphite border border-graphite text-chalk font-inter-tight text-note p-1.5 rounded-xs focus:border-signal-lime focus:outline-none"
            >
              <option value="github">GitHub Logo</option>
              <option value="git">Git Logo</option>
              <option value="star">Star Icon</option>
              <option value="awesome">Awesome Logo</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
