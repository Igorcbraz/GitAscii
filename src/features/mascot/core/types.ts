import type { GitAsciiAvatarTheme, GitAsciiAvatarVariant } from '@/components/avatar'

export type StrobiMood =
  | 'idle'
  | 'observing'
  | 'curious'
  | 'happy'
  | 'excited'
  | 'thinking'
  | 'speaking'
  | 'petting'
  | 'walking'
  | 'jumping'
  | 'surprised'
  | 'sleeping'
  | 'waking'
  | 'guiding'
  | 'grabbing'
  | 'celebrating'
  | 'focused'
  | 'proud'
  | 'playful'
  | 'waving'

export type StrobiAccessory =
  | 'none'
  | 'developer'
  | 'popcorn'
  | 'professor'
  | 'detective'
  | 'artist'
  | 'businessman'
  | 'dizzy'
  | 'astronaut'
  | 'party'

export type MascotMood = StrobiMood

export type StrobiScene = 'landing' | 'editor' | 'pro' | 'onboarding' | 'dialog' | 'lab' | 'global'

export type MascotScene = StrobiScene

export type StrobiAnchorId =
  | 'hero'
  | 'features'
  | 'demo'
  | 'community'
  | 'templates'
  | 'comparison'
  | 'widgets'
  | 'faq'
  | 'cta'
  | 'dock'
  | 'editor'
  | 'lab-stage'
  | (string & {})

export interface AnchorBounds {
  x: number
  y: number
  width: number
  height: number
  top: number
  left: number
  bottom: number
  right: number
}

export interface AnchorConfig {
  id: StrobiAnchorId
  element?: HTMLElement | null
  offsetX?: number
  offsetY?: number
  align?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  scale?: number
  size?: number
  scene?: StrobiScene
  restingMood?: StrobiMood
  priority?: number
  float?: boolean
  bounce?: boolean
  accessory?: StrobiAccessory
}

export interface GazePoint {
  x: number
  y: number
}

export interface GazeVector {
  nx: number
  ny: number
  angle: number
  distance: number
  eyeOffset: { x: number; y: number }
  headRotation: { pitch: number; yaw: number; roll: number }
}

export interface EyeRigState {
  pupilX: number
  pupilY: number
  catchlightX: number
  catchlightY: number
  eyelidOpenness: number
  isSquinting: boolean
  shape: 'normal' | 'happy-crescent' | 'surprised-wide' | 'squint' | 'closed'
}

export type LocomotionStyle = 'float' | 'hop' | 'flight' | 'settle'

export interface SpatialCoordinates {
  x: number
  y: number
  scale: number
  rotation: number
  elevation: number
  squashX: number
  squashY: number
}

export enum ActionPriority {
  IDLE = 10,
  TRANSITION = 30,
  SPEAKING = 40,
  REACTION = 50,
  PETTING = 60,
  GUIDE = 80,
  CRITICAL = 100,
}

export interface StateMachineAction {
  id: string
  name: string
  priority: ActionPriority
  mood: StrobiMood
  duration?: number
  onComplete?: () => void
}

export interface StrobiSpeechMessage {
  id: string
  message: string
  shortcut?: string
  priority?: ActionPriority
  duration?: number
  mood?: StrobiMood
  source?: 'system' | 'waypoint' | 'editor' | 'petting' | 'guide' | 'user'
  persistent?: boolean
  actions?: Array<{
    id: string
    label: string
    variant?: 'primary' | 'secondary' | 'mute'
    onClick: () => void
  }>
}

export type MascotTip = StrobiSpeechMessage

export interface PettingFeedback {
  intensity: number
  velocity: number
  count: number
  responseMessage: string
  mood: StrobiMood
}

export interface StrobiController {
  goTo: (
    anchorId: StrobiAnchorId,
    options?: {
      immediate?: boolean
      style?: LocomotionStyle
      accessory?: StrobiAccessory
      mood?: StrobiMood
      durationMs?: number
      onArrival?: () => void
    }
  ) => void
  moveToCoords: (x: number, y: number, options?: { scale?: number; immediate?: boolean }) => void
  getCurrentAnchor: () => StrobiAnchorId | null

  setMood: (mood: StrobiMood, duration?: number) => void
  react: (mood: StrobiMood, duration?: number) => void
  lookAt: (point: GazePoint | HTMLElement | null) => void
  clearLookAt: () => void

  pet: (strokeVelocity?: number) => void

  speak: (message: StrobiSpeechMessage | string) => void
  dismissSpeech: () => void
  mute: () => void
  unmute: () => void
  isMuted: () => boolean

  guide: (target: HTMLElement | string, message?: StrobiSpeechMessage | string) => void
  cancelGuide: () => void
  grabCursor: () => void
  releaseCursor: () => void

  sleep: () => void
  wake: () => void
  show: () => void
  hide: () => void

  setAccessory: (accessory: StrobiAccessory) => void
  getAccessory: () => StrobiAccessory

  startDistraction: (durationMs?: number, onEnd?: () => void) => void

  setVariant: (variant: GitAsciiAvatarVariant) => void
  setTheme: (theme: GitAsciiAvatarTheme) => void
  getVariant: () => GitAsciiAvatarVariant
  getTheme: () => GitAsciiAvatarTheme
}

export interface StrobiActorState {
  mounted: boolean
  visible: boolean
  muted: boolean
  isSleeping: boolean
  currentAnchorId: StrobiAnchorId | null
  currentMood: StrobiMood
  currentAccessory: StrobiAccessory
  currentScene: StrobiScene
  currentMessage: StrobiSpeechMessage | null
  isSpeaking: boolean
  isGuiding: boolean
  guideTargetElement: HTMLElement | null
  isGrabbingCursor: boolean
  petCount: number
  variant: GitAsciiAvatarVariant
  theme: GitAsciiAvatarTheme
  size: number
}
