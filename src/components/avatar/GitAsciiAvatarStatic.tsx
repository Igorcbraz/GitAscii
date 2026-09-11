import type { AvatarDefinition } from '@bible-strong/avatar-core'
import type { BodyNode } from '@bible-strong/avatar-core/body'
import {
  type Expression,
  poseFromExpression,
  renderAvatar,
} from '@bible-strong/avatar-core/geometry'
import React, { useId } from 'react'

import { getGitAsciiAvatarDefinition, resolveGitAsciiExpression } from './avatarDefinition'
import type { GitAsciiAvatarProps } from './types'

/**
 * Render a trusted, bundled avatar definition without importing avatar-core's
 * root entry point. The root eagerly compiles its AJV schema with `new Function`,
 * which Cloudflare Workers correctly rejects during request-time SSR.
 */
function renderTrustedAvatarDefinition(definition: AvatarDefinition, expressionKey: string) {
  const definitionExpression = definition.expressions[expressionKey]
  if (!definitionExpression) {
    throw new Error(`Unknown expression '${expressionKey}'`)
  }

  const expression: Expression = {
    id: expressionKey,
    semanticKey: expressionKey,
    headX: definitionExpression.head.x,
    headY: definitionExpression.head.y,
    headZ: definitionExpression.head.z,
    widthLeft: definitionExpression.eyes.left.width,
    widthRight: definitionExpression.eyes.right.width,
    heightLeft: definitionExpression.eyes.left.height,
    heightRight: definitionExpression.eyes.right.height,
    spacing: definitionExpression.eyes.spacing,
    positionXLeft: definitionExpression.eyes.left.x,
    positionXRight: definitionExpression.eyes.right.x,
    positionYLeft: definitionExpression.eyes.left.y,
    positionYRight: definitionExpression.eyes.right.y,
    leftAngle: definitionExpression.eyes.left.angle,
    rightAngle: definitionExpression.eyes.right.angle,
    perspective: definitionExpression.perspective,
    eyeMotion: definitionExpression.motion.eyes,
    bodyMotion: definitionExpression.motion.body,
    ...(definitionExpression.colors?.body ? { bodyColor: definitionExpression.colors.body } : {}),
    ...(definitionExpression.colors?.eyes ? { eyeColor: definitionExpression.colors.eyes } : {}),
  }
  const bodyNodes: BodyNode[] = definition.body.nodes.map((node, index) => ({
    id: `runtime-node-${index}`,
    name: `Runtime node ${index + 1}`,
    surface: { ...node.surface },
    position: [...node.position],
    rotation: [...node.rotation],
  }))

  return {
    geometry: renderAvatar(poseFromExpression(expression), definition.body.primary, 1, {
      bodyNodes,
    }),
    colors: {
      body: definitionExpression.colors?.body ?? expression.bodyColor ?? definition.colors.body,
      eyes: definitionExpression.colors?.eyes ?? expression.eyeColor ?? definition.colors.eyes,
    },
  }
}

export function GitAsciiAvatarStatic({
  size = 120,
  expression = 'neutral',
  variant = 'default',
  theme = 'dark',
  colors,
  className,
  style,
  ariaLabel = 'GitAscii Mascote',
  children,
}: GitAsciiAvatarProps) {
  const clipId = useId()
  const resolvedKey = resolveGitAsciiExpression(expression)
  const definition = getGitAsciiAvatarDefinition(variant, theme, colors)
  const scene = renderTrustedAvatarDefinition(definition, resolvedKey)

  const sizeStyle = {
    width: typeof size === 'number' ? `${size}px` : size,
    height: typeof size === 'number' ? `${size}px` : size,
  }

  return (
    <div
      className={['gitascii-avatar', className ?? ''].filter(Boolean).join(' ')}
      style={{
        display: 'inline-grid',
        placeItems: 'center',
        aspectRatio: '1',
        userSelect: 'none',
        ...sizeStyle,
        ...style,
      }}
      role="img"
      aria-label={ariaLabel}
    >
      <svg
        viewBox="-150 -150 300 300"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          overflow: 'visible',
        }}
        aria-hidden="true"
      >
        <defs>
          <clipPath id={clipId}>
            <path d={scene.geometry.headPath} />
          </clipPath>
        </defs>

        {scene.geometry.backPaths.map((pathValue, idx) => (
          <path key={`back-${idx}`} d={pathValue} fill={scene.colors.body} />
        ))}

        <path d={scene.geometry.headPath} fill={scene.colors.body} />

        <g clipPath={`url(#${clipId})`} fill={scene.colors.eyes}>
          {scene.geometry.leftVisible && <path d={scene.geometry.leftPath} />}
          {scene.geometry.rightVisible && <path d={scene.geometry.rightPath} />}
        </g>

        {scene.geometry.frontPaths.map((pathValue, idx) => (
          <path key={`front-${idx}`} d={pathValue} fill={scene.colors.body} />
        ))}

        {children}
      </svg>
    </div>
  )
}
