import { create } from 'zustand'

export type ViewMode = 'gitascii' | 'github'

interface ViewModeStore {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  toggleViewMode: () => void
  showPreviewNudge: boolean
  triggerPreviewNudge: () => void
  dismissPreviewNudge: () => void
}

export const useViewModeStore = create<ViewModeStore>((set, get) => ({
  viewMode: 'gitascii',
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleViewMode: () => set({ viewMode: get().viewMode === 'gitascii' ? 'github' : 'gitascii' }),
  showPreviewNudge: false,
  triggerPreviewNudge: () => set({ showPreviewNudge: true }),
  dismissPreviewNudge: () => set({ showPreviewNudge: false }),
}))
