'use client'

import { Sparkles } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { type CompetitorData, COMPETITORS_MAP } from '@/constants'
import { Footer } from '@/features/landing/components/Footer'
import Navbar from '@/features/landing/components/Navbar'
import { useI18n } from '@/i18n'

interface CompetitorDetailClientProps {
  data: CompetitorData
  allCompetitors: string[]
}

export function CompetitorDetailClient({ data, allCompetitors }: CompetitorDetailClientProps) {
  const { t } = useI18n()

  return (
    <main className="min-h-screen bg-carbon text-chalk font-inter-tight">
      <Navbar />

      <div className="border-b border-graphite bg-void-black/80 backdrop-blur-md px-6 py-3">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs
            items={[
              { label: t('vs.breadcrumbs', 'Competitor Comparison'), href: '/vs' },
              { label: data.name },
            ]}
          />
        </div>
      </div>

      <div className="bg-void-black border-b border-graphite px-6 py-3 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <span className="font-jetbrains-mono text-caption text-ash uppercase tracking-wider shrink-0 mr-2">
            {t('vs_detail.competitor_directory', '[ COMPETITOR DIRECTORY ]')}
          </span>
          <Link
            href="/vs"
            className="px-3 py-1 bg-carbon border border-graphite font-inter-tight text-caption text-ash hover:text-white uppercase transition-colors shrink-0"
          >
            {t('vs_detail.all_comparisons', '← All Comparisons')}
          </Link>
          {allCompetitors.map((cKey) => {
            const item = COMPETITORS_MAP[cKey]
            const isActive = cKey === data.slug
            return (
              <Link
                key={cKey}
                href={`/vs/${cKey}`}
                className={`px-3 py-1 font-inter-tight text-caption font-medium uppercase tracking-wider transition-all shrink-0 ${
                  isActive
                    ? 'bg-signal-lime text-black shadow-[0_0_8px_rgba(197,255,74,0.3)] font-bold'
                    : 'bg-carbon text-ash hover:text-white border border-graphite hover:border-signal-lime/50'
                }`}
              >
                {item.name}
              </Link>
            )
          })}
        </div>
      </div>

      <section className="py-16 px-6 max-w-4xl mx-auto text-center">
        <span className="font-jetbrains-mono text-caption uppercase tracking-[0.22em] text-ash mb-4 block">
          {t('vs_detail.detailed_comparison_badge', '[ DETAILED COMPARISON ]')}
        </span>
        <h1 className="font-pt-serif font-light text-4xl md:text-5xl leading-tight mb-6">
          GitAscii vs <span className="italic text-signal-lime">{data.name}</span>
        </h1>
        <p className="text-body text-bone leading-relaxed max-w-2xl mx-auto mb-8">{data.summary}</p>

        <div className="bg-onyx border border-graphite p-6 text-left mb-8">
          <h2 className="text-label uppercase tracking-widest text-signal-lime mb-2 flex items-center gap-2 font-medium">
            <Sparkles size={16} /> {t('vs_detail.architectural_diff', 'Key Advantages of GitAscii')}
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
                <th className="p-4">{t('vs_detail.col_feature', 'Feature')}</th>
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
          {t('template_detail.faq_title', 'Frequently Asked Questions')}
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
