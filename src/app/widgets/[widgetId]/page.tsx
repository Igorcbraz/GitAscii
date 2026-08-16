import { ArrowRight, Github } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { APP_URL, WIDGET_DOCS_MAP, type WidgetDocData } from '@/constants'
import { Footer } from '@/features/landing/components/Footer'
import Navbar from '@/features/landing/components/Navbar'

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
    <main className="min-h-screen bg-carbon text-chalk font-inter-tight">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <Navbar />

      <div className="border-b border-graphite bg-void-black/80 backdrop-blur-md px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Breadcrumbs items={[{ label: 'Widgets', href: '/widgets' }, { label: data.name }]} />
        </div>
      </div>

      <div className="bg-void-black border-b border-graphite px-6 py-3 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <span className="font-jetbrains-mono text-caption text-ash uppercase tracking-wider shrink-0 mr-2">
            [ ALL WIDGETS ]
          </span>
          {allWidgets.map((wId) => {
            const wItem = widgetMap[wId]
            const isActive = wId === data.id
            return (
              <Link
                key={wId}
                href={`/widgets/${wId}`}
                className={`px-3 py-1 font-inter-tight text-caption font-medium uppercase tracking-wider transition-all shrink-0 ${
                  isActive
                    ? 'bg-signal-lime text-black shadow-[0_0_8px_rgba(197,255,74,0.3)] font-bold'
                    : 'bg-carbon text-ash hover:text-white border border-graphite hover:border-signal-lime/50'
                }`}
              >
                {wItem.name}
              </Link>
            )
          })}
        </div>
      </div>

      <section className="py-16 px-6 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 border border-graphite bg-onyx text-signal-lime font-jetbrains-mono text-caption mb-4">
          <span>{data.type}</span>
        </div>
        <h1 className="font-pt-serif font-light text-4xl md:text-heading-lg leading-tight mb-6">
          {data.name} <span className="italic text-signal-lime">Widget Docs</span>
        </h1>
        <p className="text-body text-bone max-w-2xl mx-auto leading-relaxed mb-6">
          {data.description}
        </p>

        <div className="flex items-center justify-center gap-4">
          <a
            href={data.githubSourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-carbon border border-graphite hover:border-signal-lime text-chalk px-4 py-2 text-caption font-jetbrains-mono uppercase transition-colors"
          >
            <Github className="size-4" />
            <span>View Source Code on GitHub ↗</span>
          </a>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 space-y-12 pb-24">
        <div className="bg-onyx border border-graphite p-8">
          <h2 className="text-subheading font-medium text-chalk mb-4">Markdown Embed Code</h2>
          <div className="bg-carbon border border-graphite p-4 font-jetbrains-mono text-caption text-signal-lime overflow-x-auto mb-6">
            <pre>{data.codeSnippet}</pre>
          </div>
          <Link
            href={`/?widget=${data.id}`}
            className="inline-flex items-center gap-2 bg-signal-lime text-black font-medium text-label px-6 py-3 uppercase tracking-wider hover:brightness-110"
          >
            <span>Open in Visual Editor</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="bg-onyx border border-graphite p-8">
          <h2 className="text-subheading font-medium text-chalk mb-6">
            Query Parameters Reference
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-inter-tight text-note">
              <thead>
                <tr className="border-b border-graphite bg-void-black text-signal-lime uppercase tracking-widest text-caption">
                  <th className="p-4">Parameter</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Default</th>
                  <th className="p-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite text-bone">
                {data.params.map((p) => (
                  <tr key={p.name}>
                    <td className="p-4 font-jetbrains-mono text-signal-lime font-medium">
                      {p.name}
                    </td>
                    <td className="p-4 font-jetbrains-mono text-ash">{p.type}</td>
                    <td className="p-4 font-jetbrains-mono text-chalk">{p.default}</td>
                    <td className="p-4 text-bone">{p.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-onyx border border-graphite p-8">
          <h2 className="text-subheading font-medium text-chalk mb-4">Best Practices</h2>
          <ul className="space-y-3 text-body text-bone">
            {data.bestPractices.map((bp, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-signal-lime font-bold">•</span>
                <span>{bp}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Footer />
    </main>
  )
}
