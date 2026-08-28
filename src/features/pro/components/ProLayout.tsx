'use client'

import React, { useEffect, useState } from 'react'

import { API_ENDPOINTS } from '@/services/endpoints'

import { ProAuthGuard } from './ProAuthGuard'
import { ProSidebar } from './ProSidebar'

export interface ProLayoutProps {
  children: React.ReactNode
}

export const ProLayout: React.FC<ProLayoutProps> = ({ children }) => {
  const [username, setUsername] = useState<string | undefined>()
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>()
  const [activeErrorsCount, setActiveErrorsCount] = useState<number>(0)

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch(API_ENDPOINTS.AUTH.SESSION)
        if (res.ok) {
          const data = await res.json()
          if (data?.session?.username) {
            setUsername(data.session.username)
            setAvatarUrl(`https://github.com/${data.session.username}.png`)

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
      } catch (err) {
        console.warn('ProLayout session load error:', err)
      }
    }

    void loadSession()
  }, [])

  return (
    <div className="h-screen bg-[#070707] text-[#e5e5e5] flex overflow-hidden">
      <ProSidebar username={username} avatarUrl={avatarUrl} activeErrorsCount={activeErrorsCount} />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <ProAuthGuard>{children}</ProAuthGuard>
      </main>
    </div>
  )
}
