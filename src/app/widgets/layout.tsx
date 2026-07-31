import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free GitHub Profile Widgets & Dynamic SVGs Showcase (2026)',
  description:
    'Discover dynamic SVG widgets for GitHub profile READMEs: real-time commit stats, contribution streak counters, top programming languages, ASCII art converters, and tech stack badges.',
  keywords: [
    'GitHub profile widgets',
    'GitHub stats widget SVG',
    'GitHub streak counter',
    'GitHub top languages card',
    'ASCII art generator for GitHub',
    'Dynamic SVG badges README',
  ],
  alternates: {
    canonical: 'https://git-ascii.vercel.app/widgets',
  },
  openGraph: {
    title: 'Free GitHub Profile Widgets & Dynamic SVGs Showcase | GitAscii',
    description:
      'Live SVG stats, streak counters, language charts, and ASCII art widgets for GitHub READMEs. Open source & zero build step.',
    url: 'https://git-ascii.vercel.app/widgets',
    siteName: 'GitAscii',
    type: 'website',
  },
}

export default function WidgetsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
