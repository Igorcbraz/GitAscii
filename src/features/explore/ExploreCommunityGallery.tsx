'use client'

import { ArrowRight, Github, Search } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import { useI18n } from '@/i18n'

import type { CommunityProfileItem } from './getCommunityProfiles'

interface ExploreCommunityGalleryProps {
  initialProfiles: CommunityProfileItem[]
}

export function ExploreCommunityGallery({ initialProfiles }: ExploreCommunityGalleryProps) {
  const router = useRouter()
  const { t } = useI18n()
  const [loadingProfile, setLoadingProfile] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('all')

  const filteredProfiles = initialProfiles.filter((p) => {
    const matchesSearch =
      p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesTemplate =
      selectedTemplate === 'all' || p.templateId.toLowerCase() === selectedTemplate.toLowerCase()

    return matchesSearch && matchesTemplate
  })

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-onyx border border-graphite p-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <span className="font-jetbrains-mono text-caption text-ash uppercase tracking-wider shrink-0 mr-2 ml-2">
            {t('explore.gallery.filter', 'Filter:')}
          </span>
          {[
            { id: 'all', label: t('explore.gallery.all', 'All Community Profiles') },
            { id: 'terminal', label: t('explore.gallery.terminal', 'Terminal CLI') },
            { id: 'dracula', label: t('explore.gallery.dracula', 'Dracula') },
            { id: 'tokyo-night', label: t('explore.gallery.tokyo_night', 'Tokyo Night') },
            { id: 'minimal', label: t('explore.gallery.minimal', 'Minimal') },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedTemplate(item.id)}
              className={`px-4 py-2 text-label font-medium uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                selectedTemplate === item.id
                  ? 'bg-signal-lime text-black shadow-[0_0_8px_rgba(197,255,74,0.3)]'
                  : 'bg-carbon text-ash hover:text-white border border-graphite'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ash" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('explore.gallery.search_placeholder', 'Search developer username...')}
            className="w-full bg-carbon border border-graphite pl-9 pr-4 py-2 font-inter-tight text-note text-chalk placeholder-ash/60 focus:border-signal-lime focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProfiles.map((p) => (
          <article
            key={p.username}
            className="bg-onyx border border-graphite rounded-none flex flex-col justify-between p-6 hover:border-signal-lime/50 transition-all duration-300 group hover:shadow-[0_0_16px_rgba(0,0,0,0.6)]"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-graphite/60">
                <div className="flex items-center gap-3">
                  <Image
                    src={`https://github.com/${p.username}.png?size=80`}
                    alt={`@${p.username}`}
                    width={44}
                    height={44}
                    unoptimized
                    className="size-11 rounded-full border border-graphite bg-carbon object-cover shrink-0"
                    onError={(e) => {
                      const target = e.currentTarget
                      target.style.display = 'none'
                    }}
                  />
                  <div>
                    <h2 className="text-subheading font-medium text-chalk group-hover:text-signal-lime transition-colors">
                      @{p.username}
                    </h2>
                    <span className="font-jetbrains-mono text-caption text-signal-lime uppercase tracking-wider block">
                      {t('explore.gallery.template', 'Template:')} {p.templateId}
                    </span>
                  </div>
                </div>

                <a
                  href={`https://github.com/${p.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 border border-graphite bg-carbon hover:border-signal-lime text-ash hover:text-white transition-colors cursor-pointer"
                  title={t('explore.gallery.view_github', 'View GitHub Profile')}
                >
                  <Github size={16} />
                </a>
              </div>

              <div className="bg-carbon border border-graphite p-3 mb-5 rounded-none overflow-hidden min-h-[120px] flex items-center justify-center relative">
                <Image
                  src={`/api/${p.username}?template=${p.templateId}`}
                  alt={`GitAscii Card for @${p.username}`}
                  width={800}
                  height={144}
                  unoptimized
                  className="max-w-full max-h-36 object-contain"
                  onError={(e) => {
                    const target = e.currentTarget
                    target.style.display = 'none'
                  }}
                />
                <span className="font-jetbrains-mono text-caption text-ash/60 absolute bottom-1 right-2">
                  {t('explore.gallery.live_preview', 'Live Card Preview')}
                </span>
              </div>

              <div className="flex items-center gap-1.5 mb-6 flex-wrap">
                {p.isStored && (
                  <span className="px-2 py-0.5 bg-signal-lime/10 border border-signal-lime/30 font-jetbrains-mono text-caption text-signal-lime uppercase tracking-wider">
                    ● {t('explore.gallery.stored_profile', 'Stored Profile')}
                  </span>
                )}
                {p.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 border border-graphite bg-carbon font-jetbrains-mono text-caption text-ash uppercase tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-graphite/60">
              <button
                onClick={() => {
                  setLoadingProfile(p.username)
                  router.push(`/${p.username}`)
                }}
                disabled={loadingProfile === p.username}
                className="w-full inline-flex items-center justify-center gap-2 bg-signal-lime text-black font-medium text-label py-3 transition-all uppercase tracking-wider hover:brightness-110 shadow-[0_0_8px_rgba(197,255,74,0.25)] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span>
                  {loadingProfile === p.username
                    ? t('explore.gallery.loading', 'Loading...')
                    : t('explore.gallery.inspect', 'Inspect & Customize Profile')}
                </span>
                {loadingProfile === p.username ? (
                  <span className="size-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRight size={14} />
                )}
              </button>
            </div>
          </article>
        ))}
      </div>

      {filteredProfiles.length === 0 && (
        <div className="bg-onyx border border-graphite p-12 text-center space-y-4">
          <p className="text-subheading text-chalk">
            {t('explore.gallery.no_results', 'No community profiles matched your query.')}
          </p>
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedTemplate('all')
            }}
            className="px-6 py-2 bg-signal-lime text-black font-medium uppercase text-label cursor-pointer"
          >
            {t('explore.gallery.reset', 'Reset Filters')}
          </button>
        </div>
      )}
    </div>
  )
}
