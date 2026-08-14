'use client'

import {
  ChevronDown,
  Download,
  ExternalLink,
  GitFork,
  Plus,
  Search,
  Sparkles,
  Upload,
  X,
  Zap,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import { useToast } from '@/components/ui/toast'
import { WIDGET_CATEGORIES, WIDGET_IDS } from '@/constants'
import { TEMPLATE_PRESETS } from '@/engine/core/TemplateRenderer'
import { useI18n } from '@/i18n'

import {
  WIDGET_CATALOG,
  WIDGET_FILTERS,
  WidgetBadgeType,
  type WidgetCatalogItem,
} from '../../config/widgets'
import { useEditorStore } from '../../store/editorStore'
import { WidgetPreviewTooltip } from './WidgetPreviewTooltip'

function renderWidgetBadge(badge?: { text: string; type: WidgetBadgeType }) {
  if (!badge) return null

  return (
    <span className="text-[9px] font-inter-tight font-medium text-signal-lime/90 bg-signal-lime/10 border border-signal-lime/20 px-1.5 py-0.5 rounded-xs shrink-0 whitespace-nowrap">
      {badge.text}
    </span>
  )
}

export function WidgetLibrary() {
  const { t } = useI18n()
  const { config, githubData, addWidget, applyTemplate, importLayout } = useEditorStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    if (!config) return
    try {
      const exportData = {
        widgets: config.widgets,
        globalStyles: config.globalStyles,
        templateId: config.templateId,
      }
      const jsonString = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `gitascii_layout_${config.username}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to export layout:', err)
    }
  }

  const { error } = useToast()

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const result = event.target?.result
        if (typeof result !== 'string') return

        const data = JSON.parse(result)
        if (!data || !Array.isArray(data.widgets)) {
          error(
            t(
              'editor.sidebar.import.invalid_format',
              'Formato de arquivo inválido: lista de widgets não encontrada.'
            )
          )
          return
        }

        // Strip user-specific data fields from imported widgets so the current
        // session's GitHub data is used instead of the exported user's data.
        const USER_SPECIFIC_FIELDS = [
          'avatarUrl',
          'uploadedImageData',
          'customBio',
          'customLocation',
          'customBlog',
          'customBullet1',
          'customBullet2',
          'customNow',
          'customAlso',
          'customLoc',
          'customSite',
          'customFrontend',
          'customBackend',
          'customLangs',
          'customWhoami',
          'asciiText',
        ]
        const sanitizedWidgets = data.widgets.map((w: Record<string, unknown>) => {
          const { config: widgetCfg, ...rest } = w as {
            config: Record<string, unknown>
            [key: string]: unknown
          }
          if (!widgetCfg) return w
          const cleanCfg = { ...widgetCfg }
          USER_SPECIFIC_FIELDS.forEach((field) => {
            delete cleanCfg[field]
          })
          return { ...rest, config: cleanCfg }
        })
        importLayout(sanitizedWidgets, data.globalStyles, data.templateId)

        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } catch (err) {
        console.error('Failed to parse import file:', err)
        error(
          t(
            'editor.sidebar.import.invalid_json',
            'Falha ao processar arquivo JSON. Verifique se é um arquivo JSON válido.'
          )
        )
      }
    }
    reader.readAsText(file)
  }
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

  if (!config) return null

  const renderWidgetCard = (item: WidgetCatalogItem) => {
    const Icon = item.icon

    if (item.id === 'gitfest-lineup') {
      return (
        <div
          key={item.id}
          role="button"
          tabIndex={0}
          onClick={() => addWidget(item.id)}
          data-testid="add-widget-gitfest-lineup"
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            setHoveredWidget({ item, rect })
          }}
          onMouseLeave={() => setHoveredWidget(null)}
          className="group relative w-full px-3 py-2 rounded-xl font-bold text-sm transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden cursor-pointer my-2 transform hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(139,92,246,0.3)]"
          style={{
            background: 'linear-gradient(145deg, #3d2b5e 0%, #2d1b4e 50%, #3d2b5e 100%)',
            border: '2px solid rgba(139, 92, 246, 0.4)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.1)',
          }}
        >
          <div
            className="absolute inset-0 bg-linear-to-br from-[#c084fc]/20 via-[#a855f7]/20 to-[#e9d5ff]/20 transition-opacity duration-700 opacity-0 group-hover:opacity-80"
            style={{ filter: 'blur(15px)' }}
          ></div>

          <div
            className="absolute -inset-1 bg-linear-to-r from-[#c084fc] via-[#a855f7] to-[#e9d5ff] rounded-2xl transition-all duration-500 opacity-0 group-hover:opacity-40 animate-pulse"
            style={{ filter: 'blur(10px)', zIndex: -1 }}
          ></div>

          <div className="absolute inset-0 rounded-2xl bg-linear-to-b from-transparent via-transparent to-black/50"></div>

          <div className="relative z-20 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="relative w-10 h-10 shrink-0 transition-transform duration-500 group-hover:scale-110">
                <div className="absolute -inset-2 bg-linear-to-br from-[#c084fc]/60 via-[#a855f7]/60 to-[#e9d5ff]/60 transition-all duration-500 blur-md opacity-60 group-hover:opacity-100 group-hover:blur-lg"></div>

                <div className="relative w-full h-full flex items-center justify-center">
                  <div
                    className="absolute inset-0 bg-linear-to-br from-[#8B5CF6] to-[#C084FC] rounded-lg transition-transform duration-500 group-hover:rotate-12"
                    style={{
                      boxShadow:
                        '0 4px 12px rgba(0, 0, 0, 0.6), inset 0 1px 3px rgba(255, 255, 255, 0.4)',
                    }}
                  ></div>

                  <svg
                    className="relative z-10 w-6 h-6 transition-transform duration-300 group-hover:scale-110"
                    viewBox="0 0 24 24"
                    fill="white"
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6))',
                      opacity: 0.95,
                    }}
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              <div className="flex items-center justify-center pl-2">
                <Image
                  src={'/gitfest.png'}
                  alt="GitFest"
                  width={120}
                  height={36}
                  className="h-9 w-auto object-contain transition-all duration-300 drop-shadow-[0_2px_6px_rgba(139,92,246,0.5)] group-hover:drop-shadow-[0_4px_16px_rgba(168,85,247,0.9)] group-hover:brightness-125"
                />
              </div>
            </div>

            <div className="text-white/60 group-hover:text-white transition-colors duration-300 p-1 shrink-0 self-center">
              <Plus size={15} />
            </div>
          </div>

          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-[#d8b4fe]/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
          </div>
        </div>
      )
    }

    if (item.category === WIDGET_CATEGORIES.CODEWEB_DEV) {
      return (
        <div
          key={item.id}
          onClick={() => addWidget(item.id)}
          data-testid={`add-widget-${item.id}`}
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            setHoveredWidget({ item, rect })
          }}
          onMouseLeave={() => setHoveredWidget(null)}
          className="group relative p-3 border border-white/10 hover:border-white/20 bg-[#08080d] hover:bg-[#0c0c14] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-2xl cursor-pointer flex items-center justify-between shadow-xs hover:-translate-y-0.5 overflow-hidden hover:shadow-[0_8px_24px_rgba(108,195,130,0.15)]"
        >
          <div className="absolute -left-4 -top-4 w-20 h-20 bg-[radial-gradient(circle,rgba(108,195,130,0.2)_0%,transparent_70%)] opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-[radial-gradient(circle,rgba(230,100,115,0.15)_0%,transparent_70%)] opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/80 group-hover:text-white group-hover:bg-white/[0.08] transition-all duration-300 shrink-0">
              <Icon size={16} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-inter-tight font-medium text-label text-white group-hover:text-white transition-colors duration-300">
                  {item.name}
                </h4>
              </div>
              <p className="font-inter-tight text-eyebrow text-white/45 group-hover:text-white/70 transition-colors line-clamp-1">
                {item.desc}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0 relative z-10">
            <button className="text-white/40 group-hover:text-white transition-colors duration-300 p-1">
              <Plus size={15} />
            </button>
          </div>
        </div>
      )
    }

    if (item.id === WIDGET_IDS.POKEMON_CARD) {
      return (
        <div
          key={item.id}
          onClick={() => addWidget(item.id)}
          data-testid={`add-widget-${item.id}`}
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            setHoveredWidget({ item, rect })
          }}
          onMouseLeave={() => setHoveredWidget(null)}
          className="group relative w-full rounded-lg transition-all duration-300 ease-out overflow-hidden cursor-pointer my-1.5 transform hover:-translate-y-0.5 select-none shadow-[0_4px_16px_rgba(197,32,40,0.3)] hover:shadow-[0_8px_24px_rgba(220,38,38,0.5)]"
          style={{
            background: 'linear-gradient(180deg, #d8232a 0%, #a8131b 60%, #850c12 100%)',
            border: '1.5px solid #5a070c',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-30">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 via-amber-300/25 via-cyan-300/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
          </div>

          <div className="flex items-center justify-between px-2.5 py-1 border-b border-black/25 bg-black/15 relative z-10">
            <div className="flex items-center gap-1.5">
              <div className="relative w-3.5 h-3.5 rounded-full bg-gradient-to-br from-cyan-300 via-sky-500 to-blue-700 border border-white/80 shadow-[0_0_6px_rgba(56,189,248,0.7)] flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-white/90 absolute top-0.5 left-0.5 blur-[0.2px]" />
              </div>
              <div className="flex items-center gap-1 pl-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#ff3b30] border border-black/40 shadow-[0_0_3px_rgba(255,59,48,0.7)]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#ffcc00] border border-black/40 shadow-[0_0_3px_rgba(255,204,0,0.7)]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#34c759] border border-black/40 shadow-[0_0_3px_rgba(52,199,89,0.7)]" />
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-jetbrains-mono text-[8.5px] font-bold text-white/80 tracking-wider uppercase drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                PKMN // TCG-025
              </span>
              <div className="flex gap-0.5 opacity-60">
                <div className="w-0.5 h-2 bg-black/60 rounded-full" />
                <div className="w-0.5 h-2 bg-black/60 rounded-full" />
                <div className="w-0.5 h-2 bg-black/60 rounded-full" />
              </div>
            </div>
          </div>

          <div className="p-1.5 relative z-10">
            <div className="relative rounded-md p-2 bg-[#0b1219] border border-[#1e2d3d] shadow-[inset_0_1px_6px_rgba(0,0,0,0.8)] overflow-hidden">
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
                  backgroundSize: '4px 4px',
                }}
              />

              <div className="relative z-10 flex items-center justify-between gap-2.5">
                <div className="relative shrink-0 flex items-center justify-center">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-b from-[#e53e3e] via-[#e53e3e] to-[#ffffff] border-[1.5px] border-[#1a202c] shadow-[0_1px_6px_rgba(0,0,0,0.6)] relative overflow-hidden group-hover:rotate-12 transition-transform duration-300">
                    <div className="absolute top-0 left-0 right-0 h-[48%] bg-[#e53e3e]" />
                    <div className="absolute bottom-0 left-0 right-0 h-[48%] bg-white" />
                    <div className="absolute top-1/2 left-0 right-0 h-[14%] bg-[#1a202c] -translate-y-1/2" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white border border-[#1a202c] flex items-center justify-center shadow-xs">
                      <div className="w-1 h-1 rounded-full bg-[#cbd5e1]" />
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-jetbrains-mono font-bold text-xs text-white tracking-wider uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                      {item.name}
                    </h4>
                  </div>
                  {item.desc && (
                    <p className="font-jetbrains-mono text-[10px] text-cyan-300/80 group-hover:text-cyan-200 transition-colors truncate mt-0.5 tracking-tight">
                      {item.desc}
                    </p>
                  )}
                </div>

                <div className="text-white/60 group-hover:text-white transition-colors duration-300 p-1 shrink-0">
                  <Plus size={15} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div
        key={item.id}
        onClick={() => addWidget(item.id)}
        data-testid={`add-widget-${item.id}`}
        onMouseEnter={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          setHoveredWidget({ item, rect })
        }}
        onMouseLeave={() => setHoveredWidget(null)}
        className={`group relative p-3 border transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-xs cursor-pointer flex items-center justify-between shadow-xs hover:-translate-y-0.5 overflow-hidden ${
          item.isExternal
            ? 'border-graphite hover:border-violet-500 bg-void-black/60 hover:bg-[#1a1423] hover:shadow-[0_4px_12px_rgba(139,92,246,0.2)]'
            : 'border-graphite hover:border-signal-lime bg-void-black/60 hover:bg-onyx hover:shadow-[0_4px_12px_rgba(197,255,74,0.15)]'
        }`}
      >
        {item.isExternal && (
          <div className="absolute inset-0 border border-dashed border-transparent group-hover:border-violet-500/30 pointer-events-none transition-colors duration-200 rounded-xs"></div>
        )}

        <div className="flex items-center gap-3 relative z-10">
          <div
            className={`p-2 rounded-xs transition-colors duration-300 shrink-0 ${
              item.isExternal
                ? 'bg-graphite group-hover:bg-violet-500 text-violet-400 group-hover:text-white'
                : 'bg-graphite group-hover:bg-signal-lime text-signal-lime group-hover:text-black'
            }`}
          >
            <Icon size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4
                className={`font-inter-tight font-medium text-label text-chalk transition-colors duration-300 ${
                  item.isExternal ? 'group-hover:text-violet-400' : 'group-hover:text-signal-lime'
                }`}
              >
                {item.name}
              </h4>
              {renderWidgetBadge(item.badge)}
            </div>
            <p className="font-inter-tight text-eyebrow text-ash line-clamp-1">{item.desc}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 relative z-10">
          {item.isExternal && (
            <ExternalLink
              size={11}
              className="text-ash/50 group-hover:text-violet-400/70 transition-colors"
            />
          )}
          <button
            className={`transition-colors duration-300 p-1 ${
              item.isExternal
                ? 'text-ash group-hover:text-violet-400'
                : 'text-ash group-hover:text-signal-lime'
            }`}
          >
            <Plus size={15} />
          </button>
        </div>
      </div>
    )
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
                {WIDGET_FILTERS.map((filter) => {
                  const FilterIcon = filter.icon
                  const isActive = categoryFilter === filter.id
                  return (
                    <button
                      key={filter.id}
                      onClick={() => {
                        if (isDragging) return
                        setCategoryFilter(filter.id as any)
                      }}
                      className={`px-2 py-1 text-caption font-medium font-inter-tight rounded-xs border whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                        isActive
                          ? 'bg-signal-lime/10 text-signal-lime border-signal-lime'
                          : 'bg-void-black/60 text-ash border-graphite hover:text-chalk hover:border-slate'
                      }`}
                    >
                      <FilterIcon
                        size={12}
                        className={isActive ? 'text-signal-lime' : 'text-ash'}
                      />
                      <span>{t(filter.labelKey as any, filter.defaultLabel)}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {categoryFilter === 'all' && !searchQuery && (
              <div className="mb-6 space-y-2">
                <div className="label-stamp text-signal-lime/80 mb-3">
                  {t('editor.sidebar.featured_widgets', '[ FEATURED WIDGETS ]')}
                </div>
                {translatedCatalog.find((w) => w.id === 'gitfest-lineup') &&
                  renderWidgetCard(translatedCatalog.find((w) => w.id === 'gitfest-lineup')!)}

                {translatedCatalog.find((w) => w.id === WIDGET_IDS.POKEMON_CARD) &&
                  renderWidgetCard(
                    translatedCatalog.find((w) => w.id === WIDGET_IDS.POKEMON_CARD)!
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
                <div>
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
                          {baseItems.map(renderWidgetCard)}
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
                                {extraItems.map(renderWidgetCard)}
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

                <div>
                  <button
                    onClick={() => toggleSection('asciiprofile')}
                    className="w-full flex items-center gap-1.5 mb-2 px-0.5 cursor-pointer group"
                  >
                    <span className="font-inter-tight text-caption font-medium text-[#ffa657] uppercase tracking-[0.16em]">
                      {t('editor.sidebar.asciiprofile_category', 'ASCII Profile Kit')}
                    </span>
                    <a
                      href="https://github.com/mithun50/ascii-profile-kit"
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

                        const renderItem = (item: any) => {
                          const Icon = item.icon
                          const shellScript =
                            item.id === WIDGET_IDS.ASCII_PORTRAIT
                              ? './portrait.sh'
                              : item.id === WIDGET_IDS.ASCII_INFO
                                ? 'neofetch'
                                : 'contributions --graph'

                          return (
                            <div
                              key={item.id}
                              onClick={() => addWidget(item.id)}
                              data-testid={`add-widget-${item.id}`}
                              onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect()
                                setHoveredWidget({ item, rect })
                              }}
                              onMouseLeave={() => setHoveredWidget(null)}
                              className="group relative border border-[#30363d] hover:border-[#ffa657]/60 bg-[#0d1117] hover:bg-[#161b22] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-xs cursor-pointer shadow-xs hover:-translate-y-0.5 overflow-hidden hover:shadow-[0_4px_15px_rgba(255,166,87,0.15)] flex flex-col"
                            >
                              <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                style={{
                                  backgroundImage:
                                    'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 166, 87, 0.05) 2px, rgba(255, 166, 87, 0.05) 4px)',
                                }}
                              ></div>
                              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#ffa657] scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-300 shadow-[0_0_8px_rgba(255,166,87,0.8)] z-20"></div>
                              <div className="absolute right-0 bottom-0 w-3 h-3 border-r-[2px] border-b-[2px] border-[#ffa657] opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_8px_rgba(255,166,87,0.8)] z-20"></div>
                              <div className="absolute left-0 top-0 w-3 h-3 border-l-[2px] border-t-[2px] border-[#ffa657] opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_8px_rgba(255,166,87,0.8)] z-20"></div>

                              <div className="flex items-center gap-1.5 px-3 py-1 bg-[#161b22] border-b border-[#30363d] group-hover:border-[#ffa657]/30 font-mono text-[9px] text-[#7d8590] transition-colors select-none relative z-10">
                                <div className="flex gap-0.5 text-[8px] font-bold">
                                  <span className="text-[#ff5f56]">[o]</span>
                                  <span className="text-[#ffbd2e]">[o]</span>
                                  <span className="text-[#27c93f]">[o]</span>
                                </div>
                                <span className="truncate flex-1 text-right text-[8px] opacity-75">
                                  {shellScript}
                                </span>
                              </div>

                              <div className="p-3 flex items-center justify-between">
                                <div className="flex items-center gap-3 relative z-10">
                                  <div className="p-2 rounded-xs bg-[#161b22] group-hover:bg-[#ffa657] text-[#c9d1d9] group-hover:text-[#0d1117] transition-colors duration-300 shrink-0">
                                    <Icon size={16} />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <h4 className="font-inter-tight font-medium text-label text-[#c9d1d9] group-hover:text-[#ffa657] transition-colors duration-300">
                                        {item.name}
                                      </h4>
                                    </div>
                                    <p className="font-inter-tight text-eyebrow text-[#7d8590] group-hover:text-[#c9d1d9] transition-colors line-clamp-1">
                                      {item.desc}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0 relative z-10">
                                  <button className="text-[#7d8590] group-hover:text-[#ffa657] transition-colors duration-300 p-1">
                                    <Plus size={15} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        }

                        return (
                          <>
                            {baseItems.map(renderItem)}
                            <AnimatePresence initial={false}>
                              {expandedLists['asciiprofile'] && extraItems.length > 0 && (
                                <motion.div
                                  key="extra-ascii"
                                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                  animate={{ height: 'auto', opacity: 1, marginTop: '0.5rem' }}
                                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                  className="space-y-2 overflow-hidden"
                                >
                                  {extraItems.map(renderItem)}
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

                <div>
                  <button
                    onClick={() => toggleSection('godprofile')}
                    className="w-full flex items-center gap-2 mb-2 px-0.5 cursor-pointer group"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#b6a891]/30 group-hover:bg-[#b6a891] transition-colors shrink-0"></div>
                    <span className="font-inter-tight text-caption font-medium text-[#b6a891]/70 uppercase tracking-[0.2em] group-hover:text-[#b6a891] transition-colors">
                      {t('editor.sidebar.godprofile_category', 'GodProfile MCP')}
                    </span>
                    <a
                      href="https://github.com/Luc0-0/GodProfile"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ash/50 hover:text-[#b6a891] transition-colors ml-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={10} />
                    </a>
                    <span className="ml-auto font-inter-tight text-caption text-ash/40 group-hover:text-[#b6a891]/70 transition-colors">
                      {filteredWidgets.filter((w) => w.category === 'godprofile').length}
                    </span>
                    <ChevronDown
                      size={12}
                      className={`text-ash/40 group-hover:text-[#b6a891]/70 transition-transform duration-200 ${collapsedSections['godprofile'] ? '-rotate-90' : ''}`}
                    />
                  </button>
                  {!collapsedSections['godprofile'] && (
                    <div className="space-y-1.5">
                      {(() => {
                        const items = filteredWidgets.filter((w) => w.category === 'godprofile')
                        const baseItems = items.slice(0, 3)
                        const extraItems = items.slice(3)

                        const renderItem = (item: any) => {
                          const Icon = item.icon
                          return (
                            <div
                              key={item.id}
                              onClick={() => addWidget(item.id)}
                              data-testid={`add-widget-${item.id}`}
                              onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect()
                                setHoveredWidget({ item, rect })
                              }}
                              onMouseLeave={() => setHoveredWidget(null)}
                              className="group relative px-3 py-2.5 bg-[#27272a] hover:bg-[#323238] border border-transparent hover:border-[#b6a891]/30 rounded-lg cursor-pointer flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-xs hover:shadow-lg hover:-translate-y-0.5"
                            >
                              <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
                                <div className="absolute inset-y-0 -left-1/2 w-1/2 bg-linear-to-r from-transparent via-[#b6a891]/10 to-transparent skew-x-[25deg] group-hover:translate-x-[400%] transition-transform duration-1000 ease-out"></div>
                              </div>
                              <div className="flex items-center gap-3 relative z-10">
                                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-[#18181b] group-hover:bg-[#b6a891] group-hover:text-[#18181b] text-[#b6a891]/80 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shrink-0 border border-white/5 group-hover:scale-105 group-hover:shadow-[0_0_12px_rgba(182,168,145,0.4)]">
                                  <Icon
                                    size={14}
                                    className="transition-transform duration-500 group-hover:scale-110"
                                  />
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <h4 className="font-inter-tight font-medium text-label text-[#d4d4d8] group-hover:text-[#b6a891] transition-colors duration-500">
                                      {item.name}
                                    </h4>
                                  </div>
                                  <p className="font-inter-tight text-eyebrow text-[#a1a1aa] group-hover:text-[#b6a891]/80 transition-colors line-clamp-1 mt-0.5 duration-500">
                                    {item.desc}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center shrink-0 relative z-10">
                                <div className="w-6 h-6 flex items-center justify-center rounded-full text-[#a1a1aa]/50 group-hover:text-[#b6a891] group-hover:bg-[#b6a891]/10 group-hover:rotate-90 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]">
                                  <Plus size={14} />
                                </div>
                              </div>
                            </div>
                          )
                        }

                        return (
                          <>
                            {baseItems.map(renderItem)}
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
                                  {extraItems.map(renderItem)}
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

                <div>
                  <button
                    onClick={() => toggleSection('controlplane')}
                    className="w-full flex items-center gap-1.5 mb-2 px-0.5 cursor-pointer group"
                  >
                    <div className="relative flex items-center justify-center p-0.5">
                      <div className="absolute inset-0 bg-[#00E5FF]/10 border border-[#00E5FF]/30 rounded-xs group-hover:bg-[#00E5FF]/20 transition-colors"></div>
                      <span className="relative z-10 font-mono text-[9px] font-bold text-[#00E5FF] leading-none select-none group-hover:text-white transition-colors">
                        CP
                      </span>
                    </div>
                    <span
                      className="font-mono text-[11px] font-semibold text-[#00E5FF] uppercase tracking-[0.16em] group-hover:text-[#66B2FF] transition-colors"
                      style={{ textShadow: '0 0 8px rgba(0,229,255,0.4)' }}
                    >
                      {t('editor.sidebar.controlplane_category', 'Control Plane Toolkit')}
                    </span>
                    <a
                      href="https://github.com/majiayu000/profile-control-plane"
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

                        const renderItem = (item: any) => {
                          const Icon = item.icon
                          return (
                            <div
                              key={item.id}
                              onClick={() => addWidget(item.id)}
                              data-testid={`add-widget-${item.id}`}
                              onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect()
                                setHoveredWidget({ item, rect })
                              }}
                              onMouseLeave={() => setHoveredWidget(null)}
                              className="group relative p-3 border border-[#0A1929] hover:border-[#00E5FF]/50 bg-[#020617] hover:bg-[#031024] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-none cursor-pointer flex items-center justify-between shadow-xs hover:-translate-y-0.5 overflow-hidden"
                            >
                              <div
                                className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
                                style={{
                                  backgroundImage:
                                    "url(\"data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 20 0 L 0 0 0 20' fill='none' stroke='rgba(0,229,255,0.2)' stroke-width='1'/%3E%3C/svg%3E\")",
                                }}
                              ></div>
                              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#00E5FF] scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-300"></div>
                              <div className="absolute right-0 bottom-0 w-2 h-2 border-r-[1.5px] border-b-[1.5px] border-[#00E5FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                              <div className="flex items-center gap-3 relative z-10">
                                <div className="p-2 bg-[#0A1929]/80 backdrop-blur-xs border border-[#132F4C] group-hover:border-[#00E5FF]/40 text-[#66B2FF] group-hover:text-[#00E5FF] transition-all duration-300 shrink-0 shadow-[0_0_10px_rgba(0,229,255,0)] group-hover:shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                                  <Icon size={16} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <h4 className="font-mono font-medium text-[11px] text-[#B2D8FF] group-hover:text-[#00E5FF] transition-colors duration-300 tracking-tight">
                                      {item.name}
                                    </h4>
                                  </div>
                                  <p className="font-mono text-[9px] text-[#4A6B8C] group-hover:text-[#66B2FF] transition-colors line-clamp-1 mt-0.5 uppercase tracking-wider">
                                    {item.desc}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0 relative z-10">
                                <button className="text-[#4A6B8C] group-hover:text-[#00E5FF] transition-colors duration-300 p-1">
                                  <Plus size={15} />
                                </button>
                              </div>
                            </div>
                          )
                        }

                        return (
                          <>
                            {baseItems.map(renderItem)}
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
                                  {extraItems.map(renderItem)}
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

                <div>
                  <button
                    onClick={() => toggleSection('codeweb-dev')}
                    className="w-full flex items-center gap-1.5 mb-2 px-0.5 cursor-pointer group"
                  >
                    <Sparkles size={10} className="text-[#6cc382] shrink-0" />
                    <span className="font-inter-tight text-caption font-medium text-[#6cc382] uppercase tracking-[0.16em]">
                      {t('editor.sidebar.codeweb_category', 'Codeweb-dev Aura')}
                    </span>
                    <a
                      href="https://github.com/codeweb-dev/codeweb-dev"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#6cc382] hover:text-[#9de5ad] transition-colors ml-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={10} />
                    </a>
                    <span className="ml-auto font-inter-tight text-caption text-ash">
                      {
                        filteredWidgets.filter((w) => w.category === WIDGET_CATEGORIES.CODEWEB_DEV)
                          .length
                      }
                    </span>
                    <ChevronDown
                      size={12}
                      className={`text-[#6cc382]/60 transition-transform duration-200 ${collapsedSections['codeweb-dev'] ? '-rotate-90' : ''}`}
                    />
                  </button>
                  {!collapsedSections['codeweb-dev'] && (
                    <div className="space-y-1.5">
                      {(() => {
                        const items = filteredWidgets.filter(
                          (w) => w.category === WIDGET_CATEGORIES.CODEWEB_DEV
                        )
                        const baseItems = items.slice(0, 3)
                        const extraItems = items.slice(3)

                        const renderItem = (item: any) => {
                          const Icon = item.icon
                          return (
                            <div
                              key={item.id}
                              onClick={() => addWidget(item.id)}
                              data-testid={`add-widget-${item.id}`}
                              onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect()
                                setHoveredWidget({ item, rect })
                              }}
                              onMouseLeave={() => setHoveredWidget(null)}
                              className="group relative p-3 border border-white/10 hover:border-white/20 bg-[#08080d] hover:bg-[#0c0c14] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-2xl cursor-pointer flex items-center justify-between shadow-xs hover:-translate-y-0.5 overflow-hidden hover:shadow-[0_8px_24px_rgba(108,195,130,0.15)]"
                            >
                              <div className="absolute -left-4 -top-4 w-20 h-20 bg-[radial-gradient(circle,rgba(108,195,130,0.2)_0%,transparent_70%)] opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />
                              <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-[radial-gradient(circle,rgba(230,100,115,0.15)_0%,transparent_70%)] opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />

                              <div className="flex items-center gap-3 relative z-10">
                                <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/80 group-hover:text-white group-hover:bg-white/[0.08] transition-all duration-300 shrink-0">
                                  <Icon size={16} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <h4 className="font-inter-tight font-medium text-label text-white group-hover:text-white transition-colors duration-300">
                                      {item.name}
                                    </h4>
                                  </div>
                                  <p className="font-inter-tight text-eyebrow text-white/45 group-hover:text-white/70 transition-colors line-clamp-1">
                                    {item.desc}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0 relative z-10">
                                <button className="text-white/40 group-hover:text-white transition-colors duration-300 p-1">
                                  <Plus size={15} />
                                </button>
                              </div>
                            </div>
                          )
                        }

                        return (
                          <>
                            {baseItems.map(renderItem)}
                            <AnimatePresence initial={false}>
                              {expandedLists['codeweb-dev'] && extraItems.length > 0 && (
                                <motion.div
                                  key="extra-codeweb"
                                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                  animate={{ height: 'auto', opacity: 1, marginTop: '0.375rem' }}
                                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                  className="space-y-1.5 overflow-hidden"
                                >
                                  {extraItems.map(renderItem)}
                                </motion.div>
                              )}
                            </AnimatePresence>
                            {items.length > 3 && (
                              <button
                                onClick={() =>
                                  setExpandedLists((prev) => ({
                                    ...prev,
                                    'codeweb-dev': !prev['codeweb-dev'],
                                  }))
                                }
                                className="group w-full py-2.5 mt-2 cursor-pointer flex items-center justify-center gap-2 text-caption font-inter-tight font-medium text-ash hover:text-signal-lime uppercase tracking-[0.16em] border border-dashed border-graphite hover:border-signal-lime/40 bg-void-black/40 hover:bg-signal-lime/5 rounded-xs transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5"
                              >
                                {expandedLists['codeweb-dev']
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

                <div>
                  <button
                    onClick={() => toggleSection('external')}
                    className="w-full flex items-center gap-1.5 mb-2 px-0.5 cursor-pointer group"
                  >
                    <ExternalLink size={10} className="text-violet-400/80 shrink-0" />
                    <span className="font-inter-tight text-caption font-medium text-violet-400 uppercase tracking-[0.16em]">
                      {t('editor.sidebar.external_category', 'Integrações Externas')}
                    </span>
                    <span className="ml-auto font-inter-tight text-caption text-ash">
                      {
                        filteredWidgets.filter(
                          (w) =>
                            w.isExternal &&
                            w.category !== 'godprofile' &&
                            w.category !== WIDGET_CATEGORIES.ASCIIPROFILE &&
                            w.category !== 'controlplane' &&
                            w.category !== WIDGET_CATEGORIES.CODEWEB_DEV
                        ).length
                      }
                    </span>
                    <ChevronDown
                      size={12}
                      className={`text-violet-400/60 transition-transform duration-200 ${collapsedSections['external'] ? '-rotate-90' : ''}`}
                    />
                  </button>
                  {!collapsedSections['external'] && (
                    <div className="space-y-1.5">
                      {(() => {
                        const items = filteredWidgets.filter(
                          (w) =>
                            w.isExternal &&
                            w.category !== 'godprofile' &&
                            w.category !== WIDGET_CATEGORIES.ASCIIPROFILE &&
                            w.category !== 'controlplane' &&
                            w.category !== WIDGET_CATEGORIES.CODEWEB_DEV
                        )
                        const baseItems = items.slice(0, 3)
                        const extraItems = items.slice(3)

                        const renderItem = (item: any) => {
                          const Icon = item.icon
                          return (
                            <div
                              key={item.id}
                              onClick={() => addWidget(item.id)}
                              data-testid={`add-widget-${item.id}`}
                              onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect()
                                setHoveredWidget({ item, rect })
                              }}
                              onMouseLeave={() => setHoveredWidget(null)}
                              className="group relative p-3 border border-graphite hover:border-violet-500 bg-void-black/60 hover:bg-[#1a1423] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-xs cursor-pointer flex items-center justify-between shadow-xs hover:-translate-y-0.5 overflow-hidden hover:shadow-[0_4px_12px_rgba(139,92,246,0.2)]"
                            >
                              <div className="absolute inset-0 border border-dashed border-transparent group-hover:border-violet-500/30 pointer-events-none transition-colors duration-200 rounded-xs"></div>

                              <div className="flex items-center gap-3 relative z-10">
                                <div className="p-2 rounded-xs bg-graphite group-hover:bg-violet-500 text-violet-400 group-hover:text-white transition-colors duration-300 shrink-0">
                                  <Icon size={16} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <h4 className="font-inter-tight font-medium text-label text-chalk group-hover:text-violet-400 transition-colors duration-300">
                                      {item.name}
                                    </h4>
                                    {item.badge && (
                                      <span className="text-[9px] font-inter-tight font-medium text-bone bg-graphite border border-slate px-1.5 py-0.5 rounded-xs shrink-0 whitespace-nowrap">
                                        {item.badge.text}
                                      </span>
                                    )}
                                  </div>
                                  <p className="font-inter-tight text-eyebrow text-ash group-hover:text-bone transition-colors line-clamp-1">
                                    {item.desc}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0 relative z-10">
                                <ExternalLink
                                  size={11}
                                  className="text-ash/50 group-hover:text-violet-400/70 transition-colors"
                                />
                                <button className="text-ash group-hover:text-violet-400 transition-colors duration-300 p-1">
                                  <Plus size={15} />
                                </button>
                              </div>
                            </div>
                          )
                        }

                        return (
                          <>
                            {baseItems.map(renderItem)}
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
                                  {extraItems.map(renderItem)}
                                </motion.div>
                              )}
                            </AnimatePresence>
                            {items.length > 3 && (
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
                  )}
                </div>

                <a
                  href="https://github.com/Igorcbraz/GitAscii/fork"
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
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="label-stamp">{`[ RESULTS: ${filteredWidgets.length} ]`}</div>
                </div>
                {filteredWidgets.map(renderWidgetCard)}

                <a
                  href="https://github.com/Igorcbraz/GitAscii/fork"
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
          <>
            <div className="label-stamp mb-2">
              {t('editor.sidebar.portability', '[ PORTABILITY ]')}
            </div>
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
                data-testid="import-layout-btn"
                className="group relative p-2.5 border border-graphite hover:border-pearl bg-void-black/60 hover:bg-onyx transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-xs cursor-pointer flex items-center justify-between shadow-xs hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-xs bg-graphite group-hover:bg-slate text-pearl group-hover:text-chalk transition-colors duration-300 shrink-0">
                    <Upload size={14} />
                  </div>
                  <div>
                    <h4 className="font-inter-tight font-medium text-note text-chalk group-hover:text-white transition-colors duration-300">
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
                data-testid="export-layout-btn"
                className="group relative p-2.5 border border-graphite hover:border-pearl bg-void-black/60 hover:bg-onyx transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-xs cursor-pointer flex items-center justify-between shadow-xs hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-xs bg-graphite group-hover:bg-slate text-pearl group-hover:text-chalk transition-colors duration-300 shrink-0">
                    <Download size={14} />
                  </div>
                  <div>
                    <h4 className="font-inter-tight font-medium text-note text-chalk group-hover:text-white transition-colors duration-300">
                      {t('editor.sidebar.export_layout', 'Export Layout')}
                    </h4>
                    <p className="font-inter-tight text-caption text-ash line-clamp-1">
                      {t(
                        'editor.sidebar.export_layout_desc',
                        'Salvar layout atual em arquivo JSON'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="label-stamp mb-2">
              {t('editor.sidebar.preset_templates', '[ PRESET TEMPLATES ]')}
            </div>
            <p className="text-note text-ash font-inter-tight mb-4">
              {t(
                'editor.sidebar.templates_desc',
                'Switching templates updates colors and layout while preserving your GitHub data.'
              )}
            </p>
            {Object.values(TEMPLATE_PRESETS).map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => applyTemplate(tmpl.id)}
                data-testid={`template-${tmpl.id}`}
                className={`p-4 border rounded-none cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 ${
                  config.templateId === tmpl.id
                    ? 'border-signal-lime bg-iron shadow-sm'
                    : 'border-graphite bg-graphite hover:border-slate'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-inter-tight font-medium text-body text-chalk">{tmpl.name}</h4>
                  {config.templateId === tmpl.id && (
                    <span className="text-caption uppercase font-inter-tight font-medium text-signal-lime px-2 py-0.5 border border-signal-lime rounded-[9999px]">
                      {t('editor.sidebar.active', 'Active')}
                    </span>
                  )}
                </div>
                <p className="font-inter-tight text-note text-ash mb-3">{tmpl.description}</p>
                <div className="flex gap-2">
                  <div
                    className="h-4 w-4 rounded-full border border-slate"
                    style={{ backgroundColor: tmpl.colors.background }}
                  />
                  <div
                    className="h-4 w-4 rounded-full border border-slate"
                    style={{ backgroundColor: tmpl.colors.accent }}
                  />
                  <div
                    className="h-4 w-4 rounded-full border border-slate"
                    style={{ backgroundColor: tmpl.colors.cardBackground }}
                  />
                </div>
              </div>
            ))}

            <a
              href="https://github.com/Igorcbraz/GitAscii/fork"
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-2.5 border border-signal-lime/60 bg-signal-lime/5 hover:bg-signal-lime/15 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-none cursor-pointer hover:shadow-[0_0_20px_rgba(197,255,74,0.15)] hover:-translate-y-0.5"
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
                    {t(
                      'editor.sidebar.contribute_template_desc',
                      'Faça um fork e compartilhe com a comunidade'
                    )}
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
  )
}
