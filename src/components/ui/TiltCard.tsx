'use client'

import { type HTMLMotionProps, motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import React, { useRef } from 'react'

import { cn } from '@/lib/utils'

interface TiltCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  tiltMaxAngle?: number
  scale?: number
  className?: string
}

export function TiltCard({
  children,
  tiltMaxAngle = 8,
  scale = 1.02,
  className = '',
  ...props
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  const x = useMotionValue(0.5)
  const y = useMotionValue(0.5)

  const rotateX = useSpring(useTransform(y, [0, 1], [tiltMaxAngle, -tiltMaxAngle]), {
    damping: 20,
    stiffness: 200,
  })
  const rotateY = useSpring(useTransform(x, [0, 1], [-tiltMaxAngle, tiltMaxAngle]), {
    damping: 20,
    stiffness: 200,
  })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const posX = (e.clientX - rect.left) / rect.width
    const posY = (e.clientY - rect.top) / rect.height
    x.set(posX)
    y.set(posY)
  }

  const handleMouseLeave = () => {
    x.set(0.5)
    y.set(0.5)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale }}
      transition={{ duration: 0.2 }}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={cn('perspective-1000', className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default TiltCard
