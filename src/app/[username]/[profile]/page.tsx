import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { APP_URL } from '@/constants'
import { EditorLayout } from '@/features/editor/components/EditorLayout'
import { isValidGitHubUsername } from '@/utils/githubUsername'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string; profile: string }>
}): Promise<Metadata> {
  const { username, profile } = await params
  const cleanUsername = username.trim()
  const cleanProfile = profile.trim()

  if (
    cleanUsername === 'index.html' ||
    cleanUsername === 'index.php' ||
    cleanUsername === 'index'
  ) {
    redirect('/')
  }

  if (!isValidGitHubUsername(cleanUsername) || !cleanProfile || cleanProfile.includes('.')) {
    notFound()
  }

  const title = `@${cleanUsername} - ${cleanProfile} Layout`
  const description = `Customize and preview the ${cleanProfile} GitHub Profile README layout for @${cleanUsername}.`
  const url = `${APP_URL}/${cleanUsername}/${cleanProfile}`

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
          url: `${APP_URL}/api/${cleanUsername}/${cleanProfile}`,
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
      images: [`${APP_URL}/api/${cleanUsername}/${cleanProfile}`],
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
  const cleanUsername = username.trim()
  const cleanProfile = profile.trim()

  if (
    cleanUsername === 'index.html' ||
    cleanUsername === 'index.php' ||
    cleanUsername === 'index'
  ) {
    redirect('/')
  }

  if (!isValidGitHubUsername(cleanUsername) || !cleanProfile || cleanProfile.includes('.')) {
    notFound()
  }

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
        name: `@${username}`,
        item: `${APP_URL}/${username}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: profile,
        item: `${APP_URL}/${username}/${profile}`,
      },
    ],
  }

  const safeJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c')

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }}
      />
      <EditorLayout username={username} profileSlug={profile} />
    </>
  )
}
