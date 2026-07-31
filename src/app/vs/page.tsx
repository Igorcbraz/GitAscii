'use client'

import Link from 'next/link'

import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Footer } from '@/features/landing/components/Footer'
import Navbar from '@/features/landing/components/Navbar'
import { useI18n } from '@/i18n'

export default function ComparisonHubPage() {
  const { t } = useI18n()

  const comparisons = [
    {
      slug: 'readme-so',
      name: t('vs.readme_so_title', 'GitAscii vs Readme.so'),
      summary: t(
        'vs.readme_so_summary',
        'Compare GitAscii with Readme.so. Learn why GitAscii offers live SVG rendering, custom ASCII art engine, and multi-profile support.'
      ),
    },
    {
      slug: 'gprm',
      name: t('vs.gprm_title', 'GitAscii vs GPRM'),
      summary: t(
        'vs.gprm_summary',
        'Compare GitAscii with GitHub Profile README Maker (GPRM). Discover GitAscii visual drag-and-drop editor and 13+ modern themes.'
      ),
    },
    {
      slug: 'github-profile-readme-generator',
      name: t('vs.generic_title', 'GitAscii vs Generic Generators'),
      summary: t(
        'vs.generic_summary',
        'Compare GitAscii against static GitHub README generators. Live statistics, dark/light theme switching, and real-time SVG previews.'
      ),
    },
  ]

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'GitAscii vs Competitors & Alternatives',
    description: 'Detailed feature comparison between GitAscii and popular README generators.',
    url: 'https://git-ascii.vercel.app/vs',
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
        name: 'Resources & Comparisons',
        item: 'https://git-ascii.vercel.app/vs',
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
          <Breadcrumbs items={[{ label: t('vs.breadcrumbs', 'Resources & Comparisons') }]} />
        </div>
      </div>

      <section className="py-16 px-6 max-w-5xl mx-auto text-center">
        <span className="font-jetbrains-mono text-caption uppercase tracking-[0.22em] text-ash mb-4 block">
          {t('vs.matrix_subtitle', '[ COMPARISON MATRIX & RESOURCES ]')}
        </span>
        <h1 className="font-pt-serif font-light text-4xl md:text-heading-lg leading-tight mb-6">
          {t('vs.title_part1', 'GitAscii vs')}{' '}
          <span className="italic text-signal-lime">{t('vs.title_part2', 'Alternatives')}</span>
        </h1>
        <p className="text-body text-bone max-w-2xl mx-auto leading-relaxed mb-12">
          {t(
            'vs.description',
            'Compare GitAscii with other popular README tools to see why developers choose our dynamic SVG engine, ASCII converter, and visual editor.'
          )}
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 space-y-8 mb-20">
        {comparisons.map((c) => (
          <article
            key={c.slug}
            className="bg-onyx border border-graphite p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-signal-lime/50 transition-all group"
          >
            <div>
              <h2 className="text-subheading font-medium text-chalk mb-2 group-hover:text-signal-lime transition-colors">
                {c.name}
              </h2>
              <p className="text-body text-bone leading-relaxed text-note">{c.summary}</p>
            </div>

            <Link
              href={`/vs/${c.slug}`}
              className="shrink-0 bg-signal-lime text-black font-medium text-label px-6 py-3 uppercase tracking-wider hover:brightness-110 shadow-[0_0_8px_rgba(197,255,74,0.25)] transition-all"
            >
              {t('vs.view_comparison', 'View Comparison')}
            </Link>
          </article>
        ))}
      </section>

      <section className="max-w-5xl mx-auto px-6 mb-24">
        <h2 className="text-heading font-pt-serif font-light text-chalk mb-6 text-center">
          {t('vs.matrix_title', 'Feature Comparison Matrix')}
        </h2>
        <div className="bg-onyx border border-graphite overflow-x-auto">
          <table className="w-full text-left font-inter-tight text-note">
            <thead>
              <tr className="border-b border-graphite bg-void-black text-signal-lime uppercase tracking-widest text-caption">
                <th className="p-4">{t('vs.th_feature', 'Feature')}</th>
                <th className="p-4">GitAscii</th>
                <th className="p-4">Readme.so</th>
                <th className="p-4">GPRM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite text-bone">
              <tr>
                <td className="p-4 font-medium text-chalk">
                  {t('vs.concept_edge_rendering', 'Dynamic SVG Edge Rendering')}
                </td>
                <td className="p-4 text-signal-lime font-bold">
                  {t('vs.td_included', '✓ Included')}
                </td>
                <td className="p-4 text-ash">{t('vs.td_no', '✕ No')}</td>
                <td className="p-4 text-ash">{t('vs.td_no', '✕ No')}</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-chalk">
                  {t('vs.concept_theme_toggle', 'Native Light/Dark Auto-Toggle')}
                </td>
                <td className="p-4 text-signal-lime font-bold">
                  {t('vs.td_included', '✓ Included')}
                </td>
                <td className="p-4 text-ash">{t('vs.td_manual', '✕ Manual')}</td>
                <td className="p-4 text-ash">{t('vs.td_manual', '✕ Manual')}</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-chalk">
                  {t('vs.concept_ascii_engine', 'Luminance-Based ASCII Engine')}
                </td>
                <td className="p-4 text-signal-lime font-bold">
                  {t('vs.td_included', '✓ Included')}
                </td>
                <td className="p-4 text-ash">{t('vs.td_no', '✕ No')}</td>
                <td className="p-4 text-ash">{t('vs.td_no', '✕ No')}</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-chalk">
                  {t('vs.concept_visual_builder', 'Visual Layout Canvas Builder')}
                </td>
                <td className="p-4 text-signal-lime font-bold">
                  {t('vs.td_included', '✓ Included')}
                </td>
                <td className="p-4 text-chalk">{t('vs.td_included', '✓ Included')}</td>
                <td className="p-4 text-ash">{t('vs.td_form_based', '✕ Form-based')}</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-chalk">
                  {t('vs.concept_zero_db', 'Zero Database Dependency')}
                </td>
                <td className="p-4 text-signal-lime font-bold">
                  {t('vs.td_included', '✓ Included')}
                </td>
                <td className="p-4 text-ash">{t('vs.td_requires_db', '✕ Requires DB')}</td>
                <td className="p-4 text-signal-lime font-bold">
                  {t('vs.td_included', '✓ Included')}
                </td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-chalk">
                  {t('vs.concept_self_host', 'MIT Open Source & Self-Hostable')}
                </td>
                <td className="p-4 text-signal-lime font-bold">
                  {t('vs.td_mit', '✓ MIT License')}
                </td>
                <td className="p-4 text-chalk">{t('vs.td_open_source_val', '✓ Open Source')}</td>
                <td className="p-4 text-chalk">{t('vs.td_open_source_val', '✓ Open Source')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <Footer />
    </main>
  )
}
