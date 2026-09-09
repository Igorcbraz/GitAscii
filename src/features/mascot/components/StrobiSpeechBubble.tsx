'use client'

import { AlertCircle, CheckCircle2, HelpCircle, Info, Lightbulb, Sparkles, Zap } from 'lucide-react'
import { motion } from 'motion/react'
import React, { useEffect, useState } from 'react'

import { useI18n } from '@/i18n'

import type { StrobiMood, StrobiSpeechMessage } from '../core/types'

export interface StrobiSpeechBubbleProps {
  message: StrobiSpeechMessage
  onDismiss: () => void
  onGoodTip?: () => void
  onMute?: () => void
  isMuted?: boolean
}

function getMoodIcon(mood?: StrobiMood) {
  switch (mood) {
    case 'happy':
    case 'celebrating':
    case 'petting':
      return <Sparkles className="w-3.5 h-3.5 text-signal-lime shrink-0" />
    case 'curious':
      return <HelpCircle className="w-3.5 h-3.5 text-signal-lime shrink-0" />
    case 'thinking':
      return <Lightbulb className="w-3.5 h-3.5 text-amber-300 shrink-0" />
    case 'excited':
    case 'jumping':
      return <Zap className="w-3.5 h-3.5 text-signal-lime shrink-0" />
    case 'proud':
      return <CheckCircle2 className="w-3.5 h-3.5 text-signal-lime shrink-0" />
    case 'surprised':
      return <AlertCircle className="w-3.5 h-3.5 text-amber-300 shrink-0" />
    case 'focused':
    default:
      return <Info className="w-3.5 h-3.5 text-signal-lime shrink-0" />
  }
}

export const StrobiSpeechBubble = React.memo(function StrobiSpeechBubble({
  message,
  onDismiss,
}: StrobiSpeechBubbleProps) {
  const { t } = useI18n()
  const [displayedText, setDisplayedText] = useState('')
  const fullText = t(`mascot.tips.${message.id}`, message.message || '')

  useEffect(() => {
    setDisplayedText('')
    let currentIndex = 0
    const speed = 18

    const interval = setInterval(() => {
      currentIndex += 1
      setDisplayedText(fullText.slice(0, currentIndex))
      if (currentIndex >= fullText.length) {
        clearInterval(interval)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [fullText])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 4 }}
      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
      className="relative max-w-[280px] min-w-[190px] pointer-events-auto select-none"
      style={{ transformOrigin: 'bottom right' }}
      role="status"
      aria-live="polite"
    >
      <div className="relative bg-[#0d0d0f]/95 border border-white/[0.09] rounded-xl p-3 shadow-[0_8px_24px_rgba(0,0,0,0.6)] backdrop-blur-md">
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-start gap-2 min-w-0">
            <div className="mt-0.5">{getMoodIcon(message.mood)}</div>
            <p className="font-inter-tight text-[12px] text-pearl font-normal leading-relaxed">
              {displayedText}
              {displayedText.length < fullText.length && (
                <span className="inline-block w-1.5 h-3 ml-0.5 bg-signal-lime animate-pulse align-middle" />
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 -mr-1 -mt-1 w-5 h-5 rounded-full flex items-center justify-center text-ash/60 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer text-[13px] leading-none"
            aria-label={t('mascot.close_tip', 'Close tip')}
            title={t('mascot.close', 'Close')}
          >
            ×
          </button>
        </div>

        {message.shortcut && (
          <div className="mt-2 inline-flex items-center">
            <span className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] font-jetbrains-mono text-[9px] text-signal-lime uppercase tracking-wider">
              {message.shortcut}
            </span>
          </div>
        )}

        {message.actions && message.actions.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5 pt-2 border-t border-white/[0.06]">
            {message.actions.map((act) => (
              <button
                key={act.id}
                type="button"
                onClick={act.onClick}
                className="px-2 py-0.5 rounded text-[10px] font-jetbrains-mono transition-colors cursor-pointer bg-white/[0.06] hover:bg-white/[0.12] text-pearl border border-white/[0.08]"
              >
                {act.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        className="absolute -bottom-1.5 right-6 w-0 h-0 pointer-events-none"
        style={{
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '7px solid rgba(13, 13, 15, 0.95)',
        }}
      />
    </motion.div>
  )
})
