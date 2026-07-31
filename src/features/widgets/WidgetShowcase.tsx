'use client'

import { ArrowRight, Check, Copy, ExternalLink, Github, RefreshCw } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'

import { useToast } from '@/components/ui/toast'
import { attributions, WidgetItem, widgetsList } from '@/data/widgetsData'
import { WIDGET_CATALOG } from '@/features/editor/components/Sidebar/WidgetLibrary'
import { useI18n } from '@/i18n'

export function WidgetShowcase() {
  const { t } = useI18n()
  const [usernameInput, setUsernameInput] = useState('Igorcbraz')
  const [activeUsername, setActiveUsername] = useState('Igorcbraz')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const { success } = useToast()

  const handleTestUsername = (e: React.FormEvent) => {
    e.preventDefault()
    if (usernameInput.trim()) {
      setActiveUsername(usernameInput.trim())
    }
  }

  const handleCopyMarkdown = (widget: WidgetItem) => {
    const snippet = widget.codeSnippet.replace('YOUR_USERNAME', activeUsername)
    navigator.clipboard.writeText(snippet)
    setCopiedId(widget.id)
    success(`Copied ${widget.name} markdown for @${activeUsername}.`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const allWidgets = React.useMemo(() => {
    const existingIds = new Set(widgetsList.map((w) => w.id))
    const externalWidgets: WidgetItem[] = WIDGET_CATALOG.filter(
      (w) => w.category === 'external'
    ).map((w) => ({
      id: w.id,
      name: w.name,
      type: 'External Widget',
      description: w.desc,
      codeSnippet: `![${w.name}](https://git-ascii.vercel.app/api/YOUR_USERNAME?widgets=${w.id})`,
      features: ['Live SVG Rendering', 'Editor Integration', 'Dynamic Theme Support'],
      githubSourceUrl: 'https://github.com/Igorcbraz/GitAscii',
    }))

    const uniqueExternal = externalWidgets.filter((w) => !existingIds.has(w.id))
    return [...widgetsList, ...uniqueExternal]
  }, [])

  return (
    <div className="space-y-16">
      <div className="bg-onyx border border-graphite p-8 rounded-none">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="font-jetbrains-mono text-caption text-signal-lime uppercase tracking-widest block mb-1">
              {t('widget_showcase.interactive_playground', '[ LIVE INTERACTIVE PLAYGROUND ]')}
            </span>
            <h3 className="font-pt-serif font-light text-2xl text-chalk">
              {t('widget_showcase.title', 'Test Live SVG Widgets with Any GitHub Username')}
            </h3>
            <p className="text-note text-ash font-inter-tight mt-1">
              {t(
                'widget_showcase.description',
                'Type a username to see how GitAscii live endpoints generate dynamic SVGs for your profile.'
              )}
            </p>
          </div>

          <form onSubmit={handleTestUsername} className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-jetbrains-mono text-caption text-ash">
                @
              </span>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder={t('widget_showcase.username_placeholder', 'username')}
                className="w-full bg-carbon border border-graphite pl-7 pr-3 py-2 font-jetbrains-mono text-note text-chalk placeholder-ash/50 focus:border-signal-lime focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-signal-lime text-black font-inter-tight font-medium text-label px-5 py-2 uppercase tracking-wider hover:brightness-110 cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              <RefreshCw className="size-3.5" />
              <span>{t('widget_showcase.preview_button', 'Preview')}</span>
            </button>
          </form>
        </div>
      </div>

      <div className="space-y-8">
        {allWidgets.map((widget) => {
          const widgetParamMap: Record<string, string> = {
            stats: 'stats',
            streak: 'streak-stats',
            languages: 'languages',
            ascii: 'ascii-art',
            stack: 'tech-stack',
          }
          const widgetThemeMap: Record<string, string> = {
            stats: 'dracula',
            streak: 'dracula',
            languages: 'terminal',
            ascii: 'terminal',
            stack: 'minimal',
          }
          const widgetParam = widgetParamMap[widget.id] || widget.id
          const themeParam = widgetThemeMap[widget.id] || 'terminal'
          const liveUrl = `/api/${activeUsername}?widgets=${widgetParam}&template=${themeParam}`
          const markdownSnippet = widget.codeSnippet.replace('YOUR_USERNAME', activeUsername)

          return (
            <article
              key={widget.id}
              className="bg-onyx border border-graphite p-6 flex flex-col lg:flex-row justify-between items-start gap-6 hover:border-signal-lime/40 transition-all group"
            >
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-jetbrains-mono text-caption text-signal-lime uppercase tracking-widest bg-carbon px-2.5 py-1 border border-graphite">
                    {widget.type}
                  </span>
                  <a
                    href={widget.githubSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-jetbrains-mono text-[11px] text-ash hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <Github className="size-3.5" />
                    <span>{t('widget_showcase.view_source', 'View Source Code ↗')}</span>
                  </a>
                </div>

                <h2 className="text-subheading font-medium text-chalk group-hover:text-signal-lime transition-colors">
                  {widget.name}
                </h2>
                <p className="text-body text-bone leading-relaxed text-note">
                  {widget.description}
                </p>

                <div className="flex items-center gap-4 flex-wrap pt-1">
                  {widget.features.map((f, idx) => (
                    <span
                      key={idx}
                      className="text-note text-ash flex items-center gap-1.5 font-inter-tight"
                    >
                      <span className="text-signal-lime font-bold">•</span> {f}
                    </span>
                  ))}
                </div>

                <div className="bg-carbon border border-graphite p-3 font-jetbrains-mono text-caption text-signal-lime flex items-center justify-between gap-4">
                  <code className="truncate">{markdownSnippet}</code>
                  <button
                    onClick={() => handleCopyMarkdown(widget)}
                    className="shrink-0 text-ash hover:text-signal-lime p-1 cursor-pointer transition-colors"
                    title={t('widget_showcase.copy_markdown', 'Copy Markdown')}
                  >
                    {copiedId === widget.id ? (
                      <Check className="size-4 text-signal-lime" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="w-full lg:w-72 shrink-0 bg-carbon border border-graphite p-4 flex flex-col justify-between gap-4 self-stretch lg:self-start">
                <div>
                  <span className="font-jetbrains-mono text-caption text-ash uppercase tracking-wider block mb-2">
                    {t('widget_showcase.live_preview', '[ LIVE PREVIEW ]')}
                  </span>
                  <div className="bg-void-black border border-graphite p-2.5 rounded-none flex flex-col items-center justify-center text-center overflow-hidden min-h-[90px]">
                    <Image
                      src={liveUrl}
                      alt={widget.name}
                      width={800}
                      height={96}
                      unoptimized
                      className="max-w-full max-h-24 object-contain"
                      onError={(e) => {
                        const target = e.currentTarget
                        target.style.display = 'none'
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Link
                    href={`/widgets/${widget.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 bg-graphite hover:bg-signal-lime hover:text-black text-chalk font-medium text-caption py-2 uppercase tracking-wider transition-all"
                  >
                    <span>{t('widget_showcase.view_docs', 'View Docs & API Params')}</span>
                    <ArrowRight size={12} />
                  </Link>

                  <Link
                    href={`/?username=${activeUsername}&widget=${widget.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 bg-carbon border border-graphite hover:border-signal-lime text-ash hover:text-white font-medium text-caption py-1.5 uppercase tracking-wider transition-all"
                  >
                    <span>{t('widget_showcase.edit_builder', 'Edit in Visual Builder')}</span>
                  </Link>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <section className="bg-onyx border border-graphite p-8 rounded-none space-y-6">
        <div className="border-b border-graphite pb-4">
          <span className="font-jetbrains-mono text-caption text-signal-lime uppercase tracking-widest block mb-1">
            {t(
              'widget_showcase.attribution_label',
              '[ OPEN SOURCE ATTRIBUTION & ACKNOWLEDGEMENTS ]'
            )}
          </span>
          <h3 className="font-pt-serif font-light text-2xl text-chalk">
            {t('widget_showcase.powered_by', 'Powered by the Open Source Ecosystem')}
          </h3>
          <p className="text-note text-ash font-inter-tight mt-1">
            {t(
              'widget_showcase.attribution_description',
              'GitAscii stands on the shoulders of incredible open-source projects, APIs, and standard libraries.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {attributions.map((item) => (
            <div key={item.name} className="bg-carbon border border-graphite p-5 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-inter-tight font-medium text-chalk text-subheading">
                  {item.name}
                </h4>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-jetbrains-mono text-[11px] text-signal-lime hover:underline flex items-center gap-1"
                >
                  <span>{t('widget_showcase.website', 'Website')}</span>
                  <ExternalLink size={12} />
                </a>
              </div>
              <p className="text-note text-bone leading-relaxed">{item.description}</p>
              <div className="pt-1">
                <span className="font-jetbrains-mono text-caption text-ash uppercase">
                  {t('widget_showcase.license', 'License:')} {item.license}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
