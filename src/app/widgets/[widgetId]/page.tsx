import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { APP_URL, WIDGET_DOCS_MAP, type WidgetDocData } from '@/constants'
import { WidgetDetailClient } from '@/features/widgets/WidgetDetailClient'

export const dynamicParams = false

export type { WidgetDocData }

const widgetMap = WIDGET_DOCS_MAP

export function generateStaticParams() {
  return Object.keys(widgetMap).map((widgetId) => ({ widgetId }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ widgetId: string }>
}): Promise<Metadata> {
  const { widgetId } = await params
  const data = widgetMap[widgetId]
  if (!data) return {}

  const url = `${APP_URL}/widgets/${widgetId}`

  return {
    title: `${data.title} | GitAscii`,
    description: data.description,
    keywords: [
      `${data.name} GitHub`,
      `${data.id} widget README`,
      'GitHub profile widgets',
      'GitAscii widgets',
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
    twitter: {
      card: 'summary_large_image',
      title: `${data.title} | GitAscii`,
      description: data.description,
    },
  }
}

export default async function WidgetDetailPage({
  params,
}: {
  params: Promise<{ widgetId: string }>
}) {
  const { widgetId } = await params
  const data = widgetMap[widgetId]
  if (!data) notFound()

  const allWidgets = Object.keys(widgetMap)

  const softwareLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: data.title,
    operatingSystem: 'Any',
    applicationCategory: 'DeveloperApplication',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description: data.description,
    url: `${APP_URL}/widgets/${data.id}`,
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
        name: 'Widgets',
        item: `${APP_URL}/widgets`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: data.name,
        item: `${APP_URL}/widgets/${data.id}`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <WidgetDetailClient data={data} allWidgets={allWidgets} widgetMap={widgetMap} />
    </>
  )
}
