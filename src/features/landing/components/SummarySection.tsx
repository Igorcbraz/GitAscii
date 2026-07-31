'use client'

import { Code, Cpu, Sparkles, Terminal } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { useI18n } from '@/i18n'

export function SummarySection() {
  const { t } = useI18n()

  return (
    <section className="bg-void-black border-t border-graphite py-20 px-6 relative z-10">
      <div className="max-w-5xl mx-auto flex flex-col gap-10">
        <div className="text-center">
          <span className="font-inter-tight font-medium text-eyebrow uppercase tracking-[0.22em] text-ash mb-3 block">
            {t('landing.summary.eyebrow', '[ OVERVIEW & KEY TAKEAWAYS ]')}
          </span>
          <h2 className="font-pt-serif font-light text-heading text-chalk tracking-tight">
            {t('landing.summary.title_normal', 'Why Developers Choose ')}
            <span className="italic text-signal-lime">GitAscii</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-onyx border border-graphite p-6 rounded-none">
            <h3 className="text-subheading font-medium text-chalk mb-3 flex items-center gap-2">
              <Sparkles className="text-signal-lime" size={18} />
              {t('landing.summary.feature1_title', 'Real-Time Dynamic SVG Engine')}
            </h3>
            <p className="text-body text-bone leading-relaxed text-note">
              {t(
                'landing.summary.feature1_desc',
                'GitAscii generates live SVG cards on-the-fly. Embed dynamic URL endpoints in your GitHub README markdown to display real-time commit stats, streaks, language distributions, and tech badges without manual rebuilds.'
              )}
            </p>
          </div>

          <div className="bg-onyx border border-graphite p-6 rounded-none">
            <h3 className="text-subheading font-medium text-chalk mb-3 flex items-center gap-2">
              <Terminal className="text-signal-lime" size={18} />
              {t('landing.summary.feature2_title', 'Custom Image-to-ASCII Converter')}
            </h3>
            <p className="text-body text-bone leading-relaxed text-note">
              {t(
                'landing.summary.feature2_desc',
                'Convert your GitHub avatar or custom artwork into character-based text art grids with configurable character density, contrast mapping, and color themes.'
              )}
            </p>
          </div>

          <div className="bg-onyx border border-graphite p-6 rounded-none">
            <h3 className="text-subheading font-medium text-chalk mb-3 flex items-center gap-2">
              <Code className="text-signal-lime" size={18} />
              {t('landing.summary.feature3_title', 'Dark & Light Theme Adaptability')}
            </h3>
            <p className="text-body text-bone leading-relaxed text-note">
              {t(
                'landing.summary.feature3_desc_part1',
                'Seamlessly switch between dark and light themes using standard HTML'
              )}{' '}
              <code>&lt;picture&gt;</code>{' '}
              {t('landing.summary.feature3_desc_part2', 'tags and media queries')} (
              <code>prefers-color-scheme</code>
              ).
            </p>
          </div>

          <div className="bg-onyx border border-graphite p-6 rounded-none">
            <h3 className="text-subheading font-medium text-chalk mb-3 flex items-center gap-2">
              <Cpu className="text-signal-lime" size={18} />
              {t('landing.summary.feature4_title', 'Programmatic Hubs & AI Ready')}
            </h3>
            <p className="text-body text-bone leading-relaxed text-note">
              {t(
                'landing.summary.feature4_desc',
                'Fully indexed programmatically for search engines and AI assistants (ChatGPT, Claude, Gemini, Perplexity). Explore our catalog of templates, widgets, developer profiles, and guides.'
              )}
            </p>
          </div>
        </div>

        <div className="flex justify-center items-center gap-6 flex-wrap pt-4 font-inter-tight text-label">
          <Link
            href="/templates"
            className="px-4 py-2 border border-graphite bg-onyx text-chalk hover:border-signal-lime hover:text-signal-lime transition-all"
          >
            {t('landing.summary.link_templates', '13+ Templates Catalog →')}
          </Link>
          <Link
            href="/widgets"
            className="px-4 py-2 border border-graphite bg-onyx text-chalk hover:border-signal-lime hover:text-signal-lime transition-all"
          >
            {t('landing.summary.link_widgets', 'Dynamic SVG Widgets →')}
          </Link>
          <Link
            href="/explore"
            className="px-4 py-2 border border-graphite bg-onyx text-chalk hover:border-signal-lime hover:text-signal-lime transition-all"
          >
            {t('landing.summary.link_explore', 'Explore Profiles →')}
          </Link>
          <Link
            href="/guides"
            className="px-4 py-2 border border-graphite bg-onyx text-chalk hover:border-signal-lime hover:text-signal-lime transition-all"
          >
            {t('landing.summary.link_guides', 'README Guides →')}
          </Link>
        </div>
      </div>
    </section>
  )
}
