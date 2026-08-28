import type { Metadata } from 'next'
import React from 'react'

import { ProLayout } from '@/features/pro/components/ProLayout'

export const metadata: Metadata = {
  title: 'GitAscii Pro | Workspace & Telemetry',
  description:
    'Executive dashboard for managing multiple GitAscii profiles, analytics, error alerts, and notification logs.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ProLayout>{children}</ProLayout>
}
