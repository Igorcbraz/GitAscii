import { create } from 'zustand';
import type { SavedConfiguration, WidgetInstance, NormalizedGitHubData } from '@/engine/types';
import { createConfiguration } from '@/engine/core/TemplateRenderer';

interface HistoryState {
  past: SavedConfiguration[];
  future: SavedConfiguration[];
}

const MAX_HISTORY_STEPS = 50;

function saveToLocalStorage(config: SavedConfiguration) {
  try {
    localStorage.setItem(`gitascii_${config.githubId}_${config.profileSlug}`, JSON.stringify(config));
  } catch (e) {
    console.warn('Auto-save failed:', e);
  }

  if (typeof window !== 'undefined') {
    fetch('/api/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    }).catch((err) => {
      console.warn('Auto-save to server failed:', err);
    });
  }
}

export interface EditorStore {
  config: SavedConfiguration | null;
  githubData: NormalizedGitHubData | null;
  selectedInstanceId: string | null;
  history: HistoryState;
  zoom: number;
  isSaving: boolean;
  activeTab: 'widgets' | 'layers' | 'templates';

  initEditor: (config: SavedConfiguration, data: NormalizedGitHubData) => void;
  selectWidget: (instanceId: string | null) => void;
  updateWidgetConfig: (instanceId: string, patch: Record<string, unknown>) => void;
  updateWidgetPosition: (instanceId: string, position: { x: number; y: number }, recordHistory?: boolean) => void;
  updateWidgetSize: (instanceId: string, size: { width: number; height: number }, recordHistory?: boolean) => void;
  toggleWidgetVisibility: (instanceId: string) => void;
  toggleWidgetLock: (instanceId: string) => void;
  renameWidget: (instanceId: string, name: string) => void;
  removeWidget: (instanceId: string) => void;
  addWidget: (widgetId: string) => void;
  duplicateWidget: (instanceId: string) => void;
  reorderWidgets: (fromIndex: number, toIndex: number) => void;
  moveWidgetLayer: (instanceId: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
  applyTemplate: (templateId: string) => void;
  setZoom: (zoom: number) => void;
  setActiveTab: (tab: 'widgets' | 'layers' | 'templates') => void;
  recordHistorySnapshot: () => void;

  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const useEditorStore = create<EditorStore>((set, get) => {
  const pushStateToHistory = (newConfig: SavedConfiguration) => {
    const { config, history } = get();
    if (!config) return { newPast: history.past };

    const snapshot = JSON.parse(JSON.stringify(config));
    const newPast = [...history.past, snapshot].slice(-MAX_HISTORY_STEPS);
    return { newPast };
  };

  const applyConfigChange = (newConfig: SavedConfiguration, saveSnapshot = true) => {
    const { history } = get();
    let newPast = history.past;

    if (saveSnapshot) {
      const res = pushStateToHistory(newConfig);
      newPast = res.newPast;
    }

    set({
      config: newConfig,
      history: { past: newPast, future: saveSnapshot ? [] : history.future },
      canUndo: newPast.length > 0,
      canRedo: saveSnapshot ? false : get().canRedo,
    });

    saveToLocalStorage(newConfig);
  };

  return {
    config: null,
    githubData: null,
    selectedInstanceId: null,
    history: { past: [], future: [] },
    zoom: 1,
    isSaving: false,
    activeTab: 'widgets',

    canUndo: false,
    canRedo: false,

    initEditor: (config, data) => {
      set({
        config,
        githubData: data,
        selectedInstanceId: config.widgets[0]?.instanceId || null,
        history: { past: [], future: [] },
        canUndo: false,
        canRedo: false,
      });
    },

    recordHistorySnapshot: () => {
      const { config, history } = get();
      if (!config) return;
      const snapshot = JSON.parse(JSON.stringify(config));
      const newPast = [...history.past, snapshot].slice(-MAX_HISTORY_STEPS);
      set({
        history: { past: newPast, future: [] },
        canUndo: true,
        canRedo: false,
      });
    },

    selectWidget: (instanceId) => {
      set({ selectedInstanceId: instanceId });
    },

    updateWidgetConfig: (instanceId, patch) => {
      const { config } = get();
      if (!config) return;

      const newWidgets = config.widgets.map((w) =>
        w.instanceId === instanceId ? { ...w, config: { ...w.config, ...patch } } : w
      );

      const newConfig = {
        ...config,
        widgets: newWidgets,
        metadata: { ...config.metadata, updatedAt: new Date().toISOString() },
      };

      applyConfigChange(newConfig, true);
    },

    updateWidgetPosition: (instanceId, position, recordHistory = true) => {
      const { config } = get();
      if (!config) return;

      const newWidgets = config.widgets.map((w) =>
        w.instanceId === instanceId ? { ...w, position } : w
      );

      const newConfig = {
        ...config,
        widgets: newWidgets,
        metadata: { ...config.metadata, updatedAt: new Date().toISOString() },
      };

      applyConfigChange(newConfig, recordHistory);
    },

    updateWidgetSize: (instanceId, size, recordHistory = true) => {
      const { config } = get();
      if (!config) return;

      const newWidgets = config.widgets.map((w) =>
        w.instanceId === instanceId ? { ...w, size } : w
      );

      const newConfig = {
        ...config,
        widgets: newWidgets,
        metadata: { ...config.metadata, updatedAt: new Date().toISOString() },
      };

      applyConfigChange(newConfig, recordHistory);
    },

    toggleWidgetVisibility: (instanceId) => {
      const { config } = get();
      if (!config) return;

      const newWidgets = config.widgets.map((w) =>
        w.instanceId === instanceId ? { ...w, visible: !w.visible } : w
      );

      const newConfig = {
        ...config,
        widgets: newWidgets,
        metadata: { ...config.metadata, updatedAt: new Date().toISOString() },
      };

      applyConfigChange(newConfig, true);
    },

    toggleWidgetLock: (instanceId) => {
      const { config } = get();
      if (!config) return;

      const newWidgets = config.widgets.map((w) =>
        w.instanceId === instanceId ? { ...w, locked: !w.locked } : w
      );

      const newConfig = {
        ...config,
        widgets: newWidgets,
        metadata: { ...config.metadata, updatedAt: new Date().toISOString() },
      };

      applyConfigChange(newConfig, true);
    },

    renameWidget: (instanceId, name) => {
      const { config } = get();
      if (!config) return;

      const newWidgets = config.widgets.map((w) =>
        w.instanceId === instanceId ? { ...w, name } : w
      );

      const newConfig = {
        ...config,
        widgets: newWidgets,
        metadata: { ...config.metadata, updatedAt: new Date().toISOString() },
      };

      applyConfigChange(newConfig, true);
    },

    removeWidget: (instanceId) => {
      const { config } = get();
      if (!config) return;

      const newWidgets = config.widgets.filter((w) => w.instanceId !== instanceId);
      const newConfig = {
        ...config,
        widgets: newWidgets,
        metadata: { ...config.metadata, updatedAt: new Date().toISOString() },
      };

      applyConfigChange(newConfig, true);
      set({ selectedInstanceId: null });
    },

    addWidget: (widgetId) => {
      const { config } = get();
      if (!config) return;

      const defaultSizeMap: Record<string, { width: number; height: number }> = {
        header: { width: 800, height: 90 },
        avatar: { width: 160, height: 160 },
        'ascii-art': { width: 280, height: 280 },
        'terminal-info': { width: 504, height: 280 },
        'tech-stack': { width: 800, height: 140 },
        'social-media': { width: 800, height: 120 },
        bio: { width: 800, height: 160 },
        stats: { width: 800, height: 120 },
        languages: { width: 800, height: 140 },
        repositories: { width: 800, height: 180 },
        'github-readme-stats': { width: 500, height: 210 },
        'streak-stats': { width: 500, height: 210 },
        'profile-trophy': { width: 800, height: 160 },
        'activity-graph': { width: 800, height: 300 },
        'contribution-snake': { width: 800, height: 200 },
        'metrics-card': { width: 800, height: 380 },
        'views-counter': { width: 320, height: 80 },
        'readme-quotes': { width: 500, height: 180 },
        'awesome-badge': { width: 360, height: 80 },
        divider: { width: 800, height: 30 },
        footer: { width: 800, height: 50 },
      };

      const widgetSize = defaultSizeMap[widgetId] || { width: 800, height: 120 };
      const maxY = config.widgets.reduce((acc, w) => Math.max(acc, w.position.y + w.size.height), 0);

      const newInstance: WidgetInstance = {
        instanceId: `widget_${Date.now()}`,
        widgetId,
        name: `${widgetId.charAt(0).toUpperCase() + widgetId.slice(1)} Widget`,
        position: { x: 0, y: maxY > 0 ? maxY + 16 : 0 },
        size: widgetSize,
        config: {
          ...(widgetId === 'avatar' || widgetId === 'ascii-art' ? { lockAspectRatio: true } : {}),
        },
        locked: false,
        visible: true,
        zIndex: config.widgets.length + 1,
      };

      const newConfig = {
        ...config,
        widgets: [...config.widgets, newInstance],
        metadata: { ...config.metadata, updatedAt: new Date().toISOString() },
      };

      applyConfigChange(newConfig, true);
      set({ selectedInstanceId: newInstance.instanceId });
    },

    duplicateWidget: (instanceId) => {
      const { config } = get();
      if (!config) return;

      const target = config.widgets.find((w) => w.instanceId === instanceId);
      if (!target) return;

      const newInstance: WidgetInstance = {
        ...JSON.parse(JSON.stringify(target)),
        instanceId: `widget_${Date.now()}`,
        name: `${target.name || target.widgetId} (Cópia)`,
        position: {
          x: Math.min(800 - target.size.width, target.position.x + 16),
          y: target.position.y + target.size.height + 16,
        },
        zIndex: config.widgets.length + 1,
      };

      const newConfig = {
        ...config,
        widgets: [...config.widgets, newInstance],
        metadata: { ...config.metadata, updatedAt: new Date().toISOString() },
      };

      applyConfigChange(newConfig, true);
      set({ selectedInstanceId: newInstance.instanceId });
    },

    reorderWidgets: (fromIndex, toIndex) => {
      const { config } = get();
      if (!config) return;

      const newWidgets = [...config.widgets];
      const [movedItem] = newWidgets.splice(fromIndex, 1);
      newWidgets.splice(toIndex, 0, movedItem);

      const updatedWidgets = newWidgets.map((w, idx) => ({
        ...w,
        zIndex: idx + 1,
      }));

      const newConfig = {
        ...config,
        widgets: updatedWidgets,
        metadata: { ...config.metadata, updatedAt: new Date().toISOString() },
      };

      applyConfigChange(newConfig, true);
    },

    moveWidgetLayer: (instanceId, direction) => {
      const { config } = get();
      if (!config) return;

      const index = config.widgets.findIndex((w) => w.instanceId === instanceId);
      if (index === -1) return;

      let targetIndex = index;
      if (direction === 'up' && index < config.widgets.length - 1) {
        targetIndex = index + 1;
      } else if (direction === 'down' && index > 0) {
        targetIndex = index - 1;
      } else if (direction === 'top') {
        targetIndex = config.widgets.length - 1;
      } else if (direction === 'bottom') {
        targetIndex = 0;
      }

      if (targetIndex !== index) {
        get().reorderWidgets(index, targetIndex);
      }
    },

    applyTemplate: (templateId) => {
      const { config, githubData } = get();
      if (!config || !githubData) return;

      const newConfig = createConfiguration(
        config.githubId,
        config.username,
        templateId,
        config.profileSlug,
        config.profileName
      );

      applyConfigChange(newConfig, true);
      set({ selectedInstanceId: newConfig.widgets[0]?.instanceId || null });
    },

    setZoom: (zoom) => set({ zoom }),
    setActiveTab: (tab) => set({ activeTab: tab }),

    undo: () => {
      const { config, history } = get();
      if (history.past.length === 0 || !config) return;

      const previous = history.past[history.past.length - 1];
      const newPast = history.past.slice(0, history.past.length - 1);
      const newFuture = [config, ...history.future];

      set({
        config: previous,
        history: { past: newPast, future: newFuture },
        canUndo: newPast.length > 0,
        canRedo: true,
        selectedInstanceId: previous.widgets.some((w) => w.instanceId === get().selectedInstanceId)
          ? get().selectedInstanceId
          : previous.widgets[0]?.instanceId || null,
      });

      saveToLocalStorage(previous);
    },

    redo: () => {
      const { config, history } = get();
      if (history.future.length === 0 || !config) return;

      const next = history.future[0];
      const newFuture = history.future.slice(1);
      const newPast = [...history.past, config];

      set({
        config: next,
        history: { past: newPast, future: newFuture },
        canUndo: true,
        canRedo: newFuture.length > 0,
        selectedInstanceId: next.widgets.some((w) => w.instanceId === get().selectedInstanceId)
          ? get().selectedInstanceId
          : next.widgets[0]?.instanceId || null,
      });

      saveToLocalStorage(next);
    },
  };
});
