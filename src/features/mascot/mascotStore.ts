'use client'

import { create } from 'zustand'

import type {
  MascotActions,
  MascotMood,
  MascotPosition,
  MascotScene,
  MascotState,
  MascotTip,
} from './types'

type MascotStore = MascotState & MascotActions

export const useMascotStore = create<MascotStore>((set, get) => ({
  mood: 'idle',
  isVisible: true,
  isWalking: false,
  isSpeaking: false,
  currentTip: null,
  isMinimized: false,
  petCount: 0,
  position: 'bottom-right',
  scene: 'global',

  setMood: (mood: MascotMood) => set({ mood }),

  show: () => set({ isVisible: true, isMinimized: false }),

  hide: () => set({ isVisible: false }),

  minimize: () => set({ isMinimized: true }),

  maximize: () => set({ isMinimized: false }),

  speak: (tip: MascotTip) => {
    set({
      currentTip: tip,
      isSpeaking: true,
      mood: tip.mood ?? get().mood,
    })

    if (!tip.persistent) {
      const duration = tip.duration ?? 5000
      setTimeout(() => {
        const state = get()
        if (state.currentTip?.id === tip.id) {
          set({ currentTip: null, isSpeaking: false, mood: 'idle' })
        }
      }, duration)
    }
  },

  dismiss: () => {
    set({ currentTip: null, isSpeaking: false, mood: 'idle' })
  },

  pet: () => {
    const { petCount } = get()
    const newCount = petCount + 1
    set({ petCount: newCount, mood: 'happy' })

    if (newCount % 5 === 0) {
      set({ mood: 'excited' })
    }

    setTimeout(() => {
      set((state) => {
        if (state.mood === 'happy' || state.mood === 'excited') {
          return { mood: 'idle' }
        }
        return {}
      })
    }, 2000)
  },

  setScene: (scene: MascotScene) => set({ scene }),

  setPosition: (position: MascotPosition) => set({ position }),

  setWalking: (walking: boolean) => set({ isWalking: walking }),
}))
