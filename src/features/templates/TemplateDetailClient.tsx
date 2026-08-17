'use client'

import { ArrowRight, Check } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Footer } from '@/features/landing/components/Footer'
import Navbar from '@/features/landing/components/Navbar'
import { useI18n } from '@/i18n'

export interface StackData {
  slug: string
  name: string
  title: string
  description: string
  vibe: string
  accent: string
  bg: string
  badges: string[]
  codeSnippet: string
  bestPractices: string[]
  commonMistakes: string[]
  faqs: { question: string; answer: string }[]
}

interface TemplateDetailClientProps {
  data: StackData
  allStackKeys: string[]
  stacks: Record<string, StackData>
}

export function TemplateDetailClient({ data, allStackKeys, stacks }: TemplateDetailClientProps) {
  const { t } = useI18n()

  return (
    <main className="min-h-screen bg-carbon text-chalk font-inter-tight">
      <Navbar />

      <div className="border-b border-graphite bg-void-black/80 backdrop-blur-md px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Breadcrumbs
            items={[
              { label: t('templates.breadcrumb', 'Templates Marketplace'), href: '/templates' },
              { label: data.name },
            ]}
          />
        </div>
      </div>

      <div className="bg-void-black border-b border-graphite px-6 py-3 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <span className="font-jetbrains-mono text-caption text-ash uppercase tracking-wider shrink-0 mr-2">
            {t('template_detail.language_stacks', '[ LANGUAGE STACKS ]')}
          </span>
          <Link
            href="/templates"
            className="px-3 py-1 bg-carbon border border-graphite font-inter-tight text-caption text-ash hover:text-white uppercase transition-colors shrink-0"
          >
            {t('template_detail.all_templates', '← All Templates')}
          </Link>
          {allStackKeys.map((sKey) => {
            const item = stacks[sKey]
            const isActive = sKey === data.slug
            return (
              <Link
                key={sKey}
                href={`/templates/${sKey}`}
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
        <div className="inline-flex items-center gap-2 px-3 py-1 border border-graphite bg-onyx text-signal-lime font-jetbrains-mono text-caption mb-4">
          <span className="size-2 rounded-full" style={{ backgroundColor: data.accent }} />
          <span>{data.vibe}</span>
        </div>
        <h1 className="font-pt-serif font-light text-4xl md:text-heading-lg leading-tight mb-6">
          {data.name} <span className="italic text-signal-lime">GitHub Profile</span> Template
        </h1>
        <p className="text-body text-bone max-w-2xl mx-auto leading-relaxed mb-8">
          {data.description}
        </p>

        <div className="pt-2">
          <Link
            href={`/?template=${data.slug}`}
            className="inline-flex items-center gap-2 bg-signal-lime text-black font-medium text-body px-8 py-4 uppercase tracking-wider hover:brightness-110 shadow-[0_0_12px_rgba(197,255,74,0.4)] transition-all"
          >
            <span>
              {t('template_detail.use_in_editor', `Use ${data.name} Template in Editor`, {
                name: data.name,
              })}
            </span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-8 space-y-12 pb-24">
        <div className="bg-onyx border border-graphite p-8">
          <h2 className="text-subheading font-medium text-chalk mb-4">
            {t('template_detail.included_badges', 'Included Ecosystem Badges')}
          </h2>
          <div className="flex items-center gap-2 flex-wrap mb-6">
            {data.badges.map((b) => (
              <span
                key={b}
                className="px-3 py-1 bg-carbon border border-graphite text-signal-lime font-jetbrains-mono text-note uppercase"
              >
                {b}
              </span>
            ))}
          </div>

          <h3 className="text-label font-medium uppercase tracking-wider text-ash mb-2">
            {t('template_detail.embed_snippet', 'Markdown Embed Snippet:')}
          </h3>
          <div className="bg-carbon border border-graphite p-4 font-jetbrains-mono text-caption text-signal-lime overflow-x-auto">
            <pre>{data.codeSnippet}</pre>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-onyx border border-graphite p-8">
            <h3 className="text-subheading font-medium text-signal-lime mb-4 flex items-center gap-2">
              <Check size={18} /> {t('template_detail.best_practices', 'Best Practices')}
            </h3>
            <ul className="space-y-3 text-body text-bone">
              {data.bestPractices.map((bp, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-signal-lime font-jetbrains-mono font-bold mt-0.5">•</span>
                  <span>{bp}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-onyx border border-graphite p-8">
            <h3 className="text-subheading font-medium text-ash mb-4">
              {t('template_detail.common_mistakes', 'Common Mistakes to Avoid')}
            </h3>
            <ul className="space-y-3 text-body text-bone">
              {data.commonMistakes.map((cm, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-red-400 font-jetbrains-mono font-bold mt-0.5">✕</span>
                  <span>{cm}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-onyx border border-graphite p-8">
          <h2 className="text-subheading font-medium text-chalk mb-6">
            {t('template_detail.faq_title', 'Frequently Asked Questions')}
          </h2>
          <div className="space-y-6">
            {data.faqs.map((faq, idx) => (
              <div key={idx} className="border-b border-graphite pb-6 last:border-0 last:pb-0">
                <h3 className="text-body font-medium text-chalk mb-2">Q: {faq.question}</h3>
                <p className="text-note text-bone leading-relaxed">A: {faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
