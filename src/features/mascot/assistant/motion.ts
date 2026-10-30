import { STROBI_CHOREOGRAPHY } from '../constants/motion'
import { STROBI_MOOD } from '../constants/strobi'
import type { StrobiMood } from '../core/types'

export function getStrobiChoreography(mood: StrobiMood, enabled: boolean) {
  if (!enabled) return STROBI_CHOREOGRAPHY.neutral
  if (mood === STROBI_MOOD.CURIOUS) return STROBI_CHOREOGRAPHY[STROBI_MOOD.THINKING]
  if (mood === STROBI_MOOD.PLAYFUL) return STROBI_CHOREOGRAPHY[STROBI_MOOD.WAVING]
  return STROBI_CHOREOGRAPHY[mood] ?? STROBI_CHOREOGRAPHY.neutral
}
