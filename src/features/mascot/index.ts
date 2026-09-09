export { StrobiAccessories } from './components/StrobiAccessories'
export { StrobiAnchor } from './components/StrobiAnchor'
export { StrobiRoot } from './components/StrobiRoot'
export { StrobiSpeechBubble } from './components/StrobiSpeechBubble'
export { StrobiTether } from './components/StrobiTether'
export { AnchorRegistry } from './core/AnchorRegistry'
export { AnimationStateMachine } from './core/AnimationStateMachine'
export { GazeController } from './core/GazeController'
export { LocomotionPhysics } from './core/LocomotionPhysics'
export { SpeechQueue } from './core/SpeechQueue'
export { StrobiProvider, useStrobiContext } from './core/StrobiContext'
export type {
  AnchorBounds,
  AnchorConfig,
  EyeRigState,
  GazePoint,
  GazeVector,
  LocomotionStyle,
  PettingFeedback,
  SpatialCoordinates,
  StrobiAccessory,
  StrobiActorState,
  StrobiAnchorId,
  StrobiController,
  StrobiMood,
  StrobiScene,
  StrobiSpeechMessage,
} from './core/types'
export { ActionPriority } from './core/types'
export { EditorMascot, EditorMascotInline } from './EditorMascot'
export { useScrollJourney } from './hooks/useScrollJourney'
export { useStrobi } from './hooks/useStrobi'
export { useStrobiAnchor } from './hooks/useStrobiAnchor'
export { LandingMascot, LandingMascotWalkIn } from './LandingMascot'
export type { MascotBuddyProps } from './MascotBuddy'
export { MascotBuddy, MascotWalker } from './MascotBuddy'
export { MascotDialog, MascotOnboarding, MascotToast } from './MascotCompanions'
export { useMascotStore } from './mascotStore'
export {
  EDITOR_TIPS,
  IDLE_TIPS,
  LANDING_WAYPOINTS,
  ONBOARDING_TIPS,
  PET_RESPONSES,
  PRO_TIPS,
} from './mascotTips'
export type {
  MascotActions,
  MascotMood,
  MascotPosition,
  MascotScene,
  MascotScrollWaypoint,
  MascotState,
  MascotTip,
} from './types'
