'use client'

import React from 'react'

import { ProSkeleton } from './ProSkeleton'

export const ProPaywallSkeleton: React.FC = () => {
  return (
    <div className="w-full h-full overflow-y-auto bg-carbon text-chalk px-4 py-8 sm:px-6 sm:py-12 lg:px-10 select-none animate-fade-in">
      <div className="w-full max-w-7xl mx-auto space-y-12 sm:space-y-16">
        <div className="relative overflow-hidden border border-graphite/40 bg-gradient-to-b from-onyx via-carbon to-void-black">
          <div className="flex items-center justify-between px-6 py-3 border-b border-graphite/30 bg-void-black/70">
            <ProSkeleton className="h-4 w-44 rounded-sm bg-signal-lime/20" />
            <ProSkeleton className="h-3 w-32 rounded-sm" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            <div className="lg:col-span-7 px-6 sm:px-10 lg:px-12 py-10 sm:py-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-graphite/30 space-y-6">
              <div className="space-y-4">
                <ProSkeleton className="h-6 w-36 rounded-sm bg-signal-lime/15" />
                <ProSkeleton className="h-10 sm:h-12 w-3/4 rounded-sm" />
                <div className="space-y-2 pt-2">
                  <ProSkeleton className="h-4 w-full" />
                  <ProSkeleton className="h-4 w-4/5" />
                </div>

                <div className="space-y-3 pt-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <ProSkeleton className="w-5 h-5 rounded-sm flex-shrink-0 mt-0.5 bg-signal-lime/10" />
                      <div className="space-y-1.5 flex-1">
                        <ProSkeleton className="h-4 w-52" />
                        <ProSkeleton className="h-3.5 w-4/5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-graphite/30 flex flex-wrap gap-4">
                <ProSkeleton className="h-3.5 w-32" />
                <ProSkeleton className="h-3.5 w-36" />
                <ProSkeleton className="h-3.5 w-28" />
              </div>
            </div>

            <div className="lg:col-span-5 px-6 sm:px-10 py-10 sm:py-12 flex flex-col items-center justify-center text-center bg-onyx/30 space-y-6">
              <ProSkeleton className="h-6 w-44 rounded-sm bg-signal-lime/20" />
              <div className="space-y-2 flex flex-col items-center w-full">
                <div className="flex items-baseline justify-center gap-2">
                  <ProSkeleton className="h-6 w-12 rounded-sm" />
                  <ProSkeleton className="h-14 w-28 rounded-sm bg-signal-lime/10" />
                  <ProSkeleton className="h-5 w-10 rounded-sm" />
                </div>
                <ProSkeleton className="h-3.5 w-48" />
              </div>

              <div className="space-y-3 w-full max-w-sm flex flex-col items-center">
                <ProSkeleton className="h-12 w-full rounded-sm bg-signal-lime/20 border border-signal-lime/30" />
                <ProSkeleton className="h-3 w-56" />
              </div>
            </div>
          </div>
        </div>

        <div className="border border-graphite/40 bg-onyx/30 p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-graphite/30">
            <ProSkeleton className="h-4 w-48 bg-signal-lime/20" />
            <ProSkeleton className="flex-1 h-px" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <ProSkeleton className="h-3 w-28" />
                <ProSkeleton className="h-4 w-40" />
                <ProSkeleton className="h-3 w-full" />
                <ProSkeleton className="h-3 w-4/5" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-graphite/30">
            <ProSkeleton className="h-7 w-64 rounded-sm" />
            <ProSkeleton className="h-4 w-48" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="p-6 bg-onyx/40 border border-graphite/40 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <ProSkeleton className="w-8 h-8 rounded-sm bg-signal-lime/10" />
                    <ProSkeleton className="h-3 w-20" />
                  </div>
                  <ProSkeleton className="h-5 w-44" />
                  <div className="space-y-1.5">
                    <ProSkeleton className="h-3.5 w-full" />
                    <ProSkeleton className="h-3.5 w-4/5" />
                  </div>
                  <div className="pt-2 space-y-1">
                    <ProSkeleton className="h-3 w-32" />
                    <ProSkeleton className="h-3 w-36" />
                  </div>
                </div>
                <div className="pt-3 border-t border-graphite/20 flex items-center justify-between">
                  <ProSkeleton className="h-3 w-24" />
                  <ProSkeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-graphite/40 bg-void-black/40 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 bg-void-black/60 border-b border-graphite/30">
            <ProSkeleton className="h-4 w-48 bg-signal-lime/20" />
            <ProSkeleton className="flex-1 h-px" />
          </div>
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-graphite/20"
              >
                <ProSkeleton className="h-4 w-1/3" />
                <ProSkeleton className="h-4 w-20" />
                <ProSkeleton className="h-4 w-24 bg-signal-lime/10" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-graphite/30">
            <ProSkeleton className="h-4 w-40 bg-signal-lime/20" />
            <ProSkeleton className="flex-1 h-px" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border border-graphite/40 bg-onyx/20 p-5">
                <ProSkeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
