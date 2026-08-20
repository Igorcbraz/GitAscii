import { create } from 'zustand'

import { convertTextToAscii } from '@/engine/ascii/textConverter'
import { createConfiguration } from '@/engine/core/TemplateRenderer'
import type { NormalizedGitHubData, SavedConfiguration, WidgetInstance } from '@/engine/types'
import { safeStorage } from '@/utils/storage'

import { WIDGET_CATALOG } from '../config/widgets'
import { detectSocialsFromProfile, detectTechStackFromProfile } from '../utils/profileAutoDetection'

interface HistoryState {
  past: SavedConfiguration[]
  future: SavedConfiguration[]
}

const MAX_HISTORY_STEPS = 50

function saveToLocalStorage(config: SavedConfiguration) {
  safeStorage.setJSON(`gitascii_${config.githubId}_${config.profileSlug || 'default'}`, config)
}

export interface EditorStore {
  config: SavedConfiguration | null
  githubData: NormalizedGitHubData | null
  selectedInstanceId: string | null
  selectedInstanceIds: string[]
  history: HistoryState
  zoom: number
  isSaving: boolean
  activeTab: 'widgets' | 'layers' | 'templates'
  session: { username: string; githubId: number } | null
  clipboard: WidgetInstance[]
  activeMobilePanel: 'widgets' | 'canvas' | 'properties'
  setSession: (session: { username: string; githubId: number } | null) => void
  setActiveMobilePanel: (panel: 'widgets' | 'canvas' | 'properties') => void

  initEditor: (config: SavedConfiguration, data: NormalizedGitHubData) => void
  selectWidget: (instanceId: string | null, multi?: boolean, isShift?: boolean) => void
  setSelection: (instanceIds: string[]) => void
  copyWidgets: () => void
  pasteWidgets: () => void
  cutWidgets: () => void
  updateWidgetConfig: (instanceId: string, patch: Record<string, unknown>) => void
  updateWidgetsConfig: (instanceIds: string[], patch: Record<string, unknown>) => void
  updateGlobalStyles: (patch: Partial<SavedConfiguration['globalStyles']>) => void
  updateWidgetPositions: (
    deltas: { instanceId: string; position: { x: number; y: number } }[],
    recordHistory?: boolean
  ) => void
  updateWidgetPosition: (
    instanceId: string,
    position: { x: number; y: number },
    recordHistory?: boolean
  ) => void
  updateWidgetSize: (
    instanceId: string,
    size: { width: number; height: number },
    recordHistory?: boolean
  ) => void
  updateWidgetsSize: (
    instanceIds: string[],
    size: Partial<{ width: number; height: number }>,
    recordHistory?: boolean
  ) => void
  toggleWidgetVisibility: (instanceId: string) => void
  toggleWidgetsVisibility: (instanceIds: string[]) => void
  toggleWidgetLock: (instanceId: string) => void
  toggleWidgetsLock: (instanceIds: string[]) => void
  alignWidgets: (
    instanceIds: string[],
    alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
  ) => void
  distributeWidgets: (instanceIds: string[], direction: 'horizontal' | 'vertical') => void
  renameWidget: (instanceId: string, name: string) => void
  removeWidget: (instanceId: string) => void
  removeWidgets: (instanceIds: string[]) => void
  addWidget: (widgetId: string) => void
  duplicateWidget: (instanceId: string) => void
  reorderWidgets: (fromIndex: number, toIndex: number) => void
  moveWidgetLayer: (instanceId: string, direction: 'up' | 'down' | 'top' | 'bottom') => void
  applyTemplate: (templateId: string) => void
  setZoom: (zoom: number) => void
  setActiveTab: (tab: 'widgets' | 'layers' | 'templates') => void
  recordHistorySnapshot: () => void

  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  importLayout: (
    widgets: WidgetInstance[],
    globalStyles?: SavedConfiguration['globalStyles'],
    templateId?: string
  ) => void
}

