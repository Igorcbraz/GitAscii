'use client'

import { ArrowRight, Check, Copy, Filter, Search } from 'lucide-react'
import Link from 'next/link'
import React, { useMemo, useState } from 'react'

import { TechIcon } from '@/components/ui/TechIcon'
import { useToast } from '@/components/ui/toast'
import { APP_URL } from '@/constants'
import { languageStacks, templateList } from '@/data/templatesData'
import { renderSvg } from '@/engine/core/SVGEngine'
import { createConfiguration, TEMPLATE_PRESETS } from '@/engine/core/TemplateRenderer'
import { getMockGitHubData } from '@/features/github/api/mockProfile'
import { useI18n } from '@/i18n'
import { copyToClipboard } from '@/utils/clipboard'

export function TemplateGallery() {
  const { t } = useI18n()
  const demoData = useMemo(() => getMockGitHubData('Igorcbraz'), [])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)
  const { success } = useToast()

  const renderedSvgMap = useMemo(() => {
    const map: Record<string, string> = {}
    templateList.forEach((tpl) => {
      const targetPresetId = TEMPLATE_PRESETS[tpl.slug] ? tpl.slug : 'native'
      const config = createConfiguration(
        0,
        'Igorcbraz',
        targetPresetId,
        'default',
        'Default',
        demoData
      )

      config.globalStyles.backgroundColor = tpl.bg
      config.globalStyles.accentColor = tpl.accent
      config.globalStyles.templateStyle = tpl.slug

      const rawSvg = renderSvg(config, demoData, { width: 800 })
      map[tpl.slug] = rawSvg.replace(/<\?xml[\s\S]*?\?>/i, '').trim()
    })
    return map
  }, [demoData])

  const filteredTemplates = templateList.filter((tpl) => {
    const matchesCategory = activeCategory === 'all' || tpl.category === activeCategory
    const matchesSearch =
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesCategory && matchesSearch
  })

  const handleCopyMarkdown = async (slug: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const markdown = `<!-- GitAscii ${slug} template -->\n![GitHub Profile Card](${APP_URL}/api/YOUR_USERNAME?theme=${slug})`
    const copied = await copyToClipboard(markdown)
    if (copied) {
      setCopiedSlug(slug)
      success(`Copied ${slug} template SVG snippet to clipboard.`)
      setTimeout(() => setCopiedSlug(null), 2000)
    }
  }

  return (
    <div className="w-full space-y-12">
      <div className="bg-onyx border border-graphite p-6 rounded-none">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-graphite/60">
          <div>
            <span className="font-jetbrains-mono text-caption text-signal-lime uppercase tracking-widest block">
              {t('template_gallery.stack_directory', '[ STACK DIRECTORY ]')}
            </span>
            <h3 className="font-pt-serif font-light text-subheading text-chalk">
              {t('template_gallery.title', 'Language & Framework Specific Templates')}
            </h3>
          </div>
          <span className="text-caption text-ash font-inter-tight">
            {t(
              'template_gallery.subtitle',
              'Tailored badges, SVG widgets, and presets for your ecosystem'
            )}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {languageStacks.map((stack) => (
            <Link
              key={stack.slug}
              href={`/templates/${stack.slug}`}
              className="flex items-center gap-2.5 bg-carbon border border-graphite p-3 text-chalk hover:border-signal-lime hover:text-signal-lime transition-all group"
            >
              <TechIcon name={stack.slug} className="size-4.5 text-signal-lime shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="font-inter-tight text-label font-medium truncate">
                  {stack.name}
                </span>
                <span className="font-jetbrains-mono text-caption text-ash group-hover:text-signal-lime/80 uppercase">
                  {t('template_gallery.view_template', 'View Template ↗')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-onyx border border-graphite p-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <Filter className="size-4 text-ash shrink-0 hidden sm:block ml-2" />
          {[
            { id: 'all', label: t('template_gallery.categories.all', 'All Templates') },
            { id: 'cli', label: t('template_gallery.categories.cli', 'CLI & Hacker') },
            { id: 'minimal', label: t('template_gallery.categories.minimal', 'Minimal') },
            { id: 'themes', label: t('template_gallery.categories.themes', 'Color Themes') },
            { id: 'pro', label: t('template_gallery.categories.pro', 'Pro & Community') },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 text-label font-medium uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-signal-lime text-black shadow-[0_0_8px_rgba(197,255,74,0.3)]'
                  : 'bg-carbon text-ash hover:text-white border border-graphite'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ash" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('template_gallery.search_placeholder', 'Search templates or tags...')}
            className="w-full bg-carbon border border-graphite pl-9 pr-4 py-2 font-inter-tight text-note text-chalk placeholder-ash/60 focus:border-signal-lime focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredTemplates.map((tpl) => (
          <article
            key={tpl.slug}
            className="bg-onyx border border-graphite rounded-none flex flex-col justify-between p-6 hover:border-signal-lime/50 transition-all duration-300 group hover:shadow-[0_0_16px_rgba(0,0,0,0.6)]"
          >
            <div>
              <div className="h-48 w-full rounded-none mb-6 p-2 flex items-center justify-center border border-graphite relative overflow-hidden bg-void-black shadow-inner">
                <div
                  suppressHydrationWarning
                  className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-h-44 [&>svg]:object-contain"
                  dangerouslySetInnerHTML={{ __html: renderedSvgMap[tpl.slug] || '' }}
                />
                {tpl.popular && (
                  <div className="absolute top-2 right-2 z-10">
                    <span className="bg-signal-lime text-black font-inter-tight text-caption font-bold px-2 py-0.5 uppercase tracking-wider shadow-xs">
                      {t('template_gallery.badge.popular', 'Popular')}
                    </span>
                  </div>
                )}
                {tpl.featured && !tpl.popular && (
                  <div className="absolute top-2 right-2 z-10">
                    <span className="bg-white/10 text-white border border-white/20 backdrop-blur-xs font-inter-tight text-caption font-medium px-2 py-0.5 uppercase tracking-wider">
                      {t('template_gallery.badge.featured', 'Featured')}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                {tpl.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 border border-graphite bg-carbon font-jetbrains-mono text-caption text-ash uppercase tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h2 className="text-subheading font-medium text-chalk mb-2 group-hover:text-signal-lime transition-colors">
                {tpl.name}
              </h2>
              <p className="text-body text-bone leading-relaxed mb-6">{tpl.description}</p>
            </div>

            <div className="space-y-2 pt-4 border-t border-graphite/60">
              <Link
                href={`/?template=${tpl.slug}`}
                className="w-full inline-flex items-center justify-center gap-2 bg-signal-lime text-black font-medium text-label py-3 transition-all uppercase tracking-wider hover:brightness-110 shadow-[0_0_8px_rgba(197,255,74,0.25)]"
              >
                <span>{t('template_gallery.use_in_editor', 'Use in Visual Editor')}</span>
                <ArrowRight size={14} />
              </Link>

              <button
                onClick={(e) => handleCopyMarkdown(tpl.slug, e)}
                className="w-full inline-flex items-center justify-center gap-2 bg-carbon border border-graphite hover:border-signal-lime text-ash hover:text-white font-medium text-caption py-2 transition-all uppercase tracking-wider cursor-pointer"
              >
                {copiedSlug === tpl.slug ? (
                  <>
                    <Check size={12} className="text-signal-lime" />
                    <span className="text-signal-lime">
                      {t('template_gallery.copied_markdown', 'Copied Markdown')}
                    </span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>{t('template_gallery.copy_snippet', 'Copy SVG Snippet')}</span>
                  </>
                )}
              </button>
            </div>
          </article>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="bg-onyx border border-graphite p-12 text-center space-y-4">
          <p className="text-subheading text-chalk">
            {t('template_gallery.no_results', 'No templates matched your search filter.')}
          </p>
          <button
            onClick={() => {
              setSearchQuery('')
              setActiveCategory('all')
            }}
            className="px-6 py-2 bg-signal-lime text-black font-medium uppercase text-label cursor-pointer"
          >
            {t('template_gallery.reset_filters', 'Reset Filters')}
          </button>
        </div>
      )}
    </div>
  )
}
