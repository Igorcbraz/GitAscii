'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import type { GitAsciiAvatarTheme, GitAsciiAvatarVariant } from '@/components/avatar'

import { AnchorRegistry } from './AnchorRegistry'
import { AnimationStateMachine } from './AnimationStateMachine'
import { GazeController } from './GazeController'
import { LocomotionPhysics } from './LocomotionPhysics'
import { SpeechQueue } from './SpeechQueue'
import {
  ActionPriority,
  type GazePoint,
  type LocomotionStyle,
  type StrobiAccessory,
  type StrobiActorState,
  type StrobiAnchorId,
  type StrobiController,
  type StrobiMood,
  type StrobiScene,
  type StrobiSpeechMessage,
} from './types'

interface StrobiContextValue {
  state: StrobiActorState
  controller: StrobiController
  registry: AnchorRegistry
  gazeController: GazeController
  stateMachine: AnimationStateMachine
  speechQueue: SpeechQueue
  physics: LocomotionPhysics
  registerHostMounted: () => () => void
  isHostMounted: boolean
}

const StrobiContext = createContext<StrobiContextValue | null>(null)

export interface StrobiProviderProps {
  children: React.ReactNode
  initialAnchor?: StrobiAnchorId
  initialScene?: StrobiScene
  initialVariant?: GitAsciiAvatarVariant
  initialTheme?: GitAsciiAvatarTheme
  initialAccessory?: StrobiAccessory
}

