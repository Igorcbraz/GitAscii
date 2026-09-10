export type MascotScene = 'landing' | 'editor' | 'pro' | 'onboarding' | 'dialog' | 'global'

export type MascotMood =
  | 'idle'
  | 'happy'
  | 'curious'
  | 'excited'
  | 'thinking'
  | 'surprised'
  | 'playful'
  | 'focused'
  | 'celebrating'
  | 'sleeping'
  | 'waving'
  | 'observing'
  | 'petting'
  | 'proud'

export type MascotPosition =
  'bottom-right' | 'bottom-left' | 'bottom-center' | 'inline' | 'floating'

export interface MascotTip {
  id: string
  message: string

  shortcut?: string

  duration?: number

  mood?: MascotMood

  action?: () => void

  persistent?: boolean
}

export interface MascotScrollWaypoint {
  at: number
  tip: MascotTip

  once?: boolean
  mood?: MascotMood
}

export interface MascotState {
  mood: MascotMood
  isVisible: boolean
  isWalking: boolean
  isSpeaking: boolean
  currentTip: MascotTip | null
  isMinimized: boolean
  petCount: number
  position: MascotPosition
  scene: MascotScene
}

export interface MascotActions {
  setMood: (mood: MascotMood) => void
  show: () => void
  hide: () => void
  minimize: () => void
  maximize: () => void
  speak: (tip: MascotTip) => void
  dismiss: () => void
  pet: () => void
  setScene: (scene: MascotScene) => void
  setPosition: (position: MascotPosition) => void
  setWalking: (walking: boolean) => void
}
