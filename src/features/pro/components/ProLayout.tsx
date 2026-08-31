'use client'

import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { PRO_PLAN_TIERS } from '@/constants'
import { API_ENDPOINTS } from '@/services/endpoints'

import { AnalyticsDashboardSkeleton } from './analytics/AnalyticsSkeleton'
import { EmailNotificationsDashboardSkeleton } from './emails/EmailNotificationsSkeleton'
import { WidgetErrorsDashboardSkeleton } from './errors/WidgetErrorsSkeleton'
import { HealthSkeleton } from './health/HealthSkeleton'
import { OverviewDashboardSkeleton } from './overview/OverviewSkeleton'
import { ProAuthGuard } from './ProAuthGuard'
import { ProfilesDashboardSkeleton } from './profiles/ProfilesSkeleton'
import { ProSidebar } from './ProSidebar'
import { ReportsDashboardSkeleton } from './reports/ReportsSkeleton'

export interface ProLayoutProps {
  children: React.ReactNode
}

/** Map each pro route prefix → its proper page skeleton. */
const ROUTE_SKELETONS: [string, React.ReactNode][] = [
  ['/pro/analytics', <AnalyticsDashboardSkeleton key="analytics" />],
  ['/pro/reports', <ReportsDashboardSkeleton key="reports" />],
  ['/pro/emails', <EmailNotificationsDashboardSkeleton key="emails" />],
  ['/pro/errors', <WidgetErrorsDashboardSkeleton key="errors" />],
  ['/pro/health', <HealthSkeleton key="health" />],
  ['/pro/profiles', <ProfilesDashboardSkeleton key="profiles" />],
]

function getSkeletonForPath(pathname: string): React.ReactNode {
  for (const [prefix, skeleton] of ROUTE_SKELETONS) {
    if (pathname.startsWith(prefix)) return skeleton
  }
  return <OverviewDashboardSkeleton key="overview" />
}

export const ProLayout: React.FC<ProLayoutProps> = ({ children }) => {
  const pathname = usePathname() ?? '/pro'

  const [username, setUsername] = useState<string | undefined>()
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>()
  const [isPro, setIsPro] = useState<boolean>(false)
  const [activeErrorsCount, setActiveErrorsCount] = useState<number>(0)

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch(API_ENDPOINTS.AUTH.SESSION)
        if (res.ok) {
          const data = await res.json()
          if (data?.session?.username) {
            const hasPro = Boolean(data.session.isPro || data.session.tier !== PRO_PLAN_TIERS.FREE)
            setUsername(data.session.username)
            setIsPro(hasPro)
            setAvatarUrl(`https://github.com/${data.session.username}.png`)

            if (hasPro) {
              fetch(API_ENDPOINTS.PRO.ERRORS())
                .then((r) => (r.ok ? r.json() : null))
                .then((d) => {
                  if (d?.errors && Array.isArray(d.errors)) {
                    const active = d.errors.filter((e: any) => e.status !== 'resolved').length
                    setActiveErrorsCount(active)
                  }
                })
                .catch(() => {})
            }
          }
        }
      } catch (err) {
        console.warn('ProLayout session load error:', err)
      }
    }

    void loadSession()

    const handleUpgrade = () => {
      void loadSession()
    }

    window.addEventListener('gitascii:pro-upgrade', handleUpgrade)
    return () => window.removeEventListener('gitascii:pro-upgrade', handleUpgrade)
  }, [])

  return (
    <div className="h-screen bg-[#070707] text-[#e5e5e5] flex overflow-hidden">
      <ProSidebar
        username={username}
        avatarUrl={avatarUrl}
        isPro={isPro}
        activeErrorsCount={activeErrorsCount}
      />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <ProAuthGuard loadingFallback={getSkeletonForPath(pathname)}>{children}</ProAuthGuard>
      </main>
    </div>
  )
}
