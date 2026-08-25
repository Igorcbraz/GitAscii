'use client'

import React, { useCallback, useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

interface SquaresProps {
  direction?: 'diagonal' | 'up' | 'right' | 'down' | 'left'
  speed?: number
  borderColor?: string
  squareSize?: number
  hoverFillColor?: string
  className?: string
}

export function Squares({
  direction = 'diagonal',
  speed = 0.5,
  borderColor = 'rgba(255, 255, 255, 0.04)',
  squareSize = 48,
  hoverFillColor = 'rgba(197, 255, 74, 0.08)',
  className,
}: SquaresProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const requestRef = useRef<number>(0)
  const numSquaresX = useRef<number>(0)
  const numSquaresY = useRef<number>(0)
  const gridOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const hoveredSquare = useRef<{ x: number; y: number } | null>(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const startX = Math.floor(gridOffset.current.x / squareSize) * squareSize
    const startY = Math.floor(gridOffset.current.y / squareSize) * squareSize

    ctx.lineWidth = 0.75
    ctx.strokeStyle = borderColor

    for (let x = startX; x < canvas.width + squareSize; x += squareSize) {
      for (let y = startY; y < canvas.height + squareSize; y += squareSize) {
        const squareX = x - (gridOffset.current.x % squareSize)
        const squareY = y - (gridOffset.current.y % squareSize)

        if (
          hoveredSquare.current &&
          Math.floor((x - startX) / squareSize) === hoveredSquare.current.x &&
          Math.floor((y - startY) / squareSize) === hoveredSquare.current.y
        ) {
          ctx.fillStyle = hoverFillColor
          ctx.fillRect(squareX, squareY, squareSize, squareSize)
        }

        ctx.strokeRect(squareX, squareY, squareSize, squareSize)
      }
    }

    const effectiveSpeed = Math.max(speed, 0.1)
    switch (direction) {
      case 'right':
        gridOffset.current.x = (gridOffset.current.x - effectiveSpeed + squareSize) % squareSize
        break
      case 'left':
        gridOffset.current.x = (gridOffset.current.x + effectiveSpeed + squareSize) % squareSize
        break
      case 'up':
        gridOffset.current.y = (gridOffset.current.y + effectiveSpeed + squareSize) % squareSize
        break
      case 'down':
        gridOffset.current.y = (gridOffset.current.y - effectiveSpeed + squareSize) % squareSize
        break
      case 'diagonal':
        gridOffset.current.x = (gridOffset.current.x - effectiveSpeed + squareSize) % squareSize
        gridOffset.current.y = (gridOffset.current.y - effectiveSpeed + squareSize) % squareSize
        break
    }

    requestRef.current = requestAnimationFrame(draw)
  }, [borderColor, direction, hoverFillColor, speed, squareSize])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      if (!canvas.parentElement) return
      canvas.width = canvas.parentElement.clientWidth
      canvas.height = canvas.parentElement.clientHeight
      numSquaresX.current = Math.ceil(canvas.width / squareSize) + 1
      numSquaresY.current = Math.ceil(canvas.height / squareSize) + 1
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      if (mouseX < 0 || mouseX > canvas.width || mouseY < 0 || mouseY > canvas.height) {
        hoveredSquare.current = null
        return
      }

      const startX = Math.floor(gridOffset.current.x / squareSize) * squareSize
      const startY = Math.floor(gridOffset.current.y / squareSize) * squareSize

      const hoveredX = Math.floor((mouseX + (gridOffset.current.x % squareSize) - startX) / squareSize)
      const hoveredY = Math.floor((mouseY + (gridOffset.current.y % squareSize) - startY) / squareSize)

      hoveredSquare.current = { x: hoveredX, y: hoveredY }
    }

    const handleMouseLeave = () => {
      hoveredSquare.current = null
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    requestRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [draw, squareSize])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 h-full w-full select-none', className)}
    />
  )
}

export default Squares
