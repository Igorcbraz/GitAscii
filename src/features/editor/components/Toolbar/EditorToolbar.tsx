'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Copy,
  Check,
  Save,
  Loader2,
  Download,
  Upload
} from 'lucide-react';
import { CopyGuideModal } from './CopyGuideModal';
import { useEditorStore } from '../../store/editorStore';
import { APP_URL } from '../../../../constants';
import { useI18n } from '@/i18n';
import LanguageSelector from '@/components/ui/LanguageSelector';

export function EditorToolbar() {
  const { t } = useI18n();
  const {
    config,
    githubData,
    zoom,
    setZoom,
    undo,
    redo,
    canUndo,
    canRedo,
    selectedInstanceId,
    removeWidget,
    selectWidget,
    updateWidgetPosition,
    duplicateWidget,
    saveToServer,
    isSaving,
    importLayout,
  } = useEditorStore();

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [copied, setCopied] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await saveToServer();
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleExport = () => {
    if (!config) return;
    try {
      const exportData = {
        widgets: config.widgets,
        globalStyles: config.globalStyles,
        templateId: config.templateId,
      };
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gitascii_layout_${config.username}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export layout:', err);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result !== 'string') return;

        const data = JSON.parse(result);
        if (!data || !Array.isArray(data.widgets)) {
          alert(t('editor.sidebar.import.invalid_format', 'Formato de arquivo inválido: lista de widgets não encontrada.'));
          return;
        }

        // Import widgets and optionally global styles & templateId
        importLayout(data.widgets, data.globalStyles, data.templateId);
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (err) {
        console.error('Failed to parse import file:', err);
        alert(t('editor.sidebar.import.invalid_json', 'Falha ao processar arquivo JSON. Verifique se é um arquivo JSON válido.'));
      }
    };
    reader.readAsText(file);
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          if (canRedo) {
            e.preventDefault();
            redo();
          }
        } else {
          if (canUndo) {
            e.preventDefault();
            undo();
          }
        }
        return;
      }

      if (cmdOrCtrl && e.key.toLowerCase() === 'y') {
        if (canRedo) {
          e.preventDefault();
          redo();
        }
        return;
      }

      if (cmdOrCtrl && e.key.toLowerCase() === 'd') {
        if (selectedInstanceId) {
          e.preventDefault();
          duplicateWidget(selectedInstanceId);
        }
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedInstanceId) {
        const widget = config?.widgets.find((w) => w.instanceId === selectedInstanceId);
        if (widget && !widget.locked) {
          e.preventDefault();
          removeWidget(selectedInstanceId);
        }
        return;
      }

      if (e.key === 'Escape' && selectedInstanceId) {
        e.preventDefault();
        selectWidget(null);
        return;
      }

      if (selectedInstanceId && config) {
        const widget = config.widgets.find((w) => w.instanceId === selectedInstanceId);
        if (widget && !widget.locked) {
          const step = e.shiftKey ? 10 : 2;

          if (e.key === 'ArrowUp') {
            e.preventDefault();
            updateWidgetPosition(widget.instanceId, { x: widget.position.x, y: Math.max(0, widget.position.y - step) }, true);
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            updateWidgetPosition(widget.instanceId, { x: widget.position.x, y: widget.position.y + step }, true);
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            updateWidgetPosition(widget.instanceId, { x: Math.max(0, widget.position.x - step), y: widget.position.y }, true);
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            updateWidgetPosition(widget.instanceId, { x: Math.min(800 - widget.size.width, widget.position.x + step), y: widget.position.y }, true);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    undo,
    redo,
    canUndo,
    canRedo,
    selectedInstanceId,
    removeWidget,
    selectWidget,
    updateWidgetPosition,
    duplicateWidget,
    config,
  ]);

  if (!config || !githubData) return null;

  const username = config.username;
  const profileSlug = config.profileSlug;

  const embedUrl =
    profileSlug === 'default'
      ? `${APP_URL}/api/${username}`
      : `${APP_URL}/api/${username}/${profileSlug}`;

  // Helper functions to generate correct URLs for external widgets
  const getGithubReadmeStatsUrl = (cfg: any, themeMode: 'dark' | 'light') => {
    const u = cfg.username || username;
    const type = cfg.statType || 'stats';
    const th = themeMode === 'light' ? 'default' : (cfg.theme || 'dark');
    const showIcons = cfg.showIcons !== false;
    const countPrivate = !!cfg.countPrivate;
    const includeAllCommits = !!cfg.includeAllCommits;
    const hideRank = !!cfg.hideRank;
    const hideBorder = !!cfg.hideBorder;
    if (type === 'top-langs') {
      const layout = cfg.layout || 'compact';
      const langsCount = cfg.langsCount || 5;
      const hideLangs = cfg.hideLangs || '';
      return `https://github-readme-stats-fast.vercel.app/api/top-langs/?username=${encodeURIComponent(u)}&layout=${layout}&langs_count=${langsCount}&theme=${th}${hideLangs ? `&hide=${encodeURIComponent(hideLangs)}` : ''}${hideBorder ? '&hide_border=true' : ''}`;
    } else if (type === 'pin') {
      const repo = cfg.repoName || 'gitascii';
      return `https://github-readme-stats-fast.vercel.app/api/pin/?username=${encodeURIComponent(u)}&repo=${encodeURIComponent(repo)}&theme=${th}${hideBorder ? '&hide_border=true' : ''}`;
    }
    return `https://github-readme-stats-fast.vercel.app/api?username=${encodeURIComponent(u)}&show_icons=${showIcons}&theme=${th}${countPrivate ? '&count_private=true' : ''}${includeAllCommits ? '&include_all_commits=true' : ''}${hideRank ? '&hide_rank=true' : ''}${hideBorder ? '&hide_border=true' : ''}`;
  };

  const getStreakStatsUrl = (cfg: any, themeMode: 'dark' | 'light') => {
    const u = cfg.username || username;
    const th = themeMode === 'light' ? 'default' : (cfg.theme || 'dark');
    const mode = cfg.mode || 'daily';
    const dateFormat = cfg.dateFormat || 'M j, Y';
    const streakBorderRadius = cfg.streakBorderRadius || 4;
    const hideBorder = !!cfg.hideBorder;
    return `https://streak-stats.demolab.com/?user=${encodeURIComponent(u)}&theme=${th}&mode=${mode}&date_format=${encodeURIComponent(dateFormat)}&border_radius=${streakBorderRadius}${hideBorder ? '&hide_border=true' : ''}`;
  };

  const getProfileTrophyUrl = (cfg: any, themeMode: 'dark' | 'light') => {
    const u = cfg.username || username;
    const th = themeMode === 'light' ? 'flat' : (cfg.theme || 'dark');
    const column = cfg.column || 6;
    const row = cfg.row || 1;
    const noFrame = !!cfg.noFrame;
    const noBg = !!cfg.noBg;
    return `https://github-profile-trophy-fast.vercel.app/?username=${encodeURIComponent(u)}&theme=${th}&column=${column}&row=${row}${noFrame ? '&margin-w=0' : ''}${noBg ? '&no-bg=true' : ''}`;
  };

  const getActivityGraphUrl = (cfg: any, themeMode: 'dark' | 'light') => {
    const u = cfg.username || username;
    const th = themeMode === 'light' ? 'github-light' : (cfg.theme || 'dark');
    const days = cfg.days || 30;
    const area = cfg.showArea !== false;
    const hideBorder = !!cfg.hideBorder;
    return `https://github-readme-activity-graph.vercel.app/graph?username=${encodeURIComponent(u)}&theme=${th}&days=${days}&area=${area}${hideBorder ? '&hide_border=true' : ''}`;
  };

  const getContributionSnakeUrl = (cfg: any, isDark: boolean) => {
    const u = cfg.username || username;
    const branch = cfg.branch || 'output';
    const snakeFileName = isDark ? 'github-contribution-grid-snake-dark.svg' : 'github-contribution-grid-snake.svg';
    return `https://raw.githubusercontent.com/${encodeURIComponent(u)}/${encodeURIComponent(u)}/${encodeURIComponent(branch)}/${snakeFileName}`;
  };

  const getMetricsCardUrl = (cfg: any) => {
    const u = cfg.username || username;
    const template = cfg.template || 'classic';
    const baseSections = cfg.baseSections || 'header,activity,community,repositories';
    return `https://metrics.lecoq.io/${encodeURIComponent(u)}?template=${encodeURIComponent(template)}&base=${encodeURIComponent(baseSections)}`;
  };

  const getViewsCounterUrl = (cfg: any) => {
    const u = cfg.username || username;
    const color = cfg.color || '00f0ff';
    const style = cfg.style || 'for-the-badge';
    const label = cfg.label || 'PROFILE VIEWS';
    const baseVal = cfg.baseVal || 0;
    return `https://komarev.com/ghpvc/?username=${encodeURIComponent(u)}&color=${color}&style=${style}&label=${encodeURIComponent(label)}${baseVal > 0 ? `&base=${baseVal}` : ''}`;
  };

  const getReadmeQuotesUrl = (cfg: any, themeMode: 'dark' | 'light') => {
    const quoteType = cfg.quoteType || 'random';
    const th = themeMode === 'light' ? 'default' : (cfg.theme || 'dark');
    const layout = cfg.layout || 'horizontal';
    return `https://quotes-github-readme.vercel.app/api?type=${quoteType === 'quote-day' ? 'quote-day' : layout}&theme=${th}`;
  };

  const getAwesomeBadgeUrl = (cfg: any) => {
    const badgeStyle = cfg.badgeStyle || 'for-the-badge';
    const badgeColor = cfg.badgeColor || 'brightgreen';
    const label = cfg.label || 'Awesome GitHub Profile';
    const logo = cfg.logo || 'github';
    return `https://img.shields.io/badge/${encodeURIComponent(label)}-Featured-${badgeColor}?style=${badgeStyle}&logo=${encodeURIComponent(logo)}`;
  };

  const EXTERNAL_WIDGET_IDS = [
    'github-readme-stats',
    'streak-stats',
    'profile-trophy',
    'activity-graph',
    'contribution-snake',
    'metrics-card',
    'views-counter',
    'readme-quotes',
    'awesome-badge',
  ];

  // Sort visible widgets by vertical position (Y coordinate)
  const visibleWidgets = [...config.widgets]
    .filter((w) => w.visible)
    .sort((a, b) => a.position.y - b.position.y);

  const codeBlocks: string[] = [];
  let currentGroup: string[] = [];

  const flushGroup = () => {
    if (currentGroup.length > 0) {
      const ids = currentGroup.join(',');
      codeBlocks.push(`<picture>
  <source media="(prefers-color-scheme: dark)" srcset="${embedUrl}?theme=dark&widgets=${ids}" />
  <source media="(prefers-color-scheme: light)" srcset="${embedUrl}?theme=light&widgets=${ids}" />
  <img alt="${username}'s GitAscii Section" src="${embedUrl}?widgets=${ids}" />
</picture>`);
      currentGroup = [];
    }
  };

  visibleWidgets.forEach((w) => {
    if (EXTERNAL_WIDGET_IDS.includes(w.widgetId)) {
      flushGroup();

      let darkUrl = '';
      let lightUrl = '';

      switch (w.widgetId) {
        case 'github-readme-stats':
          darkUrl = getGithubReadmeStatsUrl(w.config, 'dark');
          lightUrl = getGithubReadmeStatsUrl(w.config, 'light');
          break;
        case 'streak-stats':
          darkUrl = getStreakStatsUrl(w.config, 'dark');
          lightUrl = getStreakStatsUrl(w.config, 'light');
          break;
        case 'profile-trophy':
          darkUrl = getProfileTrophyUrl(w.config, 'dark');
          lightUrl = getProfileTrophyUrl(w.config, 'light');
          break;
        case 'activity-graph':
          darkUrl = getActivityGraphUrl(w.config, 'dark');
          lightUrl = getActivityGraphUrl(w.config, 'light');
          break;
        case 'contribution-snake':
          darkUrl = getContributionSnakeUrl(w.config, true);
          lightUrl = getContributionSnakeUrl(w.config, false);
          break;
        case 'metrics-card':
          darkUrl = getMetricsCardUrl(w.config);
          lightUrl = darkUrl;
          break;
        case 'views-counter':
          darkUrl = getViewsCounterUrl(w.config);
          lightUrl = darkUrl;
          break;
        case 'readme-quotes':
          darkUrl = getReadmeQuotesUrl(w.config, 'dark');
          lightUrl = getReadmeQuotesUrl(w.config, 'light');
          break;
        case 'awesome-badge':
          darkUrl = getAwesomeBadgeUrl(w.config);
          lightUrl = darkUrl;
          break;
      }

      let markdownElement = '';
      if (w.widgetId === 'contribution-snake') {
        const u = (w.config.username as string) || username;
        const branch = (w.config.branch as string) || 'output';
        const snakeUrl = `https://github.com/${encodeURIComponent(u)}/${encodeURIComponent(u)}/raw/${encodeURIComponent(branch)}/github-contribution-grid-snake.svg`;
        markdownElement = `![Snake animation](${snakeUrl})`;
      } else if (w.widgetId === 'awesome-badge') {
        markdownElement = `[![Featured Awesome Profile Badge](${darkUrl})](https://github.com/abhisheknaiidu/awesome-github-profile-readme)`;
      } else {
        markdownElement = `![${w.name || w.widgetId}](${darkUrl})`;
      }

      codeBlocks.push(markdownElement);
    } else {
      currentGroup.push(w.instanceId);
    }
  });

  flushGroup();

  const embedCode = codeBlocks.join('\n\n');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    
    const skipGuide = typeof window !== 'undefined' && localStorage.getItem('gitascii_skip_copy_guide') === 'true';
    if (!skipGuide) {
      setShowGuide(true);
    }
    
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="relative h-14 w-full bg-void-black border-b border-graphite px-4 flex items-center justify-between text-chalk shrink-0 z-30">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-1">
          <span className="font-inter-tight text-[16px] font-medium text-chalk">Git</span>
          <span className="font-pt-serif text-[16px] font-light italic text-signal-lime">Ascii</span>
        </Link>

        <div className="h-4 w-px bg-graphite" />

        <div className="flex items-center gap-2 text-ash text-label font-inter-tight">
          <span className="text-chalk font-medium">@{username}</span>
          <span>/</span>
          <span className="text-signal-lime uppercase tracking-wider font-medium text-eyebrow px-2 py-0.5 border border-graphite rounded-xs bg-onyx">
            {config.profileName || 'Default'}
          </span>
        </div>
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 bg-onyx border border-graphite rounded-sm p-1">
        <button
          onClick={undo}
          disabled={!canUndo}
          title={t('editor.toolbar.undo', 'Undo')}
          className="p-1.5 rounded-xs hover:bg-graphite disabled:opacity-30 disabled:hover:bg-transparent text-chalk transition-colors cursor-pointer"
        >
          <Undo2 size={16} />
        </button>

        <button
          onClick={redo}
          disabled={!canRedo}
          title={t('editor.toolbar.redo', 'Redo')}
          className="p-1.5 rounded-xs hover:bg-graphite disabled:opacity-30 disabled:hover:bg-transparent text-chalk transition-colors cursor-pointer"
        >
          <Redo2 size={16} />
        </button>

        <div className="h-4 w-px bg-graphite mx-1" />

        <button
          onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
          title={t('editor.toolbar.zoom_out', 'Zoom Out')}
          className="p-1.5 rounded-xs hover:bg-graphite text-chalk transition-colors cursor-pointer"
        >
          <ZoomOut size={16} />
        </button>

        <span className="font-jetbrains-mono text-eyebrow text-ash px-2">
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}
          title={t('editor.toolbar.zoom_in', 'Zoom In')}
          className="p-1.5 rounded-xs hover:bg-graphite text-chalk transition-colors cursor-pointer"
        >
          <ZoomIn size={16} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <LanguageSelector align="right" />

        <button
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-inter-tight font-medium text-note uppercase tracking-wider transition-all cursor-pointer ${
            saveStatus === 'saved'
              ? 'bg-signal-lime text-black glow-lime'
              : saveStatus === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-onyx text-chalk border border-graphite hover:bg-graphite hover:text-white'
          }`}
        >
          {saveStatus === 'saving' ? (
            <Loader2 size={14} className="animate-spin" />
          ) : saveStatus === 'saved' ? (
            <Check size={14} />
          ) : (
            <Save size={14} />
          )}
          <span>
            {saveStatus === 'saving'
              ? t('common.saving', 'Saving...')
              : saveStatus === 'saved'
              ? t('common.saved', 'Saved!')
              : saveStatus === 'error'
              ? t('common.error', 'Error!')
              : t('common.save_profile', 'Save Profile')}
          </span>
        </button>

        <button
          onClick={handleCopyCode}
          className="flex items-center gap-1.5 bg-signal-lime text-black px-3 py-1.5 rounded-sm font-inter-tight font-medium text-note uppercase tracking-wider glow-lime hover:brightness-110 transition-all cursor-pointer"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? t('common.copied', 'Copied!') : t('common.copy_code', 'Copy Code')}</span>
        </button>
      </div>

      <CopyGuideModal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        username={username}
        embedCode={embedCode}
      />
    </header>
  );
}
