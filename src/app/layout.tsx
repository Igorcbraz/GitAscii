import './globals.css'

import type { Metadata } from 'next'
import { Inter_Tight, JetBrains_Mono, PT_Serif } from 'next/font/google'

const ptSerif = PT_Serif({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pt-serif',
  display: 'swap',
})

const interTight = Inter_Tight({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-inter-tight',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'GitAscii — Premium GitHub Profile READMEs',
  description:
    'Create stunning GitHub Profile READMEs with premium SVGs, ASCII art, and a powerful visual editor. The best open source tool for GitHub profile customization.',
  keywords: [
    'GitHub',
    'profile',
    'README',
    'SVG',
    'ASCII art',
    'generator',
    'developer',
    'portfolio',
  ],
  authors: [{ name: 'GitAscii' }],
  openGraph: {
    title: 'GitAscii — Premium GitHub Profile READMEs',
    description:
      'Create stunning GitHub Profile READMEs with premium SVGs, ASCII art, and a powerful visual editor.',
    type: 'website',
    locale: 'en_US',
    siteName: 'GitAscii',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GitAscii — Premium GitHub Profile READMEs',
    description: 'Create stunning GitHub Profile READMEs with premium SVGs and a visual editor.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
}

import { GoogleAnalytics } from '@next/third-parties/google'

import { ToastProvider } from '@/components/ui/toast'
import { I18nProvider } from '@/i18n'
import { AutoAnalyticsTracker } from '@/lib/analytics'
import { WebVitalsReporter } from '@/lib/analytics/web-vitals'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${ptSerif.variable} ${interTight.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <I18nProvider>
          <ToastProvider>
            <AutoAnalyticsTracker>
              <WebVitalsReporter />
              {children}
            </AutoAnalyticsTracker>
          </ToastProvider>
        </I18nProvider>
        <GoogleAnalytics gaId="G-GDBZXFCBLQ" />
      </body>
    </html>
  )
}
