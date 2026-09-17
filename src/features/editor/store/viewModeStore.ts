import { create } from 'zustand'

import { safeStorage } from '@/utils/storage'

export type ViewMode = 'gitascii' | 'github'

export const PREVIEW_NUDGE_SEEN_KEY = 'gitascii_has_seen_preview_nudge'

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
  triggerPreviewNudge: () => {
    const hasSeen = safeStorage.getItem(PREVIEW_NUDGE_SEEN_KEY) === 'true'
    if (hasSeen) return
    safeStorage.setItem(PREVIEW_NUDGE_SEEN_KEY, 'true')
    set({ showPreviewNudge: true })
  },
  dismissPreviewNudge: () => {
    safeStorage.setItem(PREVIEW_NUDGE_SEEN_KEY, 'true')
    set({ showPreviewNudge: false })
  },
}))
