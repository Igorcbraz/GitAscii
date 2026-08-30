import './globals.css'

import type { Metadata, Viewport } from 'next'
import { Barlow_Condensed, Inter_Tight, JetBrains_Mono, PT_Serif, Teko } from 'next/font/google'
import { headers } from 'next/headers'

import { ToastProvider } from '@/components/ui/toast'
import { APP_URL, EXTERNAL_LINKS, LANDING_FAQS } from '@/constants'
import { I18nProvider } from '@/i18n'
import { AutoAnalyticsTracker } from '@/lib/analytics'
import { ConsentControlledScripts } from '@/lib/analytics/ConsentControlledScripts'
import { WebVitalsReporter } from '@/lib/analytics/web-vitals'

const ptSerif = PT_Serif({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-pt-serif',
  display: 'swap',
})

const interTight = Inter_Tight({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-inter-tight',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

const barlowCondensed = Barlow_Condensed({
  weight: ['600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-barlow-condensed',
  display: 'swap',
})

const teko = Teko({
  weight: ['500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-teko',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#c5ff4a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'GitAscii — GitHub Profile README & ASCII Generator',
    template: '%s | GitAscii',
  },
  description:
    'Create stunning custom GitHub Profile READMEs with live SVGs, ASCII art generator engine, and an interactive visual editor. Fast, free, and open source for developers.',
  keywords: [
    'GitHub profile README generator',
    'GitHub ASCII art generator',
    'GitHub stats widget',
    'GitHub profile templates',
    'Developer portfolio builder',
    'README.md editor online',
    'GitHub profile customization',
    'Open source GitHub profile maker',
    'Gerador de README GitHub',
    'Generador de perfil de GitHub',
    'Generative Engine Optimization',
    'Answer Engine Optimization',
  ],
  authors: [{ name: 'GitAscii Team', url: APP_URL }],
  creator: 'GitAscii',
  publisher: 'GitAscii',
  category: 'Developer Tools',
  classification: 'Software Development & Developer Tools',
  applicationName: 'GitAscii',
  openGraph: {
    title: 'GitAscii — GitHub Profile README & ASCII Generator',
    description:
      'Create stunning custom GitHub Profile READMEs with live SVGs, ASCII art generator engine, and an interactive visual editor. Fast, free, and open source for developers.',
    url: APP_URL,
    siteName: 'GitAscii',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${APP_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'GitAscii — GitHub Profile README & ASCII Generator',
        type: 'image/png',
      },
      {
        url: `${APP_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'GitAscii — GitHub Profile README & ASCII Generator (Dynamic)',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GitAscii — GitHub Profile README & ASCII Generator',
    description:
      'Create stunning custom GitHub Profile READMEs with live SVGs, ASCII art generator engine, and an interactive visual editor. Fast, free, and open source for developers.',
    images: [`${APP_URL}/og-image.png`],
    creator: '@git_ascii',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: APP_URL,
    languages: {
      en: APP_URL,
      'pt-BR': `${APP_URL}?lang=pt`,
      'es-ES': `${APP_URL}?lang=es`,
      'zh-CN': `${APP_URL}?lang=zh`,
      'x-default': APP_URL,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/manifest.webmanifest',
}

const softwareLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'GitAscii',
  operatingSystem: 'Any',
  applicationCategory: 'DeveloperApplication',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  description:
    'Create stunning GitHub Profile READMEs with premium SVGs, ASCII art, and a powerful visual editor.',
  url: APP_URL,
  author: {
    '@type': 'Organization',
    name: 'GitAscii',
    url: APP_URL,
  },
  featureList: [
    'Visual Drag-and-Drop Profile Editor',
    'Real-time Live SVG Generation',
    'Image-to-ASCII Art Converter Engine',
    '13+ Handcrafted Theme Templates',
    'Dark & Light Mode Automatic Theme Switching',
    'Multiple Named Profiles per GitHub Account',
  ],
}

const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'GitAscii',
  url: APP_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${APP_URL}/{search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

const orgLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'GitAscii',
  url: APP_URL,
  logo: `${APP_URL}/icon-512.png`,
  sameAs: [EXTERNAL_LINKS.GITHUB_REPO],
}

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: LANDING_FAQS.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersList = await headers()
  const queryLang = headersList.get('x-lang')
  const cookieHeader = headersList.get('cookie') || ''
  const acceptLanguage = headersList.get('accept-language') || ''

  let ssrLang = 'en'
  if (queryLang === 'pt') {
    ssrLang = 'pt-BR'
  } else if (queryLang === 'es') {
    ssrLang = 'es-ES'
  } else if (queryLang === 'zh') {
    ssrLang = 'zh-CN'
  } else if (queryLang === 'en') {
    ssrLang = 'en'
  } else if (cookieHeader.includes('gitascii_lang=pt')) {
    ssrLang = 'pt-BR'
  } else if (cookieHeader.includes('gitascii_lang=es')) {
    ssrLang = 'es-ES'
  } else if (cookieHeader.includes('gitascii_lang=zh')) {
    ssrLang = 'zh-CN'
  } else if (cookieHeader.includes('gitascii_lang=en')) {
    ssrLang = 'en'
  } else if (
    acceptLanguage.startsWith('pt') ||
    acceptLanguage.includes('pt-BR') ||
    acceptLanguage.includes('pt-PT')
  ) {
    ssrLang = 'pt-BR'
  } else if (acceptLanguage.startsWith('es')) {
    ssrLang = 'es-ES'
  } else if (acceptLanguage.startsWith('zh')) {
    ssrLang = 'zh-CN'
  }

  return (
    <html
      lang={ssrLang}
      suppressHydrationWarning
      className={`${ptSerif.variable} ${interTight.variable} ${jetbrainsMono.variable} ${barlowCondensed.variable} ${teko.variable}`}
    >
      <head>
        <link
          rel="preconnect"
          href="https://avatars.githubusercontent.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://img.shields.io" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.github.com" />
      </head>
      <body suppressHydrationWarning>
        <I18nProvider>
          <ToastProvider>
            <AutoAnalyticsTracker>
              <WebVitalsReporter />
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareLd) }}
              />
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
              />
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
              />
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
              />
              {children}
            </AutoAnalyticsTracker>
          </ToastProvider>
        </I18nProvider>
        <ConsentControlledScripts />
      </body>
    </html>
  )
}
