'use client'

import { useEffect } from 'react'

import { useStrobi } from './hooks/useStrobi'
import type { MascotTip } from './types'

export interface EditorMascotInlineProps {
  tip: MascotTip
  size?: number
}

export function EditorMascotInline({ tip }: EditorMascotInlineProps) {
  const { strobe } = useStrobi()

  useEffect(() => {
    strobe.speak(tip)
  }, [tip, strobe])

  return (
    <div className="flex items-start gap-3 p-2 rounded-lg bg-carbon/50 border border-signal-lime/20">
      <div className="flex-1">
        <p className="font-inter-tight text-xs text-chalk leading-relaxed">{tip.message}</p>
        {tip.shortcut && (
          <span className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-signal-lime/15 border border-signal-lime/30 font-jetbrains-mono text-[10px] text-signal-lime tracking-wide">
            {tip.shortcut}
          </span>
        )}
      </div>
    </div>
  )
}
