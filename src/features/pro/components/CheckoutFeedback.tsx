'use client'

import {
  ArrowRight,
  BadgeDollarSign,
  CircleHelp,
  Clock3,
  CreditCard,
  MessageSquare,
  Wrench,
  X,
} from 'lucide-react'
import { useEffect, useRef } from 'react'

import { useI18n } from '@/i18n'
import { analytics } from '@/lib/analytics'
import type { AnalyticsEvents } from '@/lib/analytics/types'

type Reason = AnalyticsEvents['checkout_feedback']['reason']

const REASONS = [
  {
    value: 'price',
    key: 'pro.checkout.reason_price',
    fallback: 'The price was too high',
    icon: BadgeDollarSign,
  },
  {
    value: 'payment_method',
    key: 'pro.checkout.reason_payment',
    fallback: 'My payment method was unavailable',
    icon: CreditCard,
  },
  {
    value: 'trust',
    key: 'pro.checkout.reason_trust',
    fallback: 'I needed more information before buying',
    icon: CircleHelp,
  },
  {
    value: 'timing',
    key: 'pro.checkout.reason_timing',
    fallback: 'I am not ready to buy yet',
    icon: Clock3,
  },
  {
    value: 'technical_issue',
    key: 'pro.checkout.reason_technical',
    fallback: 'I had a technical problem',
    icon: Wrench,
  },
  {
    value: 'other',
    key: 'pro.checkout.reason_other',
    fallback: 'Another reason',
    icon: MessageSquare,
  },
] as const satisfies ReadonlyArray<{
  value: Reason
  key: string
  fallback: string
  icon: typeof BadgeDollarSign
}>

export function CheckoutFeedback({ onClose }: { onClose: () => void }) {
  const { t } = useI18n()
  const dialogRef = useRef<HTMLElement>(null)
  const firstOptionRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    firstOptionRef.current?.focus()
    return () => previousFocus?.focus()
  }, [])

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') {
      onClose()
      return
    }
    if (event.key !== 'Tab') return
    const buttons = dialogRef.current?.querySelectorAll<HTMLButtonElement>('button')
    if (!buttons?.length) return
    const first = buttons[0]
    const last = buttons[buttons.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  function selectReason(reason: Reason) {
    analytics.track('checkout_feedback', { reason, checkout_provider: 'stripe' })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-9998 flex overflow-y-auto bg-black/80 p-4 backdrop-blur-xs"
      role="presentation"
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-feedback-title"
        onKeyDown={handleKeyDown}
        className="m-auto flex w-full max-w-[500px] flex-col overflow-hidden rounded-sm border border-graphite bg-carbon text-chalk shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-graphite bg-onyx/40 px-5 py-3.5">
          <span className="font-jetbrains-mono text-caption font-bold uppercase tracking-wider text-signal-lime">
            [ GITASCII PRO · CHECKOUT ]
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close', 'Close')}
            className="cursor-pointer rounded p-1 text-ash transition-colors hover:bg-graphite hover:text-white focus-visible:outline-2 focus-visible:outline-signal-lime"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          <h2
            id="checkout-feedback-title"
            className="font-pt-serif text-2xl leading-snug font-light tracking-tight text-white"
          >
            {t('pro.checkout.feedback_title_prefix', 'What ')}
            <span className="font-pt-serif text-signal-lime italic">
              {t('pro.checkout.feedback_title_highlight', 'stopped')}
            </span>
            {t('pro.checkout.feedback_title_suffix', ' your purchase?')}
          </h2>
          <p className="mt-1 font-inter-tight text-note leading-relaxed text-pearl">
            {t(
              'pro.checkout.feedback_description',
              'Optional feedback without personal details to help us improve checkout.'
            )}
          </p>

          <div className="mt-5 grid gap-2.5">
            {REASONS.map(({ value, key, fallback, icon: Icon }, index) => (
              <button
                key={value}
                ref={index === 0 ? firstOptionRef : undefined}
                type="button"
                onClick={() => selectReason(value)}
                className="group flex min-h-14 cursor-pointer items-center gap-3.5 rounded-sm border border-graphite bg-onyx/80 p-3 text-left transition-colors hover:border-signal-lime/50 hover:bg-iron/70 focus-visible:outline-2 focus-visible:outline-signal-lime"
              >
                <Icon size={18} aria-hidden="true" className="shrink-0 text-signal-lime" />
                <span className="min-w-0 flex-1 font-inter-tight text-body font-medium text-bone">
                  {t(key, fallback)}
                </span>
                <ArrowRight
                  size={15}
                  aria-hidden="true"
                  className="shrink-0 text-ash transition-colors group-hover:text-signal-lime"
                />
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
