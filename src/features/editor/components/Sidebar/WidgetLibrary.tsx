'use client'

import { ChevronDown, ExternalLink, GitFork, Plus, Sparkles, Zap } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import { EXTERNAL_LINKS, WIDGET_CATEGORIES, WIDGET_IDS } from '@/constants'
import { useI18n } from '@/i18n'

import { WIDGET_CATALOG, WIDGET_FILTERS, type WidgetCatalogItem } from '../../config/widgets'
import { useEditorStore } from '../../store/editorStore'
import { AsciiProfileCardItem } from './WidgetLibrary/AsciiProfileCardItem'
import { ControlPlaneCardItem } from './WidgetLibrary/ControlPlaneCardItem'
import { GodProfileCardItem } from './WidgetLibrary/GodProfileCardItem'
import { TemplateLibrarySection } from './WidgetLibrary/TemplateLibrarySection'
import { WidgetCardItem } from './WidgetLibrary/WidgetCardItem'
import { WidgetFilterBar } from './WidgetLibrary/WidgetFilterBar'
import { WidgetPreviewTooltip } from './WidgetPreviewTooltip'

export function WidgetLibrary() {
  const { t } = useI18n()
  const hasConfig = useEditorStore((state) => Boolean(state.config))
  const globalStyles = useEditorStore((state) => state.config?.globalStyles)
  const githubData = useEditorStore((state) => state.githubData)
  const addWidget = useEditorStore((state) => state.addWidget)
  const applyTemplate = useEditorStore((state) => state.applyTemplate)
  const importLayout = useEditorStore((state) => state.importLayout)

  const [sidebarTab, setSidebarTab] = useState<'widgets' | 'templates'>('widgets')
  const [hoveredWidget, setHoveredWidget] = useState<{
    item: WidgetCatalogItem
    rect: DOMRect
  } | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})
  const [expandedLists, setExpandedLists] = useState<Record<string, boolean>>({})

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

  const scrollRef = useRef<HTMLDivElement>(null)
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeftState, setScrollLeftState] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault()
        el.scrollLeft += e.deltaY
      }
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [])

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return
    setIsMouseDown(true)
    setIsDragging(false)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeftState(scrollRef.current.scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDown || !scrollRef.current) return
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 1.5
    if (Math.abs(walk) > 4) {
      setIsDragging(true)
    }
    scrollRef.current.scrollLeft = scrollLeftState - walk
  }

  const handleMouseUpOrLeave = () => {
    setIsMouseDown(false)
    setTimeout(() => setIsDragging(false), 50)
  }

  const translatedCatalog = useMemo(() => {
    return WIDGET_CATALOG.map((item) => ({
      ...item,
      name: t(`widget.catalog.${item.id}.name`, item.name),
      desc: item.desc ? t(`widget.catalog.${item.id}.desc`, item.desc) : undefined,
      badge: item.badge
        ? {
            ...item.badge,
            text: t(
              `widget.badge.${item.badge.text.toLowerCase().replace(/\s+/g, '_')}`,
              item.badge.text
            ),
          }
        : undefined,
    }))
  }, [t])

  const filteredWidgets = useMemo(() => {
    return translatedCatalog.filter((item) => {
      const filter = WIDGET_FILTERS.find((f) => f.id === categoryFilter)
      if (filter && !filter.match(item)) {
        return false
      }

      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        item.name.toLowerCase().includes(q) ||
        (item.desc && item.desc.toLowerCase().includes(q)) ||
        item.badge?.text.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
      )
    })
  }, [categoryFilter, searchQuery, translatedCatalog])

  if (!hasConfig || !globalStyles || !githubData) return null

  const handleHover = (item: WidgetCatalogItem, rect: DOMRect) => {
    setHoveredWidget({ item, rect })
  }

  const handleLeave = () => {
    setHoveredWidget(null)
  }

  return (
    <aside className="w-full lg:w-75 h-full bg-onyx border-r-0 lg:border-r border-graphite flex flex-col shrink-0">
      <div className="flex border-b border-graphite bg-void-black">
        <button
          onClick={() => setSidebarTab('widgets')}
          data-testid="widgets-tab-btn"
          className={`flex-1 py-3 font-inter-tight text-eyebrow font-medium uppercase tracking-[0.12em] transition-colors cursor-pointer border-b-2 ${
            sidebarTab === 'widgets'
              ? 'border-signal-lime text-signal-lime bg-onyx'
              : 'border-transparent text-ash hover:text-chalk'
          }`}
        >
          {t('editor.sidebar.widgets', 'Widgets')}
        </button>
        <button
          onClick={() => setSidebarTab('templates')}
          data-testid="templates-tab-btn"
          className={`flex-1 py-3 font-inter-tight text-eyebrow font-medium uppercase tracking-[0.12em] transition-colors cursor-pointer border-b-2 ${
            sidebarTab === 'templates'
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
            <WidgetFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              categoryFilter={categoryFilter}
              onCategoryChange={(cat) => {
                if (!isDragging) setCategoryFilter(cat)
              }}
              scrollRef={scrollRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUpOrLeave={handleMouseUpOrLeave}
              searchPlaceholder={t('editor.sidebar.search_placeholder', 'Buscar widget...')}
            />

            {categoryFilter === 'all' && !searchQuery && (
              <div className="mb-6 space-y-2" id="tour-featured-widgets">
                <div className="label-stamp text-signal-lime/80 mb-3">
                  {t('editor.sidebar.featured_widgets', '[ FEATURED WIDGETS ]')}
                </div>
                {translatedCatalog.find((w) => w.id === 'gitfest-lineup') && (
                  <WidgetCardItem
                    key="gitfest-lineup"
                    item={translatedCatalog.find((w) => w.id === 'gitfest-lineup')!}
                    onAdd={addWidget}
                    onHover={handleHover}
                    onLeave={handleLeave}
                  />
                )}

                {translatedCatalog.find((w) => w.id === WIDGET_IDS.POKEMON_CARD) && (
                  <WidgetCardItem
                    key={WIDGET_IDS.POKEMON_CARD}
                    item={translatedCatalog.find((w) => w.id === WIDGET_IDS.POKEMON_CARD)!}
                    onAdd={addWidget}
                    onHover={handleHover}
                    onLeave={handleLeave}
                  />
                )}

                <div className="group relative p-3 border border-dashed border-graphite hover:border-signal-lime bg-void-black/30 hover:bg-signal-lime/5 rounded-xs flex items-center justify-between cursor-pointer transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xs bg-graphite/50 group-hover:bg-signal-lime/10 text-ash group-hover:text-signal-lime transition-colors shrink-0">
                      <Plus size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-inter-tight font-medium text-label text-ash group-hover:text-chalk transition-colors">
                          {t('editor.sidebar.featured_slot', 'Espaço Disponível')}
                        </h4>
                        <span className="text-[9px] font-inter-tight font-medium text-signal-lime bg-signal-lime/10 border border-signal-lime/20 px-1.5 py-0.5 rounded-xs shrink-0 whitespace-nowrap">
                          {t('editor.sidebar.announce', 'Anuncie Aqui')}
                        </span>
                      </div>
                      <p className="font-inter-tight text-eyebrow text-ash group-hover:text-chalk transition-colors line-clamp-1">
                        {t(
                          'editor.sidebar.featured_slot_desc',
                          'Destaque seu widget para a comunidade'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {filteredWidgets.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-graphite rounded-xs text-ash text-note font-inter-tight">
                {t('editor.sidebar.no_widgets', 'Nenhum widget encontrado para "{query}"', {
                  query: searchQuery,
                })}
              </div>
            ) : categoryFilter === 'all' && !searchQuery ? (
              <div className="space-y-5">
                {/* Native Section */}
                <div id="tour-normal-widgets">
                  <div className="flex items-center gap-1.5 mb-2 px-0.5">
                    <Zap size={10} className="text-signal-lime shrink-0" />
                    <span className="font-inter-tight text-caption font-medium text-signal-lime uppercase tracking-[0.16em]">
                      {t('editor.sidebar.native_category', 'GitAscii Native')}
                    </span>
                    <span className="ml-auto font-inter-tight text-caption text-ash/50">
                      {
                        filteredWidgets.filter(
                          (w) =>
                            !w.isExternal &&
                            w.id !== 'gitfest-lineup' &&
                            w.id !== WIDGET_IDS.POKEMON_CARD &&
                            w.category !== WIDGET_CATEGORIES.CODEWEB_DEV &&
                            w.category !== WIDGET_CATEGORIES.ASCIIPROFILE &&
                            w.category !== WIDGET_CATEGORIES.GODPROFILE &&
                            w.category !== WIDGET_CATEGORIES.CONTROLPLANE
                        ).length
                      }
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {(() => {
                      const items = filteredWidgets.filter(
                        (w) =>
                          !w.isExternal &&
                          w.id !== 'gitfest-lineup' &&
                          w.id !== WIDGET_IDS.POKEMON_CARD &&
                          w.category !== WIDGET_CATEGORIES.CODEWEB_DEV &&
                          w.category !== WIDGET_CATEGORIES.ASCIIPROFILE &&
                          w.category !== WIDGET_CATEGORIES.GODPROFILE &&
                          w.category !== WIDGET_CATEGORIES.CONTROLPLANE
                      )
                      const baseItems = items.slice(0, 5)
                      const extraItems = items.slice(5)
                      return (
                        <>
                          {baseItems.map((item) => (
                            <WidgetCardItem
                              key={item.id}
                              item={item}
                              onAdd={addWidget}
                              onHover={handleHover}
                              onLeave={handleLeave}
                            />
                          ))}
                          <AnimatePresence initial={false}>
                            {expandedLists['native'] && extraItems.length > 0 && (
                              <motion.div
                                key="extra-native"
                                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                animate={{ height: 'auto', opacity: 1, marginTop: '0.375rem' }}
                                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                className="space-y-1.5 overflow-hidden"
                              >
                                {extraItems.map((item) => (
                                  <WidgetCardItem
                                    key={item.id}
                                    item={item}
                                    onAdd={addWidget}
                                    onHover={handleHover}
                                    onLeave={handleLeave}
                                  />
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                          {items.length > 5 && (
                            <button
                              onClick={() =>
                                setExpandedLists((prev) => ({ ...prev, native: !prev.native }))
                              }
                              className="group w-full py-2.5 mt-2 cursor-pointer flex items-center justify-center gap-2 text-caption font-inter-tight font-medium text-ash hover:text-signal-lime uppercase tracking-[0.16em] border border-dashed border-graphite hover:border-signal-lime/40 bg-void-black/40 hover:bg-signal-lime/5 rounded-xs transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5"
                            >
                              {expandedLists['native']
                                ? t('editor.sidebar.show_less', 'Mostrar menos')
                                : t('editor.sidebar.load_more', 'Carregar mais')}
                            </button>
                          )}
                        </>
                      )
                    })()}
                  </div>
                </div>

                <div className="border-t border-graphite/50" />

                {/* ASCII Profile Section */}
                <div>
                  <button
                    onClick={() => toggleSection('asciiprofile')}
                    className="w-full flex items-center gap-1.5 mb-2 px-0.5 cursor-pointer group"
                  >
                    <span className="font-inter-tight text-caption font-medium text-[#ffa657] uppercase tracking-[0.16em]">
                      {t('editor.sidebar.asciiprofile_category', 'ASCII Profile Kit')}
                    </span>
                    <a
                      href={EXTERNAL_LINKS.COMMUNITY_REPOS.ASCII_PROFILE_KIT}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#ffa657] hover:text-[#ffbd2e] transition-colors ml-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={10} />
                    </a>

                    <span className="ml-auto font-inter-tight text-caption text-ash">
                      {
                        filteredWidgets.filter((w) => w.category === WIDGET_CATEGORIES.ASCIIPROFILE)
                          .length
                      }
                    </span>
                    <ChevronDown
                      size={12}
                      className={`text-[#ffa657]/60 transition-transform duration-200 ${collapsedSections['asciiprofile'] ? '-rotate-90' : ''}`}
                    />
                  </button>
                  {!collapsedSections['asciiprofile'] && (
                    <div className="space-y-2">
                      {(() => {
                        const items = filteredWidgets.filter(
                          (w) => w.category === WIDGET_CATEGORIES.ASCIIPROFILE
                        )
                        const baseItems = items.slice(0, 3)
                        const extraItems = items.slice(3)
                        return (
                          <>
                            {baseItems.map((item) => (
                              <AsciiProfileCardItem
                                key={item.id}
                                item={item}
                                onAdd={addWidget}
                                onHover={handleHover}
                                onLeave={handleLeave}
                              />
                            ))}
                            <AnimatePresence initial={false}>
                              {expandedLists['asciiprofile'] && extraItems.length > 0 && (
                                <motion.div
                                  key="extra-asciiprofile"
                                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                  animate={{ height: 'auto', opacity: 1, marginTop: '0.375rem' }}
                                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                  className="space-y-1.5 overflow-hidden"
                                >
                                  {extraItems.map((item) => (
                                    <AsciiProfileCardItem
                                      key={item.id}
                                      item={item}
                                      onAdd={addWidget}
                                      onHover={handleHover}
                                      onLeave={handleLeave}
                                    />
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                            {items.length > 3 && (
                              <button
                                onClick={() =>
                                  setExpandedLists((prev) => ({
                                    ...prev,
                                    asciiprofile: !prev.asciiprofile,
                                  }))
                                }
                                className="group w-full py-2.5 mt-2 cursor-pointer flex items-center justify-center gap-2 text-caption font-inter-tight font-medium text-ash hover:text-signal-lime uppercase tracking-[0.16em] border border-dashed border-graphite hover:border-signal-lime/40 bg-void-black/40 hover:bg-signal-lime/5 rounded-xs transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5"
                              >
                                {expandedLists['asciiprofile']
                                  ? t('editor.sidebar.show_less', 'Mostrar menos')
                                  : t('editor.sidebar.load_more', 'Carregar mais')}
                              </button>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  )}
                </div>

                <div className="border-t border-graphite/50" />

                {/* GodProfile Section */}
                <div>
                  <button
                    onClick={() => toggleSection('godprofile')}
                    className="w-full flex items-center gap-1.5 mb-2 px-0.5 cursor-pointer group"
                  >
                    <Sparkles size={10} className="text-[#b6a891] shrink-0" />
                    <span className="font-inter-tight text-caption font-medium text-[#d4d4d8] uppercase tracking-[0.16em] group-hover:text-[#b6a891] transition-colors">
                      {t('editor.sidebar.godprofile_category', 'God Profile (B&W Edition)')}
                    </span>
                    <a
                      href={EXTERNAL_LINKS.COMMUNITY_REPOS.GOD_PROFILE}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#b6a891]/70 hover:text-[#b6a891] transition-colors ml-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={10} />
                    </a>
                    <span className="ml-auto font-inter-tight text-caption text-ash">
                      {filteredWidgets.filter((w) => w.category === 'godprofile').length}
                    </span>
                    <ChevronDown
                      size={12}
                      className={`text-[#b6a891]/60 transition-transform duration-200 ${collapsedSections['godprofile'] ? '-rotate-90' : ''}`}
                    />
                  </button>
                  {!collapsedSections['godprofile'] && (
                    <div className="space-y-1.5">
                      {(() => {
                        const items = filteredWidgets.filter((w) => w.category === 'godprofile')
                        const baseItems = items.slice(0, 3)
                        const extraItems = items.slice(3)
                        return (
                          <>
                            {baseItems.map((item) => (
                              <GodProfileCardItem
                                key={item.id}
                                item={item}
                                onAdd={addWidget}
                                onHover={handleHover}
                                onLeave={handleLeave}
                              />
                            ))}
                            <AnimatePresence initial={false}>
                              {expandedLists['godprofile'] && extraItems.length > 0 && (
                                <motion.div
                                  key="extra-godprofile"
                                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                  animate={{ height: 'auto', opacity: 1, marginTop: '0.375rem' }}
                                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                  className="space-y-1.5 overflow-hidden"
                                >
                                  {extraItems.map((item) => (
                                    <GodProfileCardItem
                                      key={item.id}
                                      item={item}
                                      onAdd={addWidget}
                                      onHover={handleHover}
                                      onLeave={handleLeave}
                                    />
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                            {items.length > 3 && (
                              <button
                                onClick={() =>
                                  setExpandedLists((prev) => ({
                                    ...prev,
                                    godprofile: !prev.godprofile,
                                  }))
                                }
                                className="group w-full py-2.5 mt-2 cursor-pointer flex items-center justify-center gap-2 text-caption font-inter-tight font-medium text-ash hover:text-signal-lime uppercase tracking-[0.16em] border border-dashed border-graphite hover:border-signal-lime/40 bg-void-black/40 hover:bg-signal-lime/5 rounded-xs transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5"
                              >
                                {expandedLists['godprofile']
                                  ? t('editor.sidebar.show_less', 'Mostrar menos')
                                  : t('editor.sidebar.load_more', 'Carregar mais')}
                              </button>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  )}
                </div>

                <div className="border-t border-graphite/50" />

                {/* Control Plane Section */}
                <div>
                  <button
                    onClick={() => toggleSection('controlplane')}
                    className="w-full flex items-center gap-2 mb-2 px-1 py-1.5 bg-[#030d1a] border border-[#0A2744] hover:border-[#00E5FF]/40 rounded-none cursor-pointer group transition-all duration-300 relative overflow-hidden"
                  >
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-caption text-[#00E5FF] font-bold">»</span>
                      <span className="w-1.5 h-1.5 bg-[#00E5FF] group-hover:shadow-[0_0_8px_#00E5FF] transition-all" />
                    </div>
                    <span
                      className="font-mono text-[11px] font-semibold text-[#00E5FF] uppercase tracking-[0.16em] group-hover:text-[#66B2FF] transition-colors"
                      style={{ textShadow: '0 0 8px rgba(0,229,255,0.4)' }}
                    >
                      {t('editor.sidebar.controlplane_category', 'Control Plane Toolkit')}
                    </span>
                    <a
                      href={EXTERNAL_LINKS.COMMUNITY_REPOS.PROFILE_CONTROL_PLANE}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00E5FF]/70 hover:text-[#00E5FF] transition-colors ml-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={10} />
                    </a>
                    <span className="ml-auto font-mono text-caption text-[#4A6B8C]">
                      {filteredWidgets.filter((w) => w.category === 'controlplane').length}
                    </span>
                    <ChevronDown
                      size={12}
                      className={`text-[#4A6B8C] transition-transform duration-200 ${collapsedSections['controlplane'] ? '-rotate-90' : ''}`}
                    />
                  </button>
                  {!collapsedSections['controlplane'] && (
                    <div className="space-y-2">
                      {(() => {
                        const items = filteredWidgets.filter((w) => w.category === 'controlplane')
                        const baseItems = items.slice(0, 3)
                        const extraItems = items.slice(3)
                        return (
                          <>
                            {baseItems.map((item) => (
                              <ControlPlaneCardItem
                                key={item.id}
                                item={item}
                                onAdd={addWidget}
                                onHover={handleHover}
                                onLeave={handleLeave}
                              />
                            ))}
                            <AnimatePresence initial={false}>
                              {expandedLists['controlplane'] && extraItems.length > 0 && (
                                <motion.div
                                  key="extra-controlplane"
                                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                  animate={{ height: 'auto', opacity: 1, marginTop: '0.375rem' }}
                                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                  className="space-y-1.5 overflow-hidden"
                                >
                                  {extraItems.map((item) => (
                                    <ControlPlaneCardItem
                                      key={item.id}
                                      item={item}
                                      onAdd={addWidget}
                                      onHover={handleHover}
                                      onLeave={handleLeave}
                                    />
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                            {items.length > 3 && (
                              <button
                                onClick={() =>
                                  setExpandedLists((prev) => ({
                                    ...prev,
                                    controlplane: !prev.controlplane,
                                  }))
                                }
                                className="group w-full py-2.5 mt-2 cursor-pointer flex items-center justify-center gap-2 text-caption font-inter-tight font-medium text-ash hover:text-signal-lime uppercase tracking-[0.16em] border border-dashed border-graphite hover:border-signal-lime/40 bg-void-black/40 hover:bg-signal-lime/5 rounded-xs transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5"
                              >
                                {expandedLists['controlplane']
                                  ? t('editor.sidebar.show_less', 'Mostrar menos')
                                  : t('editor.sidebar.load_more', 'Carregar mais')}
                              </button>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  )}
                </div>

                <div className="border-t border-graphite/50" />

                {/* Codeweb Section */}
                <div>
                  <button
                    onClick={() => toggleSection('codeweb')}
                    className="w-full flex items-center gap-2 mb-2 px-1 py-1.5 bg-[#0a0a14] border border-[#1e1e38] hover:border-[#6cc382]/40 rounded-xl cursor-pointer group transition-all duration-300 relative overflow-hidden"
                  >
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-caption text-[#6cc382] font-bold">»</span>
                      <span className="w-1.5 h-1.5 bg-[#6cc382] group-hover:shadow-[0_0_8px_#6cc382] transition-all rounded-full" />
                    </div>
                    <span
                      className="font-mono text-[11px] font-semibold text-[#6cc382] uppercase tracking-[0.16em] group-hover:text-[#a0e8b0] transition-colors"
                      style={{ textShadow: '0 0 8px rgba(108,195,130,0.4)' }}
                    >
                      {t('editor.sidebar.codeweb_category', 'Codeweb Studio')}
                    </span>
                    <a
                      href={EXTERNAL_LINKS.COMMUNITY_REPOS.CODEWEB_DEV}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#6cc382]/70 hover:text-[#6cc382] transition-colors ml-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={10} />
                    </a>
                    <span className="ml-auto font-mono text-caption text-[#6b6b8a]">
                      {
                        filteredWidgets.filter((w) => w.category === WIDGET_CATEGORIES.CODEWEB_DEV)
                          .length
                      }
                    </span>
                    <ChevronDown
                      size={12}
                      className={`text-[#6b6b8a] transition-transform duration-200 ${collapsedSections['codeweb'] ? '-rotate-90' : ''}`}
                    />
                  </button>
                  {!collapsedSections['codeweb'] && (
                    <div className="space-y-2">
                      {(() => {
                        const items = filteredWidgets.filter(
                          (w) => w.category === WIDGET_CATEGORIES.CODEWEB_DEV
                        )
                        const baseItems = items.slice(0, 3)
                        const extraItems = items.slice(3)
                        return (
                          <>
                            {baseItems.map((item) => (
                              <WidgetCardItem
                                key={item.id}
                                item={item}
                                onAdd={addWidget}
                                onHover={handleHover}
                                onLeave={handleLeave}
                              />
                            ))}
                            <AnimatePresence initial={false}>
                              {expandedLists['codeweb'] && extraItems.length > 0 && (
                                <motion.div
                                  key="extra-codeweb"
                                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                  animate={{ height: 'auto', opacity: 1, marginTop: '0.375rem' }}
                                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                  className="space-y-1.5 overflow-hidden"
                                >
                                  {extraItems.map((item) => (
                                    <WidgetCardItem
                                      key={item.id}
                                      item={item}
                                      onAdd={addWidget}
                                      onHover={handleHover}
                                      onLeave={handleLeave}
                                    />
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                            {items.length > 3 && (
                              <button
                                onClick={() =>
                                  setExpandedLists((prev) => ({
                                    ...prev,
                                    codeweb: !prev.codeweb,
                                  }))
                                }
                                className="group w-full py-2.5 mt-2 cursor-pointer flex items-center justify-center gap-2 text-caption font-inter-tight font-medium text-ash hover:text-signal-lime uppercase tracking-[0.16em] border border-dashed border-graphite hover:border-signal-lime/40 bg-void-black/40 hover:bg-signal-lime/5 rounded-xs transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5"
                              >
                                {expandedLists['codeweb']
                                  ? t('editor.sidebar.show_less', 'Mostrar menos')
                                  : t('editor.sidebar.load_more', 'Carregar mais')}
                              </button>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  )}
                </div>

                <div className="border-t border-graphite/50" />

                {/* Community Section */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2 px-0.5">
                    <Sparkles size={10} className="text-violet-400 shrink-0" />
                    <span className="font-inter-tight text-caption font-medium text-violet-400 uppercase tracking-[0.16em]">
                      {t('editor.sidebar.community_category', 'Community & External')}
                    </span>
                    <span className="ml-auto font-inter-tight text-caption text-ash/50">
                      {filteredWidgets.filter((w) => w.isExternal).length}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {(() => {
                      const items = filteredWidgets.filter((w) => w.isExternal)
                      const baseItems = items.slice(0, 5)
                      const extraItems = items.slice(5)
                      return (
                        <>
                          {baseItems.map((item) => (
                            <WidgetCardItem
                              key={item.id}
                              item={item}
                              onAdd={addWidget}
                              onHover={handleHover}
                              onLeave={handleLeave}
                            />
                          ))}
                          <AnimatePresence initial={false}>
                            {expandedLists['external'] && extraItems.length > 0 && (
                              <motion.div
                                key="extra-external"
                                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                animate={{ height: 'auto', opacity: 1, marginTop: '0.375rem' }}
                                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                className="space-y-1.5 overflow-hidden"
                              >
                                {extraItems.map((item) => (
                                  <WidgetCardItem
                                    key={item.id}
                                    item={item}
                                    onAdd={addWidget}
                                    onHover={handleHover}
                                    onLeave={handleLeave}
                                  />
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                          {items.length > 5 && (
                            <button
                              onClick={() =>
                                setExpandedLists((prev) => ({
                                  ...prev,
                                  external: !prev.external,
                                }))
                              }
                              className="group w-full py-2.5 mt-2 cursor-pointer flex items-center justify-center gap-2 text-caption font-inter-tight font-medium text-ash hover:text-signal-lime uppercase tracking-[0.16em] border border-dashed border-graphite hover:border-signal-lime/40 bg-void-black/40 hover:bg-signal-lime/5 rounded-xs transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5"
                            >
                              {expandedLists['external']
                                ? t('editor.sidebar.show_less', 'Mostrar menos')
                                : t('editor.sidebar.load_more', 'Carregar mais')}
                            </button>
                          )}
                        </>
                      )
                    })()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                {filteredWidgets.map((item) => (
                  <WidgetCardItem
                    key={item.id}
                    item={item}
                    onAdd={addWidget}
                    onHover={handleHover}
                    onLeave={handleLeave}
                  />
                ))}
              </div>
            )}

            {filteredWidgets.length > 0 && (
              <div className="pt-2">
                <a
                  href={EXTERNAL_LINKS.GITHUB_FORK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative p-2.5 border border-graphite bg-void-black/60 hover:bg-onyx hover:border-pearl transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-xs cursor-pointer flex items-center gap-2.5 hover:-translate-y-0.5"
                >
                  <div className="p-1.5 rounded-xs bg-graphite group-hover:bg-slate text-pearl group-hover:text-chalk transition-colors duration-300 shrink-0">
                    <GitFork size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-inter-tight font-medium text-note text-pearl group-hover:text-chalk transition-colors duration-300 leading-tight">
                      {t('editor.sidebar.contribute_widget', 'Adicione seu próprio Widget!')}
                    </h4>
                    <p className="font-inter-tight text-caption text-chalk/50 leading-tight">
                      {t(
                        'editor.sidebar.contribute_widget_desc',
                        'Faça um fork e contribua com a comunidade'
                      )}
                    </p>
                  </div>
                </a>
              </div>
            )}
          </>
        )}

        {sidebarTab === 'templates' && (
          <TemplateLibrarySection
            config={useEditorStore.getState().config!}
            applyTemplate={applyTemplate}
            importLayout={importLayout}
          />
        )}
      </div>

      {hoveredWidget && sidebarTab === 'widgets' && (
        <WidgetPreviewTooltip
          widgetItem={hoveredWidget.item}
          targetRect={hoveredWidget.rect}
          globalStyles={globalStyles}
          githubData={githubData}
        />
      )}
    </aside>
  )
}
