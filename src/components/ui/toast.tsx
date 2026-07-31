'use client'

import { AlertCircle, CheckCircle, Info, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import React, { createContext, useCallback, useContext, useState } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (message: string, type: ToastType = 'info', duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9)
      setToasts((prev) => [...prev, { id, message, type, duration }])

      setTimeout(() => {
        removeToast(id)
      }, duration)
    },
    [removeToast]
  )

  const success = useCallback(
    (message: string, duration?: number) => toast(message, 'success', duration),
    [toast]
  )
  const error = useCallback(
    (message: string, duration?: number) => toast(message, 'error', duration),
    [toast]
  )
  const info = useCallback(
    (message: string, duration?: number) => toast(message, 'info', duration),
    [toast]
  )

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      <div className="fixed bottom-6 right-6 z-9999 flex flex-col gap-3 max-w-md w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon =
              t.type === 'success' ? CheckCircle : t.type === 'error' ? AlertCircle : Info
            const borderColors = {
              success: 'border-signal-lime/30 text-signal-lime',
              error: 'border-red-500/30 text-red-400',
              info: 'border-ash/30 text-chalk',
            }

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } }}
                className={`pointer-events-auto flex items-start gap-3 bg-onyx/90 backdrop-blur-xl border p-4 rounded-xs shadow-[0_8px_30px_rgba(0,0,0,0.5)] ${borderColors[t.type]}`}
              >
                <Icon size={18} className="shrink-0 mt-0.5" />
                <div className="flex-1 font-inter-tight text-body-sm leading-relaxed text-bone select-text">
                  {t.message}
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="shrink-0 text-ash hover:text-white p-0.5 rounded transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
