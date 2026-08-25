'use client'

import {
  ArrowRight,
  Check,
  Code2,
  Copy,
  Github,
  Grid,
  Monitor,
  Palette,
  Search,
  Sliders,
  Terminal as TerminalIcon,
  Wand2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useMemo, useState } from 'react'

import {
  APP_URL,
  EXTERNAL_LINKS,
  WIDGET_IDS,
  type WidgetId,
} from '@/constants'
import { renderWidgetSvg } from '@/engine/core/WidgetRenderer'
import type { GlobalStyles, WidgetInstance } from '@/engine/types'
import { getMockGitHubData } from '@/features/github/api/mockProfile'
import { useI18n } from '@/i18n'
import { copyToClipboard } from '@/utils/clipboard'

interface ThemePreset {
  id: string
  name: string
  accent: string
  bg: string
  textColor: string
  borderColor: string
  templateStyle: string
}

const DEMO_THEMES: ThemePreset[] = [
  {
    id: 'terminal',
    name: 'Terminal CLI',
    accent: '#c5ff4a',
    bg: '#060606',
    textColor: '#ffffff',
    borderColor: '#252525',
    templateStyle: 'terminal',
  },
  {
    id: 'dracula',
    name: 'Dracula',
    accent: '#bd93f9',
    bg: '#282a36',
    textColor: '#f8f8f2',
    borderColor: '#44475a',
    templateStyle: 'dracula',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    accent: '#ff00ff',
    bg: '#0a0a0f',
    textColor: '#00ffff',
    borderColor: '#331144',
    templateStyle: 'cyberpunk',
  },
  {
    id: 'nord',
    name: 'Nord Arctic',
    accent: '#88c0d0',
    bg: '#2e3440',
    textColor: '#eceff4',
    borderColor: '#434c5e',
    templateStyle: 'nord',
  },
  {
    id: 'minimal',
    name: 'Minimal Light',
    accent: '#000000',
    bg: '#ffffff',
    textColor: '#111111',
    borderColor: '#e5e5e5',
    templateStyle: 'minimal',
  },
]

interface CatalogWidget {
  id: WidgetId
  name: string
  category: 'essential' | 'stats' | 'interactive' | 'visual'
  height: number
  desc: string
}

const CATALOG_WIDGETS: CatalogWidget[] = [
  {
    id: WIDGET_IDS.ASCII_ART,
    name: 'ASCII Art Banner',
    category: 'visual',
    height: 180,
    desc: 'Image-to-ASCII vector matrix',
  },
  {
    id: WIDGET_IDS.STATS,
    name: 'GitHub Stats Card',
    category: 'stats',
    height: 150,
    desc: 'Stars, PRs, commits & grade',
  },
  {
    id: WIDGET_IDS.LANGUAGES,
    name: 'Top Languages Breakdown',
    category: 'stats',
    height: 130,
    desc: 'Language percentages & donut',
  },
  {
    id: WIDGET_IDS.TECH_STACK,
    name: 'Tech Stack Badges',
    category: 'essential',
    height: 110,
    desc: 'Vector icon skills & toolchain',
  },
  {
    id: WIDGET_IDS.BIO,
    name: 'Terminal Bio Card',
    category: 'essential',
    height: 90,
    desc: 'Custom developer presentation',
  },
  {
    id: WIDGET_IDS.REPOSITORIES,
    name: 'Top Repositories',
    category: 'stats',
    height: 170,
    desc: 'Pinned projects & stargazers',
  },
  {
    id: WIDGET_IDS.POKEMON_CARD,
    name: 'Pokémon Dev Card',
    category: 'interactive',
    height: 280,
    desc: 'Collectible Holo TCG card',
  },
]

