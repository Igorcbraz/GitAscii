'use client'

import { motion } from 'motion/react'
import React, { useEffect } from 'react'

import { StrobiAnchor } from './components/StrobiAnchor'
import { useStrobi } from './hooks/useStrobi'
import type { MascotTip } from './types'

export interface MascotDialogProps {
  tip: MascotTip
  size?: number
  className?: string
}

export function MascotDialog({ tip, size = 52, className }: MascotDialogProps) {
  const { strobe } = useStrobi()

  useEffect(() => {
    strobe.goTo('dialog', { style: 'float' })
    strobe.speak(tip)
  }, [tip, strobe])

  return (
    <div className={`flex items-center gap-3 ${className ?? ''}`}>
      <StrobiAnchor id="dialog" size={size} />
      <div className="flex-1 min-w-0">
        <p className="font-inter-tight text-sm text-chalk leading-relaxed">{tip.message}</p>
        {tip.shortcut && (
          <span className="mt-1 inline-flex items-center px-1.5 py-0.5 rounded bg-signal-lime/15 border border-signal-lime/30 font-jetbrains-mono text-[10px] text-signal-lime tracking-wide">
            {tip.shortcut}
          </span>
        )}
      </div>
    </div>
  )
}

export interface MascotOnboardingProps {
  title: string
  description: string
  onContinue: () => void
  continueLabel?: string
}

export function MascotOnboarding({
  title,
  description,
  onContinue,
  continueLabel = 'Continuar',
}: MascotOnboardingProps) {
  const { strobe } = useStrobi()

  useEffect(() => {
    strobe.goTo('onboarding', { style: 'flight' })
    strobe.react('excited', 3000)
    return () => {
      strobe.goTo('hero')
    }
  }, [strobe])

  return (
    <div className="flex flex-col items-center text-center gap-6 py-4">
      <div className="relative flex items-center justify-center min-h-[140px]">
        <StrobiAnchor id="onboarding" size={120} restingMood="excited" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <h3 className="font-pt-serif font-light text-2xl text-white">{title}</h3>
        <p className="font-inter-tight text-sm text-pearl leading-relaxed max-w-sm">
          {description}
        </p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, type: 'spring' }}
        whileTap={{ scale: 0.96 }}
        onClick={onContinue}
        className="px-6 py-2.5 rounded-sm bg-signal-lime text-black font-inter-tight font-semibold text-sm hover:brightness-110 transition-all cursor-pointer shadow-[0_0_20px_rgba(197,255,74,0.4)]"
      >
        {continueLabel} →
      </motion.button>
    </div>
  )
}

export interface MascotToastProps {
  message: string
  show: boolean
  onDismiss?: () => void
  type?: 'success' | 'info' | 'excited'
}

export function MascotToast({
  message,
  show,
  onDismiss: _onDismiss,
  type = 'info',
}: MascotToastProps) {
  const { strobe } = useStrobi()

  useEffect(() => {
    if (show) {
      strobe.react(type === 'success' || type === 'excited' ? 'celebrating' : 'happy', 3500)
      strobe.speak({
        id: `toast-${Date.now()}`,
        message,
        duration: 4500,
        mood: 'happy',
      })
    }
  }, [show, message, type, strobe])

  return null
}
