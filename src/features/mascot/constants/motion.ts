import type { TargetAndTransition } from 'motion/react'

import { STROBI_MOOD } from './strobi'

export const STROBI_REACTION = {
  petDurationMs: 1500,
  dragStartDurationMs: 1200,
  dragEndDurationMs: 1600,
  goodTipDurationMs: 1800,
  tipDurationMs: 2200,
  celebrationDurationMs: 3200,
  squash: { x: 1.07, y: 0.94 },
  celebrationSquash: { x: 1.22, y: 0.8 },
  dragThresholdPx: 5,
} as const

export const STROBI_CHOREOGRAPHY: Record<string, TargetAndTransition> = {
  neutral: { y: 0, rotate: 0, scaleX: 1, scaleY: 1 },
  [STROBI_MOOD.CELEBRATING]: {
    y: [0, 3, -18, 0, -7, 0],
    rotate: [0, -6, 7, -3, 2, 0],
    scaleX: [1, 1.1, 0.94, 1.06, 1, 1],
    scaleY: [1, 0.88, 1.1, 0.95, 1, 1],
  },
  [STROBI_MOOD.THINKING]: { y: [0, -3, 0], rotate: [0, -7, 0], scaleX: 1, scaleY: 1 },
  [STROBI_MOOD.WAVING]: { y: [0, -6, 0], rotate: [0, 8, -6, 3, 0], scaleX: 1, scaleY: 1 },
}

export const STROBI_MOTION = {
  celebrationDuration: 0.85,
  reactionDuration: 0.55,
  panelSpring: { type: 'spring', stiffness: 380, damping: 30 },
  panelInitial: { opacity: 0, y: 12, scale: 0.96, clipPath: 'inset(8% 0 0 0 round 12px)' },
  panelAnimate: { opacity: 1, y: 0, scale: 1, clipPath: 'inset(0% 0 0 0 round 12px)' },
  panelExitDuration: 0.12,
} as const
