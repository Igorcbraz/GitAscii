'use client'

import { motion } from 'motion/react'
import React, { useCallback, useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

interface DecryptedTextProps {
  text: string
  speed?: number
  maxIterations?: number
  sequential?: boolean
  revealDirection?: 'start' | 'end' | 'center'
  characters?: string
  className?: string
  encryptedClassName?: string
  parentClassName?: string
  animateOn?: 'view' | 'hover'
}

export function DecryptedText({
  text,
  speed = 40,
  maxIterations = 12,
  sequential = true,
  revealDirection = 'start',
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+~`|}{[]:;?><,./-=',
  className = '',
  encryptedClassName = 'text-signal-lime/80',
  parentClassName = '',
  animateOn = 'view',
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text)
  const [isScrambling, setIsScrambling] = useState(false)

  const triggerDecrypt = useCallback(() => {
    if (isScrambling) return
    setIsScrambling(true)

    let iteration = 0
    const totalLength = text.length

    const interval = setInterval(() => {
      setDisplayText(() => {
        return text
          .split('')
          .map((char, idx) => {
            if (char === ' ') return ' '

            let shouldReveal = false
            if (sequential) {
              if (revealDirection === 'start') {
                shouldReveal = idx < Math.floor((iteration / maxIterations) * totalLength)
              } else if (revealDirection === 'end') {
                shouldReveal =
                  idx >= totalLength - Math.floor((iteration / maxIterations) * totalLength)
              } else {
                const mid = totalLength / 2
                const dist = Math.abs(idx - mid)
                shouldReveal = dist <= (iteration / maxIterations) * mid
              }
            } else {
              shouldReveal = Math.random() < iteration / maxIterations
            }

            if (shouldReveal || iteration >= maxIterations) {
              return text[idx]
            }

            const randChar = characters[Math.floor(Math.random() * characters.length)]
            return randChar
          })
          .join('')
      })

      iteration++
      if (iteration > maxIterations) {
        clearInterval(interval)
        setIsScrambling(false)
        setDisplayText(text)
      }
    }, speed)
  }, [characters, isScrambling, maxIterations, revealDirection, sequential, speed, text])

  useEffect(() => {
    if (animateOn === 'view') {
      triggerDecrypt()
    }
  }, [animateOn, triggerDecrypt])

  const handleMouseEnter = () => {
    if (animateOn === 'hover') {
      triggerDecrypt()
    }
  }

  return (
    <motion.span
      className={cn('inline-block whitespace-pre select-none', parentClassName)}
      onMouseEnter={handleMouseEnter}
      initial={animateOn === 'view' ? { opacity: 0 } : undefined}
      whileInView={animateOn === 'view' ? { opacity: 1 } : undefined}
      viewport={{ once: true }}
      onViewportEnter={() => {
        if (animateOn === 'view') triggerDecrypt()
      }}
    >
      <span className={isScrambling ? encryptedClassName : className}>{displayText}</span>
    </motion.span>
  )
}

export default DecryptedText
