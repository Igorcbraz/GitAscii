import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Explore Community GitHub Profiles & Portfolios (2026)',
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
    canonical: 'https://git-ascii.vercel.app/explore',
  },
  openGraph: {
    title: 'Explore Community GitHub Profiles | GitAscii Directory',
    description:
      'Community gallery of real developer profiles, GitHub READMEs, and ASCII portfolios.',
    url: 'https://git-ascii.vercel.app/explore',
    siteName: 'GitAscii',
    type: 'website',
  },
}

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
