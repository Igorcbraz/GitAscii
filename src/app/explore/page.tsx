'use client'

import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { ExploreCommunityGallery } from '@/features/explore/ExploreCommunityGallery'
import { getStoredProfiles } from '@/features/explore/getCommunityProfiles'
import { Footer } from '@/features/landing/components/Footer'
import Navbar from '@/features/landing/components/Navbar'
import { useI18n } from '@/i18n'

export default function ExplorePage() {
  const { t } = useI18n()
  const profiles = getStoredProfiles()

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Explore Community GitHub Profile Portfolios',
    description:
      'Directory of real developer profiles, GitHub READMEs, and ASCII portfolios created with GitAscii.',
    url: 'https://git-ascii.vercel.app/explore',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: profiles.length,
      itemListElement: profiles.map((p, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: `@${p.username}`,
        url: `https://git-ascii.vercel.app/${p.username}`,
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
        name: 'Explore Community',
        item: 'https://git-ascii.vercel.app/explore',
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
          <Breadcrumbs items={[{ label: t('explore.breadcrumb', 'Community Profiles Gallery') }]} />
        </div>
      </div>

      <section className="py-16 px-6 max-w-5xl mx-auto text-center">
        <span className="font-jetbrains-mono text-caption uppercase tracking-[0.22em] text-ash mb-4 block">
          {t('explore.subtitle', '[ COMMUNITY GALLERY & DEVELOPER DIRECTORY ]')}
        </span>
        <h1 className="font-pt-serif font-light text-4xl md:text-heading-lg leading-tight mb-6">
          {t('explore.title_part1', 'Explore Real')}{' '}
          <span className="italic text-signal-lime">
            {t('explore.title_part2', 'Developer Profiles')}
          </span>
        </h1>
        <p className="text-body text-bone max-w-2xl mx-auto leading-relaxed mb-8">
          {t(
            'explore.description',
            'Browse authentic developer profiles and custom GitHub README layouts configured with GitAscii. Inspect live SVG stats, themes, and ASCII banners generated directly from stored application data.'
          )}
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <ExploreCommunityGallery initialProfiles={profiles} />
      </section>

      <Footer />
    </main>
  )
}