export const useEditorStore = create<EditorStore>((set, get) => {
  const pushStateToHistory = () => {
    const { config, history } = get()
    if (!config) return { newPast: history.past }

    const snapshot = JSON.parse(JSON.stringify(config))
    const newPast = [...history.past, snapshot].slice(-MAX_HISTORY_STEPS)
    return { newPast }
  }

  const applyConfigChange = (newConfig: SavedConfiguration, saveSnapshot = true) => {
    const { history } = get()
    let newPast = history.past

    if (saveSnapshot) {
      const res = pushStateToHistory()
      newPast = res.newPast
    }

    set({
      config: newConfig,
      history: { past: newPast, future: saveSnapshot ? [] : history.future },
      canUndo: newPast.length > 0,
      canRedo: saveSnapshot ? false : get().canRedo,
    })

    saveToLocalStorage(newConfig)
  }

  return {
    config: null,
    githubData: null,
    selectedInstanceId: null,
    selectedInstanceIds: [],
    history: { past: [], future: [] },
    zoom: 1,
    isSaving: false,
    activeTab: 'widgets',
    session: null,
    clipboard: [],
    activeMobilePanel: 'canvas',

    setSession: (session) => set({ session }),
    setActiveMobilePanel: (panel) => set({ activeMobilePanel: panel }),

    canUndo: false,
    canRedo: false,

    initEditor: (config, data) => {
      set({
        config,
        githubData: data,
        selectedInstanceId: config.widgets[0]?.instanceId || null,
        selectedInstanceIds: config.widgets[0]?.instanceId ? [config.widgets[0].instanceId] : [],
        history: { past: [], future: [] },
        canUndo: false,
        canRedo: false,
      })
    },

    recordHistorySnapshot: () => {
      const { config, history } = get()
      if (!config) return
      const snapshot = JSON.parse(JSON.stringify(config))
      const newPast = [...history.past, snapshot].slice(-MAX_HISTORY_STEPS)
      set({
        history: { past: newPast, future: [] },
        canUndo: true,
        canRedo: false,
      })
    },

    selectWidget: (instanceId, multi = false, isShift = false) => {
      const { config, selectedInstanceId, selectedInstanceIds } = get()
      if (!instanceId) {
        set({ selectedInstanceId: null, selectedInstanceIds: [] })
        return
      }

      if (multi) {
        if (selectedInstanceIds.includes(instanceId)) {
          const newIds = selectedInstanceIds.filter((id) => id !== instanceId)
          set({
            selectedInstanceIds: newIds,
            selectedInstanceId: newIds.length > 0 ? newIds[newIds.length - 1] : null,
          })
        } else {
          const newIds = [...selectedInstanceIds, instanceId]
          set({
            selectedInstanceIds: newIds,
            selectedInstanceId: instanceId,
          })
        }
      } else if (isShift && config) {
        const lastId = selectedInstanceId
        if (!lastId) {
          set({ selectedInstanceId: instanceId, selectedInstanceIds: [instanceId] })
        } else {
          const lastIndex = config.widgets.findIndex((w) => w.instanceId === lastId)
          const currIndex = config.widgets.findIndex((w) => w.instanceId === instanceId)
          if (lastIndex !== -1 && currIndex !== -1) {
            const start = Math.min(lastIndex, currIndex)
            const end = Math.max(lastIndex, currIndex)
            const newIds = new Set([...selectedInstanceIds])
            for (let i = start; i <= end; i++) {
              newIds.add(config.widgets[i].instanceId)
            }
            set({ selectedInstanceIds: Array.from(newIds), selectedInstanceId: instanceId })
          } else {
            set({ selectedInstanceId: instanceId, selectedInstanceIds: [instanceId] })
          }
        }
      } else {
        set({ selectedInstanceId: instanceId, selectedInstanceIds: [instanceId] })
      }
    },
    setSelection: (instanceIds) => {
      set({
        selectedInstanceIds: instanceIds,
        selectedInstanceId: instanceIds.length > 0 ? instanceIds[instanceIds.length - 1] : null,
      })
    },

    copyWidgets: () => {
      const { config, selectedInstanceIds } = get()
      if (!config || selectedInstanceIds.length === 0) return
      const toCopy = config.widgets.filter((w) => selectedInstanceIds.includes(w.instanceId))
      set({ clipboard: JSON.parse(JSON.stringify(toCopy)) })
    },

    pasteWidgets: () => {
      const { config, clipboard } = get()
      if (!config || clipboard.length === 0) return

      const newWidgets = clipboard.map((target, idx) => ({
        ...JSON.parse(JSON.stringify(target)),
        instanceId: `widget_${Date.now()}_${idx}`,
        name: `${target.name || target.widgetId} (Cópia)`,
        position: {
          x: Math.min(800 - target.size.width, target.position.x + 16),
          y: target.position.y + 16,
        },
        zIndex: config.widgets.length + idx + 1,
      }))

      const newConfig = {
        ...config,
        widgets: [...config.widgets, ...newWidgets],
        metadata: { ...config.metadata, updatedAt: new Date().toISOString() },
      }
      applyConfigChange(newConfig, true)

      const newIds = newWidgets.map((w) => w.instanceId)
      set({ selectedInstanceIds: newIds, selectedInstanceId: newIds[newIds.length - 1] })
    },

    cutWidgets: () => {
      get().copyWidgets()
      const { config, selectedInstanceIds } = get()
      if (!config || selectedInstanceIds.length === 0) return

      const newWidgets = config.widgets.filter((w) => !selectedInstanceIds.includes(w.instanceId))
      const newConfig = {
        ...config,
        widgets: newWidgets,
        metadata: { ...config.metadata, updatedAt: new Date().toISOString() },
      }
      applyConfigChange(newConfig, true)
      set({ selectedInstanceId: null, selectedInstanceIds: [] })
    },

    updateWidgetConfig: (instanceId, patch) => {
      const { config } = get()
      if (!config) return

      const targetWidget = config.widgets.find((w) => w.instanceId === instanceId)
      if (!targetWidget) return

      const hasChanged = Object.entries(patch).some(
        ([key, val]) => (targetWidget.config as Record<string, unknown>)[key] !== val
      )
      if (!hasChanged) return

      const newWidgets = config.widgets.map((w) =>
        w.instanceId === instanceId ? { ...w, config: { ...w.config, ...patch } } : w
      )

      const newConfig = {
        ...config,
        widgets: newWidgets,
        metadata: { ...config.metadata, updatedAt: new Date().toISOString() },
      }

      applyConfigChange(newConfig, true)
    },

    updateWidgetsConfig: (instanceIds, patch) => {
      const { config } = get()
      if (!config || instanceIds.length === 0) return

      const targetSet = new Set(instanceIds)
      const hasChanged = config.widgets.some((w) => {
        if (!targetSet.has(w.instanceId)) return false
        return Object.entries(patch).some(
          ([key, val]) => (w.config as Record<string, unknown>)[key] !== val
        )
      })
      if (!hasChanged) return

      const newWidgets = config.widgets.map((w) =>
        targetSet.has(w.instanceId) ? { ...w, config: { ...w.config, ...patch } } : w
      )

      const newConfig = {
        ...config,
        widgets: newWidgets,
        metadata: { ...config.metadata, updatedAt: new Date().toISOString() },
      }

      applyConfigChange(newConfig, true)
    },

    updateGlobalStyles: (patch) => {
      const { config } = get()
      if (!config) return

      const hasChanged = Object.entries(patch).some(
        ([key, val]) => config.globalStyles[key as keyof typeof config.globalStyles] !== val
      )
      if (!hasChanged) return

      const newConfig = {
        ...config,
        globalStyles: { ...config.globalStyles, ...patch },
        metadata: { ...config.metadata, updatedAt: new Date().toISOString() },
      }

      applyConfigChange(newConfig, true)
    },

    updateWidgetPositions: (deltas, recordHistory = true) => {
      const { config } = get()
      if (!config || deltas.length === 0) return

      const deltaMap = new Map(deltas.map((d) => [d.instanceId, d.position]))
      const hasAnyChange = config.widgets.some((w) => {
        const newPos = deltaMap.get(w.instanceId)
        return newPos && (newPos.x !== w.position.x || newPos.y !== w.position.y)
      })
      if (!hasAnyChange) return

      const newWidgets = config.widgets.map((w) => {
        const newPos = deltaMap.get(w.instanceId)
        return newPos ? { ...w, position: newPos } : w
      })

      const newConfig = {
        ...config,
        widgets: newWidgets,
        metadata: { ...config.metadata, updatedAt: new Date().toISOString() },
      }

      applyConfigChange(newConfig, recordHistory)
    },

    updateWidgetPosition: (instanceId, position, recordHistory = true) => {
      const { config } = get()
      if (!config) return

      const target = config.widgets.find((w) => w.instanceId === instanceId)
      if (!target || (target.position.x === position.x && target.position.y === position.y)) {
        return
      }

      const newWidgets = config.widgets.map((w) =>
        w.instanceId === instanceId ? { ...w, position } : w
      )

      const newConfig = {
        ...config,
        widgets: newWidgets,
        metadata: { ...config.metadata, updatedAt: new Date().toISOString() },
      }

      applyConfigChange(newConfig, recordHistory)
    },

    updateWidgetSize: (instanceId, size, recordHistory = true) => {
      const { config } = get()
      if (!config) return

      const target = config.widgets.find((w) => w.instanceId === instanceId)
      if (
        !target ||
        ((size.width === undefined || target.size.width === size.width) &&
          (size.height === undefined || target.size.height === size.height))
      ) {
        return
      }

      const newWidgets = config.widgets.map((w) =>
        w.instanceId === instanceId
          ? {
              ...w,
              size: {
                width: size.width !== undefined ? size.width : w.size.width,
                height: size.height !== undefined ? size.height : w.size.height,
              },
            }
          : w
      )

      const newConfig = {
        ...config,
        widgets: newWidgets,
        metadata: { ...config.metadata, updatedAt: new Date().toISOString() },
      }

      applyConfigChange(newConfig, recordHistory)
    },

    updateWidgetsSize: (instanceIds, size, recordHistory = true) => {
      const { config } = get()
      if (!config || instanceIds.length === 0) return

      const targetSet = new Set(instanceIds)
      let hasAnyChange = false

      const newWidgets = config.widgets.map((w) => {
        if (!targetSet.has(w.instanceId) || w.locked) return w
        const isAspectLocked =
          w.config.lockAspectRatio !== undefined
            ? Boolean(w.config.lockAspectRatio)
            : w.widgetId === 'avatar' || w.widgetId === 'ascii-art'

        const newWidth = size.width !== undefined ? size.width : w.size.width
        let newHeight = size.height !== undefined ? size.height : w.size.height

        if (isAspectLocked && size.width !== undefined && size.height === undefined) {
          newHeight = size.width
        } else if (isAspectLocked && size.height !== undefined && size.width === undefined) {
          newHeight = size.height
        }

        if (newWidth !== w.size.width || newHeight !== w.size.height) {
          hasAnyChange = true
        }

        return { ...w, size: { width: newWidth, height: newHeight } }
      })

      if (!hasAnyChange) return

      const newConfig = {
        ...config,
        widgets: newWidgets,
        metadata: { ...config.metadata, updatedAt: new Date().toISOString() },
      }

      applyConfigChange(newConfig, recordHistory)
    },

    toggleWidgetVisibility: (instanceId) => {
      const { config } = get()
      if (!config) return

      const newWidgets = config.widgets.map((w) =>
        w.instanceId === instanceId ? { ...w, visible: !w.visible } : w
      )

      const newConfig = {
        ...config,
        widgets: newWidgets,
        metadata: { ...config.metadata, updatedAt: new Date().toISOString() },
      }

      applyConfigChange(newConfig, true)
    },

    toggleWidgetsVisibility: (instanceIds) => {
      const { config } = get()
      if (!config || instanceIds.length === 0) return

      const targetSet = new Set(instanceIds)
      const selected = config.widgets.filter((w) => targetSet.has(w.instanceId))
      const allVisible = selected.every((w) => w.visible)
      const nextVisible = !allVisible

      const newWidgets = config.widgets.map((w) =>
        targetSet.has(w.instanceId) ? { ...w, visible: nextVisible } : w
      )

      const newConfig = {
        ...config,
        widgets: newWidgets,
        metadata: { ...config.metadata, updatedAt: new Date().toISOString() },
      }

      applyConfigChange(newConfig, true)
    },

    toggleWidgetLock: (instanceId) => {
      const { config } = get()
      if (!config) return

      const newWidgets = config.widgets.map((w) =>
        w.instanceId === instanceId ? { ...w, locked: !w.locked } : w
      )

      const newConfig = {
        ...config,
        widgets: newWidgets,
        metadata: { ...config.metadata, updatedAt: new Date().toISOString() },
      }

      applyConfigChange(newConfig, true)
    },

    toggleWidgetsLock: (instanceIds) => {
      const { config } = get()
      if (!config || instanceIds.length === 0) return

      const targetSet = new Set(instanceIds)
      const selected = config.widgets.filter((w) => targetSet.has(w.instanceId))
      const allLocked = selected.every((w) => w.locked)
      const nextLocked = !allLocked

      const newWidgets = config.widgets.map((w) =>
        targetSet.has(w.instanceId) ? { ...w, locked: nextLocked } : w
      )

      const newConfig = {
        ...config,
        widgets: newWidgets,
        metadata: { ...config.metadata, updatedAt: new Date().toISOString() },
      }

      applyConfigChange(newConfig, true)
    },

    alignWidgets: (instanceIds, alignment) => {
      const { config } = get()
      if (!config || instanceIds.length <= 1) return

      const targetWidgets = config.widgets.filter(
        (w) => instanceIds.includes(w.instanceId) && !w.locked
      )
      if (targetWidgets.length <= 1) return

      const minX = Math.min(...targetWidgets.map((w) => w.position.x))
      const maxX = Math.max(...targetWidgets.map((w) => w.position.x + w.size.width))
      const minY = Math.min(...targetWidgets.map((w) => w.position.y))
      const maxY = Math.max(...targetWidgets.map((w) => w.position.y + w.size.height))
      const centerX = Math.round(minX + (maxX - minX) / 2)
      const centerY = Math.round(minY + (maxY - minY) / 2)

      const targetSet = new Set(instanceIds)
      const newWidgets = config.widgets.map((w) => {
        if (!targetSet.has(w.instanceId) || w.locked) return w
        let newX = w.position.x
        let newY = w.position.y

        if (alignment === 'left') {
          newX = minX
        } else if (alignment === 'center') {
          newX = Math.max(0, Math.min(800 - w.size.width, Math.round(centerX - w.size.width / 2)))
        } else if (alignment === 'right') {
          newX = Math.max(0, maxX - w.size.width)
        } else if (alignment === 'top') {
          newY = minY
        } else if (alignment === 'middle') {
          newY = Math.max(0, Math.round(centerY - w.size.height / 2))
        } else if (alignment === 'bottom') {
          newY = Math.max(0, maxY - w.size.height)
        }

        return { ...w, position: { x: newX, y: newY } }
      })

      const newConfig = {
        ...config,
        widgets: newWidgets,
        metadata: { ...config.metadata, updatedAt: new Date().toISOString() },
      }

      applyConfigChange(newConfig, true)
    },

    distributeWidgets: (instanceIds, direction) => {
      const { config } = get()
      if (!config || instanceIds.length <= 2) return

      const targetWidgets = config.widgets.filter(
        (w) => instanceIds.includes(w.instanceId) && !w.locked
      )
      if (targetWidgets.length <= 2) return

      if (direction === 'vertical') {
        const sorted = [...targetWidgets].sort((a, b) => a.position.y - b.position.y)
        const first = sorted[0]
        const last = sorted[sorted.length - 1]
        const totalSpan = last.position.y - first.position.y
        const totalHeightOfMiddles = sorted
          .slice(0, sorted.length - 1)
          .reduce((sum, w) => sum + w.size.height, 0)
        const availableGap =
          (totalSpan - (totalHeightOfMiddles - first.size.height)) / (sorted.length - 1)

        let currentY = first.position.y
        const posMap = new Map<string, number>()
        sorted.forEach((w, idx) => {
          if (idx === 0) {
            posMap.set(w.instanceId, w.position.y)
            currentY = w.position.y + w.size.height + availableGap
          } else if (idx === sorted.length - 1) {
            posMap.set(w.instanceId, w.position.y)
          } else {
            posMap.set(w.instanceId, Math.max(0, Math.round(currentY)))
            currentY += w.size.height + availableGap
          }
        })

        const newWidgets = config.widgets.map((w) => {
          const newY = posMap.get(w.instanceId)
          return newY !== undefined ? { ...w, position: { ...w.position, y: newY } } : w
        })

        const newConfig = {
          ...config,
          widgets: newWidgets,
          metadata: { ...config.metadata, updatedAt: new Date().toISOString() },
        }
        applyConfigChange(newConfig, true)
      } else {
        const sorted = [...targetWidgets].sort((a, b) => a.position.x - b.position.x)
        const first = sorted[0]
        const last = sorted[sorted.length - 1]
        const totalSpan = last.position.x - first.position.x
        const totalWidthOfMiddles = sorted
          .slice(0, sorted.length - 1)
          .reduce((sum, w) => sum + w.size.width, 0)
        const availableGap =
          (totalSpan - (totalWidthOfMiddles - first.size.width)) / (sorted.length - 1)

        let currentX = first.position.x
        const posMap = new Map<string, number>()
        sorted.forEach((w, idx) => {
          if (idx === 0) {
            posMap.set(w.instanceId, w.position.x)
            currentX = w.position.x + w.size.width + availableGap
          } else if (idx === sorted.length - 1) {
            posMap.set(w.instanceId, w.position.x)
          } else {
            posMap.set(
              w.instanceId,
              Math.max(0, Math.min(800 - w.size.width, Math.round(currentX)))
            )
            currentX += w.size.width + availableGap
          }
        })

        const newWidgets = config.widgets.map((w) => {
          const newX = posMap.get(w.instanceId)
          return newX !== undefined ? { ...w, position: { ...w.position, x: newX } } : w
        })

        const newConfig = {
          ...config,
          widgets: newWidgets,
          metadata: { ...config.metadata, updatedAt: new Date().toISOString() },
        }
        applyConfigChange(newConfig, true)
      }
    },

    renameWidget: (instanceId, name) => {
      const { config } = get()
      if (!config) return

      const newWidgets = config.widgets.map((w) =>
        w.instanceId === instanceId ? { ...w, name } : w
      )

      const newConfig = {
        ...config,
        widgets: newWidgets,
        metadata: { ...config.metadata, updatedAt: new Date().toISOString() },
      }

      applyConfigChange(newConfig, true)
    },

    removeWidget: (instanceId) => {
      const { config } = get()
      if (!config) return

      const newWidgets = config.widgets.filter((w) => w.instanceId !== instanceId)
      const newConfig = {
        ...config,
        widgets: newWidgets,
        metadata: { ...config.metadata, updatedAt: new Date().toISOString() },
      }

      applyConfigChange(newConfig, true)
      set((state) => {
        const newIds = state.selectedInstanceIds.filter((id) => id !== instanceId)
        return {
          selectedInstanceId: newIds.length > 0 ? newIds[newIds.length - 1] : null,
          selectedInstanceIds: newIds,
        }
      })
    },

    removeWidgets: (instanceIds) => {
      const { config } = get()
      if (!config) return

      const newWidgets = config.widgets.filter(
        (w) => !instanceIds.includes(w.instanceId) || w.locked
      )

      const newConfig = {
        ...config,
        widgets: newWidgets,
        metadata: { ...config.metadata, updatedAt: new Date().toISOString() },
      }
      applyConfigChange(newConfig, true)
      set({ selectedInstanceId: null, selectedInstanceIds: [] })
    },

    addWidget: (widgetId) => {
      const { config, githubData } = get()
      if (!config) return

      const defaultSizeMap: Record<string, { width: number; height: number }> = {
        header: { width: 800, height: 90 },
        avatar: { width: 160, height: 160 },
        'ascii-art': { width: 280, height: 280 },
        'ascii-text': { width: 800, height: 120 },
        'terminal-info': { width: 504, height: 280 },
        'tech-stack': { width: 800, height: 140 },
        'social-media': { width: 800, height: 120 },
        bio: { width: 800, height: 160 },
        stats: { width: 800, height: 120 },
        languages: { width: 800, height: 140 },
        repositories: { width: 800, height: 300 },
        'gitfest-lineup': { width: 500, height: 650 },
        'github-readme-stats': { width: 390, height: 210 },
        'streak-stats': { width: 390, height: 210 },
        'profile-trophy': { width: 800, height: 200 },
        'activity-graph': { width: 710, height: 300 },
        'contribution-snake': { width: 800, height: 250 },
        'metrics-card': { width: 440, height: 380 },
        'views-counter': { width: 200, height: 96 },
        'readme-quotes': { width: 500, height: 210 },
        'awesome-badge': { width: 360, height: 80 },
        ghstats: { width: 390, height: 350 },
        divider: { width: 800, height: 30 },
        footer: { width: 800, height: 50 },
      }
      const catalogItem = WIDGET_CATALOG.find((item) => item.id === widgetId)
      const widgetSize = catalogItem?.defaultSize ||
        defaultSizeMap[widgetId] || { width: 800, height: 120 }
      const maxY = config.widgets.reduce((acc, w) => Math.max(acc, w.position.y + w.size.height), 0)

      const detectedSocials =
        widgetId === 'social-media' || widgetId === 'codeweb-social-badge'
          ? detectSocialsFromProfile(githubData)
          : null
      const detectedTechs =
        widgetId === 'tech-stack' || widgetId === 'codeweb-retro-grid'
          ? detectTechStackFromProfile(githubData)
          : null

      const newInstance: WidgetInstance = {
        instanceId: `widget_${Date.now()}`,
        widgetId,
        name: `${widgetId.charAt(0).toUpperCase() + widgetId.slice(1)} Widget`,
        position: { x: 0, y: maxY > 0 ? maxY + 16 : 0 },
        size: widgetSize,
        config: {
          ...(widgetId === 'social-media' && detectedSocials
            ? {
                selectedSocials: detectedSocials.selectedSocials,
                socialUrls: detectedSocials.socialUrls,
              }
            : {}),
          ...(widgetId === 'codeweb-social-badge' && detectedSocials
            ? { platforms: detectedSocials.selectedSocials }
            : {}),
          ...(widgetId === 'tech-stack' && detectedTechs ? { selectedTechs: detectedTechs } : {}),
          ...(widgetId === 'codeweb-retro-grid' && detectedTechs
            ? { selectedTechs: detectedTechs }
            : {}),
          ...(widgetId === 'avatar' || widgetId === 'ascii-art' ? { lockAspectRatio: true } : {}),
          ...(catalogItem?.category === 'controlplane'
            ? { layoutType: 'hero', accentColor: '#00A7D1' }
            : {}),
          ...(catalogItem?.category === 'godprofile' ? { accentColor: '#b6a891' } : {}),
          ...(catalogItem?.category === 'asciiprofile' ? { accentColor: '#ffa657' } : {}),
          ...(catalogItem?.category === 'surveillance'
            ? {
                accentColor: '#55ffff',
                customTitle: catalogItem.name,
              }
            : {}),
          ...(widgetId === 'ascii-text'
            ? {
                customText: 'GitAscii',
                asciiFont: 'block',
                charSpacing: 1,
                fontSize: 12,
                charset: 'default',
                customCharset: '',
                asciiLines: convertTextToAscii('GitAscii', 'block', 1, 'default', ''),
              }
            : {}),
        },
        locked: false,
        visible: true,
        zIndex: config.widgets.length + 1,
      }

      const newConfig = {
        ...config,
        widgets: [...config.widgets, newInstance],
        metadata: { ...config.metadata, updatedAt: new Date().toISOString() },
      }

      applyConfigChange(newConfig, true)
      set((state) => ({
        selectedInstanceId: newInstance.instanceId,
        selectedInstanceIds: [newInstance.instanceId],
        activeMobilePanel:
          state.activeMobilePanel === 'widgets' ? 'canvas' : state.activeMobilePanel,
      }))
    },

    duplicateWidget: (instanceId) => {
      const { config } = get()
      if (!config) return

      const target = config.widgets.find((w) => w.instanceId === instanceId)
      if (!target) return

      const newInstance: WidgetInstance = {
        ...JSON.parse(JSON.stringify(target)),
        instanceId: `widget_${Date.now()}`,
        name: `${target.name || target.widgetId} (Cópia)`,
        position: {
          x: Math.min(800 - target.size.width, target.position.x + 16),
          y: target.position.y + target.size.height + 16,
        },
        zIndex: config.widgets.length + 1,
      }

      const newConfig = {
        ...config,
        widgets: [...config.widgets, newInstance],
        metadata: { ...config.metadata, updatedAt: new Date().toISOString() },
      }

      applyConfigChange(newConfig, true)
      set({
        selectedInstanceId: newInstance.instanceId,
        selectedInstanceIds: [newInstance.instanceId],
      })
    },

    reorderWidgets: (fromIndex, toIndex) => {
      const { config } = get()
      if (!config) return

      const newWidgets = [...config.widgets]
      const [movedItem] = newWidgets.splice(fromIndex, 1)
      newWidgets.splice(toIndex, 0, movedItem)

      const updatedWidgets = newWidgets.map((w, idx) => ({
        ...w,
        zIndex: idx + 1,
      }))

      const newConfig = {
        ...config,
        widgets: updatedWidgets,
        metadata: { ...config.metadata, updatedAt: new Date().toISOString() },
      }

      applyConfigChange(newConfig, true)
    },

    moveWidgetLayer: (instanceId, direction) => {
      const { config } = get()
      if (!config) return

      const index = config.widgets.findIndex((w) => w.instanceId === instanceId)
      if (index === -1) return

      let targetIndex = index
      if (direction === 'up' && index < config.widgets.length - 1) {
        targetIndex = index + 1
      } else if (direction === 'down' && index > 0) {
        targetIndex = index - 1
      } else if (direction === 'top') {
        targetIndex = config.widgets.length - 1
      } else if (direction === 'bottom') {
        targetIndex = 0
      }

      if (targetIndex !== index) {
        get().reorderWidgets(index, targetIndex)
      }
    },

    applyTemplate: (templateId) => {
      const { config, githubData } = get()
      if (!config || !githubData) return

      const newConfig = createConfiguration(
        config.githubId,
        config.username,
        templateId,
        config.profileSlug || 'default',
        config.profileName,
        githubData
      )

      applyConfigChange(newConfig, true)
      set({
        selectedInstanceId: newConfig.widgets[0]?.instanceId || null,
        selectedInstanceIds: newConfig.widgets[0]?.instanceId
          ? [newConfig.widgets[0].instanceId]
          : [],
      })
    },

    setZoom: (zoom) => set({ zoom }),
    setActiveTab: (tab) => set({ activeTab: tab }),

    undo: () => {
      const { config, history } = get()
      if (history.past.length === 0 || !config) return

      const previous = history.past[history.past.length - 1]
      const newPast = history.past.slice(0, history.past.length - 1)
      const newFuture = [config, ...history.future]

      set({
        config: previous,
        history: { past: newPast, future: newFuture },
        canUndo: newPast.length > 0,
        canRedo: true,
        selectedInstanceId: previous.widgets.some((w) => w.instanceId === get().selectedInstanceId)
          ? get().selectedInstanceId
          : previous.widgets[0]?.instanceId || null,
        selectedInstanceIds: previous.widgets.some((w) => w.instanceId === get().selectedInstanceId)
          ? get().selectedInstanceIds
          : previous.widgets[0]?.instanceId
            ? [previous.widgets[0].instanceId]
            : [],
      })

      saveToLocalStorage(previous)
    },

    redo: () => {
      const { config, history } = get()
      if (history.future.length === 0 || !config) return

      const next = history.future[0]
      const newFuture = history.future.slice(1)
      const newPast = [...history.past, config]

      set({
        config: next,
        history: { past: newPast, future: newFuture },
        canUndo: true,
        canRedo: newFuture.length > 0,
        selectedInstanceId: next.widgets.some((w) => w.instanceId === get().selectedInstanceId)
          ? get().selectedInstanceId
          : next.widgets[0]?.instanceId || null,
        selectedInstanceIds: next.widgets.some((w) => w.instanceId === get().selectedInstanceId)
          ? get().selectedInstanceIds
          : next.widgets[0]?.instanceId
            ? [next.widgets[0].instanceId]
            : [],
      })

      saveToLocalStorage(next)
    },

    importLayout: (widgets, globalStyles, templateId) => {
      const { config } = get()
      if (!config) return

      const newConfig = {
        ...config,
        widgets,
        globalStyles: globalStyles || config.globalStyles,
        templateId: templateId || config.templateId,
        metadata: {
          ...config.metadata,
          updatedAt: new Date().toISOString(),
        },
      }

      applyConfigChange(newConfig, true)
      set({
        selectedInstanceId: newConfig.widgets[0]?.instanceId || null,
        selectedInstanceIds: newConfig.widgets[0]?.instanceId
          ? [newConfig.widgets[0].instanceId]
          : [],
      })
    },
  }
})

if (typeof window !== 'undefined') {
  ;(window as any).__EDITOR_STORE__ = useEditorStore
}
