'use client'

import { Zap } from 'lucide-react'

import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { widgetsList } from '@/data/widgetsData'
import { Footer } from '@/features/landing/components/Footer'
import Navbar from '@/features/landing/components/Navbar'
import { WidgetShowcase } from '@/features/widgets/WidgetShowcase'
import { useI18n } from '@/i18n'

export default function WidgetsPage() {
  const { t } = useI18n()

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Free GitHub Profile Widgets & Dynamic SVGs Showcase',
    description:
      'Live SVG stats, streak counters, language charts, and ASCII art widgets for GitHub READMEs.',
    url: 'https://git-ascii.vercel.app/widgets',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: widgetsList.length,
      itemListElement: widgetsList.map((w, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: w.name,
        description: w.description,
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
        item: 'https://git-ascii.vercel.app',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Widgets',
        item: 'https://git-ascii.vercel.app/widgets',
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
          <Breadcrumbs items={[{ label: t('widgets.breadcrumb', 'Dynamic Widgets Showcase') }]} />
        </div>
      </div>

      <section className="py-16 px-6 max-w-5xl mx-auto text-center">
        <span className="font-jetbrains-mono text-caption uppercase tracking-[0.22em] text-ash mb-4 block">
          {t('widgets.tagline', '[ DYNAMIC SVG ENGINE & WIDGET SHOWCASE ]')}
        </span>
        <h1 className="font-pt-serif font-light text-4xl md:text-heading-lg leading-tight mb-6">
          {t('widgets.h1_prefix', 'Dynamic GitHub')}{' '}
          <span className="italic text-signal-lime">
            {t('widgets.h1_highlight', 'Profile Widgets')}
          </span>
        </h1>
        <p className="text-body text-bone max-w-2xl mx-auto leading-relaxed mb-8">
          {t(
            'widgets.subtitle',
            'Embed vector SVG widgets that render real-time statistics, language distributions, contribution streaks, and ASCII banners directly on GitHub.'
          )}
        </p>

        <div className="bg-onyx border border-graphite p-6 rounded-none text-left max-w-3xl mx-auto mb-6">
          <h2 className="text-label font-medium uppercase tracking-widest text-signal-lime mb-2 flex items-center gap-2">
            <Zap size={16} /> {t('widgets.advantages_title', 'Key Technical Advantages')}
          </h2>
          <ul className="text-note text-bone space-y-2">
            <li>
              • <strong>{t('widgets.adv_1_strong', 'Zero Build Step:')}</strong>{' '}
              {t('widgets.adv_1_text', 'Copy the generated Markdown URL directly into your')}{' '}
              <code>README.md</code>.
            </li>
            <li>
              • <strong>{t('widgets.adv_2_strong', 'Global Serverless Edge:')}</strong>{' '}
              {t(
                'widgets.adv_2_text',
                'Rendered on Vercel Edge functions with 4-hour automatic caching.'
              )}
            </li>
            <li>
              • <strong>{t('widgets.adv_3_strong', 'High-DPI Vector Crispness:')}</strong>{' '}
              {t(
                'widgets.adv_3_text',
                'Scalable vector graphics that stay razor-sharp on Retina displays.'
              )}
            </li>
            <li>
              • <strong>{t('widgets.adv_4_strong', 'Open Source & Transparent:')}</strong>{' '}
              {t('widgets.adv_4_text', 'Complete source code available under MIT on GitHub.')}
            </li>
          </ul>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <WidgetShowcase />
      </section>

      <Footer />
    </main>
  )
}
