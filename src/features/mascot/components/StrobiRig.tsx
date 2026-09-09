'use client'

import {
  type AvatarPose,
  bodyFromDefinition,
  type Expression,
  expressionFromDefinition,
  interpolatePose,
  quaternionFromEuler,
  radians,
  renderAvatar,
  renderEyeEditor,
} from '@bible-strong/avatar-core'
import React, { useId, useMemo, useRef } from 'react'

import {
  getGitAsciiAvatarDefinition,
  type GitAsciiAvatarTheme,
  type GitAsciiAvatarVariant,
  resolveGitAsciiExpression,
} from '@/components/avatar'

import type { EyeRigState, GazeVector, StrobiAccessory, StrobiMood } from '../core/types'
import { StrobiAccessories } from './StrobiAccessories'

export interface StrobiRigProps {
  size?: number
  variant?: GitAsciiAvatarVariant
  theme?: GitAsciiAvatarTheme
  gazeVector: GazeVector
  eyeRigState: EyeRigState
  mood?: StrobiMood
  accessory?: StrobiAccessory
  elevation?: number
  squashX?: number
  squashY?: number
  rotation?: number
  isHovered?: boolean
  className?: string
  style?: React.CSSProperties
}

export const StrobiRig = React.memo(function StrobiRig({
  size = 88,
  variant = 'default',
  theme = 'dark',
  gazeVector,
  eyeRigState,
  mood = 'idle',
  accessory = 'none',
  elevation: _elevation = 0,
  squashX = 1,
  squashY = 1,
  rotation = 0,
  isHovered = false,
  className,
  style,
}: StrobiRigProps) {
  const uniqueId = useId().replace(/[:]/g, '')

  const definition = useMemo(() => getGitAsciiAvatarDefinition(variant, theme), [variant, theme])

  const body = useMemo(() => bodyFromDefinition(definition.body), [definition.body])

  const expressionKey = useMemo(() => {
    switch (mood) {
      case 'happy':
      case 'petting':
      case 'celebrating':
        return 'happy'
      case 'curious':
        return 'curious'
      case 'focused':
      case 'walking':
        return 'focused'
      case 'thinking':
        return 'thinking'
      case 'surprised':
      case 'excited':
        return 'surprised'
      case 'sleeping':
        return 'sleeping'
      case 'playful':
        return 'playful'
      case 'waving':
      case 'proud':
        return 'happy'
      case 'idle':
      case 'observing':
      default:
        return 'neutral'
    }
  }, [mood])

  const resolvedExpressionKey = resolveGitAsciiExpression(expressionKey)
  const baseExpressionDef =
    definition.expressions[resolvedExpressionKey] ?? definition.expressions.neutral

  const targetBaseExpression = useMemo(() => {
    const raw = expressionFromDefinition(resolvedExpressionKey, baseExpressionDef)
    return {
      ...raw,
      headX: 0,
      headY: 0,
      headZ: 0,
    }
  }, [resolvedExpressionKey, baseExpressionDef])

  const targetPose = useMemo<AvatarPose>(() => {
    return {
      expression: targetBaseExpression,
      orientation: quaternionFromEuler(0, 0, 0),
    }
  }, [targetBaseExpression])

  const prevPoseRef = useRef<AvatarPose>(targetPose)
  const currentPoseRef = useRef<AvatarPose>(targetPose)
  const lastTargetKeyRef = useRef<string>(resolvedExpressionKey)
  const transitionStartRef = useRef<number>(
    typeof performance !== 'undefined' ? performance.now() : Date.now()
  )

  if (lastTargetKeyRef.current !== resolvedExpressionKey) {
    prevPoseRef.current = currentPoseRef.current
    lastTargetKeyRef.current = resolvedExpressionKey
    transitionStartRef.current = typeof performance !== 'undefined' ? performance.now() : Date.now()
  }

  const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
  const elapsed = now - transitionStartRef.current
  const transitionDuration = 260
  const rawProgress = Math.min(1, elapsed / transitionDuration)
  const easedProgress =
    rawProgress < 0.5
      ? 4 * rawProgress * rawProgress * rawProgress
      : 1 - Math.pow(-2 * rawProgress + 2, 3) / 2

  const blendedPose = useMemo(() => {
    if (rawProgress >= 1) {
      currentPoseRef.current = targetPose
      return targetPose
    }
    const interp = interpolatePose(prevPoseRef.current, targetPose, easedProgress)
    currentPoseRef.current = interp
    return interp
  }, [targetPose, rawProgress, easedProgress])

  const pose: AvatarPose = useMemo(() => {
    const expr: Expression = {
      ...blendedPose.expression,
      headX: gazeVector.headRotation.pitch,
      headY: gazeVector.headRotation.yaw,
      headZ: gazeVector.headRotation.roll,
    }

    const orientation = quaternionFromEuler(
      radians(expr.headX),
      radians(expr.headY),
      radians(expr.headZ)
    )

    return { expression: expr, orientation }
  }, [
    blendedPose,
    gazeVector.headRotation.pitch,
    gazeVector.headRotation.yaw,
    gazeVector.headRotation.roll,
  ])

  const scene = useMemo(() => {
    return renderAvatar(pose, body.primary, 1, {
      bodyNodes: body.nodes,
      includeWire: false,
    })
  }, [pose, body])

  const leftEyeCenter = useMemo(() => {
    try {
      const editor = renderEyeEditor(pose, body.primary, -1)
      return { x: editor.center[0], y: editor.center[1], visible: editor.visible }
    } catch {
      return { x: -28, y: -4, visible: true }
    }
  }, [pose, body])

  const rightEyeCenter = useMemo(() => {
    try {
      const editor = renderEyeEditor(pose, body.primary, 1)
      return { x: editor.center[0], y: editor.center[1], visible: editor.visible }
    } catch {
      return { x: 28, y: -4, visible: true }
    }
  }, [pose, body])

  const bodyColor = theme === 'light' ? '#060606' : '#c5ff4a'
  const eyeBaseColor = theme === 'light' ? '#c5ff4a' : '#000000'
  const socketBgColor = theme === 'light' ? '#0f0f0f' : '#050505'
  const pupilColor = theme === 'light' ? '#060606' : '#000000'
  const irisGlow = theme === 'light' ? '#c5ff4a' : 'rgba(197, 255, 74, 0.25)'

  const eyelidHeight = 70
  const upperLidOffset = (1 - eyeRigState.eyelidOpenness) * eyelidHeight
  const lowerLidOffset = (1 - eyeRigState.eyelidOpenness) * eyelidHeight * 0.35

  const headClipId = `head-clip-${uniqueId}`
  const leftEyeClipId = `eye-left-clip-${uniqueId}`
  const rightEyeClipId = `eye-right-clip-${uniqueId}`
  const auraGlowId = `aura-glow-${uniqueId}`

  return (
    <div
      className={`relative select-none ${className ?? ''}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        transform: `rotate(${rotation}deg) scale(${squashX}, ${squashY})`,
        transformOrigin: 'bottom center',
        transition: 'transform 0.08s ease-out',
        ...style,
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="-150 -150 300 300"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          overflow: 'visible',
          transition: 'filter 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          filter:
            mood === 'celebrating' || mood === 'excited'
              ? 'drop-shadow(0 0 16px rgba(197,255,74,0.75))'
              : isHovered
                ? 'drop-shadow(0 0 12px rgba(197,255,74,0.5))'
                : 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))',
        }}
      >
        <defs>
          <clipPath id={headClipId}>
            <path d={scene.headPath} />
          </clipPath>

          <clipPath id={leftEyeClipId}>
            <path d={scene.leftPath} />
          </clipPath>

          <clipPath id={rightEyeClipId}>
            <path d={scene.rightPath} />
          </clipPath>

          <filter id={auraGlowId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <radialGradient id={`iris-grad-${uniqueId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={irisGlow} />
            <stop offset="80%" stopColor={eyeBaseColor} />
            <stop offset="100%" stopColor={socketBgColor} />
          </radialGradient>
        </defs>

        {scene.backPaths.map((pathValue, idx) => (
          <path
            key={`back-${idx}`}
            d={pathValue}
            fill={bodyColor}
            style={{
              transform: `translate(${-gazeVector.nx * 2}px, ${-gazeVector.ny * 2}px)`,
              transition: 'transform 0.12s ease-out',
            }}
          />
        ))}

        <path d={scene.headPath} fill={bodyColor} />

        <ellipse
          cx={-15 - gazeVector.nx * 10}
          cy={-35 - gazeVector.ny * 10}
          rx="75"
          ry="65"
          fill="rgba(255,255,255,0.08)"
          clipPath={`url(#${headClipId})`}
          style={{ pointerEvents: 'none' }}
        />

        <g clipPath={`url(#${headClipId})`}>
          {scene.leftVisible && (
            <g>
              <path d={scene.leftPath} fill={socketBgColor} />

              <g clipPath={`url(#${leftEyeClipId})`}>
                <g
                  style={{
                    opacity:
                      eyeRigState.shape === 'happy-crescent' || eyeRigState.shape === 'closed'
                        ? 0
                        : 1,
                    transition: 'opacity 0.2s ease-in-out',
                  }}
                >
                  <circle
                    cx={leftEyeCenter.x + eyeRigState.pupilX}
                    cy={leftEyeCenter.y + eyeRigState.pupilY}
                    r="16"
                    fill={`url(#iris-grad-${uniqueId})`}
                  />

                  <circle
                    cx={leftEyeCenter.x + eyeRigState.pupilX}
                    cy={leftEyeCenter.y + eyeRigState.pupilY}
                    r={eyeRigState.shape === 'surprised-wide' ? 12 : 9}
                    fill={pupilColor}
                  />

                  <circle
                    cx={leftEyeCenter.x + eyeRigState.catchlightX + 3.2}
                    cy={leftEyeCenter.y + eyeRigState.catchlightY - 3.2}
                    r="3.5"
                    fill="#ffffff"
                    opacity="0.95"
                  />

                  <circle
                    cx={leftEyeCenter.x + eyeRigState.catchlightX - 2.8}
                    cy={leftEyeCenter.y + eyeRigState.catchlightY + 2.8}
                    r="1.6"
                    fill="#ffffff"
                    opacity="0.6"
                  />
                </g>

                <path
                  d={`M ${leftEyeCenter.x + eyeRigState.pupilX * 0.35 - 16} ${leftEyeCenter.y + eyeRigState.pupilY * 0.35 + 4} Q ${leftEyeCenter.x + eyeRigState.pupilX * 0.35} ${leftEyeCenter.y + eyeRigState.pupilY * 0.35 - 18} ${leftEyeCenter.x + eyeRigState.pupilX * 0.35 + 16} ${leftEyeCenter.y + eyeRigState.pupilY * 0.35 + 4}`}
                  fill="none"
                  stroke={bodyColor}
                  strokeWidth="6.5"
                  strokeLinecap="round"
                  style={{
                    opacity: eyeRigState.shape === 'happy-crescent' ? 1 : 0,
                    transition: 'opacity 0.2s ease-in-out',
                    pointerEvents: 'none',
                  }}
                />

                <path
                  d={`M ${leftEyeCenter.x - 14} ${leftEyeCenter.y} Q ${leftEyeCenter.x} ${leftEyeCenter.y + 12} ${leftEyeCenter.x + 14} ${leftEyeCenter.y}`}
                  fill="none"
                  stroke={theme === 'light' ? bodyColor : 'rgba(255,255,255,0.7)'}
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  style={{
                    opacity: eyeRigState.shape === 'closed' ? 1 : 0,
                    transition: 'opacity 0.2s ease-in-out',
                    pointerEvents: 'none',
                  }}
                />

                {eyeRigState.eyelidOpenness < 0.98 && (
                  <rect
                    x={leftEyeCenter.x - 35}
                    y={leftEyeCenter.y - 45}
                    width="70"
                    height={upperLidOffset}
                    fill={bodyColor}
                    rx="4"
                  />
                )}

                {eyeRigState.eyelidOpenness < 0.98 && (
                  <rect
                    x={leftEyeCenter.x - 35}
                    y={leftEyeCenter.y + 45 - lowerLidOffset}
                    width="70"
                    height={lowerLidOffset + 10}
                    fill={bodyColor}
                    rx="4"
                  />
                )}
              </g>
            </g>
          )}

          {scene.rightVisible && (
            <g>
              <path d={scene.rightPath} fill={socketBgColor} />

              <g clipPath={`url(#${rightEyeClipId})`}>
                <g
                  style={{
                    opacity:
                      eyeRigState.shape === 'happy-crescent' || eyeRigState.shape === 'closed'
                        ? 0
                        : 1,
                    transition: 'opacity 0.2s ease-in-out',
                  }}
                >
                  <circle
                    cx={rightEyeCenter.x + eyeRigState.pupilX}
                    cy={rightEyeCenter.y + eyeRigState.pupilY}
                    r="16"
                    fill={`url(#iris-grad-${uniqueId})`}
                  />

                  <circle
                    cx={rightEyeCenter.x + eyeRigState.pupilX}
                    cy={rightEyeCenter.y + eyeRigState.pupilY}
                    r={eyeRigState.shape === 'surprised-wide' ? 12 : 9}
                    fill={pupilColor}
                  />

                  <circle
                    cx={rightEyeCenter.x + eyeRigState.catchlightX + 3.2}
                    cy={rightEyeCenter.y + eyeRigState.catchlightY - 3.2}
                    r="3.5"
                    fill="#ffffff"
                    opacity="0.95"
                  />

                  <circle
                    cx={rightEyeCenter.x + eyeRigState.catchlightX - 2.8}
                    cy={rightEyeCenter.y + eyeRigState.catchlightY + 2.8}
                    r="1.6"
                    fill="#ffffff"
                    opacity="0.6"
                  />
                </g>

                <path
                  d={`M ${rightEyeCenter.x + eyeRigState.pupilX * 0.35 - 16} ${rightEyeCenter.y + eyeRigState.pupilY * 0.35 + 4} Q ${rightEyeCenter.x + eyeRigState.pupilX * 0.35} ${rightEyeCenter.y + eyeRigState.pupilY * 0.35 - 18} ${rightEyeCenter.x + eyeRigState.pupilX * 0.35 + 16} ${rightEyeCenter.y + eyeRigState.pupilY * 0.35 + 4}`}
                  fill="none"
                  stroke={bodyColor}
                  strokeWidth="6.5"
                  strokeLinecap="round"
                  style={{
                    opacity: eyeRigState.shape === 'happy-crescent' ? 1 : 0,
                    transition: 'opacity 0.2s ease-in-out',
                    pointerEvents: 'none',
                  }}
                />

                <path
                  d={`M ${rightEyeCenter.x - 14} ${rightEyeCenter.y} Q ${rightEyeCenter.x} ${rightEyeCenter.y + 12} ${rightEyeCenter.x + 14} ${rightEyeCenter.y}`}
                  fill="none"
                  stroke={theme === 'light' ? bodyColor : 'rgba(255,255,255,0.7)'}
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  style={{
                    opacity: eyeRigState.shape === 'closed' ? 1 : 0,
                    transition: 'opacity 0.2s ease-in-out',
                    pointerEvents: 'none',
                  }}
                />

                {eyeRigState.eyelidOpenness < 0.98 && (
                  <rect
                    x={rightEyeCenter.x - 35}
                    y={rightEyeCenter.y - 45}
                    width="70"
                    height={upperLidOffset}
                    fill={bodyColor}
                    rx="4"
                  />
                )}

                {eyeRigState.eyelidOpenness < 0.98 && (
                  <rect
                    x={rightEyeCenter.x - 35}
                    y={rightEyeCenter.y + 45 - lowerLidOffset}
                    width="70"
                    height={lowerLidOffset + 10}
                    fill={bodyColor}
                    rx="4"
                  />
                )}
              </g>
            </g>
          )}
        </g>

        {scene.frontPaths.map((pathValue, idx) => (
          <path key={`front-${idx}`} d={pathValue} fill={bodyColor} />
        ))}

        <StrobiAccessories
          accessory={accessory}
          gazeVector={gazeVector}
          mood={mood}
          theme={theme}
          isHovered={isHovered}
        />
      </svg>
    </div>
  )
})
