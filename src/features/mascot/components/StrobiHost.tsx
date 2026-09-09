'use client'

import { AnimatePresence } from 'motion/react'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { useStrobiContext } from '../core/StrobiContext'
import type { EyeRigState, GazeVector } from '../core/types'
import { StrobiRig } from './StrobiRig'
import { StrobiShadow } from './StrobiShadow'
import { StrobiSpeechBubble } from './StrobiSpeechBubble'
import { StrobiTether } from './StrobiTether'

export function StrobiHost() {
  const {
    state,
    controller,
    registry,
    gazeController,
    stateMachine,
    physics,
    registerHostMounted,
  } = useStrobiContext()

  const hostRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const [spatial, setSpatial] = useState({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    elevation: 0,
    squashX: 1,
    squashY: 1,
  })

  const [gaze, setGaze] = useState<{ gazeVector: GazeVector; eyeRigState: EyeRigState }>({
    gazeVector: {
      nx: 0,
      ny: 0,
      angle: 0,
      distance: 0,
      eyeOffset: { x: 0, y: 0 },
      headRotation: { pitch: 0, yaw: 0, roll: 0 },
    },
    eyeRigState: {
      pupilX: 0,
      pupilY: 0,
      catchlightX: 2.5,
      catchlightY: -2.5,
      eyelidOpenness: 1,
      isSquinting: false,
      shape: 'normal',
    },
  })

  const lastPointerPos = useRef<{ x: number; y: number; time: number } | null>(null)
  const strokeVelocity = useRef(0)

  const [isDragging, setIsDragging] = useState(false)
  const isPointerDown = useRef(false)
  const pointerStartPos = useRef({ x: 0, y: 0 })
  const dragOffset = useRef({ x: 0, y: 0 })
  const hasMovedPastThreshold = useRef(false)

  useEffect(() => {
    return registerHostMounted()
  }, [registerHostMounted])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      gazeController.updatePointer(e.clientX, e.clientY)

      if (lastPointerPos.current) {
        const dt = (performance.now() - lastPointerPos.current.time) / 1000
        if (dt > 0) {
          const dx = e.clientX - lastPointerPos.current.x
          const dy = e.clientY - lastPointerPos.current.y
          const speed = Math.hypot(dx, dy) / dt
          strokeVelocity.current = speed
        }
      }
      lastPointerPos.current = { x: e.clientX, y: e.clientY, time: performance.now() }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0]
        gazeController.updatePointer(touch.clientX, touch.clientY)
      }
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [gazeController])

  useEffect(() => {
    const syncAnchor = () => {
      if (state.currentAnchorId && !state.isGuiding && !physics.isDraggingActive()) {
        const coords = registry.resolveCoordinates(state.currentAnchorId)
        physics.updateAnchorTarget(coords.x, coords.y, coords.scale, false)
      }
    }

    const unsub = registry.subscribe(syncAnchor)
    window.addEventListener('resize', syncAnchor, { passive: true })

    return () => {
      unsub()
      window.removeEventListener('resize', syncAnchor)
    }
  }, [registry, state.currentAnchorId, state.isGuiding, physics])

  const hasInitializedPos = useRef(false)
  useEffect(() => {
    if (!hasInitializedPos.current && state.currentAnchorId) {
      hasInitializedPos.current = true
      const coords = registry.resolveCoordinates(state.currentAnchorId)
      physics.setPosition(coords.x, coords.y, coords.scale)
    }
  }, [state.currentAnchorId, registry, physics])

  useEffect(() => {
    let frameId: number

    const tick = (currentTime: number) => {
      const currentAnchorConfig = state.currentAnchorId ? registry.get(state.currentAnchorId) : null
      const enableFloat = currentAnchorConfig?.float !== false && !state.isSleeping
      const enableBounce = currentAnchorConfig?.bounce === true || state.currentMood === 'jumping'

      const nextSpatial = physics.update(currentTime, reduceMotion, enableFloat, enableBounce)
      setSpatial(nextSpatial)

      const mascotCenterX = nextSpatial.x + (state.size * nextSpatial.scale) / 2
      const mascotCenterY = nextSpatial.y + (state.size * nextSpatial.scale) / 2

      const nextGaze = gazeController.solve(
        mascotCenterX,
        mascotCenterY,
        currentTime,
        state.currentMood,
        reduceMotion
      )
      setGaze(nextGaze)

      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [
    physics,
    gazeController,
    state.size,
    state.currentMood,
    state.currentAnchorId,
    state.isSleeping,
    registry,
    reduceMotion,
  ])

  const handlePet = useCallback(() => {
    controller.pet(strokeVelocity.current)
  }, [controller])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest('button')) return
      if (e.pointerType === 'mouse' && e.button !== 0) return

      isPointerDown.current = true
      pointerStartPos.current = { x: e.clientX, y: e.clientY }
      dragOffset.current = { x: e.clientX - spatial.x, y: e.clientY - spatial.y }
      hasMovedPastThreshold.current = false
    },
    [spatial.x, spatial.y]
  )

  useEffect(() => {
    const handlePointerMoveGlobal = (e: PointerEvent) => {
      if (!isPointerDown.current) return

      const dx = e.clientX - pointerStartPos.current.x
      const dy = e.clientY - pointerStartPos.current.y
      const dist = Math.hypot(dx, dy)

      if (!hasMovedPastThreshold.current && dist > 5) {
        hasMovedPastThreshold.current = true
        setIsDragging(true)
        physics.startDrag(e.clientX, e.clientY, dragOffset.current.x, dragOffset.current.y)
        controller.react('surprised', 1200)
      }

      if (hasMovedPastThreshold.current) {
        physics.updateDrag(e.clientX, e.clientY, dragOffset.current.x, dragOffset.current.y)
      }
    }

    const handlePointerUpGlobal = (e: PointerEvent) => {
      if (!isPointerDown.current) return
      isPointerDown.current = false

      if (hasMovedPastThreshold.current) {
        setIsDragging(false)
        const finalPos = physics.endDrag()
        controller.moveToCoords(finalPos.x, finalPos.y, { immediate: true })
        controller.react('happy', 1600)
      } else {
        handlePet()
      }
    }

    const handlePointerCancelGlobal = (e: PointerEvent) => {
      if (!isPointerDown.current) return
      isPointerDown.current = false
      if (hasMovedPastThreshold.current) {
        setIsDragging(false)
        physics.endDrag()
      }
    }

    window.addEventListener('pointermove', handlePointerMoveGlobal, { passive: true })
    window.addEventListener('pointerup', handlePointerUpGlobal)
    window.addEventListener('pointercancel', handlePointerCancelGlobal)

    return () => {
      window.removeEventListener('pointermove', handlePointerMoveGlobal)
      window.removeEventListener('pointerup', handlePointerUpGlobal)
      window.removeEventListener('pointercancel', handlePointerCancelGlobal)
    }
  }, [physics, controller, handlePet])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handlePet()
      } else if (e.key === 'Escape') {
        controller.dismissSpeech()
      }
    },
    [handlePet, controller]
  )

  const handleGoodTip = useCallback(() => {
    controller.react('happy', 1800)
    controller.dismissSpeech()
  }, [controller])

  const handleMuteToggle = useCallback(() => {
    if (state.muted) {
      controller.unmute()
    } else {
      controller.mute()
      controller.dismissSpeech()
    }
  }, [state.muted, controller])

  if (!mounted || !state.visible) return null

  const guideTargetRect = state.guideTargetElement?.getBoundingClientRect()
  const guideTargetX = guideTargetRect ? guideTargetRect.left + guideTargetRect.width / 2 : 0
  const guideTargetY = guideTargetRect ? guideTargetRect.top + guideTargetRect.height / 2 : 0
  const mascotCenterX = spatial.x + (state.size * spatial.scale) / 2
  const mascotCenterY = spatial.y + (state.size * spatial.scale) / 2

  return (
    <>
      {/* Visual Guiding Tether */}
      <StrobiTether
        startX={mascotCenterX}
        startY={mascotCenterY}
        endX={guideTargetX}
        endY={guideTargetY}
        active={state.isGuiding && !!state.guideTargetElement}
        label="DICA STROBI"
      />

      {/* The ONE Persistent Mascot Container */}
      <div
        ref={hostRef}
        id="strobi-persistent-actor"
        suppressHydrationWarning
        tabIndex={0}
        role="region"
        aria-label="GitAscii Mascote Strobi"
        onKeyDown={handleKeyDown}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => {
          setIsHovered(false)
          strokeVelocity.current = 0
        }}
        onPointerDown={handlePointerDown}
        onDragStart={(e) => e.preventDefault()}
        draggable={false}
        className={`fixed z-[200] select-none rounded-full touch-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab active:cursor-grabbing'
        } focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-lime/80`}
        style={{
          left: `${spatial.x}px`,
          top: `${spatial.y}px`,
          width: `${state.size * spatial.scale}px`,
          height: `${state.size * spatial.scale}px`,
          willChange: 'left, top, transform',
          pointerEvents: 'auto',
        }}
      >
        {/* Contact Shadow Plane */}
        <StrobiShadow
          size={state.size * spatial.scale}
          elevation={spatial.elevation}
          squashX={spatial.squashX}
        />

        {/* High-Fidelity SVG Rig */}
        <StrobiRig
          size={state.size * spatial.scale}
          variant={state.variant}
          theme={state.theme}
          gazeVector={gaze.gazeVector}
          eyeRigState={gaze.eyeRigState}
          mood={state.currentMood}
          accessory={state.currentAccessory}
          elevation={spatial.elevation}
          squashX={spatial.squashX}
          squashY={spatial.squashY}
          rotation={spatial.rotation}
          isHovered={isHovered}
        />

        {/* Muted Badge / Indicator */}
        {state.muted && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleMuteToggle()
            }}
            title="Strobi está silenciado. Clique para reativar dicas."
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-graphite border border-white/20 flex items-center justify-center text-[10px] text-ash hover:text-signal-lime hover:border-signal-lime transition-all cursor-pointer shadow-md"
            aria-label="Reativar dicas do Strobi"
          >
            <svg
              className="w-2.5 h-2.5 text-ash"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          </button>
        )}

        {/* Speech Bubble Positioned Above Mascot */}
        <div
          className="absolute bottom-full right-0 mb-3 pointer-events-none"
          style={{ width: 'max-content' }}
        >
          <AnimatePresence mode="wait">
            {state.isSpeaking && state.currentMessage && (
              <StrobiSpeechBubble
                key={state.currentMessage.id}
                message={state.currentMessage}
                onDismiss={controller.dismissSpeech}
                onGoodTip={handleGoodTip}
                onMute={handleMuteToggle}
                isMuted={state.muted}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}
