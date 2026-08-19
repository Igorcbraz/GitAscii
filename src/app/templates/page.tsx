'use client'

import { Layout } from 'lucide-react'

import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { APP_URL } from '@/constants'
import { templateList } from '@/data/templatesData'
import { Footer } from '@/features/landing/components/Footer'
import Navbar from '@/features/landing/components/Navbar'
import { TemplateGallery } from '@/features/templates/TemplateGallery'
import { useI18n } from '@/i18n'

export default function TemplatesPage() {
  const { t } = useI18n()

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '13+ Best GitHub Profile README Templates Marketplace',
    description:
      'Handcrafted, responsive GitHub Profile README templates with live SVG stats, ASCII art, and custom themes.',
    url: `${APP_URL}/templates`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: templateList.length,
      itemListElement: templateList.map((tpl, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: tpl.name,
        description: tpl.description,
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
        name: 'Templates',
        item: `${APP_URL}/templates`,
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

      <div className="pt-20 md:pt-24 border-b border-graphite bg-void-black/80 backdrop-blur-md px-6 py-3">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs items={[{ label: t('templates.breadcrumb', 'Templates Marketplace') }]} />
        </div>
      </div>

      <section className="py-16 px-6 max-w-5xl mx-auto text-center">
        <span className="font-jetbrains-mono text-caption uppercase tracking-[0.22em] text-ash mb-4 block">
          {t('templates.showcase', '[ CATALOG & MARKETPLACE SHOWCASE ]')}
        </span>
        <h1 className="font-pt-serif font-light text-4xl md:text-heading-lg leading-tight mb-6">
          {t('templates.heading_part1', '13+ Handcrafted ')}
          <span className="italic text-signal-lime">
            {t('templates.heading_part2', 'GitHub Profile')}
          </span>{' '}
          {t('templates.heading_part3', 'Templates')}
        </h1>
        <p className="text-body text-bone max-w-2xl mx-auto leading-relaxed mb-8">
          {t(
            'templates.description',
            'Elevate your developer identity with templates designed for every aesthetic. Filter by ecosystem stack, classic CLI terminal style, or vibrant dark mode themes. Fully interactive in our visual drag-and-drop editor.'
          )}
        </p>

        <div className="bg-onyx border border-graphite p-6 rounded-none text-left max-w-3xl mx-auto mb-4">
          <h2 className="text-label font-medium uppercase tracking-widest text-signal-lime mb-2 flex items-center gap-2">
            <Layout size={16} /> {t('templates.key_capabilities', 'Key Platform Capabilities')}
          </h2>
          <ul className="text-note text-bone space-y-2">
            <li>
              • <strong>{t('templates.feat1_strong', 'Real-time Live SVGs:')}</strong>{' '}
              {t(
                'templates.feat1_text',
                'Rendered dynamically via serverless endpoints without manual file uploads.'
              )}
            </li>
            <li>
              • <strong>{t('templates.feat2_strong', 'Dark/Light Theme Adaptive:')}</strong>{' '}
              {t('templates.feat2_text_part1', 'Native HTML ')}
              <code>&lt;picture&gt;</code>{' '}
              {t('templates.feat2_text_part2', 'support for automatic theme switching.')}
            </li>
            <li>
              • <strong>{t('templates.feat3_strong', 'Zero Maintenance:')}</strong>{' '}
              {t(
                'templates.feat3_text',
                'Your GitHub contributions, star counts, and language charts update automatically.'
              )}
            </li>
            <li>
              • <strong>{t('templates.feat4_strong', '100% Free & Open Source:')}</strong>{' '}
              {t(
                'templates.feat4_text',
                'Licensed under MIT — full design control without subscriptions.'
              )}
            </li>
          </ul>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <TemplateGallery />
      </section>

      <Footer />
    </main>
  )
}
