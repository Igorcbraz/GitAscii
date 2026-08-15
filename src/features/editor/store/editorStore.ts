import { create } from 'zustand'

import { convertTextToAscii } from '@/engine/ascii/textConverter'
import { createConfiguration } from '@/engine/core/TemplateRenderer'
import type { NormalizedGitHubData, SavedConfiguration, WidgetInstance } from '@/engine/types'
import { safeStorage } from '@/utils/storage'

import { WIDGET_CATALOG } from '../config/widgets'

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
  toggleWidgetVisibility: (instanceId: string) => void
  toggleWidgetLock: (instanceId: string) => void
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

    updateGlobalStyles: (patch) => {
      const { config } = get()
      if (!config) return

      const newConfig = {
        ...config,
        globalStyles: { ...config.globalStyles, ...patch },
        metadata: { ...config.metadata, updatedAt: new Date().toISOString() },
      }

      applyConfigChange(newConfig, true)
    },

    updateWidgetPositions: (deltas, recordHistory = true) => {
      const { config } = get()
      if (!config) return

      const deltaMap = new Map(deltas.map((d) => [d.instanceId, d.position]))

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

      const newWidgets = config.widgets.map((w) =>
        w.instanceId === instanceId ? { ...w, size } : w
      )

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
      const { config } = get()
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

      const newInstance: WidgetInstance = {
        instanceId: `widget_${Date.now()}`,
        widgetId,
        name: `${widgetId.charAt(0).toUpperCase() + widgetId.slice(1)} Widget`,
        position: { x: 0, y: maxY > 0 ? maxY + 16 : 0 },
        size: widgetSize,
        config: {
          ...(widgetId === 'avatar' || widgetId === 'ascii-art' ? { lockAspectRatio: true } : {}),
          ...(catalogItem?.category === 'controlplane'
            ? { layoutType: 'hero', accentColor: '#00A7D1' }
            : {}),
          ...(catalogItem?.category === 'godprofile' ? { accentColor: '#b6a891' } : {}),
          ...(catalogItem?.category === 'asciiprofile' ? { accentColor: '#ffa657' } : {}),
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
        config.profileName
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
