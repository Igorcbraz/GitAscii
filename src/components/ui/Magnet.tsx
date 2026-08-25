'use client'

import { motion, useMotionValue, useSpring } from 'motion/react'
import React, { useRef } from 'react'

interface MagnetProps {
  children: React.ReactNode
  distance?: number
  strength?: number
  className?: string
}

export function Magnet({
  children,
  distance = 100,
  strength = 0.35,
  className = '',
}: MagnetProps) {
  const ref = useRef<HTMLDivElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 }
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return

    const { clientX, clientY } = e
    const { left, top, width, height } = ref.current.getBoundingClientRect()

    const centerX = left + width / 2
    const centerY = top + height / 2

    const distX = clientX - centerX
    const distY = clientY - centerY

    const dist = Math.sqrt(distX * distX + distY * distY)

    if (dist < distance) {
      x.set(distX * strength)
      y.set(distY * strength)
    } else {
      x.set(0)
      y.set(0)
    }
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  )
}

export default Magnet
