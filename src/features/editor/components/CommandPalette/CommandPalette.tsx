'use client'

import {
  Activity,
  Award,
  BarChart3,
  Check,
  Code2,
  Command,
  Cpu,
  Download,
  Eye,
  FileText,
  Flame,
  FolderGit2,
  Github,
  Globe,
  Heading,
  LayoutTemplate,
  Loader2,
  Minus,
  PieChart,
  Quote,
  Redo2,
  Search,
  Share2,
  Sparkles,
  Terminal,
  TerminalSquare,
  TrendingUp,
  Trophy,
  Type,
  Undo2,
  User,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { TEMPLATE_PRESETS } from '@/engine/core/TemplateRenderer'
import { useI18n } from '@/i18n'

import { WIDGET_CATALOG } from '../../config/widgets'
import { useEditorStore } from '../../store/editorStore'

type CommandGroup = 'widget' | 'template' | 'action' | 'view'

interface Command {
  id: string
  label: string
  description?: string
  group: CommandGroup
  icon: React.ElementType
  keywords?: string[]
  onSelect: () => void
  badge?: string
  shortcut?: string[]
}

const GROUP_ORDER: CommandGroup[] = ['action', 'widget', 'template', 'view']

const WIDGET_ICONS: Record<string, React.ElementType> = {
  header: Heading,
  'ascii-text': Type,
  'ascii-art': Terminal,
  'terminal-info': TerminalSquare,
  avatar: User,
  'tech-stack': Cpu,
  bio: FileText,
  'custom-image': FileText,
  stats: BarChart3,
  languages: Code2,
  repositories: FolderGit2,
  'social-media': Share2,
  'github-readme-stats': BarChart3,
  'streak-stats': Flame,
  'profile-trophy': Trophy,
  'activity-graph': Activity,
  'contribution-snake': TrendingUp,
  'metrics-card': PieChart,
  'views-counter': Eye,
  'readme-quotes': Quote,
  'awesome-badge': Award,
  'gitfest-lineup': Sparkles,
  ghstats: BarChart3,
  divider: Minus,
  footer: LayoutTemplate,
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  onCommit?: () => void
  onExport?: () => void
  commitStatus?: 'idle' | 'committing' | 'success' | 'error'
}

export function CommandPalette({
  open,
  onClose,
  onCommit,
  onExport,
  commitStatus = 'idle',
}: CommandPaletteProps) {
  const { t } = useI18n()
  const { addWidget, applyTemplate, setZoom, zoom, undo, redo, canUndo, canRedo } = useEditorStore()

  const GROUP_LABELS: Record<CommandGroup, string> = {
    widget: t('editor.cmd.group.widget'),
    template: t('editor.cmd.group.template'),
    action: t('editor.cmd.group.action'),
    view: t('editor.cmd.group.view'),
  }

  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const commands = useMemo<Command[]>(() => {
    const list: Command[] = []

    if (onCommit) {
      list.push({
        id: 'action-commit',
        label:
          commitStatus === 'committing'
            ? t('editor.cmd.commit.committing')
            : commitStatus === 'success'
              ? t('editor.cmd.commit.success')
              : t('editor.cmd.commit.idle'),
        description: t('editor.cmd.commit.desc'),
        group: 'action',
        icon: commitStatus === 'committing' ? Loader2 : commitStatus === 'success' ? Check : Github,
        keywords: ['commit', 'github', 'readme', 'save', 'push'],
        badge: 'README',
        shortcut: [],
        onSelect: () => {
          onCommit()
          onClose()
        },
      })
    }

    if (onExport) {
      list.push({
        id: 'action-export',
        label: t('editor.cmd.export.title'),
        description: t('editor.cmd.export.desc'),
        group: 'action',
        icon: Download,
        keywords: ['export', 'download', 'json', 'layout', 'salvar'],
        shortcut: [],
        onSelect: () => {
          onExport()
          onClose()
        },
      })
    }

    list.push({
      id: 'action-undo',
      label: t('editor.cmd.undo.title'),
      description: t('editor.cmd.undo.desc'),
      group: 'action',
      icon: Undo2,
      keywords: ['undo', 'desfazer', 'voltar'],
      shortcut: ['⌘', 'Z'],
      onSelect: () => {
        if (canUndo) undo()
        onClose()
      },
    })

    list.push({
      id: 'action-redo',
      label: t('editor.cmd.redo.title'),
      description: t('editor.cmd.redo.desc'),
      group: 'action',
      icon: Redo2,
      keywords: ['redo', 'refazer'],
      shortcut: ['⌘', 'Y'],
      onSelect: () => {
        if (canRedo) redo()
        onClose()
      },
    })

    list.push({
      id: 'view-zoom-in',
      label: t('editor.cmd.zoom_in.title'),
      description: `${t('editor.cmd.zoom.desc')}${Math.round(zoom * 100)}%`,
      group: 'view',
      icon: ZoomIn,
      keywords: ['zoom', 'in', 'aumentar', 'mais'],
      shortcut: [],
      onSelect: () => {
        setZoom(Math.min(1.5, zoom + 0.1))
        onClose()
      },
    })

    list.push({
      id: 'view-zoom-out',
      label: t('editor.cmd.zoom_out.title'),
      description: `${t('editor.cmd.zoom.desc')}${Math.round(zoom * 100)}%`,
      group: 'view',
      icon: ZoomOut,
      keywords: ['zoom', 'out', 'diminuir', 'menos'],
      shortcut: [],
      onSelect: () => {
        setZoom(Math.max(0.5, zoom - 0.1))
        onClose()
      },
    })

    list.push({
      id: 'view-zoom-reset',
      label: t('editor.cmd.zoom_reset.title'),
      description: t('editor.cmd.zoom_reset.desc'),
      group: 'view',
      icon: Globe,
      keywords: ['zoom', 'reset', 'fit', '100'],
      shortcut: [],
      onSelect: () => {
        setZoom(1)
        onClose()
      },
    })

    WIDGET_CATALOG.forEach((w) => {
      list.push({
        id: `widget-${w.id}`,
        label: w.name,
        description: w.desc,
        group: 'widget',
        icon: WIDGET_ICONS[w.id] ?? FileText,
        keywords: [w.id, w.category ?? '', w.badge?.text ?? ''],
        badge: w.badge?.text,
        onSelect: () => {
          addWidget(w.id)
          onClose()
        },
      })
    })

    Object.values(TEMPLATE_PRESETS).forEach((tpl) => {
      list.push({
        id: `template-${tpl.id}`,
        label: tpl.name,
        description: tpl.description,
        group: 'template',
        icon: LayoutTemplate,
        keywords: [tpl.id, 'template', 'layout', 'theme', 'preset'],
        onSelect: () => {
          applyTemplate(tpl.id)
          onClose()
        },
      })
    })

    return list
  }, [
    addWidget,
    applyTemplate,
    canRedo,
    canUndo,
    commitStatus,
    onClose,
    onCommit,
    onExport,
    redo,
    setZoom,
    t,
    undo,
    zoom,
  ])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return commands

    return commands.filter((cmd) => {
      return (
        cmd.label.toLowerCase().includes(q) ||
        cmd.description?.toLowerCase().includes(q) ||
        cmd.keywords?.some((k) => k.toLowerCase().includes(q))
      )
    })
  }, [commands, query])

  const grouped = useMemo(() => {
    const map = new Map<CommandGroup, Command[]>()
    GROUP_ORDER.forEach((g) => map.set(g, []))
    filtered.forEach((cmd) => {
      const g = map.get(cmd.group)
      if (g) g.push(cmd)
    })
    return GROUP_ORDER.map((g) => ({ group: g, items: map.get(g)! })).filter(
      (g) => g.items.length > 0
    )
  }, [filtered])

  const flatItems = useMemo(() => grouped.flatMap((g) => g.items), [grouped])

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-cmd-index="${selectedIndex}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  const handleSelect = useCallback((cmd: Command) => {
    cmd.onSelect()
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, flatItems.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const cmd = flatItems[selectedIndex]
        if (cmd) handleSelect(cmd)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    },
    [flatItems, handleSelect, onClose, selectedIndex]
  )

  if (!open) return null

  let flatIndex = 0

  return (
    <div
      className="fixed inset-0 z-9999 flex items-start justify-center pt-[12vh]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full max-w-160 mx-4 bg-[#0e0e0e] border border-graphite rounded-md shadow-2xl shadow-black/60 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-150"
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-graphite/60">
          <Search size={16} className="text-ash shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('editor.cmd.search')}
            className="flex-1 bg-transparent text-chalk text-body font-inter-tight placeholder:text-fog outline-none"
            data-testid="command-palette-input"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-fog hover:text-ash transition-colors text-caption px-1.5 py-0.5 border border-graphite/40 rounded-xs"
            >
              {t('editor.cmd.nav.esc')}
            </button>
          )}
          <div className="hidden sm:flex items-center gap-1 shrink-0">
            <kbd className="bg-onyx border border-graphite text-ash text-caption px-1.5 py-0.5 rounded-xs font-inter-tight">
              ↑↓
            </kbd>
            <span className="text-fog text-caption">{t('editor.cmd.nav.navigate')}</span>
            <kbd className="bg-onyx border border-graphite text-ash text-caption px-1.5 py-0.5 rounded-xs font-inter-tight ml-1">
              ↵
            </kbd>
            <span className="text-fog text-caption">{t('editor.cmd.nav.select')}</span>
          </div>
        </div>

        <div
          ref={listRef}
          className="max-h-110 overflow-y-auto overscroll-contain py-1"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#333 transparent' }}
        >
          {flatItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-fog">
              <Search size={24} className="opacity-30" />
              <p className="text-note font-inter-tight">
                {t('editor.cmd.empty')}&quot;{query}&quot;
              </p>
            </div>
          ) : (
            grouped.map(({ group, items }) => {
              return (
                <div key={group} className="mb-1">
                  <div className="px-3 pt-3 pb-1.5">
                    <span className="text-eyebrow font-inter-tight font-medium text-fog uppercase tracking-widest">
                      {GROUP_LABELS[group]}
                    </span>
                  </div>

                  {items.map((cmd) => {
                    const itemIndex = flatIndex++
                    const isSelected = itemIndex === selectedIndex
                    const Icon = cmd.icon

                    return (
                      <button
                        key={cmd.id}
                        data-cmd-index={itemIndex}
                        data-testid={`cmd-${cmd.id}`}
                        onClick={() => handleSelect(cmd)}
                        onMouseEnter={() => setSelectedIndex(itemIndex)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 mx-1 rounded-xs transition-colors cursor-pointer text-left group ${
                          isSelected
                            ? 'bg-signal-lime/10 text-signal-lime'
                            : 'text-chalk hover:bg-graphite/40'
                        }`}
                        style={{ width: 'calc(100% - 8px)' }}
                      >
                        <div
                          className={`shrink-0 w-7 h-7 rounded-xs flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-signal-lime/15' : 'bg-onyx group-hover:bg-graphite'
                          }`}
                        >
                          <Icon
                            size={14}
                            className={isSelected ? 'text-signal-lime' : 'text-ash'}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-note font-inter-tight font-medium leading-none ${
                                isSelected ? 'text-signal-lime' : 'text-chalk'
                              }`}
                            >
                              {cmd.label}
                            </span>
                            {cmd.badge && (
                              <span className="text-[9px] font-inter-tight font-medium text-signal-lime/70 bg-signal-lime/10 border border-signal-lime/20 px-1.5 py-0.5 rounded-xs shrink-0 uppercase tracking-wide">
                                {cmd.badge}
                              </span>
                            )}
                          </div>
                          {cmd.description && (
                            <p
                              className={`text-eyebrow leading-none mt-0.5 truncate ${
                                isSelected ? 'text-signal-lime/60' : 'text-fog'
                              }`}
                            >
                              {cmd.description}
                            </p>
                          )}
                        </div>

                        {cmd.shortcut && cmd.shortcut.length > 0 && (
                          <div className="flex items-center gap-0.5 shrink-0">
                            {cmd.shortcut.map((key, ki) => (
                              <kbd
                                key={ki}
                                className={`text-caption px-1.5 py-0.5 rounded-xs border font-inter-tight ${
                                  isSelected
                                    ? 'bg-signal-lime/15 border-signal-lime/30 text-signal-lime'
                                    : 'bg-onyx border-graphite text-ash'
                                }`}
                              >
                                {key}
                              </kbd>
                            ))}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>

        <div className="border-t border-graphite/60 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-fog">
            <Command size={11} />
            <span className="text-eyebrow font-inter-tight">{t('editor.cmd.footer.title')}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-eyebrow text-fog">
              {flatItems.length}{' '}
              {flatItems.length !== 1
                ? t('editor.cmd.footer.results')
                : t('editor.cmd.footer.result')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
