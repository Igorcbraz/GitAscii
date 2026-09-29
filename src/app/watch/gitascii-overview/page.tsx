import type { Metadata } from 'next'
import Link from 'next/link'

import { APP_URL } from '@/constants'

const watchUrl = `${APP_URL}/watch/gitascii-overview`
const title = 'GitAscii Overview: GitHub Profile README and ASCII Art Demo'
const description =
  'Watch a 40-second walkthrough of GitAscii: turn a GitHub profile into ASCII art, choose README templates, and edit live SVG widgets.'
const thumbnailUrl = `${APP_URL}/editor.webp`

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: watchUrl },
  openGraph: {
    title,
    description,
    url: watchUrl,
    type: 'video.other',
    images: [{ url: thumbnailUrl, width: 5640, height: 2592, alt: 'GitAscii editor preview' }],
  },
}

const videoLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoObject',
  name: title,
  description,
  thumbnailUrl,
  uploadDate: '2026-08-27T10:28:55-03:00',
  duration: 'PT40S',
  contentUrl: `${APP_URL}/presentation.mp4`,
  url: watchUrl,
  publisher: { '@type': 'Organization', name: 'GitAscii', url: APP_URL },
}

export default function GitAsciiOverviewPage() {
  return (
    <main lang="en" className="min-h-screen bg-carbon px-4 py-10 text-bone sm:px-6 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoLd) }}
      />
      <article className="mx-auto max-w-5xl">
        <Link href="/" className="font-jetbrains-mono text-sm text-signal-lime">
          GitAscii
        </Link>
        <h1 className="mt-8 font-pt-serif text-4xl text-chalk sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-3xl text-base">{description}</p>
        <video
          controls
          playsInline
          preload="none"
          poster="/editor.webp"
          width={1200}
          height={675}
          className="mt-8 aspect-video w-full bg-black"
        >
          <source src="/presentation.mp4" type="video/mp4" />
          Your browser does not support HTML video.
        </video>
        <p className="mt-8 max-w-3xl text-base leading-relaxed">
          The demo shows the GitAscii studio, where you can customize a GitHub profile README with
          ASCII art, templates, and live SVG widgets. Open the editor from the homepage to try it
          with your own GitHub username.
        </p>
      </article>
    </main>
  )
}
