'use client'

import React, { useCallback, useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

interface ParticlesProps {
  className?: string
  quantity?: number
  staticity?: number
  ease?: number
  color?: string
  size?: number
}

export function Particles({
  className = '',
  quantity = 40,
  staticity = 50,
  ease = 50,
  color = '#c5ff4a',
  size = 1.2,
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const context = useRef<CanvasRenderingContext2D | null>(null)
  const circles = useRef<
    Array<{
      x: number
      y: number
      translateX: number
      translateY: number
      size: number
      alpha: number
      targetAlpha: number
      dx: number
      dy: number
      magnetism: number
    }>
  >([])
  const mousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const mouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const canvasSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 })
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  const rafId = useRef<number>(0)

  const rgb = (() => {
    if (color.startsWith('#')) {
      const hex = color.replace('#', '')
      const r = parseInt(hex.substring(0, 2), 16)
      const g = parseInt(hex.substring(2, 4), 16)
      const b = parseInt(hex.substring(4, 6), 16)
      return `${r}, ${g}, ${b}`
    }
    return '197, 255, 74'
  })()

  const circleParams = useCallback(() => {
    const x = Math.floor(Math.random() * canvasSize.current.w)
    const y = Math.floor(Math.random() * canvasSize.current.h)
    const translateX = 0
    const translateY = 0
    const pSize = Math.floor(Math.random() * 2) + size
    const alpha = 0
    const targetAlpha = parseFloat((Math.random() * 0.35 + 0.1).toFixed(2))
    const dx = (Math.random() - 0.5) * 0.2
    const dy = (Math.random() - 0.5) * 0.2
    const magnetism = 0.1 + Math.random() * 4
    return {
      x,
      y,
      translateX,
      translateY,
      size: pSize,
      alpha,
      targetAlpha,
      dx,
      dy,
      magnetism,
    }
  }, [size])

  const drawCircle = useCallback(
    (circle: (typeof circles.current)[0], update = false) => {
      if (context.current) {
        const { x, y, translateX, translateY, size: pSize, alpha } = circle
        context.current.translate(translateX, translateY)
        context.current.beginPath()
        context.current.arc(x, y, pSize, 0, 2 * Math.PI)
        context.current.fillStyle = `rgba(${rgb}, ${alpha})`
        context.current.fill()
        context.current.setTransform(dpr, 0, 0, dpr, 0, 0)

        if (!update) {
          circles.current.push(circle)
        }
      }
    },
    [dpr, rgb]
  )

  const drawParticles = useCallback(() => {
    circles.current = []
    for (let i = 0; i < quantity; i++) {
      const circle = circleParams()
      drawCircle(circle)
    }
  }, [circleParams, drawCircle, quantity])

  const resizeCanvas = useCallback(() => {
    if (canvasContainerRef.current && canvasRef.current && context.current) {
      circles.current = []
      canvasSize.current.w = canvasContainerRef.current.offsetWidth
      canvasSize.current.h = canvasContainerRef.current.offsetHeight
      canvasRef.current.width = canvasSize.current.w * dpr
      canvasRef.current.height = canvasSize.current.h * dpr
      canvasRef.current.style.width = `${canvasSize.current.w}px`
      canvasRef.current.style.height = `${canvasSize.current.h}px`
      context.current.scale(dpr, dpr)
      drawParticles()
    }
  }, [dpr, drawParticles])

  const animate = useCallback(() => {
    if (context.current) {
      context.current.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h)
      circles.current.forEach((circle, i) => {
        const edge = [
          circle.x + circle.translateX - circle.size,
          canvasSize.current.w - circle.x - circle.translateX - circle.size,
          circle.y + circle.translateY - circle.size,
          canvasSize.current.h - circle.y - circle.translateY - circle.size,
        ]
        const closestEdge = edge.reduce((a, b) => Math.min(a, b))
        const remapClosestEdge = parseFloat((closestEdge / 20).toFixed(2))
        if (remapClosestEdge > 1) {
          circle.alpha += 0.02
          if (circle.alpha > circle.targetAlpha) {
            circle.alpha = circle.targetAlpha
          }
        } else {
          circle.alpha = circle.targetAlpha * remapClosestEdge
        }
        circle.x += circle.dx
        circle.y += circle.dy
        circle.translateX +=
          (mouse.current.x / (staticity / circle.magnetism) - circle.translateX) / ease
        circle.translateY +=
          (mouse.current.y / (staticity / circle.magnetism) - circle.translateY) / ease

        if (
          circle.x < -circle.size ||
          circle.x > canvasSize.current.w + circle.size ||
          circle.y < -circle.size ||
          circle.y > canvasSize.current.h + circle.size
        ) {
          circles.current.splice(i, 1)
          const newCircle = circleParams()
          drawCircle(newCircle)
        } else {
          drawCircle(
            {
              ...circle,
              x: circle.x,
              y: circle.y,
              translateX: circle.translateX,
              translateY: circle.translateY,
              alpha: circle.alpha,
            },
            true
          )
        }
      })
    }
    rafId.current = window.requestAnimationFrame(animate)
  }, [circleParams, drawCircle, ease, staticity])

  useEffect(() => {
    if (canvasRef.current) {
      context.current = canvasRef.current.getContext('2d')
    }
    resizeCanvas()
    animate()
    window.addEventListener('resize', resizeCanvas)

    const onMouseMove = (e: MouseEvent) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        const { w, h } = canvasSize.current
        const x = e.clientX - rect.left - w / 2
        const y = e.clientY - rect.top - h / 2
        const inside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom
        if (inside) {
          mousePosition.current.x = x
          mousePosition.current.y = y
        }
      }
    }

    window.addEventListener('mousemove', onMouseMove)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', onMouseMove)
      if (rafId.current) {
        window.cancelAnimationFrame(rafId.current)
      }
    }
  }, [animate, resizeCanvas])

  return (
    <div
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      ref={canvasContainerRef}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} />
    </div>
  )
}

export default Particles