export function LandingMiniEditor({ readmesCount = 12400 }: { readmesCount?: number }) {
  const { t } = useI18n()

  const [activeThemeId, setActiveThemeId] = useState<string>('terminal')
  const [activeWidgetIds, setActiveWidgetIds] = useState<WidgetId[]>([
    WIDGET_IDS.ASCII_ART,
    WIDGET_IDS.STATS,
    WIDGET_IDS.LANGUAGES,
  ])
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(
    `demo-${WIDGET_IDS.STATS}`
  )
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [zoomLevel, setZoomLevel] = useState<number>(100)
  const [viewMode, setViewMode] = useState<'gitascii' | 'github'>('gitascii')
  const [copied, setCopied] = useState<boolean>(false)

  const activeTheme = useMemo(
    () => DEMO_THEMES.find((th) => th.id === activeThemeId) || DEMO_THEMES[0],
    [activeThemeId]
  )

  const demoData = useMemo(() => getMockGitHubData('Igorcbraz'), [])

  const filteredCatalog = useMemo(() => {
    return CATALOG_WIDGETS.filter((w) => {
      const matchCat = activeCategory === 'all' || w.category === activeCategory
      const matchSearch =
        searchQuery === '' ||
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.desc.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCat && matchSearch
    })
  }, [activeCategory, searchQuery])

  const toggleWidget = (id: WidgetId) => {
    setActiveWidgetIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev
        const next = prev.filter((wId) => wId !== id)
        if (selectedInstanceId === `demo-${id}`) {
          setSelectedInstanceId(next[0] ? `demo-${next[0]}` : null)
        }
        return next
      }
      setSelectedInstanceId(`demo-${id}`)
      return [...prev, id]
    })
  }

  const { svgMarkup } = useMemo(() => {
    const globalStyles: GlobalStyles = {
      backgroundColor: activeTheme.bg,
      textColor: activeTheme.textColor,
      accentColor: activeTheme.accent,
      borderColor: activeTheme.borderColor,
      fontFamily: 'JetBrains Mono',
      borderRadius: 0,
      padding: 16,
      themeMode: 'dark',
      templateStyle: activeTheme.templateStyle,
    }

    let currentY = 16
    const widgets: WidgetInstance[] = []

    CATALOG_WIDGETS.forEach((widgetDef) => {
      if (!activeWidgetIds.includes(widgetDef.id)) return

      const wHeight = widgetDef.height
      const instance: WidgetInstance = {
        instanceId: `demo-${widgetDef.id}`,
        widgetId: widgetDef.id,
        name: widgetDef.name,
        position: { x: 16, y: currentY },
        size: { width: 768, height: wHeight },
        locked: false,
        visible: true,
        zIndex: widgets.length + 1,
        config: {
          accentColor: activeTheme.accent,
          backgroundColor: activeTheme.bg,
          textColor: activeTheme.textColor,
          borderColor: activeTheme.borderColor,
          templateStyle: activeTheme.templateStyle,
          customBio:
            widgetDef.id === WIDGET_IDS.BIO
              ? 'Full Stack Engineer & Open Source Creator. Building high performance developer tools.'
              : undefined,
          asciiText:
            widgetDef.id === WIDGET_IDS.ASCII_ART
              ? [
                  '  ██████╗ ██╗████████╗ █████╗ ███████╗ ██████╗██╗██╗',
                  ' ██╔════╝ ██║╚══██╔══╝██╔══██╗██╔════╝██╔════╝██║██║',
                  ' ██║  ███╗██║   ██║   ███████║███████╗██║     ██║██║',
                  ' ██║   ██║██║   ██║   ██╔══██║╚════██║██║     ██║██║',
                  ' ╚██████╔╝██║   ██║   ██║  ██║███████║╚██████╗██║██║',
                ]
              : undefined,
        },
      }

      widgets.push(instance)
      currentY += wHeight + 16
    })

    const width = 800
    const calculatedHeight = Math.max(currentY + 16, 320)

    const renderedWidgets = widgets
      .map((w) => renderWidgetSvg(w, demoData, globalStyles, true, false))
      .join('\n')

    const fullSvg = `<svg width="100%" height="100%" viewBox="0 0 ${width} ${calculatedHeight}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <style>
    @import url('${EXTERNAL_LINKS.GOOGLE_FONTS_CSS}');
    * { box-sizing: border-box; }
    text { user-select: none; }
    .gitascii-canvas-bg { fill: ${activeTheme.bg}; }
  </style>
  <rect width="${width}" height="${calculatedHeight}" fill="${activeTheme.bg}" stroke="${activeTheme.borderColor}" stroke-width="1" />
  ${renderedWidgets}
</svg>`

    return { svgMarkup: fullSvg }
  }, [activeWidgetIds, activeTheme, demoData])

  const handleCopy = async () => {
    const markdown = `<!-- GitAscii Dynamic GitHub Profile README -->\n<picture>\n  <source media="(prefers-color-scheme: dark)" srcset="${APP_URL}/api/Igorcbraz?template=${activeThemeId}" />\n  <source media="(prefers-color-scheme: light)" srcset="${APP_URL}/api/Igorcbraz?template=minimal" />\n  <img src="${APP_URL}/api/Igorcbraz?template=${activeThemeId}" alt="Igor Braz GitHub Profile" width="100%" />\n</picture>`
    await copyToClipboard(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleScrollToHero = () => {
    if (typeof window !== 'undefined') {
      const input = document.getElementById('hero-username-input')
      if (input) {
        input.focus()
        input.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  return (
    <section
      id="editor-demo"
      className="relative z-10 w-full bg-carbon py-20 md:py-28 px-4 sm:px-6 lg:px-8 border-b border-graphite"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-signal-lime/5 border border-signal-lime/20 text-signal-lime font-jetbrains-mono text-[11px] uppercase tracking-[0.2em]">
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>{t('landing.editor_demo.badge', '[ LIVE EDITOR SANDBOX ]')}</span>
          </div>

          <h2 className="font-pt-serif font-light text-3xl sm:text-heading leading-[0.95] tracking-[-0.02em] text-chalk">
            {t('landing.editor_demo.title_start', 'Test the Real ')}
            <em className="italic text-signal-lime">
              {t('landing.editor_demo.title_highlight', 'Editor.')}
            </em>
          </h2>

          <p className="font-inter-tight text-body text-bone leading-relaxed max-w-xl mx-auto">
            {t(
              'landing.editor_demo.subtitle',
              `Used to build ${readmesCount.toLocaleString()}+ developer READMEs. Try the real 3-panel workspace: add widgets, switch themes, inspect properties, and toggle preview modes.`
            )}
          </p>
        </div>

        <div className="bg-onyx border border-graphite rounded-none shadow-2xl overflow-hidden flex flex-col">
          <div className="bg-void-black px-4 py-2.5 border-b border-graphite flex flex-wrap items-center justify-between gap-3 text-ash font-inter-tight select-none">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]/80 border border-[#e0443e]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]/80 border border-[#dea123]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f]/80 border border-[#1aab29]" />
              </div>

              <div className="h-4 w-px bg-graphite hidden sm:block" />

              <div className="flex items-center gap-2">
                <span className="font-jetbrains-mono text-[11px] uppercase tracking-wider text-ash hidden md:inline">
                  Template:
                </span>
                <select
                  value={activeThemeId}
                  onChange={(e) => setActiveThemeId(e.target.value)}
                  className="bg-carbon border border-graphite text-chalk font-jetbrains-mono text-[11px] px-2.5 py-1 uppercase tracking-wider focus:border-signal-lime focus:outline-none cursor-pointer"
                >
                  {DEMO_THEMES.map((th) => (
                    <option key={th.id} value={th.id} className="bg-carbon text-chalk">
                      {th.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center bg-carbon border border-graphite p-0.5">
              <button
                onClick={() => setViewMode('gitascii')}
                className={`px-3 py-1 font-jetbrains-mono text-[11px] uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'gitascii'
                    ? 'bg-signal-lime text-carbon font-semibold shadow-xs'
                    : 'text-ash hover:text-chalk'
                }`}
              >
                <Monitor className="w-3 h-3" />
                <span>Canvas</span>
              </button>
              <button
                onClick={() => setViewMode('github')}
                className={`px-3 py-1 font-jetbrains-mono text-[11px] uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'github'
                    ? 'bg-signal-lime text-carbon font-semibold shadow-xs'
                    : 'text-ash hover:text-chalk'
                }`}
              >
                <Github className="w-3 h-3" />
                <span>GitHub Mode</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center gap-1 bg-carbon border border-graphite px-2 py-1 font-jetbrains-mono text-[11px]">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
                  className="text-ash hover:text-chalk cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3 h-3" />
                </button>
                <span className="text-ash/80 px-1">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                  className="text-ash hover:text-chalk cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3 h-3" />
                </button>
              </div>

              <button
                onClick={handleScrollToHero}
                className="px-3.5 py-1.5 bg-signal-lime hover:bg-signal-lime-hover text-carbon font-inter-tight font-semibold text-[12px] uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <span>Launch Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="bg-onyx border-b border-graphite px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-[12px] font-inter-tight select-none">
            <div className="flex items-center gap-2">
              <span className="text-signal-lime font-jetbrains-mono font-semibold uppercase tracking-wider text-[11px]">
                [ SANDBOX PREVIEW ]
              </span>
              <span className="text-pearl">
                Testing as <strong className="text-chalk">@Igorcbraz</strong>. Connect your GitHub account in the Hero to sync in 1 click.
              </span>
            </div>

            <div className="flex items-center gap-2 text-ash font-jetbrains-mono text-[11px]">
              <button
                onClick={handleCopy}
                className="hover:text-signal-lime flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-signal-lime" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Snippet' : 'Copy Markdown'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px] bg-carbon relative">
            <div className="lg:col-span-3 bg-void-black/80 border-b lg:border-b-0 lg:border-r border-graphite p-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-graphite">
                  <div className="flex items-center gap-2 text-chalk font-inter-tight font-semibold text-[13px]">
                    <Grid className="w-4 h-4 text-signal-lime" />
                    <span>Widget Library</span>
                  </div>
                  <span className="font-jetbrains-mono text-[10px] text-ash uppercase">
                    {activeWidgetIds.length}/{CATALOG_WIDGETS.length} Active
                  </span>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-ash absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search 70+ widgets..."
                    className="w-full pl-8 pr-3 py-1.5 bg-carbon border border-graphite text-[12px] text-chalk font-jetbrains-mono focus:border-signal-lime focus:outline-none"
                  />
                </div>

                <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                  {['all', 'essential', 'stats', 'interactive'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-2 py-0.5 text-[10px] font-jetbrains-mono uppercase tracking-wider border transition-colors cursor-pointer shrink-0 ${
                        activeCategory === cat
                          ? 'border-signal-lime bg-signal-lime/10 text-chalk'
                          : 'border-graphite bg-carbon text-ash hover:text-chalk'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                  {filteredCatalog.map((widget) => {
                    const isActive = activeWidgetIds.includes(widget.id)
                    const isSelected = selectedInstanceId === `demo-${widget.id}`
                    return (
                      <div
                        key={widget.id}
                        onClick={() => {
                          if (!isActive) toggleWidget(widget.id)
                          setSelectedInstanceId(`demo-${widget.id}`)
                        }}
                        className={`p-2.5 border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-signal-lime bg-signal-lime/10 shadow-xs'
                            : isActive
                              ? 'border-graphite bg-carbon hover:border-ash/50'
                              : 'border-graphite/60 bg-carbon/40 hover:bg-carbon text-ash/60'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-inter-tight font-medium text-[12px] text-chalk truncate">
                              {widget.name}
                            </span>
                            {isActive && <Check className="w-3 h-3 text-signal-lime shrink-0" />}
                          </div>
                          <span className="font-jetbrains-mono text-[10px] text-ash truncate block">
                            {widget.desc}
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleWidget(widget.id)
                          }}
                          className={`px-2 py-1 text-[10px] font-jetbrains-mono uppercase tracking-wider border shrink-0 transition-colors ${
                            isActive
                              ? 'border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                              : 'border-signal-lime/40 bg-signal-lime/10 text-signal-lime hover:bg-signal-lime/20'
                          }`}
                        >
                          {isActive ? 'Remove' : 'Add +'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-graphite">
                <Link
                  href="/widgets"
                  className="w-full py-2 bg-carbon hover:bg-onyx text-ash hover:text-signal-lime border border-graphite text-[11px] font-jetbrains-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Browse 70+ Widget Catalog</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 bg-carbon/60 p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden">
              <div className="flex-1 flex items-center justify-center overflow-auto min-h-[440px] max-h-[560px] p-4 bg-void-black border border-graphite/80 relative">
                {viewMode === 'gitascii' ? (
                  <div
                    suppressHydrationWarning
                    className="w-full max-w-[760px] shadow-2xl transition-all duration-300 relative"
                    style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                    dangerouslySetInnerHTML={{ __html: svgMarkup }}
                  />
                ) : (
                  /* GitHub Profile Mockup View */
                  <div className="w-full max-w-[720px] bg-[#0d1117] border border-[#30363d] p-4 text-[#c9d1d9] font-sans text-[12px] space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-[#30363d]">
                      <div className="w-8 h-8 rounded-full bg-carbon border border-graphite overflow-hidden">
                        <Image
                          src="https://github.com/Igorcbraz.png?size=64"
                          alt="avatar"
                          width={32}
                          height={32}
                          unoptimized
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-white">Igor Braz</div>
                        <div className="text-[11px] text-[#8b949e]">Igorcbraz / README.md</div>
                      </div>
                    </div>

                    <div className="p-3 bg-[#161b22] border border-[#30363d] rounded-md">
                      <div className="font-mono text-[11px] text-[#8b949e] mb-2 flex items-center gap-1">
                        <Code2 className="w-3 h-3 text-signal-lime" />
                        <span>Rendered &lt;picture&gt; SVG preview on github.com</span>
                      </div>
                      <div
                        suppressHydrationWarning
                        className="w-full shadow-lg"
                        dangerouslySetInnerHTML={{ __html: svgMarkup }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 flex items-center justify-between text-ash font-jetbrains-mono text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-signal-lime animate-pulse" />
                  <span>Canvas Width: 800px · Responsive SVG</span>
                </div>
                <span>Theme: {activeTheme.name}</span>
              </div>
            </div>

            <div className="lg:col-span-3 bg-void-black/80 border-t lg:border-t-0 lg:border-l border-graphite p-4 flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-2 border-b border-graphite">
                  <div className="flex items-center gap-2 text-chalk font-inter-tight font-semibold text-[13px]">
                    <Sliders className="w-4 h-4 text-signal-lime" />
                    <span>Properties Inspector</span>
                  </div>
                  <span className="font-jetbrains-mono text-[10px] text-signal-lime uppercase">
                    Live
                  </span>
                </div>

                <div className="space-y-3">
                  <label className="font-jetbrains-mono text-[11px] uppercase tracking-wider text-ash flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-signal-lime" />
                    Palette Presets
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    {DEMO_THEMES.map((th) => (
                      <button
                        key={th.id}
                        onClick={() => setActiveThemeId(th.id)}
                        className={`p-2 border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          activeThemeId === th.id
                            ? 'border-signal-lime bg-signal-lime/10 text-chalk'
                            : 'border-graphite bg-carbon text-ash hover:text-chalk'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/20"
                          style={{ backgroundColor: th.accent }}
                        />
                        <span className="font-jetbrains-mono text-[10px] truncate">{th.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-carbon border border-graphite space-y-2 font-jetbrains-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-ash">Accent:</span>
                    <span style={{ color: activeTheme.accent }}>{activeTheme.accent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ash">Background:</span>
                    <span className="text-chalk">{activeTheme.bg}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ash">Border:</span>
                    <span className="text-chalk">{activeTheme.borderColor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ash">Font Family:</span>
                    <span className="text-signal-lime">JetBrains Mono</span>
                  </div>
                </div>

                <div className="p-3 bg-onyx border border-signal-lime/30 space-y-1.5">
                  <span className="font-jetbrains-mono text-[10px] text-signal-lime uppercase tracking-wider block">
                    Active Widget
                  </span>
                  <div className="font-inter-tight font-medium text-[13px] text-chalk">
                    {CATALOG_WIDGETS.find((w) => `demo-${w.id}` === selectedInstanceId)?.name || 'Stats Card'}
                  </div>
                  <p className="font-inter-tight text-[11px] text-ash">
                    SVG vectors re-render on the fly at 60fps on every configuration update.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-graphite space-y-2">
                <button
                  onClick={handleScrollToHero}
                  className="w-full py-2.5 bg-signal-lime hover:bg-signal-lime-hover text-carbon font-inter-tight font-semibold text-[13px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>Open with Your GitHub</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LandingMiniEditor