export function StrobiProvider({
  children,
  initialAnchor = 'hero',
  initialScene = 'landing',
  initialVariant = 'default',
  initialTheme = 'dark',
  initialAccessory = 'none',
}: StrobiProviderProps) {
  const registry = useMemo(() => AnchorRegistry.getInstance(), [])
  const gazeController = useMemo(() => new GazeController(), [])
  const stateMachine = useMemo(() => new AnimationStateMachine(), [])
  const speechQueue = useMemo(() => new SpeechQueue(), [])
  const physics = useMemo(() => new LocomotionPhysics(), [])

  const hostCountRef = useRef(0)
  const [isHostMounted, setIsHostMounted] = useState(false)

  const [actorState, setActorState] = useState<StrobiActorState>(() => {
    let initialVisible = true
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('gitascii_strobi_visible')
        if (stored === 'false') initialVisible = false
      } catch {}
    }

    return {
      mounted: false,
      visible: initialVisible,
      muted: speechQueue.isMuted(),
      isSleeping: false,
      currentAnchorId: initialAnchor,
      currentMood: 'idle',
      currentAccessory: initialAccessory,
      currentScene: initialScene,
      currentMessage: null,
      isSpeaking: false,
      isGuiding: false,
      guideTargetElement: null,
      isGrabbingCursor: false,
      petCount: 0,
      variant: initialVariant,
      theme: initialTheme,
      size: 84,
    }
  })

  const actorStateRef = useRef(actorState)
  actorStateRef.current = actorState

  useEffect(() => {
    return stateMachine.subscribe((mood) => {
      setActorState((prev) => ({ ...prev, currentMood: mood }))
    })
  }, [stateMachine])

  useEffect(() => {
    return speechQueue.subscribe((msg) => {
      setActorState((prev) => ({
        ...prev,
        currentMessage: msg,
        isSpeaking: msg !== null,
      }))
      stateMachine.setSpeaking(msg !== null)
    })
  }, [speechQueue, stateMachine])

  const registerHostMounted = useCallback(() => {
    hostCountRef.current += 1
    setIsHostMounted(true)
    setActorState((prev) => ({ ...prev, mounted: true }))

    return () => {
      hostCountRef.current = Math.max(0, hostCountRef.current - 1)
      if (hostCountRef.current === 0) {
        setIsHostMounted(false)
        setActorState((prev) => ({ ...prev, mounted: false }))
      }
    }
  }, [])

  const goTo = useCallback(
    (
      anchorId: StrobiAnchorId,
      options?: {
        immediate?: boolean
        style?: LocomotionStyle
        accessory?: StrobiAccessory
        mood?: StrobiMood
        durationMs?: number
        onArrival?: () => void
      }
    ) => {
      const coords = registry.resolveCoordinates(anchorId)
      stateMachine.setTraveling(true)

      physics.travelTo(coords.x, coords.y, coords.scale, {
        immediate: options?.immediate,
        style: options?.style,
        durationMs: options?.durationMs,
        onArrival: () => {
          stateMachine.setTraveling(false)
          const config = registry.get(anchorId)
          const finalMood = options?.mood || config?.restingMood
          if (finalMood) {
            stateMachine.setBaseMood(finalMood)
          }
          if (options?.onArrival) {
            options.onArrival()
          }
        },
      })

      if (options?.mood) {
        stateMachine.requestAction({
          id: `goto-mood-${Date.now()}`,
          name: 'travel-mood',
          priority: ActionPriority.TRANSITION,
          mood: options.mood,
          duration: 3500,
        })
      }

      setActorState((prev) => {
        const config = registry.get(anchorId)
        const targetAccessory =
          options?.accessory !== undefined
            ? options.accessory
            : config?.accessory !== undefined
              ? config.accessory
              : prev.currentAccessory

        return {
          ...prev,
          currentAnchorId: anchorId,
          size: coords.size,
          currentAccessory: targetAccessory,
        }
      })
    },
    [registry, physics, stateMachine]
  )

  const moveToCoords = useCallback(
    (x: number, y: number, options?: { scale?: number; immediate?: boolean }) => {
      physics.travelTo(x, y, options?.scale ?? 1, {
        immediate: options?.immediate,
      })
      setActorState((prev) => ({ ...prev, currentAnchorId: null }))
    },
    [physics]
  )

  const getCurrentAnchor = useCallback(() => actorStateRef.current.currentAnchorId, [])

  const setMood = useCallback(
    (mood: StrobiMood, duration?: number) => {
      if (duration && duration > 0) {
        stateMachine.requestAction({
          id: `mood-${Date.now()}`,
          name: 'custom-mood',
          priority: ActionPriority.REACTION,
          mood,
          duration,
        })
      } else {
        stateMachine.setBaseMood(mood)
      }
    },
    [stateMachine]
  )

  const react = useCallback(
    (mood: StrobiMood, duration = 2200) => {
      stateMachine.requestAction({
        id: `react-${Date.now()}`,
        name: 'reaction',
        priority: ActionPriority.REACTION,
        mood,
        duration,
      })
    },
    [stateMachine]
  )

  const lookAt = useCallback(
    (point: GazePoint | HTMLElement | null) => {
      gazeController.setLookTarget(point)
    },
    [gazeController]
  )

  const clearLookAt = useCallback(() => {
    gazeController.setLookTarget(null)
  }, [gazeController])

  const pet = useCallback(
    (velocity = 1.0) => {
      setActorState((prev) => {
        const nextCount = prev.petCount + 1
        const isMilestone = nextCount % 5 === 0

        const velocityFactor = Math.max(0.8, Math.min(1.4, velocity || 1))
        physics.triggerSquash(1.1 * velocityFactor, 0.9 / velocityFactor)

        const petMood: StrobiMood = isMilestone ? 'excited' : 'petting'
        stateMachine.requestAction({
          id: `pet-${nextCount}`,
          name: 'petting',
          priority: ActionPriority.PETTING,
          mood: petMood,
          duration: isMilestone ? 3000 : 2000,
        })

        const responses = [
          'Strobi operacional.',
          'Pronto para ajudar.',
          'Modo mascote ativo.',
          'GitAscii pronto.',
          'Ao seu serviço.',
        ]
        const randomMsg = responses[Math.floor(Math.random() * responses.length)]

        speechQueue.enqueue({
          id: `pet-msg-${nextCount}`,
          message: randomMsg,
          priority: ActionPriority.PETTING,
          duration: 2200,
          mood: petMood,
          source: 'petting',
        })

        return { ...prev, petCount: nextCount }
      })
    },
    [physics, stateMachine, speechQueue]
  )

  const speak = useCallback(
    (message: StrobiSpeechMessage | string) => {
      const msgObj: StrobiSpeechMessage =
        typeof message === 'string'
          ? {
              id: `msg-${Date.now()}`,
              message,
              duration: 5000,
              priority: ActionPriority.SPEAKING,
            }
          : message

      speechQueue.enqueue(msgObj)
    },
    [speechQueue]
  )

  const dismissSpeech = useCallback(() => {
    speechQueue.dismiss()
  }, [speechQueue])

  const mute = useCallback(() => {
    speechQueue.mute()
    setActorState((prev) => ({ ...prev, muted: true }))
  }, [speechQueue])

  const unmute = useCallback(() => {
    speechQueue.unmute()
    setActorState((prev) => ({ ...prev, muted: false }))
  }, [speechQueue])

  const isMuted = useCallback(() => speechQueue.isMuted(), [speechQueue])

  const guide = useCallback(
    (target: HTMLElement | string, message?: StrobiSpeechMessage | string) => {
      const el =
        typeof target === 'string' ? (document.querySelector(target) as HTMLElement | null) : target

      if (!el) return

      stateMachine.setGuiding(true)
      setActorState((prev) => ({
        ...prev,
        isGuiding: true,
        guideTargetElement: el,
      }))

      const rect = el.getBoundingClientRect()
      const targetX = Math.max(16, rect.right + 20)
      const targetY = Math.max(16, rect.top - 20)

      physics.travelTo(targetX, targetY, 0.9, {
        style: 'flight',
        onArrival: () => {
          gazeController.setLookTarget(el)
          stateMachine.requestAction({
            id: 'guide-action',
            name: 'guiding',
            priority: ActionPriority.GUIDE,
            mood: 'curious',
          })

          if (message) {
            const msgObj: StrobiSpeechMessage =
              typeof message === 'string'
                ? {
                    id: 'guide-msg',
                    message,
                    priority: ActionPriority.GUIDE,
                    persistent: true,
                  }
                : { ...message, priority: ActionPriority.GUIDE }
            speechQueue.enqueue(msgObj)
          }
        },
      })
    },
    [stateMachine, physics, gazeController, speechQueue]
  )

  const cancelGuide = useCallback(() => {
    stateMachine.setGuiding(false)
    gazeController.setLookTarget(null)
    speechQueue.dismiss()
    setActorState((prev) => ({
      ...prev,
      isGuiding: false,
      guideTargetElement: null,
    }))

    if (actorStateRef.current.currentAnchorId) {
      goTo(actorStateRef.current.currentAnchorId)
    }
  }, [stateMachine, gazeController, speechQueue, goTo])

  const grabCursor = useCallback(() => {
    stateMachine.setGrabbingCursor(true)
    setActorState((prev) => ({ ...prev, isGrabbingCursor: true }))
    stateMachine.requestAction({
      id: 'grab-cursor',
      name: 'grabbing',
      priority: ActionPriority.CRITICAL,
      mood: 'excited',
    })
  }, [stateMachine])

  const releaseCursor = useCallback(() => {
    stateMachine.setGrabbingCursor(false)
    setActorState((prev) => ({ ...prev, isGrabbingCursor: false }))
    stateMachine.completeAction('grab-cursor')
  }, [stateMachine])

  const sleep = useCallback(() => {
    setActorState((prev) => ({ ...prev, isSleeping: true }))
    stateMachine.setBaseMood('sleeping')
  }, [stateMachine])

  const wake = useCallback(() => {
    setActorState((prev) => ({ ...prev, isSleeping: false }))
    stateMachine.setBaseMood('idle')
    react('surprised', 1400)
  }, [stateMachine, react])

  const show = useCallback(() => {
    setActorState((prev) => ({ ...prev, visible: true }))
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('gitascii_strobi_visible', 'true')
      } catch {}
    }
  }, [])

  const hide = useCallback(() => {
    setActorState((prev) => ({ ...prev, visible: false }))
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('gitascii_strobi_visible', 'false')
      } catch {}
    }
  }, [])

  const setVariant = useCallback((variant: GitAsciiAvatarVariant) => {
    setActorState((prev) => ({ ...prev, variant }))
  }, [])

  const setTheme = useCallback((theme: GitAsciiAvatarTheme) => {
    setActorState((prev) => ({ ...prev, theme }))
  }, [])

  const setAccessory = useCallback((accessory: StrobiAccessory) => {
    setActorState((prev) => ({ ...prev, currentAccessory: accessory }))
  }, [])

  const getAccessory = useCallback(() => actorStateRef.current.currentAccessory, [])

  const startDistraction = useCallback(
    (durationMs = 4500, onEnd?: () => void) => {
      gazeController.startDistraction(durationMs, onEnd)
    },
    [gazeController]
  )

  const getVariant = useCallback(() => actorStateRef.current.variant, [])
  const getTheme = useCallback(() => actorStateRef.current.theme, [])

  const controller: StrobiController = useMemo(
    () => ({
      goTo,
      moveToCoords,
      getCurrentAnchor,
      setMood,
      react,
      lookAt,
      clearLookAt,
      pet,
      speak,
      dismissSpeech,
      mute,
      unmute,
      isMuted,
      guide,
      cancelGuide,
      grabCursor,
      releaseCursor,
      sleep,
      wake,
      show,
      hide,
      setAccessory,
      getAccessory,
      startDistraction,
      setVariant,
      setTheme,
      getVariant,
      getTheme,
    }),
    [
      goTo,
      moveToCoords,
      getCurrentAnchor,
      setMood,
      react,
      lookAt,
      clearLookAt,
      pet,
      speak,
      dismissSpeech,
      mute,
      unmute,
      isMuted,
      guide,
      cancelGuide,
      grabCursor,
      releaseCursor,
      sleep,
      wake,
      show,
      hide,
      setAccessory,
      getAccessory,
      startDistraction,
      setVariant,
      setTheme,
      getVariant,
      getTheme,
    ]
  )

  const contextValue: StrobiContextValue = useMemo(
    () => ({
      state: actorState,
      controller,
      registry,
      gazeController,
      stateMachine,
      speechQueue,
      physics,
      registerHostMounted,
      isHostMounted,
    }),
    [
      actorState,
      controller,
      registry,
      gazeController,
      stateMachine,
      speechQueue,
      physics,
      registerHostMounted,
      isHostMounted,
    ]
  )

  return <StrobiContext.Provider value={contextValue}>{children}</StrobiContext.Provider>
}

export function useStrobiContext(): StrobiContextValue {
  const ctx = useContext(StrobiContext)
  if (!ctx) {
    throw new Error('useStrobiContext must be used within a <StrobiProvider>')
  }
  return ctx
}
