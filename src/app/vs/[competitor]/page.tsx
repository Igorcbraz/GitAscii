import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { APP_URL, COMPETITORS_MAP } from '@/constants'
import { CompetitorDetailClient } from '@/features/vs/CompetitorDetailClient'

export const dynamicParams = false

export function generateStaticParams() {
  return Object.keys(COMPETITORS_MAP).map((competitor) => ({ competitor }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ competitor: string }>
}): Promise<Metadata> {
  const { competitor } = await params
  const data = COMPETITORS_MAP[competitor]
  if (!data) return {}

  const url = `${APP_URL}/vs/${competitor}`

  return {
    title: `${data.title} | GitAscii`,
    description: data.description,
    keywords: [
      `GitAscii vs ${data.name}`,
      `${data.name} alternative`,
      'GitHub profile generator comparison',
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${data.title} | GitAscii`,
      description: data.description,
      url,
      siteName: 'GitAscii',
      type: 'website',
    },
  }
}

export default async function CompetitorPage({
  params,
}: {
  params: Promise<{ competitor: string }>
}) {
  const { competitor } = await params
  const data = COMPETITORS_MAP[competitor]
  if (!data) notFound()

  const webPageLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: data.title,
    description: data.description,
    url: `${APP_URL}/vs/${data.slug}`,
  }

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
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
        name: 'Comparisons',
        item: `${APP_URL}/vs`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: data.name,
        item: `${APP_URL}/vs/${data.slug}`,
      },
    ],
  }

  const allCompetitors = Object.keys(COMPETITORS_MAP)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <CompetitorDetailClient data={data} allCompetitors={allCompetitors} />
    </>
  )
}
