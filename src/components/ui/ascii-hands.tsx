'use client'

import { useEffect, useRef, useState } from 'react'

const ASCII_RAMP = ' .`\'^",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$'
const HANDS_SRC = '/ascii-hands.webp'

interface AsciiHandsProps {
  className?: string
}

export default function AsciiHands({ className = '' }: AsciiHandsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageDataRef = useRef<{
    data: Uint8ClampedArray
    width: number
    height: number
  } | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let active = true
    let idleId: number | null = null
    let timerId: NodeJS.Timeout | null = null

    const startProcessing = () => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        if (!active) return
        const offscreen = document.createElement('canvas')
        offscreen.width = img.naturalWidth
        offscreen.height = img.naturalHeight
        const ctx = offscreen.getContext('2d', { willReadFrequently: true })
        if (!ctx) return
        ctx.drawImage(img, 0, 0)
        const imgData = ctx.getImageData(0, 0, offscreen.width, offscreen.height)
        imageDataRef.current = {
          data: imgData.data,
          width: offscreen.width,
          height: offscreen.height,
        }
        setLoaded(true)
      }
      img.src = HANDS_SRC
    }

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleId = (window as any).requestIdleCallback(startProcessing, { timeout: 1500 })
    } else {
      timerId = setTimeout(startProcessing, 150)
    }

    return () => {
      active = false
      if (idleId !== null && typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        ;(window as any).cancelIdleCallback(idleId)
      }
      if (timerId !== null) {
        clearTimeout(timerId)
      }
    }
  }, [])

  useEffect(() => {
    if (!loaded) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const recomputeCellsAndDraw = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      const W = Math.round(rect.width)
      const H = Math.round(rect.height)
      if (W === 0 || H === 0) return

      canvas.width = W
      canvas.height = H

      const imgInfo = imageDataRef.current
      if (!imgInfo) return

      const fontSize = Math.max(5, Math.min(10, W / 180))
      const charW = fontSize * 0.62
      const charH = fontSize * 1.15

      ctx.font = `${fontSize}px "JetBrains Mono", "Courier New", monospace`
      ctx.textBaseline = 'top'

      const scale = 1.35
      const asciiAreaW = W * scale
      const asciiAreaH = H * scale
      const startX = (W - asciiAreaW) / 2
      const startY = (H - asciiAreaH) / 2

      const cols = Math.floor(asciiAreaW / charW)
      const rows = Math.floor(asciiAreaH / charH)

      const sampleStepX = imgInfo.width / cols
      const sampleStepY = imgInfo.height / rows

      ctx.clearRect(0, 0, W, H)

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const imgX = Math.floor(col * sampleStepX)
          const imgY = Math.floor(row * sampleStepY)
          const idx = (imgY * imgInfo.width + imgX) * 4

          const r = imgInfo.data[idx]
          const g = imgInfo.data[idx + 1]
          const b = imgInfo.data[idx + 2]

          const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255

          if (brightness < 0.06) continue

          const charIdx = Math.floor(brightness * (ASCII_RAMP.length - 1))
          const char = ASCII_RAMP[charIdx]

          if (char === ' ') continue

          const x = Math.round(startX + col * charW)
          const y = Math.round(startY + row * charH)

          const limeBlend = Math.pow(brightness, 0.8)
          const cr = Math.round(197 * limeBlend + 200 * (1 - limeBlend))
          const cg = Math.round(255 * limeBlend + 200 * (1 - limeBlend))
          const cb = Math.round(74 * limeBlend + 200 * (1 - limeBlend))

          // Draw statically without shimmer
          const alpha = Math.max(0, Math.min(1, brightness * 0.85))
          ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha.toFixed(2)})`
          ctx.fillText(char, x, y)
        }
      }
    }

    // Run once on load
    recomputeCellsAndDraw()

    // Rerun on resize
    window.addEventListener('resize', recomputeCellsAndDraw)

    return () => {
      window.removeEventListener('resize', recomputeCellsAndDraw)
    }
  }, [loaded])

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden pointer-events-none select-none ${className}`}
      style={{ transform: 'translateZ(0)' }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} aria-hidden="true" className="w-full h-full opacity-90" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_55%_55%_at_50%_50%,rgba(197,255,74,0.12)_0%,transparent_100%)] opacity-70" />
    </div>
  )
}
