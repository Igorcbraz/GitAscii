import type { Metadata } from 'next'
import Link from 'next/link'

import { APP_URL } from '@/constants'

const watchUrl = `${APP_URL}/watch/gitascii-overview-mobile`
const title = 'GitAscii Mobile Overview: GitHub Profile README and ASCII Art Demo'
const description =
  'Watch the portrait-format GitAscii presentation for phones: explore ASCII art, GitHub profile README templates, and the interactive editor.'
const thumbnailUrl = `${APP_URL}/editor-poster(mobile).webp`

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: watchUrl },
  openGraph: {
    title,
    description,
    url: watchUrl,
    type: 'video.other',
    images: [{ url: thumbnailUrl, width: 941, height: 1672, alt: 'GitAscii mobile presentation' }],
  },
}

const videoLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoObject',
  name: title,
  description,
  thumbnailUrl,
  uploadDate: '2026-09-30',
  contentUrl: `${APP_URL}/presentation(mobile).mp4`,
  url: watchUrl,
  publisher: { '@type': 'Organization', name: 'GitAscii', url: APP_URL },
}

export default function GitAsciiOverviewMobilePage() {
  return (
    <main lang="en" className="min-h-screen bg-carbon px-4 py-10 text-bone sm:px-6 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoLd) }}
      />
      <article className="mx-auto max-w-3xl">
        <Link href="/" className="font-jetbrains-mono text-sm text-signal-lime">
          GitAscii
        </Link>
        <h1 className="mt-8 font-pt-serif text-4xl text-chalk sm:text-5xl">{title}</h1>
        <p className="mt-4 text-base">{description}</p>
        <video
          controls
          playsInline
          preload="none"
          poster="/editor-poster(mobile).webp"
          width={941}
          height={1672}
          className="mx-auto mt-8 aspect-[941/1672] w-full max-w-sm bg-black"
        >
          <source src="/presentation(mobile).mp4" type="video/mp4" />
          Your browser does not support HTML video.
        </video>
        <p className="mt-4 text-sm">
          Prefer a wide screen?{' '}
          <Link href="/watch/gitascii-overview" className="text-signal-lime underline">
            Watch the desktop version
          </Link>
          .
        </p>
        <p className="mt-8 text-base leading-relaxed">
          See how GitAscii turns a GitHub profile into a customizable README with ASCII art,
          templates, and live SVG widgets. Open the editor from the homepage to make your own.
        </p>
      </article>
    </main>
  )
}
