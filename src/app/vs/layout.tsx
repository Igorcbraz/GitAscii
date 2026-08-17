import type { Metadata } from 'next'

import { APP_URL } from '@/constants'

export const metadata: Metadata = {
  title: 'GitAscii vs Competitors & Tools',
  description:
    'Compare GitAscii with Readme.so, GPRM, and other README makers: live SVGs, ASCII art engine, and 13+ themes.',
  keywords: [
    'GitAscii vs Readme.so',
    'GitAscii vs GPRM',
    'GitHub profile generator alternatives',
    'Best GitHub README maker comparison',
  ],
  alternates: {
    canonical: `${APP_URL}/vs`,
  },
  openGraph: {
    title: 'GitAscii vs Competitors & Alternatives | 2026 Comparison',
    description: 'Detailed feature matrix comparing GitAscii with Readme.so and GPRM.',
    url: `${APP_URL}/vs`,
    siteName: 'GitAscii',
    type: 'website',
  },
}

export default function VsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
