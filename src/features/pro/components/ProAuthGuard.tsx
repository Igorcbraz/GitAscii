'use client'

import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { useToast } from '@/components/ui/toast'
import { PRO_PLAN_TIERS } from '@/constants'
import { useI18n } from '@/i18n'
import { analytics } from '@/lib/analytics'
import { getGAIdentifiers, trackCheckoutIntent } from '@/lib/analytics/commerce'
import { API_ENDPOINTS } from '@/services/endpoints'

import { CheckoutFeedback } from './CheckoutFeedback'
import { ProPaywall } from './ProPaywall'
import { ProPaywallSkeleton } from './ProSkeleton'

export interface ProAuthGuardProps {
  children: React.ReactNode
  loadingFallback?: React.ReactNode
}

interface UserSessionState {
  username?: string
  githubId?: number
  email?: string
  name?: string
  isPro?: boolean
  tier?: (typeof PRO_PLAN_TIERS)[keyof typeof PRO_PLAN_TIERS]
}

interface SocialProofState {
  count: number
  usernames: string[]
}

export const ProAuthGuard: React.FC<ProAuthGuardProps> = ({ children, loadingFallback }) => {
  const pathname = usePathname() || '/pro'
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<UserSessionState | null>(null)
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [showCheckoutFeedback, setShowCheckoutFeedback] = useState(false)
  const { t } = useI18n()
  const { error: showError } = useToast()
  const upgradeSuccess = false
  const [socialProof, setSocialProof] = useState<SocialProofState>({ count: 0, usernames: [] })

  const checkAuth = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.AUTH.SESSION, {
        headers: { 'Cache-Control': 'no-cache' },
      })
      if (res.ok) {
        const data = await res.json()
        setSession(data.session || data)
      } else {
        setSession(null)
      }
    } catch {
      setSession(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void checkAuth()
  }, [])

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('checkout') === 'cancelled') {
      try {
        if (sessionStorage.getItem('gitascii:checkout:cancelled') === 'handled') return
        sessionStorage.setItem('gitascii:checkout:cancelled', 'handled')
      } catch {
        // Tracking still works when storage is unavailable.
      }
      analytics.track('checkout_cancelled', { checkout_provider: 'stripe', entry_point: pathname })
      setShowCheckoutFeedback(true)
    }
  }, [pathname])

  useEffect(() => {
    fetch('/api/pro/social-proof')
      .then((r) => r.json())
      .then((d: SocialProofState) => setSocialProof(d))
      .catch(() => {})
  }, [])

  const handleUpgradeToPro = async () => {
    trackCheckoutIntent()
    if (!session || !session.username) {
      window.location.href = API_ENDPOINTS.AUTH.LOGIN(pathname)
      return
    }

    try {
      setIsUpgrading(true)
      const identifiers = await getGAIdentifiers()
      const res = await fetch(API_ENDPOINTS.PRO.SUBSCRIBE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(identifiers),
      })
      const data = await res.json()

      if (res.ok && data?.checkoutUrl) {
        const provider = data.checkoutProvider === 'stripe' ? 'stripe' : 'external'
        await analytics.trackBeforeNavigation('checkout_opened', {
          checkout_provider: provider,
          entry_point: pathname,
        })
        try {
          sessionStorage.removeItem('gitascii:checkout:cancelled')
        } catch {}
        window.location.href = data.checkoutUrl
        return
      }

      analytics.track('checkout_error', { stage: 'create_session', status_code: res.status })
      showError(t('pro.checkout.error', 'Unable to open checkout. Please try again.'))
      setIsUpgrading(false)
    } catch (err) {
      console.error('Upgrade error:', err)
      analytics.track('checkout_error', { stage: 'create_session' })
      showError(t('pro.checkout.error', 'Unable to open checkout. Please try again.'))
      setIsUpgrading(false)
    }
  }

  if (loading) {
    return <>{loadingFallback ?? <ProPaywallSkeleton />}</>
  }

  if (!session?.username || (!session.isPro && session.tier === PRO_PLAN_TIERS.FREE)) {
    return (
      <>
        <ProPaywall
          username={session?.username}
          isUpgrading={isUpgrading}
          upgradeSuccess={upgradeSuccess}
          onUpgrade={handleUpgradeToPro}
          proCustomers={socialProof.count}
          proUsernames={socialProof.usernames}
        />
        {showCheckoutFeedback && (
          <CheckoutFeedback onClose={() => setShowCheckoutFeedback(false)} />
        )}
      </>
    )
  }

  return <>{children}</>
}
