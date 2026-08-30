import React from 'react'

export interface ProSkeletonProps {
  className?: string
}

export const ProSkeleton: React.FC<ProSkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse rounded-lg bg-white/[0.04] border border-white/[0.06] ${className}`}
    />
  )
}

export { AnalyticsDashboardSkeleton } from './analytics/AnalyticsSkeleton'
export { EmailNotificationsDashboardSkeleton } from './emails/EmailNotificationsSkeleton'
export { WidgetErrorsDashboardSkeleton } from './errors/WidgetErrorsSkeleton'
export { HealthSkeleton as HealthDashboardSkeleton, HealthSkeleton } from './health/HealthSkeleton'
export { OverviewDashboardSkeleton } from './overview/OverviewSkeleton'
export { ProfilesDashboardSkeleton } from './profiles/ProfilesSkeleton'
export { ProPaywallSkeleton } from './ProPaywallSkeleton'
export { ReportsDashboardSkeleton } from './reports/ReportsSkeleton'
