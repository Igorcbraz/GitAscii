'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  User,
  Terminal,
  TerminalSquare,
  Heading,
  FileText,
  BarChart3,
  Code2,
  FolderGit2,
  Minus,
  LayoutTemplate,
  Plus,
  Share2,
  Cpu,
  Flame,
  Trophy,
  Activity,
  PieChart,
  Eye,
  Quote,
  Award,
  TrendingUp,
  Search,
  X,
  ShieldCheck,
  Grid,
  Globe,
  Download,
  Upload,
  GitFork,
  Type
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { TEMPLATE_PRESETS } from '@/engine/core/TemplateRenderer';
import { WidgetPreviewTooltip, type WidgetCatalogItem, type WidgetBadgeType } from './WidgetPreviewTooltip';
import { useI18n } from '@/i18n';

const WIDGET_CATALOG: WidgetCatalogItem[] = [
  {
    id: 'header',
    name: 'Header',
    icon: Heading,
    desc: 'Name, handle & company badge',
    category: 'essential',
    badge: { text: 'Mais Usado', type: 'popular' },
  },
  {
    id: 'ascii-text',
    name: 'ASCII Text',
    icon: Type,
    desc: 'Custom text rendered in ASCII art font',
    category: 'interactive',
    badge: { text: 'Novo', type: 'highlight' },
  },
  {
    id: 'ascii-art',
    name: 'ASCII Art',
    icon: Terminal,
    desc: 'Image converted to character art',
    category: 'interactive',
    badge: { text: 'Destaque', type: 'highlight' },
  },
  {
    id: 'terminal-info',
    name: 'Terminal Info',
    icon: TerminalSquare,
    desc: 'Neofetch-style terminal info card',
    category: 'essential',
    badge: { text: 'Mais Usado', type: 'popular' },
  },
  {
    id: 'avatar',
    name: 'Avatar',
    icon: User,
    desc: 'Profile picture frame',
    category: 'essential',
    badge: { text: 'Essencial', type: 'essential' },
  },
  {
    id: 'tech-stack',
    name: 'Tech Stack',
    icon: Cpu,
    desc: 'Interactive skill icons gallery',
    category: 'interactive',
    badge: { text: 'Interativo', type: 'interactive' },
  },
  {
    id: 'bio',
    name: 'Bio & Links',
    icon: FileText,
    desc: 'Biography, location & blog link',
    category: 'essential',
  },
  {
    id: 'stats',
    name: 'GitHub Stats',
    icon: BarChart3,
    desc: 'Stars, repos, followers metrics',
    category: 'stats',
    badge: { text: 'Popular', type: 'popular' },
  },
  {
    id: 'languages',
    name: 'Top Languages',
    icon: Code2,
    desc: 'Language breakdown bar',
    category: 'stats',
  },
  {
    id: 'repositories',
    name: 'Featured Repos',
    icon: FolderGit2,
    desc: 'Highlighted repository cards',
    category: 'stats',
  },
  {
    id: 'social-media',
    name: 'Social Media',
    icon: Share2,
    desc: 'Shields & social media badges',
    category: 'misc',
  },

  {
    id: 'github-readme-stats',
    name: 'GitHub Readme Stats',
    icon: BarChart3,
    desc: 'Estatísticas, top linguagens & repos fixados',
    isExternal: true,
    category: 'external',
    badge: { text: 'Popular', type: 'popular' },
  },
  {
    id: 'streak-stats',
    name: 'GitHub Streak Stats',
    icon: Flame,
    desc: 'Sequência e recorde de contribuições',
    isExternal: true,
    category: 'external',
  },
  {
    id: 'profile-trophy',
    name: 'GitHub Profile Trophy',
    icon: Trophy,
    desc: 'Troféus e conquistas do perfil',
    isExternal: true,
    category: 'external',
  },
  {
    id: 'activity-graph',
    name: 'Activity Graph',
    icon: Activity,
    desc: 'Gráfico de linhas de atividade em 31 dias',
    isExternal: true,
    category: 'external',
  },
  {
    id: 'contribution-snake',
    name: 'Contribution Snake',
    icon: TrendingUp,
    desc: 'Cobra animada comendo os blocos de commit',
    isExternal: true,
    category: 'external',
    badge: { text: 'Trending', type: 'trending' },
  },
  {
    id: 'metrics-card',
    name: 'Metrics Card',
    icon: PieChart,
    desc: 'Infográfico avançado de métricas e hábitos',
    isExternal: true,
    category: 'external',
  },
  {
    id: 'views-counter',
    name: 'Profile Views Counter',
    icon: Eye,
    desc: 'Contador de visitas ao perfil GitHub',
    isExternal: true,
    category: 'external',
  },
  {
    id: 'readme-quotes',
    name: 'GitHub Readme Quotes',
    icon: Quote,
    desc: 'Citação diária para desenvolvedores',
    isExternal: true,
    category: 'external',
  },
  {
    id: 'awesome-badge',
    name: 'Awesome Profile Badge',
    icon: Award,
    desc: 'Badge de destaque para perfis incríveis',
    isExternal: true,
    category: 'external',
  },

  {
    id: 'divider',
    name: 'Neon Divider',
    icon: Minus,
    desc: 'Section separator line',
    category: 'misc',
  },
  {
    id: 'footer',
    name: 'Footer Stamp',
    icon: LayoutTemplate,
    desc: 'Signature metadata footer',
    category: 'misc',
  },
];

