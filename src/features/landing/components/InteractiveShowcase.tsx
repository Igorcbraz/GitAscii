'use client'

import { ArrowRight, Check, Copy, ExternalLink, Github, User, Zap } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'

import {
  FEATURED_GUIDES,
  FEATURED_PROFILES,
  POPULAR_TEMPLATES,
  SHOWCASE_TABS,
  SHOWCASE_WIDGETS,
} from '@/constants'
import { useI18n } from '@/i18n'
import { API_ENDPOINTS } from '@/services/endpoints'

export default function InteractiveShowcase() {
  const { language } = useI18n()
  const [activeTab, setActiveTab] = useState<'templates' | 'widgets' | 'profiles' | 'guides'>(
    'templates'
  )
  const [copied, setCopied] = useState(false)
  const [copiedText, setCopiedText] = useState('')

  const [selectedTemplate, setSelectedTemplate] = useState('terminal')
  const [selectedWidget, setSelectedWidget] = useState('stats')
  const [selectedProfile, setSelectedProfile] = useState('igorcbraz')
  const [selectedGuide, setSelectedGuide] = useState('github')

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(text)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
      setCopiedText('')
    }, 2000)
  }

  const tc = (key: string, enVal: string, ptVal: string) => {
    return language === 'pt' ? ptVal : enVal
  }

  const tabs = SHOWCASE_TABS.map((tab) => ({
    id: tab.id,
    label: tc(tab.labelKey, tab.labelEn, tab.labelPt),
    icon: tab.icon,
  }))

  const popularTemplates = POPULAR_TEMPLATES

  const showcaseWidgets = SHOWCASE_WIDGETS.map((widget) => ({
    id: widget.id,
    name: tc(widget.nameKey, widget.nameEn, widget.namePt),
    snippet: widget.snippet,
    desc: tc(widget.descKey, widget.descEn, widget.descPt),
  }))

  const featuredProfiles = FEATURED_PROFILES

  const featuredGuides = FEATURED_GUIDES.map((guide) => ({
    id: guide.id,
    title: guide.title,
    publisher: guide.publisher,
    url: guide.url,
    readTime: guide.readTime,
    summary: tc(guide.summaryKey, guide.summaryEn, guide.summaryPt),
  }))

  return (
    <section
      id="showcase-hub"
      className="bg-carbon py-24 md:py-32 border-t border-graphite relative z-10 w-full"
    >
      <div className="mx-auto w-full max-w-7xl px-6 md:px-12 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-8">
          <span className="font-inter-tight font-medium text-eyebrow uppercase tracking-[0.22em] text-ash block">
            {tc(
              'landing.showcase.eyebrow',
              '[ EXPLORE THE PLATFORM HUB ]',
              '[ EXPLORAR CENTRAL DA PLATAFORMA ]'
            )}
          </span>
          <h2 className="font-pt-serif font-light text-heading leading-[0.95] tracking-[-0.02em] text-chalk">
            {tc('landing.showcase.title_normal', 'Everything under one ', 'Tudo sob a mesma ')}
            <em className="italic text-signal-lime">
              {tc('landing.showcase.title_italic', 'Platform.', 'Plataforma.')}
            </em>
          </h2>
          <p className="font-inter-tight text-body text-bone leading-body max-w-lg mx-auto">
            {tc(
              'landing.showcase.subtitle',
              'Interact with templates, live SVG widgets, community developer portfolios, and curation guides directly from the homepage.',
              'Interaja com templates, widgets SVG dinâmicos, portfólios da comunidade e guias de criação diretamente da página inicial.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-onyx border border-graphite p-6 md:p-8 rounded-none">
          <div className="lg:col-span-4 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-graphite pb-6 lg:pb-0 lg:pr-8 gap-6">
            <div className="space-y-3">
              <span className="font-jetbrains-mono text-caption text-ash uppercase tracking-wider block mb-2">
                {tc(
                  'landing.showcase.navigator',
                  '[ NAVIGATE PLATFORM ]',
                  '[ NAVEGAR PLATAFORMA ]'
                )}
              </span>

              <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 gap-2 shrink-0 scrollbar-none">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-4 py-3.5 flex items-center gap-3 transition-all cursor-pointer rounded-none border uppercase font-inter-tight text-label font-medium tracking-wide whitespace-nowrap lg:whitespace-normal shrink-0 ${
                        isActive
                          ? 'bg-signal-lime text-black border-signal-lime shadow-[0_0_10px_rgba(197,255,74,0.25)]'
                          : 'bg-carbon text-ash border-graphite hover:text-chalk hover:border-ash/50'
                      }`}
                    >
                      <Icon size={16} className="shrink-0" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="hidden lg:block bg-carbon border border-graphite p-4 space-y-3">
              <div className="flex justify-between items-center text-caption font-jetbrains-mono text-ash">
                <span>SYSTEM STATUS</span>
                <span className="text-signal-lime font-bold">● ONLINE</span>
              </div>
              <div className="h-px bg-graphite" />
              <div className="grid grid-cols-2 gap-2 font-jetbrains-mono text-eyebrow">
                <div>
                  <span className="text-ash block">TEMPLATES</span>
                  <span className="text-chalk font-semibold">13+ Catalog</span>
                </div>
                <div>
                  <span className="text-ash block">WIDGETS</span>
                  <span className="text-chalk font-semibold">5 Core Types</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col justify-between pl-0 lg:pl-8 pt-6 lg:pt-0 min-w-0 lg:h-120">
            <AnimatePresence mode="wait">
              {activeTab === 'templates' && (
                <motion.div
                  key="templates-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6 flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="font-jetbrains-mono text-caption text-ash uppercase tracking-widest bg-carbon px-2 py-1 border border-graphite self-start">
                        [ SELECTED THEME PREVIEW ]
                      </span>
                      <div className="flex gap-2">
                        {popularTemplates.map((tItem) => (
                          <button
                            key={tItem.id}
                            onClick={() => setSelectedTemplate(tItem.id)}
                            className={`px-3 py-1 font-inter-tight text-caption uppercase tracking-wider transition-colors cursor-pointer border ${
                              selectedTemplate === tItem.id
                                ? 'bg-signal-lime text-black border-signal-lime font-semibold'
                                : 'bg-carbon text-ash border-graphite hover:text-white'
                            }`}
                          >
                            {tItem.name.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {(() => {
                      const tInfo =
                        popularTemplates.find((tItem) => tItem.id === selectedTemplate) ||
                        popularTemplates[0]
                      const isMinimal = tInfo.id === 'minimal'
                      return (
                        <div
                          className={`border ${tInfo.border} ${tInfo.bg} p-6 transition-all duration-300 min-h-60 relative overflow-hidden flex flex-col justify-between`}
                        >
                          <div className="absolute top-2 right-2 text-ash/30 font-jetbrains-mono text-[9px] uppercase">
                            Preset: {tInfo.name}
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-graphite flex items-center justify-center border border-ash/20 font-jetbrains-mono text-caption text-ash shrink-0">
                                @USER
                              </div>
                              <div>
                                <h3
                                  className={`font-pt-serif font-light text-xl leading-tight ${isMinimal ? 'text-black' : 'text-chalk'}`}
                                >
                                  Igor Braz
                                </h3>
                                <div className="flex gap-2 mt-1">
                                  <span className="px-2 py-0.5 border border-graphite text-[9px] font-jetbrains-mono uppercase text-ash">
                                    DEVELOPER
                                  </span>
                                  <span className="px-2 py-0.5 border border-graphite text-[9px] font-jetbrains-mono uppercase text-ash">
                                    SAO PAULO
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="border border-graphite/60 bg-carbon/50 p-4 font-jetbrains-mono text-eyebrow leading-relaxed">
                              <div className="flex items-center gap-2 mb-2">
                                <span style={{ color: tInfo.accent }}>●</span>
                                <span className={isMinimal ? 'text-black' : 'text-ash'}>
                                  neofetch --gitascii
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1" style={{ color: tInfo.accent }}>
                                  <div>░░▒▒▓▓██████▓▓▒▒░░</div>
                                  <div>░░▒▒▓▓██████▓▓▒▒░░</div>
                                  <div>░░▒▒▓▓██████▓▓▒▒░░</div>
                                </div>
                                <div className={isMinimal ? 'text-black/80' : 'text-bone/80'}>
                                  <div>
                                    <span className="text-ash">Commits:</span> 492
                                  </div>
                                  <div>
                                    <span className="text-ash">Stars:</span> 128
                                  </div>
                                  <div>
                                    <span className="text-ash">Languages:</span> TS, React, Node
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-4 border-t border-graphite/40 mt-4 text-caption font-jetbrains-mono text-ash">
                            <span>[ POWERED BY GITASCII ENGINE ]</span>
                            <span className="flex gap-2">
                              {tInfo.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="border border-graphite px-1.5 py-0.5 uppercase"
                                >
                                  {tag}
                                </span>
                              ))}
                            </span>
                          </div>
                        </div>
                      )
                    })()}
                  </div>

                  <div className="pt-6 border-t border-graphite/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="font-inter-tight text-note text-ash leading-relaxed max-w-md">
                      {tc(
                        'landing.showcase.templates.desc',
                        'We serve 13+ layout presets built directly into the system. Fully responsive, lightweight, and customizable with our drag-and-drop builder.',
                        'Disponibilizamos mais de 13 presets de layout integrados. Totalmente responsivos, leves e customizáveis com nosso editor de arrastar e soltar.'
                      )}
                    </p>
                    <Link
                      href="/templates"
                      className="inline-flex items-center justify-center gap-2 bg-signal-lime text-black font-inter-tight font-medium text-body px-5 py-3 uppercase tracking-wider hover:brightness-110 shadow-[0_0_8px_rgba(197,255,74,0.25)] transition-all shrink-0 rounded-sm"
                    >
                      <span>
                        {tc(
                          'landing.showcase.templates.btn',
                          'View 13+ Templates Presets',
                          'Ver Catálogo de Templates'
                        )}
                      </span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              )}

              {activeTab === 'widgets' && (
                <motion.div
                  key="widgets-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6 flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="font-jetbrains-mono text-caption text-ash uppercase tracking-widest bg-carbon px-2 py-1 border border-graphite self-start">
                        [ DYNAMIC WIDGET PREVIEW ]
                      </span>
                      <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none shrink-0">
                        {showcaseWidgets.map((wItem) => (
                          <button
                            key={wItem.id}
                            onClick={() => setSelectedWidget(wItem.id)}
                            className={`px-3 py-1 font-inter-tight text-caption uppercase tracking-wider transition-colors cursor-pointer border shrink-0 ${
                              selectedWidget === wItem.id
                                ? 'bg-signal-lime text-black border-signal-lime font-semibold'
                                : 'bg-carbon text-ash border-graphite hover:text-white'
                            }`}
                          >
                            {wItem.name.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {(() => {
                      const wInfo =
                        showcaseWidgets.find((wItem) => wItem.id === selectedWidget) ||
                        showcaseWidgets[0]
                      return (
                        <div className="border border-graphite bg-carbon p-6 space-y-6">
                          <div>
                            <h4 className="font-inter-tight font-medium text-subheading text-chalk flex items-center gap-2">
                              <Zap size={16} className="text-signal-lime" />
                              {wInfo.name}
                            </h4>
                            <p className="font-inter-tight text-body text-ash mt-1">{wInfo.desc}</p>
                          </div>

                          <div className="bg-onyx border border-graphite p-6 flex flex-col justify-center items-center min-h-36 font-jetbrains-mono relative">
                            {wInfo.id === 'stats' && (
                              <div className="w-full max-w-md border border-graphite/60 bg-carbon p-4 text-eyebrow space-y-3 shadow-md">
                                <div className="flex justify-between items-center text-signal-lime border-b border-graphite pb-2">
                                  <span className="font-bold">GITASCII STATS</span>
                                  <span className="text-[9px] border border-signal-lime px-1 rounded-sm">
                                    ✓ LIVE
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-bone">
                                  <div className="flex justify-between">
                                    <span className="text-ash">Total Commits:</span>
                                    <span className="text-chalk font-semibold">492</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-ash">Stars Earned:</span>
                                    <span className="text-chalk font-semibold">128</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-ash">PRs Merged:</span>
                                    <span className="text-chalk font-semibold">38</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-ash">Issues Closed:</span>
                                    <span className="text-chalk font-semibold">12</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {wInfo.id === 'streak' && (
                              <div className="w-full max-w-sm border border-graphite/60 bg-carbon p-4 text-eyebrow flex justify-around items-center text-center shadow-md">
                                <div className="space-y-1">
                                  <span className="text-ash block uppercase text-[9px]">
                                    Current Streak
                                  </span>
                                  <span className="text-signal-lime font-bold text-lg flex items-center justify-center gap-1">
                                    🔥 24
                                  </span>
                                  <span className="text-[9px] text-ash">days active</span>
                                </div>
                                <div className="w-px h-10 bg-graphite" />
                                <div className="space-y-1">
                                  <span className="text-ash block uppercase text-[9px]">
                                    Longest Streak
                                  </span>
                                  <span className="text-chalk font-bold text-lg flex items-center justify-center">
                                    45
                                  </span>
                                  <span className="text-[9px] text-ash">days record</span>
                                </div>
                              </div>
                            )}

                            {wInfo.id === 'languages' && (
                              <div className="w-full max-w-md border border-graphite/60 bg-carbon p-4 text-eyebrow space-y-3 shadow-md text-bone">
                                <div className="text-caption font-bold text-ash tracking-wider">
                                  TOP LANGUAGES BYTES
                                </div>
                                <div className="space-y-2">
                                  <div>
                                    <div className="flex justify-between mb-1">
                                      <span>TypeScript (54.2%)</span>
                                      <span className="text-ash">142,500 bytes</span>
                                    </div>
                                    <div className="w-full h-2 bg-graphite">
                                      <div
                                        className="h-full bg-signal-lime"
                                        style={{ width: '54.2%' }}
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <div className="flex justify-between mb-1">
                                      <span>JavaScript (32.1%)</span>
                                      <span className="text-ash">84,300 bytes</span>
                                    </div>
                                    <div className="w-full h-2 bg-graphite">
                                      <div
                                        className="h-full bg-[#bd93f9]"
                                        style={{ width: '32.1%' }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {wInfo.id === 'stack' && (
                              <div className="flex flex-wrap gap-2 justify-center max-w-md">
                                <span className="px-3 py-1 border border-graphite bg-carbon text-eyebrow font-bold text-[#61dafb]">
                                  React.js
                                </span>
                                <span className="px-3 py-1 border border-graphite bg-carbon text-eyebrow font-bold text-chalk">
                                  Next.js
                                </span>
                                <span className="px-3 py-1 border border-graphite bg-carbon text-eyebrow font-bold text-[#339933]">
                                  Node.js
                                </span>
                                <span className="px-3 py-1 border border-graphite bg-carbon text-eyebrow font-bold text-[#3776ab]">
                                  Python
                                </span>
                                <span className="px-3 py-1 border border-graphite bg-carbon text-eyebrow font-bold text-signal-lime">
                                  GitAscii
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="relative bg-carbon border border-graphite p-3 flex justify-between items-center font-jetbrains-mono text-eyebrow">
                            <code className="text-bone truncate pr-16 select-all">
                              {wInfo.snippet}
                            </code>
                            <button
                              onClick={() => handleCopy(wInfo.snippet)}
                              className="absolute top-1/2 right-2 -translate-y-1/2 px-2.5 py-1 bg-onyx hover:bg-graphite border border-graphite text-ash hover:text-signal-lime transition-all flex items-center gap-1.5 cursor-pointer rounded-sm"
                            >
                              {copied && copiedText === wInfo.snippet ? (
                                <>
                                  <Check size={11} className="text-signal-lime" />
                                  <span className="text-caption text-signal-lime">Copiado</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={11} />
                                  <span className="text-caption">Copiar</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )
                    })()}
                  </div>

                  <div className="pt-6 border-t border-graphite/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="font-inter-tight text-note text-ash leading-relaxed max-w-md">
                      {tc(
                        'landing.showcase.widgets.desc',
                        'Generate dynamic vector SVG widget URLs mapping live statistics. Insert standard markdown endpoints directly into your GitHub README files.',
                        'Gere URLs dinâmicas de widgets SVG vetoriais mapeando estatísticas em tempo real. Insira marcadores markdown diretamente no seu README.'
                      )}
                    </p>
                    <Link
                      href="/widgets"
                      className="inline-flex items-center justify-center gap-2 bg-signal-lime text-black font-inter-tight font-medium text-body px-5 py-3 uppercase tracking-wider hover:brightness-110 shadow-[0_0_8px_rgba(197,255,74,0.25)] transition-all shrink-0 rounded-sm"
                    >
                      <span>
                        {tc(
                          'landing.showcase.widgets.btn',
                          'Browse SVG Widgets Library',
                          'Ver Biblioteca de Widgets'
                        )}
                      </span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              )}

              {activeTab === 'profiles' && (
                <motion.div
                  key="profiles-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6 flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-graphite pb-3">
                      <span className="font-jetbrains-mono text-caption text-ash uppercase tracking-widest bg-carbon px-2 py-1 border border-graphite">
                        [ FEATURED PORTFOLIO CARDS ]
                      </span>
                      <div className="flex gap-2">
                        {featuredProfiles.map((pItem) => (
                          <button
                            key={pItem.id}
                            onClick={() => setSelectedProfile(pItem.id)}
                            className={`px-3 py-1 font-inter-tight text-caption uppercase tracking-wider transition-colors cursor-pointer border ${
                              selectedProfile === pItem.id
                                ? 'bg-signal-lime text-black border-signal-lime font-semibold'
                                : 'bg-carbon text-ash border-graphite hover:text-white'
                            }`}
                          >
                            @{pItem.username}
                          </button>
                        ))}
                      </div>
                    </div>

                    {(() => {
                      const pInfo =
                        featuredProfiles.find((pItem) => pItem.id === selectedProfile) ||
                        featuredProfiles[0]
                      return (
                        <div className="border border-graphite bg-carbon p-6 space-y-6">
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-graphite/60">
                            <div className="flex items-center gap-4">
                              <Image
                                src={pInfo.avatar}
                                alt={`@${pInfo.username}`}
                                width={56}
                                height={56}
                                unoptimized
                                className="w-14 h-14 rounded-full border border-graphite bg-onyx shrink-0"
                              />
                              <div>
                                <h4 className="font-inter-tight font-medium text-subheading text-chalk flex items-center gap-2">
                                  {pInfo.name}
                                  <span className="text-[9px] border border-signal-lime text-signal-lime px-2 py-0.5 rounded-full font-jetbrains-mono">
                                    ● STORED
                                  </span>
                                </h4>
                                <span className="font-jetbrains-mono text-caption text-ash">
                                  @{pInfo.username} · {pInfo.role}
                                </span>
                              </div>
                            </div>

                            <a
                              href={API_ENDPOINTS.GITHUB.USER_PROFILE(pInfo.username)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center p-2 border border-graphite hover:border-signal-lime text-ash hover:text-white transition-colors bg-onyx cursor-pointer"
                              title="View GitHub"
                            >
                              <Github size={16} />
                            </a>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-onyx border border-graphite p-4 space-y-2">
                              <span className="text-[9px] font-jetbrains-mono text-ash uppercase block">
                                CONFIGURATION STATS
                              </span>
                              <div className="space-y-1 font-jetbrains-mono text-eyebrow text-bone">
                                <div>
                                  Active Template:{' '}
                                  <span className="text-signal-lime font-bold">
                                    {pInfo.template}
                                  </span>
                                </div>
                                <div>
                                  Widgets Integrated:{' '}
                                  <span className="text-chalk font-semibold">{pInfo.widgets}</span>
                                </div>
                              </div>
                            </div>
                            <div className="bg-onyx border border-graphite p-4 space-y-2">
                              <span className="text-[9px] font-jetbrains-mono text-ash uppercase block">
                                DEVELOPER KEYWORDS
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {pInfo.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="border border-graphite bg-carbon px-2 py-0.5 text-[9px] font-jetbrains-mono text-ash uppercase"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="pt-2">
                            <Link
                              href={`/${pInfo.username}`}
                              className="w-full inline-flex items-center justify-center gap-2 bg-onyx hover:bg-graphite border border-graphite hover:border-signal-lime/50 text-bone hover:text-white font-inter-tight font-medium text-body py-3.5 transition-all uppercase tracking-wider cursor-pointer"
                            >
                              <User size={14} className="text-signal-lime" />
                              <span>
                                {tc(
                                  'landing.showcase.profiles.inspect',
                                  'Inspect & Customize Profile',
                                  'Inspecionar e Customizar Perfil'
                                )}
                              </span>
                            </Link>
                          </div>
                        </div>
                      )
                    })()}
                  </div>

                  <div className="pt-6 border-t border-graphite/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="font-inter-tight text-note text-ash leading-relaxed max-w-md">
                      {tc(
                        'landing.showcase.profiles.desc',
                        'Explore portfolios built by community members. Duplicate layouts, inspect code widgets, and learn from other developer configurations.',
                        'Explore portfólios criados por membros da comunidade. Duplique layouts, inspecione configurações e inspire-se em outros desenvolvedores.'
                      )}
                    </p>
                    <Link
                      href="/explore"
                      className="inline-flex items-center justify-center gap-2 bg-signal-lime text-black font-inter-tight font-medium text-body px-5 py-3 uppercase tracking-wider hover:brightness-110 shadow-[0_0_8px_rgba(197,255,74,0.25)] transition-all shrink-0 rounded-sm"
                    >
                      <span>
                        {tc(
                          'landing.showcase.profiles.btn',
                          'Explore Community Profiles',
                          'Ver Perfis da Comunidade'
                        )}
                      </span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              )}

              {activeTab === 'guides' && (
                <motion.div
                  key="guides-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6 flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-graphite pb-3">
                      <span className="font-jetbrains-mono text-caption text-ash uppercase tracking-widest bg-carbon px-2 py-1 border border-graphite">
                        [ CURATED RESOURCE GUIDES ]
                      </span>
                      <div className="flex gap-2">
                        {featuredGuides.map((gItem) => (
                          <button
                            key={gItem.id}
                            onClick={() => setSelectedGuide(gItem.id)}
                            className={`px-3 py-1 font-inter-tight text-caption uppercase tracking-wider transition-colors cursor-pointer border ${
                              selectedGuide === gItem.id
                                ? 'bg-signal-lime text-black border-signal-lime font-semibold'
                                : 'bg-carbon text-ash border-graphite hover:text-white'
                            }`}
                          >
                            {gItem.publisher.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {(() => {
                      const gInfo =
                        featuredGuides.find((gItem) => gItem.id === selectedGuide) ||
                        featuredGuides[0]
                      return (
                        <div className="border border-graphite bg-carbon p-6 space-y-5">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <span className="font-jetbrains-mono text-[9px] text-signal-lime uppercase tracking-widest bg-onyx px-2 py-0.5 border border-graphite">
                                [ {gInfo.publisher} ]
                              </span>
                              <span className="font-jetbrains-mono text-caption text-ash">
                                {gInfo.readTime}
                              </span>
                            </div>
                            <h4 className="font-pt-serif font-light text-xl text-chalk leading-snug">
                              {gInfo.title}
                            </h4>
                          </div>

                          <p className="font-inter-tight text-body text-bone leading-relaxed">
                            {gInfo.summary}
                          </p>

                          <div className="pt-2">
                            <a
                              href={gInfo.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-onyx hover:bg-graphite border border-graphite hover:border-signal-lime/50 text-bone hover:text-white font-inter-tight font-medium text-body px-5 py-3 transition-all uppercase tracking-wider cursor-pointer w-full justify-center"
                            >
                              <span>
                                {tc(
                                  'landing.showcase.guides.read',
                                  'Read Curated Article',
                                  'Ler Artigo Selecionado'
                                )}
                              </span>
                              <ExternalLink size={14} className="text-signal-lime" />
                            </a>
                          </div>
                        </div>
                      )
                    })()}
                  </div>

                  <div className="pt-6 border-t border-graphite/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="font-inter-tight text-note text-ash leading-relaxed max-w-md">
                      {tc(
                        'landing.showcase.guides.desc',
                        'Access tutorials on special repo setup, Shields.io badges, HTML layouts, and picture media queries for markdown mode selectors.',
                        'Acesse tutoriais sobre repositórios especiais, badges Shields.io, estruturas HTML e picture media queries para marcadores do markdown.'
                      )}
                    </p>
                    <Link
                      href="/guides"
                      className="inline-flex items-center justify-center gap-2 bg-signal-lime text-black font-inter-tight font-medium text-body px-5 py-3 uppercase tracking-wider hover:brightness-110 shadow-[0_0_8px_rgba(197,255,74,0.25)] transition-all shrink-0 rounded-sm"
                    >
                      <span>
                        {tc(
                          'landing.showcase.guides.btn',
                          'Browse All README Guides',
                          'Ver Todos os Guias'
                        )}
                      </span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
