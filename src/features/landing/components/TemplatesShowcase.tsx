'use client'

import { GitFork } from 'lucide-react'
import React from 'react'

import { EXTERNAL_LINKS, TEMPLATES_SHOWCASE_LIST } from '@/constants'
import { useI18n } from '@/i18n'

export default function TemplatesShowcase() {
  const { t } = useI18n()

  return (
    <section id="templates" className="bg-carbon py-24 relative z-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center justify-center px-4 py-1.5 border border-signal-lime text-signal-lime rounded-none text-eyebrow font-inter-tight font-medium tracking-[0.22em] bg-transparent mb-8 uppercase">
            {t('landing.templates.badge', '[ 13 TEMPLATES ]')}
          </div>

          <span className="font-inter-tight text-eyebrow uppercase tracking-[0.22em] text-ash mb-4">
            {t('landing.templates.eyebrow', '[ CHOOSE YOUR STYLE ]')}
          </span>
          <h2 className="font-pt-serif font-light text-heading text-chalk leading-[0.9] tracking-tight mb-6">
            {t('landing.templates.title_normal', 'Premium ')}
            <span className="italic text-signal-lime">
              {t('landing.templates.title_italic', 'Templates.')}
            </span>
          </h2>
          <p className="font-inter-tight text-body text-bone max-w-lg mx-auto">
            {t(
              'landing.templates.subtitle',
              '13+ beautifully crafted templates. Pick one, customize everything.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {TEMPLATES_SHOWCASE_LIST.map((template, idx) => (
            <div
              key={idx}
              className="bg-onyx border border-graphite rounded-none hover:border-signal-lime/30 transition-all duration-300 cursor-pointer group flex flex-col"
            >
              <div
                className={`h-40 w-full bg-linear-to-br ${template.gradient} relative overflow-hidden flex items-center justify-center`}
              >
                <div
                  className="font-jetbrains-mono text-caption sm:text-note leading-tight whitespace-pre opacity-50 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 text-center"
                  style={{ color: template.accent }}
                >
                  {template.preview}
                </div>
              </div>

              <div className="p-5 border-t border-graphite bg-onyx flex items-center justify-between z-10 relative group-hover:bg-graphite transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: template.accent }}
                  />
                  <span className="font-inter-tight font-semibold text-body text-chalk">
                    {template.name}
                  </span>
                </div>
                <div className="flex gap-2">
                  {template.tags.map((tag, tagIdx) => (
                    <span
                      key={tagIdx}
                      className="px-2 py-0.5 border border-graphite rounded-none font-inter-tight text-caption uppercase text-ash tracking-wide bg-transparent"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <a
            href={EXTERNAL_LINKS.GITHUB_FORK}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-onyx border-2 border-signal-lime rounded-none transition-all duration-300 cursor-pointer group flex flex-col hover:shadow-[0_0_30px_rgba(197,255,74,0.2)]"
          >
            <div className="h-40 w-full bg-linear-to-br from-[#0a0a0a] to-[#1a1a0a] relative overflow-hidden flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 group-hover:scale-110 transition-transform duration-500">
                <div className="p-3 rounded-full bg-signal-lime/10 border border-signal-lime/30 group-hover:bg-signal-lime/20 transition-colors">
                  <GitFork size={28} className="text-signal-lime" />
                </div>
                <span className="font-jetbrains-mono text-caption text-signal-lime/60 group-hover:text-signal-lime/90 transition-colors">
                  fork → contribute → PR
                </span>
              </div>
            </div>

            <div className="p-5 border-t border-signal-lime/30 bg-signal-lime/5 flex items-center justify-between z-10 relative group-hover:bg-signal-lime/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-signal-lime animate-pulse" />
                <span className="font-inter-tight font-semibold text-body text-signal-lime">
                  {t('landing.templates.contribute', 'Crie o Seu!')}
                </span>
              </div>
              <span className="px-2 py-0.5 border border-signal-lime rounded-none font-inter-tight text-caption uppercase text-signal-lime tracking-wide bg-signal-lime/10">
                Fork
              </span>
            </div>
          </a>
        </div>
      </div>
    </section>
  )
}
