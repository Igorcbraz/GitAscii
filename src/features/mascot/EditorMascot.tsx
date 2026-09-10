'use client'

import React, { useEffect, useRef } from 'react'

import { useStrobi } from './hooks/useStrobi'
import { EDITOR_TIPS } from './mascotTips'
import type { MascotTip } from './types'

export function EditorMascot() {
  const { strobe } = useStrobi()
  const tipIndexRef = useRef(0)
  const tipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    strobe.goTo('editor', { style: 'flight' })

    const welcome = setTimeout(() => {
      strobe.speak({
        id: 'editor-intro',
        message: 'Estou aqui pra te ajudar! Vou te dar dicas enquanto você edita 💪',
        duration: 5000,
        mood: 'happy',
      })
    }, 1500)

    const cycleTips = () => {
      tipTimerRef.current = setTimeout(() => {
        if (!strobe.isMuted()) {
          const tip = EDITOR_TIPS[tipIndexRef.current % EDITOR_TIPS.length]
          tipIndexRef.current += 1
          strobe.speak(tip)
        }
        cycleTips()
      }, 28000)
    }

    const startCycle = setTimeout(cycleTips, 7000)

    return () => {
      clearTimeout(welcome)
      clearTimeout(startCycle)
      if (tipTimerRef.current) clearTimeout(tipTimerRef.current)
    }
  }, [strobe])

  useEffect(() => {
    const handleCopy = () => {
      strobe.react('focused', 2500)
      strobe.speak({
        id: 'editor-copy-feedback',
        message: 'Widget copiado! Ctrl+V para colar no canvas 😊',
        shortcut: 'Ctrl+V',
        duration: 3500,
        mood: 'focused',
      })
    }

    const handleUndo = () => {
      strobe.react('thinking', 2500)
      strobe.speak({
        id: 'editor-undo-feedback',
        message: 'Desfeito! Ctrl+Shift+Z para refazer 🔄',
        shortcut: 'Ctrl+Shift+Z',
        duration: 3000,
        mood: 'thinking',
      })
    }

    const handleWidgetAdded = () => {
      strobe.react('excited', 2500)
      strobe.speak({
        id: 'editor-widget-added',
        message: 'Widget adicionado! Clique nele para editar as propriedades 🎨',
        duration: 4000,
        mood: 'excited',
      })
    }

    const handleSaved = () => {
      strobe.react('celebrating', 3200)
      strobe.speak({
        id: 'editor-saved',
        message: 'Salvo com sucesso! Seu perfil está atualizado no GitHub 🚀',
        duration: 4000,
        mood: 'celebrating',
      })
    }

    window.addEventListener('gitascii:copy', handleCopy)
    window.addEventListener('gitascii:undo', handleUndo)
    window.addEventListener('gitascii:widget-added', handleWidgetAdded)
    window.addEventListener('gitascii:saved', handleSaved)

    return () => {
      window.removeEventListener('gitascii:copy', handleCopy)
      window.removeEventListener('gitascii:undo', handleUndo)
      window.removeEventListener('gitascii:widget-added', handleWidgetAdded)
      window.removeEventListener('gitascii:saved', handleSaved)
    }
  }, [strobe])

  return null
}

export interface EditorMascotInlineProps {
  tip: MascotTip
  size?: number
}

export function EditorMascotInline({ tip, size: _size = 44 }: EditorMascotInlineProps) {
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
