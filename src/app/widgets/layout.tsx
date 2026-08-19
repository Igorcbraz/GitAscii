import type { Metadata } from 'next'

import { APP_URL } from '@/constants'

export const metadata: Metadata = {
  title: 'GitHub Profile Widgets & SVGs',
  description:
    'Dynamic SVG widgets for GitHub profile READMEs: live stats, streak counters, top languages, and ASCII art banners.',
  keywords: [
    'GitHub profile widgets',
    'GitHub stats widget SVG',
    'GitHub streak counter',
    'GitHub top languages card',
    'ASCII art generator for GitHub',
    'Dynamic SVG badges README',
  ],
  alternates: {
    canonical: `${APP_URL}/widgets`,
  },
  openGraph: {
    title: 'Free GitHub Profile Widgets & Dynamic SVGs Showcase | GitAscii',
    description:
      'Live SVG stats, streak counters, language charts, and ASCII art widgets for GitHub READMEs. Open source & zero build step.',
    url: `${APP_URL}/widgets`,
    siteName: 'GitAscii',
    type: 'website',
  },
}

export default function WidgetsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
