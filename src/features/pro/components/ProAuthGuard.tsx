'use client'

import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { PRO_PLAN_TIERS } from '@/constants'
import { API_ENDPOINTS } from '@/services/endpoints'

import { ProPaywall } from './ProPaywall'
import { ProPaywallSkeleton } from './ProSkeleton'

export interface ProAuthGuardProps {
  children: React.ReactNode
}

interface UserSessionState {
  username?: string
  githubId?: number
  email?: string
  name?: string
  isPro?: boolean
  tier?: (typeof PRO_PLAN_TIERS)[keyof typeof PRO_PLAN_TIERS]
}

export const ProAuthGuard: React.FC<ProAuthGuardProps> = ({ children }) => {
  const pathname = usePathname() || '/pro'
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<UserSessionState | null>(null)
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [upgradeSuccess, setUpgradeSuccess] = useState(false)

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
      const loginUrl = `/api/auth/login?redirect_to=${encodeURIComponent(pathname)}`
      window.location.href = loginUrl
      return
    }

    try {
      setIsUpgrading(true)
      const res = await fetch(API_ENDPOINTS.PRO.SUBSCRIBE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.ok) {
        setUpgradeSuccess(true)
        setTimeout(async () => {
          await checkAuth()
          setIsUpgrading(false)
          window.dispatchEvent(new Event('gitascii:pro-upgrade'))
        }, 1200)
      } else {
        setIsUpgrading(false)
      }
    } catch (err) {
      console.error('Upgrade error:', err)
      setIsUpgrading(false)
    }
  }

  if (loading) {
    return <ProPaywallSkeleton />
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
