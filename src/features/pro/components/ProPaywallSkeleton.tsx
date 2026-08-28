'use client'

import React from 'react'

import { ProSkeleton } from './ProSkeleton'

export const ProPaywallSkeleton: React.FC = () => {
  return (
    <div className="w-full h-full overflow-y-auto bg-[#070707] text-[#e5e5e5] px-4 py-8 sm:px-6 sm:py-12 lg:px-8 select-none animate-fade-in">
      <div className="max-w-5xl mx-auto space-y-10 sm:space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto flex flex-col items-center">
          <ProSkeleton className="h-6 w-48 rounded-full" />
          <ProSkeleton className="h-10 sm:h-12 w-80 max-w-full rounded-xl" />
          <div className="space-y-2 w-full flex flex-col items-center">
            <ProSkeleton className="h-4 w-full max-w-2xl" />
            <ProSkeleton className="h-4 w-3/4 max-w-lg" />
          </div>
        </div>

        <div className="relative rounded-2xl bg-[#0e0e0e] border border-white/10 p-6 sm:p-8 lg:p-10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <ProSkeleton className="h-7 w-48 rounded-lg" />
                  <ProSkeleton className="h-6 w-28 rounded-full" />
                </div>
                <div className="space-y-1.5 pt-1">
                  <ProSkeleton className="h-4 w-full" />
                  <ProSkeleton className="h-4 w-4/5" />
                </div>
              </div>

              <div className="space-y-3 pt-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <ProSkeleton className="w-5 h-5 rounded-md flex-shrink-0 mt-0.5" />
                    <div className="space-y-1.5 flex-1">
                      <ProSkeleton className="h-4 w-52" />
                      <ProSkeleton className="h-3.5 w-full max-w-md" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/5 flex flex-wrap gap-y-2 gap-x-6">
                <ProSkeleton className="h-4 w-44" />
                <ProSkeleton className="h-4 w-40" />
                <ProSkeleton className="h-4 w-40" />
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-center">
              <div className="p-6 sm:p-7 rounded-xl bg-[#141414] border border-white/10 space-y-6 text-center flex flex-col items-center">
                <ProSkeleton className="h-6 w-44 rounded-full" />

                <div className="space-y-2 flex flex-col items-center w-full">
                  <div className="flex items-baseline justify-center gap-2">
                    <ProSkeleton className="h-5 w-12 rounded" />
                    <ProSkeleton className="h-12 w-24 rounded-lg bg-[#c5ff4a]/10" />
                    <ProSkeleton className="h-5 w-10 rounded" />
                  </div>
                  <ProSkeleton className="h-3.5 w-48" />
                </div>

                <div className="space-y-2.5 w-full flex flex-col items-center">
                  <ProSkeleton className="h-12 w-full rounded-xl bg-[#c5ff4a]/20 border border-[#c5ff4a]/30" />
                  <ProSkeleton className="h-3 w-56" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="text-center space-y-2 flex flex-col items-center">
            <ProSkeleton className="h-7 w-72 rounded-lg" />
            <ProSkeleton className="h-4 w-96 max-w-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="p-5 rounded-xl bg-[#111111] border border-white/[0.07] flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <ProSkeleton className="w-8 h-8 rounded-lg" />
                    <ProSkeleton className="h-4 w-20 rounded" />
                  </div>
                  <ProSkeleton className="h-5 w-40 rounded" />
                  <div className="space-y-1.5">
                    <ProSkeleton className="h-3.5 w-full" />
                    <ProSkeleton className="h-3.5 w-4/5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="text-center space-y-2 flex flex-col items-center">
            <ProSkeleton className="h-7 w-64 rounded-lg" />
            <ProSkeleton className="h-4 w-80 max-w-full" />
          </div>

          <div className="rounded-xl bg-[#0e0e0e] border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[540px]">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="py-3.5 px-5 w-1/2">
                      <ProSkeleton className="h-4 w-28" />
                    </th>
                    <th className="py-3.5 px-5 text-center w-36">
                      <ProSkeleton className="h-4 w-20 mx-auto" />
                    </th>
                    <th className="py-3.5 px-5 text-center w-48 bg-[#c5ff4a]/[0.02]">
                      <ProSkeleton className="h-4 w-28 mx-auto bg-[#c5ff4a]/10" />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <tr key={i}>
                      <td className="py-3.5 px-5">
                        <ProSkeleton className="h-4 w-44" />
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <ProSkeleton className="h-4 w-16 mx-auto" />
                      </td>
                      <td className="py-3.5 px-5 text-center bg-[#c5ff4a]/[0.02]">
                        <ProSkeleton className="h-4 w-20 mx-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="text-center space-y-2 flex flex-col items-center">
            <ProSkeleton className="h-4 w-16 rounded" />
            <ProSkeleton className="h-7 w-60 rounded-lg" />
          </div>

          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl bg-[#111111] border border-white/[0.07] p-4 sm:p-5 flex items-center justify-between"
              >
                <ProSkeleton className="h-4 w-3/4 max-w-md" />
                <ProSkeleton className="w-4 h-4 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
