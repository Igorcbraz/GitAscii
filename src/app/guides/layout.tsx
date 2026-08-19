import type { Metadata } from 'next'

import { APP_URL } from '@/constants'

export const metadata: Metadata = {
  title: 'GitHub Profile README Guides',
  description:
    'Authoritative guides, documentation, and markdown tutorials on building professional GitHub Profile READMEs.',
  keywords: [
    'How to create GitHub profile README',
    'GitHub README markdown guide',
    'GitHub profile tips 2026',
    'GitHub badges tutorial',
    'GitHub dark mode picture tag',
    'Medium GitHub profile guide',
  ],
  alternates: {
    canonical: `${APP_URL}/guides`,
  },
  openGraph: {
    title: 'GitHub Profile README Guides & Resource Articles | GitAscii',
    description:
      'Curated tutorials & Medium guides on building professional GitHub Profile READMEs.',
    url: `${APP_URL}/guides`,
    siteName: 'GitAscii',
    type: 'website',
  },
}

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
