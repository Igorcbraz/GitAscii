'use client'

import { BookOpen, ExternalLink } from 'lucide-react'
import Link from 'next/link'

import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { APP_URL, GUIDES_RESOURCES_LIST, type ResourceGuide } from '@/constants'
import { Footer } from '@/features/landing/components/Footer'
import Navbar from '@/features/landing/components/Navbar'
import { useI18n } from '@/i18n'

export type { ResourceGuide }

const guidesList = GUIDES_RESOURCES_LIST

export default function GuidesPage() {
  const { t } = useI18n()

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'GitHub Profile README Guides & Resource Articles',
    description:
      'Curated collection of authoritative guides, Medium articles, official GitHub documentation, and tutorials.',
    url: `${APP_URL}/guides`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: guidesList.length,
      itemListElement: guidesList.map((g, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: g.title,
        description: g.summary,
        url: g.externalUrl,
      })),
    },
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
        name: 'Guides & Resources',
        item: `${APP_URL}/guides`,
      },
    ],
  }

  return (
    <main className="min-h-screen bg-carbon text-chalk font-inter-tight">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <Navbar />

      <div className="border-b border-graphite bg-void-black/80 backdrop-blur-md px-6 py-3">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs
            items={[{ label: t('guides.breadcrumbs', 'Guides & External Resources') }]}
          />
        </div>
      </div>

      <section className="py-16 px-6 max-w-5xl mx-auto text-center">
        <span className="font-jetbrains-mono text-caption uppercase tracking-[0.22em] text-ash mb-4 block">
          {t('guides.curated_knowledge', '[ CURATED KNOWLEDGE BASE & RESOURCES ]')}
        </span>
        <h1 className="font-pt-serif font-light text-4xl md:text-heading-lg leading-tight mb-6">
          {t('guides.hero_title_1', 'GitHub Profile README ')}
          <span className="italic text-signal-lime">
            {t('guides.hero_title_2', 'Guides & Articles')}
          </span>
        </h1>
        <p className="text-body text-bone max-w-2xl mx-auto leading-relaxed mb-8">
          {t(
            'guides.hero_subtitle',
            'Curated guides from Medium, official GitHub documentation, and developer articles on Markdown syntax, dynamic SVG integration, theme switching, and portfolio optimization.'
          )}
        </p>

        <div className="bg-onyx border border-graphite p-6 rounded-none text-left max-w-3xl mx-auto mb-6">
          <h2 className="text-label font-medium uppercase tracking-widest text-signal-lime mb-2 flex items-center gap-2">
            <BookOpen size={16} /> {t('guides.featured_topics', 'Featured Resource Topics')}
          </h2>
          <ul className="text-note text-bone space-y-2">
            <li>
              {t(
                'guides.topic_1',
                '• How to create a repository with the exact same name as your GitHub username.'
              )}
            </li>
            <li>
              {t(
                'guides.topic_2',
                '• Embedding SVG widgets with live statistics and auto-updating contribution graphs.'
              )}
            </li>
            <li>
              {t(
                'guides.topic_3',
                '• Crafting custom ASCII art banners using character density mapping.'
              )}
            </li>
          </ul>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 space-y-8 pb-20">
        {guidesList.map((guide) => (
          <article
            key={guide.slug}
            className="bg-onyx border border-graphite p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-signal-lime/50 transition-all duration-300 group"
          >
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-jetbrains-mono text-caption text-signal-lime uppercase tracking-widest bg-carbon px-2.5 py-1 border border-graphite">
                  [ {guide.publisherBadge} ]
                </span>
                <span className="font-jetbrains-mono text-[11px] text-ash uppercase tracking-wider">
                  {guide.readTime}
                </span>
              </div>

              <h2 className="text-subheading font-medium text-chalk group-hover:text-signal-lime transition-colors">
                {guide.title}
              </h2>
              <p className="text-body text-bone leading-relaxed text-note">{guide.summary}</p>

              <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                {guide.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 border border-graphite bg-carbon font-jetbrains-mono text-caption text-ash uppercase tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto shrink-0">
              <a
                href={guide.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-signal-lime text-black font-medium text-label px-6 py-3 uppercase tracking-wider hover:brightness-110 shadow-[0_0_8px_rgba(197,255,74,0.25)] transition-all"
              >
                <span>{t('guides.read_article', 'Read Article')}</span>
                <ExternalLink size={14} />
              </a>

              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-carbon border border-graphite hover:border-signal-lime text-ash hover:text-white font-medium text-caption py-2.5 px-4 uppercase tracking-wider transition-all"
              >
                <span>{t('guides.build_with_gitascii', 'Build with GitAscii')}</span>
              </Link>
            </div>
          </article>
        ))}
      </section>

      <Footer />
    </main>
  )
}