function renderWidgetBadge(badge?: { text: string; type: WidgetBadgeType }) {
  if (!badge) return null;

  return (
    <span className="text-[9px] font-inter-tight font-medium text-signal-lime/90 bg-signal-lime/10 border border-signal-lime/20 px-1.5 py-0.5 rounded-xs shrink-0 whitespace-nowrap">
      {badge.text}
    </span>
  );
}

export function WidgetLibrary() {
  const { t } = useI18n();
  const { config, githubData, addWidget, applyTemplate, importLayout } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [sidebarTab, setSidebarTab] = useState<'widgets' | 'templates'>('widgets');
  const [hoveredWidget, setHoveredWidget] = useState<{
    item: WidgetCatalogItem;
    rect: DOMRect;
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'popular' | 'essential' | 'external'>('all');

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    setIsMouseDown(true);
    setIsDragging(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDown || !scrollRef.current) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 4) {
      setIsDragging(true);
    }
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsMouseDown(false);
    setTimeout(() => setIsDragging(false), 50);
  };

  const translatedCatalog = useMemo(() => {
    return WIDGET_CATALOG.map((item) => ({
      ...item,
      name: t(`widget.catalog.${item.id}.name`, item.name),
      desc: t(`widget.catalog.${item.id}.desc`, item.desc),
      badge: item.badge ? {
        ...item.badge,
        text: t(`widget.badge.${item.badge.text.toLowerCase().replace(/\s+/g, '_')}`, item.badge.text)
      } : undefined
    }));
  }, [t]);

  const filteredWidgets = useMemo(() => {
    return translatedCatalog.filter((item) => {
      if (categoryFilter === 'popular') {
        if (!item.badge || (item.badge.type !== 'popular' && item.badge.type !== 'highlight' && item.badge.type !== 'trending')) {
          return false;
        }
      } else if (categoryFilter === 'essential') {
        if (item.category !== 'essential' && item.badge?.type !== 'essential') {
          return false;
        }
      } else if (categoryFilter === 'external') {
        if (!item.isExternal) return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        item.badge?.text.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
      );
    });
  }, [categoryFilter, searchQuery, translatedCatalog]);

  if (!config) return null;

  const handleMouseEnter = (item: WidgetCatalogItem, event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setHoveredWidget({ item, rect });
  };

  const handleMouseLeave = () => {
    setHoveredWidget(null);
  };

  const renderWidgetCard = (item: WidgetCatalogItem) => {
    const Icon = item.icon;

    return (
      <div
        key={item.id}
        onClick={() => addWidget(item.id)}
        onMouseEnter={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setHoveredWidget({ item, rect });
        }}
        onMouseLeave={() => setHoveredWidget(null)}
        className="group relative p-3 border border-graphite hover:border-signal-lime bg-void-black/60 hover:bg-onyx transition-all rounded-xs cursor-pointer flex items-center justify-between shadow-xs"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xs bg-graphite group-hover:bg-signal-lime text-signal-lime group-hover:text-black transition-colors shrink-0">
            <Icon size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-inter-tight font-medium text-label text-chalk group-hover:text-signal-lime transition-colors">
                {item.name}
              </h4>
              {renderWidgetBadge(item.badge)}
            </div>
            <p className="font-inter-tight text-eyebrow text-ash line-clamp-1">
              {item.desc}
            </p>
          </div>
        </div>
        <button className="text-ash group-hover:text-signal-lime transition-colors p-1 shrink-0 self-center">
          <Plus size={15} />
        </button>
      </div>
    );
  };

  const FILTER_ITEMS = [
    { id: 'all', label: t('editor.sidebar.filter.all', 'Todos'), icon: Grid },
    { id: 'popular', label: t('editor.sidebar.filter.popular', 'Destaques'), icon: Flame },
    { id: 'essential', label: t('editor.sidebar.filter.essential', 'Essenciais'), icon: ShieldCheck },
    { id: 'external', label: t('editor.sidebar.filter.external', 'Externos'), icon: Globe },
  ];

  return (
    <aside className="w-75 h-full bg-onyx border-r border-graphite flex flex-col shrink-0">
      <div className="flex border-b border-graphite bg-void-black">
        <button
          onClick={() => setSidebarTab('widgets')}
          className={`flex-1 py-3 font-inter-tight text-eyebrow font-medium uppercase tracking-[0.12em] transition-colors cursor-pointer border-b-2 ${sidebarTab === 'widgets'
            ? 'border-signal-lime text-signal-lime bg-onyx'
            : 'border-transparent text-ash hover:text-chalk'
            }`}
        >
          {t('editor.sidebar.widgets', 'Widgets')}
        </button>
        <button
          onClick={() => setSidebarTab('templates')}
          className={`flex-1 py-3 font-inter-tight text-eyebrow font-medium uppercase tracking-[0.12em] transition-colors cursor-pointer border-b-2 ${sidebarTab === 'templates'
            ? 'border-signal-lime text-signal-lime bg-onyx'
            : 'border-transparent text-ash hover:text-chalk'
            }`}
        >
          {t('editor.sidebar.templates', 'Templates')}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {sidebarTab === 'widgets' && (
          <>
            <div className="space-y-2 pb-1 border-b border-graphite/60">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ash" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('editor.sidebar.search_placeholder', 'Buscar widget...')}
                  className="w-full bg-void-black text-chalk text-note font-inter-tight pl-8 pr-7 py-1.5 border border-graphite rounded-xs focus:outline-none focus:border-signal-lime placeholder:text-ash/60 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-ash hover:text-chalk p-0.5"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              <div
                ref={scrollRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none cursor-grab active:cursor-grabbing"
              >
                {FILTER_ITEMS.map((filter) => {
                  const FilterIcon = filter.icon;
                  const isActive = categoryFilter === filter.id;
                  return (
                    <button
                      key={filter.id}
                      onClick={() => {
                        if (isDragging) return;
                        setCategoryFilter(filter.id as any);
                      }}
                      className={`px-2 py-1 text-caption font-medium font-inter-tight rounded-xs border whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${isActive
                        ? 'bg-signal-lime/10 text-signal-lime border-signal-lime'
                        : 'bg-void-black/60 text-ash border-graphite hover:text-chalk hover:border-slate'
                        }`}
                    >
                      <FilterIcon size={12} className={isActive ? 'text-signal-lime' : 'text-ash'} />
                      <span>{filter.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="label-stamp">
                {categoryFilter === 'all' && !searchQuery
                  ? '[ WIDGET CATALOG ]'
                  : `[ RESULTS: ${filteredWidgets.length} ]`}
              </div>
            </div>

            {filteredWidgets.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-graphite rounded-xs text-ash text-note font-inter-tight">
                {t('editor.sidebar.no_widgets', 'Nenhum widget encontrado para "{query}"', { query: searchQuery })}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredWidgets.map(renderWidgetCard)}

                <a
                  href="https://github.com/Igorcbraz/GitAscii/fork"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative p-2.5 border border-signal-lime/60 bg-signal-lime/5 hover:bg-signal-lime/15 transition-all rounded-xs cursor-pointer flex items-center gap-2.5 hover:shadow-[0_0_20px_rgba(197,255,74,0.15)]"
                >
                  <div className="p-1.5 rounded-xs bg-signal-lime text-black shrink-0">
                    <GitFork size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-inter-tight font-medium text-note text-signal-lime leading-tight">
                      {t('editor.sidebar.contribute_widget', 'Adicione seu próprio Widget!')}
                    </h4>
                    <p className="font-inter-tight text-caption text-chalk/50 leading-tight">
                      {t('editor.sidebar.contribute_widget_desc', 'Faça um fork e contribua com a comunidade')}
                    </p>
                  </div>
                </a>
              </div>
            )}
          </>
        )}

        {sidebarTab === 'templates' && (
          <>
            <div className="label-stamp mb-2">{t('editor.sidebar.portability', '[ PORTABILITY ]')}</div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />
            <div className="space-y-2 mb-4">
              <div
                onClick={handleImportClick}
                className="group relative p-2.5 border border-graphite hover:border-signal-lime bg-void-black/60 hover:bg-onyx transition-all rounded-xs cursor-pointer flex items-center justify-between shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-xs bg-graphite group-hover:bg-signal-lime text-signal-lime group-hover:text-black transition-colors shrink-0">
                    <Upload size={14} />
                  </div>
                  <div>
                    <h4 className="font-inter-tight font-medium text-note text-chalk group-hover:text-signal-lime transition-colors">
                      {t('editor.sidebar.import_layout', 'Import Layout')}
                    </h4>
                    <p className="font-inter-tight text-caption text-ash line-clamp-1">
                      {t('editor.sidebar.import_layout_desc', 'Carregar layout de arquivo JSON')}
                    </p>
                  </div>
                </div>
              </div>

              <div
                onClick={handleExport}
                className="group relative p-2.5 border border-graphite hover:border-signal-lime bg-void-black/60 hover:bg-onyx transition-all rounded-xs cursor-pointer flex items-center justify-between shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-xs bg-graphite group-hover:bg-signal-lime text-signal-lime group-hover:text-black transition-colors shrink-0">
                    <Download size={14} />
                  </div>
                  <div>
                    <h4 className="font-inter-tight font-medium text-note text-chalk group-hover:text-signal-lime transition-colors">
                      {t('editor.sidebar.export_layout', 'Export Layout')}
                    </h4>
                    <p className="font-inter-tight text-caption text-ash line-clamp-1">
                      {t('editor.sidebar.export_layout_desc', 'Salvar layout atual em arquivo JSON')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="label-stamp mb-2">{t('editor.sidebar.preset_templates', '[ PRESET TEMPLATES ]')}</div>
            <p className="text-note text-ash font-inter-tight mb-4">
              {t('editor.sidebar.templates_desc', 'Switching templates updates colors and layout while preserving your GitHub data.')}
            </p>
            {Object.values(TEMPLATE_PRESETS).map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => applyTemplate(tmpl.id)}
                className={`p-4 border rounded-none cursor-pointer transition-all ${config.templateId === tmpl.id
                  ? 'border-signal-lime bg-iron shadow-sm'
                  : 'border-graphite bg-graphite hover:border-slate'
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-inter-tight font-medium text-body text-chalk">
                    {tmpl.name}
                  </h4>
                  {config.templateId === tmpl.id && (
                    <span className="text-caption uppercase font-inter-tight font-medium text-signal-lime px-2 py-0.5 border border-signal-lime rounded-[9999px]">
                      {t('editor.sidebar.active', 'Active')}
                    </span>
                  )}
                </div>
                <p className="font-inter-tight text-note text-ash mb-3">
                  {tmpl.description}
                </p>
                <div className="flex gap-2">
                  <div className="h-4 w-4 rounded-full border border-slate" style={{ backgroundColor: tmpl.colors.background }} />
                  <div className="h-4 w-4 rounded-full border border-slate" style={{ backgroundColor: tmpl.colors.accent }} />
                  <div className="h-4 w-4 rounded-full border border-slate" style={{ backgroundColor: tmpl.colors.cardBackground }} />
                </div>
              </div>
            ))}

            <a
              href="https://github.com/Igorcbraz/GitAscii/fork"
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-2.5 border border-signal-lime/60 bg-signal-lime/5 hover:bg-signal-lime/15 transition-all rounded-none cursor-pointer hover:shadow-[0_0_20px_rgba(197,255,74,0.15)]"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-xs bg-signal-lime text-black shrink-0">
                  <GitFork size={14} />
                </div>
                <div>
                  <h4 className="font-inter-tight font-medium text-note text-signal-lime leading-tight">
                    {t('editor.sidebar.contribute_template', 'Crie seu próprio Template!')}
                  </h4>
                  <p className="font-inter-tight text-caption text-chalk/50 leading-tight">
                    {t('editor.sidebar.contribute_template_desc', 'Faça um fork e compartilhe com a comunidade')}
                  </p>
                </div>
              </div>
            </a>
          </>
        )}
      </div>

      {hoveredWidget && sidebarTab === 'widgets' && (
        <WidgetPreviewTooltip
          widgetItem={hoveredWidget.item}
          targetRect={hoveredWidget.rect}
          globalStyles={config.globalStyles}
          githubData={githubData}
        />
      )}
    </aside>
  );
}
