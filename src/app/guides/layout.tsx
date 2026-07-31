import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GitHub Profile README Guides & Resource Articles (2026)',
  description:
    'Curated collection of authoritative guides, Medium articles, official GitHub documentation, and tutorials on building professional GitHub Profile READMEs.',
  keywords: [
    'How to create GitHub profile README',
    'GitHub README markdown guide',
    'GitHub profile tips 2026',
    'GitHub badges tutorial',
    'GitHub dark mode picture tag',
    'Medium GitHub profile guide',
  ],
  alternates: {
    canonical: 'https://git-ascii.vercel.app/guides',
  },
  openGraph: {
    title: 'GitHub Profile README Guides & Resource Articles | GitAscii',
    description:
      'Curated tutorials & Medium guides on building professional GitHub Profile READMEs.',
    url: 'https://git-ascii.vercel.app/guides',
    siteName: 'GitAscii',
    type: 'website',
  },
}

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
