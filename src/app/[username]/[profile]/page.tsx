import type { Metadata } from 'next'

import { EditorLayout } from '@/features/editor/components/EditorLayout'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string; profile: string }>
}): Promise<Metadata> {
  const { username, profile } = await params
  const cleanUsername = username.trim()
  const cleanProfile = profile.trim()
  const title = `@${cleanUsername} - ${cleanProfile} Profile Layout`
  const description = `Customize, preview, and generate the custom ${cleanProfile} GitHub Profile README SVG layout for @${cleanUsername} using GitAscii.`
  const url = `https://git-ascii.vercel.app/${cleanUsername}/${cleanProfile}`

  return {
    title,
    description,
    keywords: [
      `${cleanUsername} ${cleanProfile} layout`,
      `${cleanUsername} GitHub README`,
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
          url: `https://git-ascii.vercel.app/api/${cleanUsername}/${cleanProfile}`,
          width: 1200,
          height: 630,
          alt: `@${cleanUsername}'s ${cleanProfile} GitAscii Profile Card`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | GitAscii`,
      description,
      images: [`https://git-ascii.vercel.app/api/${cleanUsername}/${cleanProfile}`],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function NamedProfileEditorPage({
  params,
}: {
  params: Promise<{ username: string; profile: string }>
}) {
  const { username, profile } = await params

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
        name: `@${username}`,
        item: `https://git-ascii.vercel.app/${username}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: profile,
        item: `https://git-ascii.vercel.app/${username}/${profile}`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <EditorLayout username={username} profileSlug={profile} />
    </>
  )
}
