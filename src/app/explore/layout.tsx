import type { Metadata } from 'next'

import { APP_URL } from '@/constants'

export const metadata: Metadata = {
  title: 'Explore Community GitHub Profiles',
  description:
    'Discover real developer profiles, custom GitHub README layouts, and live SVG portfolios created with GitAscii.',
  keywords: [
    'GitHub profile examples',
    'Best developer profile READMEs',
    'GitHub README showcase',
    'Developer portfolio directory',
    'GitAscii community profiles',
  ],
  alternates: {
    canonical: `${APP_URL}/explore`,
  },
  openGraph: {
    title: 'Explore Community GitHub Profiles | GitAscii Directory',
    description:
      'Community gallery of real developer profiles, GitHub READMEs, and ASCII portfolios.',
    url: `${APP_URL}/explore`,
    siteName: 'GitAscii',
    type: 'website',
  },
}

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
