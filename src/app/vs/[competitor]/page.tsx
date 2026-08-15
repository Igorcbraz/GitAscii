import { Sparkles } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { APP_URL, COMPETITORS_MAP } from '@/constants'
import { Footer } from '@/features/landing/components/Footer'
import Navbar from '@/features/landing/components/Navbar'

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

  return (
    <main className="min-h-screen bg-carbon text-chalk font-inter-tight">
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

      <Navbar />

      <div className="border-b border-graphite bg-void-black/80 backdrop-blur-md px-6 py-3">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs items={[{ label: 'Comparisons', href: '/vs' }, { label: data.name }]} />
        </div>
      </div>

      <section className="py-16 px-6 max-w-4xl mx-auto text-center">
        <span className="font-jetbrains-mono text-caption uppercase tracking-[0.22em] text-ash mb-4 block">
          [ DETAILED COMPARISON ]
        </span>
        <h1 className="font-pt-serif font-light text-4xl md:text-5xl leading-tight mb-6">
          GitAscii vs <span className="italic text-signal-lime">{data.name}</span>
        </h1>
        <p className="text-body text-bone leading-relaxed max-w-2xl mx-auto mb-8">{data.summary}</p>

        <div className="bg-onyx border border-graphite p-6 text-left mb-8">
          <h2 className="text-label uppercase tracking-widest text-signal-lime mb-2 flex items-center gap-2 font-medium">
            <Sparkles size={16} /> Key Advantages of GitAscii
          </h2>
          <ul className="text-note text-bone space-y-2">
            {data.prosGitAscii.map((pro, i) => (
              <li key={i}>• {pro}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mb-16">
        <div className="bg-onyx border border-graphite overflow-x-auto">
          <table className="w-full text-left font-inter-tight text-note">
            <thead>
              <tr className="border-b border-graphite bg-void-black text-signal-lime uppercase tracking-widest text-caption">
                <th className="p-4">Feature</th>
                <th className="p-4">GitAscii</th>
                <th className="p-4">{data.name}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite text-bone">
              {data.comparisonPoints.map((pt, i) => (
                <tr key={i}>
                  <td className="p-4 font-medium text-chalk">{pt.feature}</td>
                  <td className="p-4 text-signal-lime font-bold">{pt.gitascii}</td>
                  <td className="p-4 text-ash">{pt.competitor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mb-20">
        <h2 className="text-heading font-pt-serif font-light text-chalk mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {data.faqs.map((faq, i) => (
            <div key={i} className="bg-onyx border border-graphite p-6">
              <h3 className="text-subheading font-medium text-signal-lime mb-2">{faq.question}</h3>
              <p className="text-body text-bone leading-relaxed text-note">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}
