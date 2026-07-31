'use client'

import { useEffect, useRef, useState } from 'react'

const ASCII_RAMP = ' .`\'^",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$'

export default function AsciiHands({
  className,
  imageSrc = '/hands.png',
}: {
  className?: string
  imageSrc?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const imageDataRef = useRef<{
    data: Uint8ClampedArray
    width: number
    height: number
  } | null>(null)
  const [loaded, setLoaded] = useState(false)
  const timeRef = useRef<number>(0)

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const offscreen = document.createElement('canvas')
      offscreen.width = img.naturalWidth
      offscreen.height = img.naturalHeight
      const ctx = offscreen.getContext('2d')
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
    img.src = imageSrc
  }, [imageSrc])

  useEffect(() => {
    if (!loaded) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }

    resize()
    window.addEventListener('resize', resize)

    const draw = (now: number) => {
      if (!timeRef.current) timeRef.current = now
      const elapsed = (now - timeRef.current) / 1000

      const imgInfo = imageDataRef.current
      if (!imgInfo) return

      const W = canvas.width
      const H = canvas.height

      if (W === 0 || H === 0) {
        animRef.current = requestAnimationFrame(draw)
        return
      }

      ctx.clearRect(0, 0, W, H)

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

          const x = startX + col * charW
          const y = startY + row * charH

          const shimmer =
            Math.sin(col * 0.3 + elapsed * 1.2) * Math.sin(row * 0.25 + elapsed * 0.8) * 0.15

          const alpha = Math.min(1, brightness * 0.85 + shimmer * brightness)

          const limeBlend = Math.pow(brightness, 0.8)
          const cr = Math.round(197 * limeBlend + 200 * (1 - limeBlend))
          const cg = Math.round(255 * limeBlend + 200 * (1 - limeBlend))
          const cb = Math.round(74 * limeBlend + 200 * (1 - limeBlend))

          ctx.fillStyle = `rgba(${cr},${cg},${cb},${Math.max(0, alpha).toFixed(3)})`
          ctx.fillText(char, x, y)
        }
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animRef.current)
    }
  }, [loaded])

  return <canvas ref={canvasRef} className={className} style={{ width: '100%', height: '100%' }} />
}
