import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GitAscii vs Competitors & Alternatives (2026 Comparison)',
  description:
    'Compare GitAscii with Readme.so, GPRM, and generic GitHub profile generators. Feature breakdown, live SVG rendering, ASCII art engine, and theme comparison.',
  keywords: [
    'GitAscii vs Readme.so',
    'GitAscii vs GPRM',
    'GitHub profile generator alternatives',
    'Best GitHub README maker comparison',
  ],
  alternates: {
    canonical: 'https://git-ascii.vercel.app/vs',
  },
  openGraph: {
    title: 'GitAscii vs Competitors & Alternatives | 2026 Comparison',
    description: 'Detailed feature matrix comparing GitAscii with Readme.so and GPRM.',
    url: 'https://git-ascii.vercel.app/vs',
    siteName: 'GitAscii',
    type: 'website',
  },
}

export default function VsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
