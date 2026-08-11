import type { Metadata } from 'next'

import { APP_URL } from '@/constants'

export const metadata: Metadata = {
  title: '13+ Best GitHub Profile README Templates & Themes (2026)',
  description:
    'Explore 13+ handcrafted, responsive GitHub Profile README templates. From Terminal CLI and Cyberpunk to Minimalist, Dracula, Nord, and Tokyo Night. 100% Free & Open Source.',
  keywords: [
    'GitHub profile README templates',
    'Best GitHub README templates',
    'Terminal GitHub profile template',
    'Cyberpunk GitHub profile template',
    'Dracula theme README',
    'Nord theme GitHub profile',
    'Free GitHub profile maker',
  ],
  alternates: {
    canonical: `${APP_URL}/templates`,
  },
  openGraph: {
    title: '13+ Best GitHub Profile README Templates | GitAscii Marketplace',
    description:
      'Handcrafted, responsive GitHub Profile README templates with live SVG stats, ASCII art, and custom themes.',
    url: `${APP_URL}/templates`,
    siteName: 'GitAscii',
    type: 'website',
    images: [
      {
        url: `${APP_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'GitAscii GitHub Profile README Templates Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '13+ Best GitHub Profile README Templates | GitAscii',
    description: 'Handcrafted GitHub Profile README templates with live SVG widgets and ASCII art.',
  },
}

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
