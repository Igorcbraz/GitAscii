import type { Metadata } from 'next'
import Link from 'next/link'

import { EditorLayout } from '@/features/editor/components/EditorLayout'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const { username } = await params
  const cleanUsername = username.trim()
  const title = `@${cleanUsername} GitHub Profile README Generator`
  const description = `Create, edit, and preview custom GitHub Profile README SVGs, stats widgets, and ASCII art for @${cleanUsername} using GitAscii visual editor.`
  const url = `https://git-ascii.vercel.app/${cleanUsername}`

  return {
    title,
    description,
    keywords: [
      `${cleanUsername} GitHub profile`,
      `${cleanUsername} README generator`,
      `${cleanUsername} GitHub stats`,
      'GitHub Profile README generator',
      'ASCII art generator',
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} | GitAscii`,
      description,
      url,
      siteName: 'GitAscii',
      type: 'profile',
      images: [
        {
          url: `https://git-ascii.vercel.app/${cleanUsername}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `@${cleanUsername}'s GitAscii GitHub Profile Card`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | GitAscii`,
      description,
      images: [`https://git-ascii.vercel.app/${cleanUsername}/opengraph-image`],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function DefaultEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>
  searchParams: Promise<{ generate?: string }>
}) {
  const { username } = await params
  const { generate } = await searchParams

  const autoGenerate = generate === 'true'

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://git-ascii.vercel.app',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Explore Profiles',
        item: 'https://git-ascii.vercel.app/explore',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `@${username}`,
        item: `https://git-ascii.vercel.app/${username}`,
      },
    ],
  }

  const profileLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: `@${username}'s GitHub Profile README`,
    url: `https://git-ascii.vercel.app/${username}`,
    mainEntity: {
      '@type': 'Person',
      name: username,
      identifier: username,
      sameAs: `https://github.com/${username}`,
    },
  }

  return (
    <div className="flex flex-col min-h-screen bg-carbon">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profileLd) }}
      />
      <div className="flex-1">
        <EditorLayout username={username} profileSlug="default" autoGenerate={autoGenerate} />
      </div>
      <footer className="border-t border-graphite bg-void-black py-4 px-6 text-center font-inter-tight text-note text-ash flex flex-wrap items-center justify-between gap-4">
        <div>
          <span>
            GitAscii &copy; {new Date().getFullYear()} — Free GitHub Profile README Generator
          </span>
        </div>
        <nav className="flex items-center gap-6">
          <Link href="/" className="hover:text-signal-lime">
            Home
          </Link>
          <Link href="/templates" className="hover:text-signal-lime">
            Templates
          </Link>
          <Link href="/widgets" className="hover:text-signal-lime">
            Widgets
          </Link>
          <Link href="/explore" className="hover:text-signal-lime">
            Explore
          </Link>
          <Link href="/guides" className="hover:text-signal-lime">
            Guides
          </Link>
        </nav>
      </footer>
    </div>
  )
}
