import type { Metadata } from 'next'

import { APP_URL } from '@/constants'
import { EditorLayout } from '@/features/editor/components/EditorLayout'
import { API_ENDPOINTS } from '@/services/endpoints'

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
  const url = `${APP_URL}/${cleanUsername}`

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
          url: `${APP_URL}/${cleanUsername}/opengraph-image`,
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
      images: [`${APP_URL}/${cleanUsername}/opengraph-image`],
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
        item: APP_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Explore Profiles',
        item: `${APP_URL}/explore`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `@${username}`,
        item: `${APP_URL}/${username}`,
      },
    ],
  }

  const profileLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: `@${username}'s GitHub Profile README`,
    url: `${APP_URL}/${username}`,
    mainEntity: {
      '@type': 'Person',
      name: username,
      identifier: username,
      sameAs: API_ENDPOINTS.GITHUB.USER_PROFILE(username),
    },
  }

  const safeJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c')

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(profileLd) }}
      />
      <EditorLayout username={username} profileSlug="default" autoGenerate={autoGenerate} />
    </>
  )
}
