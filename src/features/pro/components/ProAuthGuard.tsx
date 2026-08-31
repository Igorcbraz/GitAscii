'use client'

import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { PRO_PLAN_TIERS } from '@/constants'
import { API_ENDPOINTS } from '@/services/endpoints'

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

export const ProAuthGuard: React.FC<ProAuthGuardProps> = ({ children, loadingFallback }) => {
  const pathname = usePathname() || '/pro'
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<UserSessionState | null>(null)
  const [isUpgrading, setIsUpgrading] = useState(false)
  const upgradeSuccess = false

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

  const handleUpgradeToPro = async () => {
    if (!session || !session.username) {
      window.location.href = API_ENDPOINTS.AUTH.LOGIN(pathname)
      return
    }

    try {
      setIsUpgrading(true)
      const res = await fetch(API_ENDPOINTS.PRO.SUBSCRIBE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()

      if (res.ok && data?.checkoutUrl) {
        window.location.href = data.checkoutUrl
        return
      }

      setIsUpgrading(false)
    } catch (err) {
      console.error('Upgrade error:', err)
      setIsUpgrading(false)
    }
  }

  if (loading) {
    return <>{loadingFallback ?? <ProPaywallSkeleton />}</>
  }

  if (!session?.username || (!session.isPro && session.tier === PRO_PLAN_TIERS.FREE)) {
    return (
      <ProPaywall
        username={session?.username}
        isUpgrading={isUpgrading}
        upgradeSuccess={upgradeSuccess}
        onUpgrade={handleUpgradeToPro}
      />
    )
  }

  return <>{children}</>
}
