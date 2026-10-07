export const STROBI_SCENE = {
  LANDING: 'landing',
  EDITOR: 'editor',
  PRO: 'pro',
  ONBOARDING: 'onboarding',
  DIALOG: 'dialog',
  LAB: 'lab',
  GLOBAL: 'global',
} as const

export const STROBI_MOOD = {
  IDLE: 'idle',
  OBSERVING: 'observing',
  CURIOUS: 'curious',
  HAPPY: 'happy',
  EXCITED: 'excited',
  THINKING: 'thinking',
  SPEAKING: 'speaking',
  PETTING: 'petting',
  WALKING: 'walking',
  JUMPING: 'jumping',
  SURPRISED: 'surprised',
  SLEEPING: 'sleeping',
  WAKING: 'waking',
  GUIDING: 'guiding',
  GRABBING: 'grabbing',
  CELEBRATING: 'celebrating',
  FOCUSED: 'focused',
  PROUD: 'proud',
  PLAYFUL: 'playful',
  WAVING: 'waving',
} as const

export const STROBI_ACCESSORY = {
  NONE: 'none',
  DEVELOPER: 'developer',
  POPCORN: 'popcorn',
  PROFESSOR: 'professor',
  DETECTIVE: 'detective',
  ARTIST: 'artist',
  BUSINESSMAN: 'businessman',
  DIZZY: 'dizzy',
  ASTRONAUT: 'astronaut',
  PARTY: 'party',
} as const

export const STROBI_LOCOMOTION = { SETTLE: 'settle' } as const
export const STROBI_LANDING_DELAY_MS = 2500
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export const STROBI_STORAGE = { VISIBILITY: 'gitascii_strobi_visible' } as const
