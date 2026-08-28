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

export const ProDashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-xl bg-[#141414] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <ProSkeleton className="h-4 w-24" />
              <ProSkeleton className="h-5 w-5 rounded-full" />
            </div>
            <ProSkeleton className="h-8 w-32" />
            <ProSkeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      <div className="p-6 rounded-xl bg-[#141414] border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <ProSkeleton className="h-5 w-40" />
            <ProSkeleton className="h-3 w-64" />
          </div>
          <ProSkeleton className="h-8 w-32" />
        </div>
        <ProSkeleton className="h-64 w-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-[#141414] border border-white/5 space-y-4">
          <ProSkeleton className="h-5 w-36" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <ProSkeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
        <div className="p-6 rounded-xl bg-[#141414] border border-white/5 space-y-4">
          <ProSkeleton className="h-5 w-36" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <ProSkeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export { AnalyticsDashboardSkeleton } from './analytics/AnalyticsSkeleton'
export { ProPaywallSkeleton } from './ProPaywallSkeleton'
