'use client'

import { GitFork, Layers, LayoutTemplate, Palette } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import React, { useMemo, useState } from 'react'

import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import Magnet from '@/components/ui/Magnet'
import ShinyText from '@/components/ui/ShinyText'
import SpotlightCard from '@/components/ui/SpotlightCard'
import { EXTERNAL_LINKS } from '@/constants'
import { renderSvg } from '@/engine/core/SVGEngine'
import {
  createConfiguration,
  TEMPLATE_PRESETS,
  type TemplatePreset,
} from '@/engine/core/TemplateRenderer'
import { getMockGitHubData } from '@/features/github/api/mockProfile'
import { useI18n } from '@/i18n'

interface TemplatesPreviewProps {
  count?: number
}

export function TemplatesPreview({ count = 18 }: TemplatesPreviewProps) {
  const { t } = useI18n()
  const demoData = useMemo(() => getMockGitHubData('Igorcbraz'), [])

  const templateList: TemplatePreset[] = useMemo(() => {
    return Object.values(TEMPLATE_PRESETS).filter((p) => p.id !== 'blank')
  }, [])

  const [selectedId, setSelectedId] = useState<string>('native')

  const activeTemplate = useMemo(() => {
    return templateList.find((p) => p.id === selectedId) || templateList[0]
  }, [templateList, selectedId])

  const activeSvgMarkup = useMemo(() => {
    const config = createConfiguration(
      0,
      'Igorcbraz',
      activeTemplate.id,
      'default',
      'Default',
      demoData
    )
    const rawSvg = renderSvg(config, demoData, { width: 800 })
    return rawSvg.replace(/<\?xml[\s\S]*?\?>/i, '').trim()
  }, [activeTemplate.id, demoData])

  return (
    <section
      id="templates-preview"
      className="relative z-10 w-full bg-transparent py-20 md:py-32 px-4 sm:px-6 lg:px-8 border-b border-graphite/60 overflow-hidden"
    >
      <div className="relative z-10 mx-auto w-full max-w-7xl space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-signal-lime/5 border border-signal-lime/20 text-signal-lime font-jetbrains-mono text-[11px] uppercase tracking-[0.2em]">
            <LayoutTemplate className="w-3.5 h-3.5" />
            <ShinyText speed={3}>
              [ <AnimatedCounter value={count} suffix="+" />{' '}
              {t('landing.templates.badge_suffix', 'PRODUCTION TEMPLATES')} ]
            </ShinyText>
          </div>

          <h2 className="font-pt-serif font-light text-3xl sm:text-heading leading-[0.95] tracking-[-0.02em] text-chalk">
            {t('landing.templates.title_start', 'Authentic Layouts Generated Directly by the ')}
            <em className="italic text-signal-lime">
              {t('landing.templates.title_highlight', 'Engine.')}
            </em>
          </h2>

          <p className="font-inter-tight text-body text-bone leading-body max-w-xl mx-auto">
            {t(
              'landing.templates.subtitle',
              `What you see is exactly what the editor renders on your canvas. Pick any layout preset to instantly load its configured widgets, typography, and color tokens.`
            )}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 flex flex-col"
          >
            <SpotlightCard className="p-6 sm:p-7 flex flex-col justify-between h-full bg-onyx border-graphite">
              <div className="flex flex-col h-full justify-between space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-graphite/80">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-jetbrains-mono text-[11px] text-signal-lime uppercase tracking-wider">
                        [ tpl://{activeTemplate.id} ]
                      </span>
                      <span className="px-2 py-0.5 bg-carbon border border-graphite rounded-none font-jetbrains-mono text-[10px] uppercase text-ash">
                        {t(
                          'landing.templates.widgets_placed',
                          `${activeTemplate.layout.length} Widgets Placed`,
                          {
                            count: String(activeTemplate.layout.length),
                          }
                        )}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight mt-1">
                      {activeTemplate.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 bg-carbon px-3 py-1.5 border border-graphite">
                    <Palette size={13} className="text-ash" />
                    <span className="font-jetbrains-mono text-[10px] text-ash uppercase">
                      {t('landing.templates.palette', 'Palette:')}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-3 h-3 rounded-full border border-white/20"
                        title={`Background: ${activeTemplate.colors.background}`}
                        style={{ backgroundColor: activeTemplate.colors.background }}
                      />
                      <div
                        className="w-3 h-3 rounded-full border border-white/20"
                        title={`Accent: ${activeTemplate.colors.accent}`}
                        style={{ backgroundColor: activeTemplate.colors.accent }}
                      />
                      <div
                        className="w-3 h-3 rounded-full border border-white/20"
                        title={`Text: ${activeTemplate.colors.text}`}
                        style={{ backgroundColor: activeTemplate.colors.text }}
                      />
                    </div>
                  </div>
                </div>

                <p className="font-inter-tight text-[13px] text-bone leading-relaxed">
                  {activeTemplate.description}
                </p>

                <div className="bg-void-black border border-graphite p-4 my-2 overflow-hidden flex-1 min-h-[300px] flex items-center justify-center relative shadow-inner">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTemplate.id}
                      initial={{ opacity: 0, scale: 0.99 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="w-full h-full flex items-center justify-center"
                    >
                      <div
                        suppressHydrationWarning
                        className="w-full max-w-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-h-[460px] [&>svg]:object-contain shadow-lg"
                        dangerouslySetInnerHTML={{ __html: activeSvgMarkup }}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="font-jetbrains-mono text-[10px] uppercase text-ash mr-1 flex items-center gap-1">
                    <Layers size={10} className="text-signal-lime" />
                    {t('landing.templates.included', 'Included:')}
                  </span>
                  {activeTemplate.layout.slice(0, 6).map((w, wIdx) => (
                    <span
                      key={wIdx}
                      className="px-2 py-0.5 border border-graphite rounded-none font-jetbrains-mono text-[9px] uppercase text-pearl bg-carbon"
                    >
                      {w.widgetId}
                    </span>
                  ))}
                  {activeTemplate.layout.length > 6 && (
                    <span className="px-2 py-0.5 border border-graphite rounded-none font-jetbrains-mono text-[9px] uppercase text-ash bg-carbon">
                      {t(
                        'landing.templates.more_widgets',
                        `+${activeTemplate.layout.length - 6} more`,
                        {
                          count: String(activeTemplate.layout.length - 6),
                        }
                      )}
                    </span>
                  )}
                </div>

                <div className="pt-3 border-t border-graphite/60 flex flex-wrap items-center justify-between gap-3">
                  <span className="font-jetbrains-mono text-[11px] text-ash">
                    {t('landing.templates.engine_layout', 'Engine Layout:')}{' '}
                    <code className="text-signal-lime">{activeTemplate.id}.json</code>
                  </span>
                  <span className="font-jetbrains-mono text-[10px] text-signal-lime uppercase">
                    {t('landing.templates.vector_mode', '[ Pixel-Perfect Vector Mode ]')}
                  </span>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex flex-col justify-between gap-3"
          >
            <div className="flex items-center justify-between px-1 pb-2 border-b border-graphite text-ash font-jetbrains-mono text-[11px] uppercase">
              <span>{t('landing.templates.presets_header', 'Layout Presets')}</span>
              <span>
                {t(
                  'landing.templates.available_studio',
                  `${templateList.length} Available in Studio`,
                  {
                    count: String(templateList.length),
                  }
                )}
              </span>
            </div>

            <div className="flex flex-col justify-between flex-1 gap-2">
              {templateList.map((template) => {
                const isSelected = template.id === selectedId
                return (
                  <motion.div
                    key={template.id}
                    onClick={() => setSelectedId(template.id)}
                    whileHover={{ x: -4 }}
                    transition={{ duration: 0.2 }}
                    className={`p-3 border transition-all duration-300 cursor-pointer relative overflow-hidden select-none flex-1 flex flex-col justify-center ${
                      isSelected
                        ? 'bg-onyx border-signal-lime shadow-[0_0_20px_rgba(197,255,74,0.12)]'
                        : 'bg-void-black/60 border-graphite hover:border-ash/60 hover:bg-onyx/50'
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="activeTemplateIndicator"
                        className="absolute right-0 top-0 bottom-0 w-1.5 bg-signal-lime shadow-[0_0_12px_rgba(197,255,74,0.8)]"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                          style={{ backgroundColor: template.colors.accent }}
                        />
                        <div className="min-w-0">
                          <h4
                            className={`font-inter-tight font-semibold text-[13px] truncate transition-colors ${
                              isSelected ? 'text-signal-lime' : 'text-chalk'
                            }`}
                          >
                            {template.name}
                          </h4>
                          <p className="font-inter-tight text-[11px] text-ash truncate mt-0.5">
                            {template.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`font-jetbrains-mono text-[9px] uppercase px-2 py-0.5 border ${
                            isSelected
                              ? 'border-signal-lime/40 bg-signal-lime/10 text-signal-lime'
                              : 'border-graphite bg-carbon text-ash'
                          }`}
                        >
                          {template.widgetCategory || template.category || 'Native'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}

              <a
                href={EXTERNAL_LINKS.GITHUB_FORK}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 border border-dashed border-signal-lime/50 bg-signal-lime/5 hover:bg-signal-lime/10 hover:border-signal-lime transition-all duration-300 cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-xs bg-signal-lime text-black shrink-0">
                    <GitFork size={13} />
                  </div>
                  <div>
                    <h4 className="font-inter-tight font-semibold text-[12px] text-signal-lime leading-tight">
                      {t('landing.templates.contribute', 'Contribute a Template!')}
                    </h4>
                    <p className="font-inter-tight text-[10px] text-ash leading-tight mt-0.5">
                      {t(
                        'landing.templates.contribute_desc',
                        'Submit your JSON preset via GitHub Pull Request'
                      )}
                    </p>
                  </div>
                </div>
                <span className="font-jetbrains-mono text-[9px] text-signal-lime uppercase px-2 py-0.5 border border-signal-lime/40 bg-signal-lime/10">
                  {t('landing.templates.fork', 'Fork')}
                </span>
              </a>
            </div>
          </motion.div>
        </div>

        <div className="text-center pt-4">
          <Magnet distance={80} strength={0.2}>
            <Link
              href="/templates"
              className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3.5 bg-signal-lime hover:bg-signal-lime-hover text-carbon font-inter-tight font-semibold text-[14px] uppercase tracking-wider transition-colors shadow-[0_0_20px_rgba(197,255,74,0.2)]"
            >
              <span>
                {t(
                  'landing.templates.explore_all',
                  `Explore Complete Template Directory (${count}+)`,
                  {
                    count: String(count),
                  }
                )}
              </span>
              <span aria-hidden="true">→</span>
            </Link>
          </Magnet>
        </div>
      </div>
    </section>
  )
}

export default TemplatesPreview
