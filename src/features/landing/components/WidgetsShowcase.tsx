'use client'

import { Flame, Globe, Layers, Sparkles, Zap } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import React, { useMemo, useState } from 'react'

import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import Magnet from '@/components/ui/Magnet'
import ShinyText from '@/components/ui/ShinyText'
import SpotlightCard from '@/components/ui/SpotlightCard'
import { DEFAULT_POKEMON_CARD_IMAGE, WIDGET_IDS, type WidgetId } from '@/constants'
import { renderWidgetSvg } from '@/engine/core/WidgetRenderer'
import type { GlobalStyles, WidgetInstance } from '@/engine/types'
import { getMockGitHubData } from '@/features/github/api/mockProfile'
import { useI18n } from '@/i18n'

interface WidgetsShowcaseProps {
  count?: number
}

type WidgetGroup = 'all' | 'featured' | 'native' | 'categories' | 'external'

interface ShowcaseWidgetDef {
  id: WidgetId
  name: string
  group: 'featured' | 'native' | 'categories' | 'external'
  subCategory: string
  badge: string
  badgeColor?: string
  desc: string
  width: number
  height: number
  spanClass: string
  themeStyle: string
  accent: string
  bg: string
  configPatch?: Record<string, unknown>
}

const ALL_SHOWCASE_WIDGETS: ShowcaseWidgetDef[] = [
  {
    id: WIDGET_IDS.POKEMON_CARD,
    name: 'Pokémon Hologram Card',
    group: 'featured',
    subCategory: 'Gamified & TCG',
    badge: 'HOLOGRAM TCG',
    badgeColor: '#ff00ff',
    desc: 'Transforms developer stats into a collectible holo card with HP, element type, and special attacks.',
    width: 300,
    height: 418,
    spanClass: 'col-span-1 md:col-span-1 lg:col-span-4',
    themeStyle: 'cyberpunk',
    accent: '#ff00ff',
    bg: '#0a0a0f',
    configPatch: {
      imageUrl: DEFAULT_POKEMON_CARD_IMAGE,
      rotateX: -8,
      rotateY: 12,
      glareX: 45,
      glareY: 35,
      intensity: 1.2,
    },
  },
  {
    id: WIDGET_IDS.GITFUT_CARD,
    name: 'GitFut 99 OVR Scout Card',
    group: 'featured',
    subCategory: 'Gamified & TCG',
    badge: 'SCOUT 99',
    badgeColor: '#ffd700',
    desc: 'FIFA Ultimate Team developer card rating overall coding proficiency, activity pace, and commit defense.',
    width: 300,
    height: 420,
    spanClass: 'col-span-1 md:col-span-1 lg:col-span-4',
    themeStyle: 'terminal',
    accent: '#ffd700',
    bg: '#0c0f1d',
    configPatch: {
      rotateX: -6,
      rotateY: 10,
      glareX: 45,
      glareY: 35,
      intensity: 1.1,
    },
  },
  {
    id: WIDGET_IDS.GITFEST_LINEUP,
    name: 'GitFest Music Festival Lineup',
    group: 'featured',
    subCategory: 'Interactive Showcase',
    badge: 'MUSIC FESTIVAL',
    badgeColor: '#c5ff4a',
    desc: 'Turns your top repositories into a Coachella/Lollapalooza style music festival poster headliner roster.',
    width: 500,
    height: 650,
    spanClass: 'col-span-1 md:col-span-2 lg:col-span-4',
    themeStyle: 'terminal',
    accent: '#c5ff4a',
    bg: '#060606',
  },

  {
    id: WIDGET_IDS.STATS,
    name: 'Live GitHub Stats Card',
    group: 'native',
    subCategory: 'GitAscii Native',
    badge: 'REAL-TIME STATS',
    badgeColor: '#c5ff4a',
    desc: 'Live stargazers, total commits, pull requests, followers, and letter grade calculated live via GraphQL.',
    width: 800,
    height: 130,
    spanClass: 'col-span-1 md:col-span-2 lg:col-span-8',
    themeStyle: 'terminal',
    accent: '#c5ff4a',
    bg: '#060606',
  },
  {
    id: WIDGET_IDS.ASCII_ART,
    name: 'Vector ASCII Art Engine',
    group: 'native',
    subCategory: 'GitAscii Native',
    badge: 'ASCII MATRIX',
    badgeColor: '#c5ff4a',
    desc: 'Converts logos and avatars into crisp vector monospace text grids with density and contrast controls.',
    width: 480,
    height: 160,
    spanClass: 'col-span-1 md:col-span-1 lg:col-span-4',
    themeStyle: 'terminal',
    accent: '#c5ff4a',
    bg: '#060606',
    configPatch: {
      asciiText: [
        '  ██████╗ ██╗████████╗ █████╗ ███████╗',
        ' ██╔════╝ ██║╚══██╔══╝██╔══██╗██╔════╝',
        ' ██║  ███╗██║   ██║   ███████║███████╗',
        ' ╚██████╔╝██║   ██║   ██║  ██║███████║',
      ],
    },
  },
  {
    id: WIDGET_IDS.LANGUAGES,
    name: 'Top Languages Breakdown',
    group: 'native',
    subCategory: 'GitAscii Native',
    badge: 'VECTOR BARS',
    badgeColor: '#7aa2f7',
    desc: 'Visual percentage breakdown of all repository source code with official language color palettes.',
    width: 800,
    height: 140,
    spanClass: 'col-span-1 md:col-span-2 lg:col-span-7',
    themeStyle: 'dracula',
    accent: '#7aa2f7',
    bg: '#1a1b26',
    configPatch: { layoutStyle: 'bars' },
  },
  {
    id: WIDGET_IDS.TERMINAL_INFO,
    name: 'Terminal Info (Neofetch)',
    group: 'native',
    subCategory: 'GitAscii Native',
    badge: 'NEOFETCH CLI',
    badgeColor: '#c5ff4a',
    desc: 'Classic Linux neofetch system info screen with host, kernel, uptime, packages, and shell status.',
    width: 504,
    height: 280,
    spanClass: 'col-span-1 md:col-span-1 lg:col-span-5',
    themeStyle: 'terminal',
    accent: '#c5ff4a',
    bg: '#060606',
  },
  {
    id: WIDGET_IDS.TECH_STACK,
    name: 'Tech Stack & Skills Badges',
    group: 'native',
    subCategory: 'GitAscii Native',
    badge: '500+ LOGOS',
    badgeColor: '#ffffff',
    desc: 'Clean vector badge directory showcasing your frontend, backend, database, and DevOps toolchain.',
    width: 800,
    height: 140,
    spanClass: 'col-span-1 md:col-span-2 lg:col-span-8',
    themeStyle: 'minimal',
    accent: '#ffffff',
    bg: '#0f0f0f',
  },
  {
    id: WIDGET_IDS.HEADER,
    name: 'Profile Header & Identity Stamp',
    group: 'native',
    subCategory: 'GitAscii Native',
    badge: 'IDENTITY',
    badgeColor: '#c5ff4a',
    desc: 'High-impact profile banner with custom name typography, handle stamp, and online availability beacon.',
    width: 800,
    height: 90,
    spanClass: 'col-span-1 md:col-span-1 lg:col-span-4',
    themeStyle: 'terminal',
    accent: '#c5ff4a',
    bg: '#060606',
  },

  {
    id: WIDGET_IDS.CONTROLPLANE_SYSTEM_LOOP,
    name: 'Control Plane System Loop',
    group: 'categories',
    subCategory: 'Control Plane',
    badge: 'CONTROL PLANE',
    badgeColor: '#00e5ff',
    desc: 'High-density mission architecture closed-loop circuit diagram connecting microservices and repos.',
    width: 800,
    height: 360,
    spanClass: 'col-span-1 md:col-span-2 lg:col-span-8',
    themeStyle: 'terminal',
    accent: '#00e5ff',
    bg: '#020617',
  },
  {
    id: WIDGET_IDS.ASCII_PORTRAIT,
    name: 'Monochrome Typing ASCII Portrait',
    group: 'categories',
    subCategory: 'ASCII Profile Kit',
    badge: 'ASCII PROFILE',
    badgeColor: '#ffa657',
    desc: 'Monochrome animated typing ASCII avatar portrait with custom density and shading matrix.',
    width: 370,
    height: 400,
    spanClass: 'col-span-1 md:col-span-1 lg:col-span-4',
    themeStyle: 'terminal',
    accent: '#ffa657',
    bg: '#0d1117',
  },
  {
    id: WIDGET_IDS.SURVEILLANCE_HEADER,
    name: '198X Surveillance CRT Feed',
    group: 'categories',
    subCategory: 'rugbedbugg Console',
    badge: '198X SURVEILLANCE',
    badgeColor: '#55ffff',
    desc: 'Retro 198X surveillance camera monitoring console with VHS scanlines and classified boot log.',
    width: 780,
    height: 417,
    spanClass: 'col-span-1 md:col-span-2 lg:col-span-7',
    themeStyle: 'terminal',
    accent: '#55ffff',
    bg: '#050308',
  },
  {
    id: WIDGET_IDS.GODPROFILE_TERMINAL,
    name: 'GodProfile Typewriter Emulator',
    group: 'categories',
    subCategory: 'GodProfile B&W',
    badge: 'GOD PROFILE',
    badgeColor: '#b6a891',
    desc: 'Pure luxury black & white terminal emulator with animated typewriter script and elegant borders.',
    width: 450,
    height: 300,
    spanClass: 'col-span-1 md:col-span-1 lg:col-span-5',
    themeStyle: 'minimal',
    accent: '#b6a891',
    bg: '#09090b',
  },
  {
    id: WIDGET_IDS.PREMIUM_ASCII_PROFILE_CARD,
    name: 'Profile Terminal Master Card',
    group: 'categories',
    subCategory: 'ASCII Premium Kit',
    badge: 'PREMIUM ASCII',
    badgeColor: '#3fb950',
    desc: 'All-in-one terminal card with GitHub metrics, roles, top repos, languages, and dynamic shell prompt.',
    width: 520,
    height: 440,
    spanClass: 'col-span-1 md:col-span-2 lg:col-span-7',
    themeStyle: 'terminal',
    accent: '#3fb950',
    bg: '#0d1117',
  },
  {
    id: WIDGET_IDS.CODEWEB_HERO_ORBIT,
    name: 'Aura Hero Orbit Radar',
    group: 'categories',
    subCategory: 'Codeweb Studio',
    badge: 'CODEWEB AURA',
    badgeColor: '#6cc382',
    desc: 'Cosmic orbit banner with pulsating glowing orbs, concentric rings, and developer status indicator.',
    width: 800,
    height: 360,
    spanClass: 'col-span-1 md:col-span-1 lg:col-span-5',
    themeStyle: 'cyberpunk',
    accent: '#6cc382',
    bg: '#0a0a14',
  },

  {
    id: WIDGET_IDS.PROFILE_TROPHY,
    name: 'GitHub Profile Trophies',
    group: 'external',
    subCategory: 'Community & External',
    badge: 'TROPHIES',
    badgeColor: '#ffb703',
    desc: 'Dynamic achievements and trophy tiers showcasing GitHub milestones with gold and silver badges.',
    width: 800,
    height: 200,
    spanClass: 'col-span-1 md:col-span-2 lg:col-span-8',
    themeStyle: 'minimal',
    accent: '#ffb703',
    bg: '#0d1117',
  },
  {
    id: WIDGET_IDS.VIEWS_COUNTER,
    name: 'Real-Time Profile Views Counter',
    group: 'external',
    subCategory: 'Community & External',
    badge: 'ANALYTICS',
    badgeColor: '#c5ff4a',
    desc: 'Live visits and page view counter tracking unique developer impressions on your profile.',
    width: 240,
    height: 100,
    spanClass: 'col-span-1 md:col-span-1 lg:col-span-4',
    themeStyle: 'terminal',
    accent: '#c5ff4a',
    bg: '#060606',
  },
  {
    id: WIDGET_IDS.CONTRIBUTION_SNAKE,
    name: 'Contribution Snake Game',
    group: 'external',
    subCategory: 'Community & External',
    badge: 'SNAKE GAME',
    badgeColor: '#2ea44f',
    desc: 'Animated vector snake eating green contribution commit tiles generated directly on GitHub Actions.',
    width: 800,
    height: 250,
    spanClass: 'col-span-1 md:col-span-2 lg:col-span-12',
    themeStyle: 'terminal',
    accent: '#2ea44f',
    bg: '#0d1117',
  },
]

export function WidgetsShowcase({ count = 70 }: WidgetsShowcaseProps) {
  const { t } = useI18n()
  const demoData = useMemo(() => getMockGitHubData('Igorcbraz'), [])
  const [activeGroup, setActiveGroup] = useState<WidgetGroup>('all')

  const renderedWidgets = useMemo(() => {
    return ALL_SHOWCASE_WIDGETS.map((widgetDef) => {
      const globalStyles: GlobalStyles = {
        backgroundColor: widgetDef.bg,
        textColor: '#ffffff',
        accentColor: widgetDef.accent,
        borderColor: '#252525',
        fontFamily: 'JetBrains Mono',
        borderRadius: 0,
        padding: 12,
        themeMode: 'dark',
        templateStyle: widgetDef.themeStyle,
      }

      const instance: WidgetInstance = {
        instanceId: `showcase-${widgetDef.id}`,
        widgetId: widgetDef.id,
        name: widgetDef.name,
        position: { x: 0, y: 0 },
        size: { width: widgetDef.width, height: widgetDef.height },
        locked: false,
        visible: true,
        zIndex: 1,
        config: {
          accentColor: widgetDef.accent,
          backgroundColor: widgetDef.bg,
          textColor: '#ffffff',
          borderColor: '#252525',
          templateStyle: widgetDef.themeStyle,
          ...(widgetDef.configPatch || {}),
        },
      }

      const innerSvg = renderWidgetSvg(instance, demoData, globalStyles, false, false)
      const fullSvg = `<svg width="100%" height="auto" viewBox="0 0 ${widgetDef.width} ${widgetDef.height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    * { box-sizing: border-box; }
    text { user-select: none; }
  </style>
  <rect width="${widgetDef.width}" height="${widgetDef.height}" fill="${widgetDef.bg}" stroke="#252525" stroke-width="1" />
  ${innerSvg}
</svg>`

      return {
        ...widgetDef,
        svgMarkup: fullSvg,
      }
    })
  }, [demoData])

  const filteredWidgets = useMemo(() => {
    if (activeGroup === 'all') return renderedWidgets
    return renderedWidgets.filter((w) => w.group === activeGroup)
  }, [renderedWidgets, activeGroup])

  return (
    <section
      id="widgets-showcase"
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
            <Layers className="w-3.5 h-3.5" />
            <ShinyText speed={3}>
              [ <AnimatedCounter value={count} suffix="+" />{' '}
              {t('landing.widgets.badge_suffix', 'LIVE SVG WIDGETS')} ]
            </ShinyText>
          </div>

          <h2 className="font-pt-serif font-light text-3xl sm:text-heading leading-[0.95] tracking-[-0.02em] text-chalk">
            {t('landing.widgets.title_start', 'Modular Engine Packed with Over ')}
            <em className="italic text-signal-lime">
              {t('landing.widgets.title_highlight', `${count}+ Dynamic Cards.`)}
            </em>
          </h2>

          <p className="font-inter-tight text-body text-bone leading-body max-w-xl mx-auto">
            {t(
              'landing.widgets.subtitle',
              `Explore widgets in the exact order available in Studio: Featured, GitAscii Native, Thematic Categories, and Community Extensions.`
            )}
          </p>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
          <button
            onClick={() => setActiveGroup('all')}
            className={`px-4 py-2 text-[12px] font-jetbrains-mono uppercase tracking-wider transition-all cursor-pointer border ${
              activeGroup === 'all'
                ? 'border-signal-lime bg-signal-lime text-carbon font-semibold shadow-[0_0_15px_rgba(197,255,74,0.3)]'
                : 'border-graphite bg-carbon text-ash hover:text-chalk hover:border-ash/60'
            }`}
          >
            {t('landing.widgets.tab_all', `All (${ALL_SHOWCASE_WIDGETS.length})`, {
              count: String(ALL_SHOWCASE_WIDGETS.length),
            })}
          </button>

          <button
            onClick={() => setActiveGroup('featured')}
            className={`px-4 py-2 text-[12px] font-jetbrains-mono uppercase tracking-wider transition-all cursor-pointer border flex items-center gap-1.5 ${
              activeGroup === 'featured'
                ? 'border-signal-lime bg-signal-lime text-carbon font-semibold shadow-[0_0_15px_rgba(197,255,74,0.3)]'
                : 'border-graphite bg-carbon text-ash hover:text-chalk hover:border-ash/60'
            }`}
          >
            <Flame
              size={13}
              className={activeGroup === 'featured' ? 'text-carbon' : 'text-signal-lime'}
            />
            <span>{t('landing.widgets.tab_featured', '1. Featured')}</span>
          </button>

          <button
            onClick={() => setActiveGroup('native')}
            className={`px-4 py-2 text-[12px] font-jetbrains-mono uppercase tracking-wider transition-all cursor-pointer border flex items-center gap-1.5 ${
              activeGroup === 'native'
                ? 'border-signal-lime bg-signal-lime text-carbon font-semibold shadow-[0_0_15px_rgba(197,255,74,0.3)]'
                : 'border-graphite bg-carbon text-ash hover:text-chalk hover:border-ash/60'
            }`}
          >
            <Zap
              size={13}
              className={activeGroup === 'native' ? 'text-carbon' : 'text-signal-lime'}
            />
            <span>{t('landing.widgets.tab_native', '2. GitAscii Native')}</span>
          </button>

          <button
            onClick={() => setActiveGroup('categories')}
            className={`px-4 py-2 text-[12px] font-jetbrains-mono uppercase tracking-wider transition-all cursor-pointer border flex items-center gap-1.5 ${
              activeGroup === 'categories'
                ? 'border-signal-lime bg-signal-lime text-carbon font-semibold shadow-[0_0_15px_rgba(197,255,74,0.3)]'
                : 'border-graphite bg-carbon text-ash hover:text-chalk hover:border-ash/60'
            }`}
          >
            <Sparkles
              size={13}
              className={activeGroup === 'categories' ? 'text-carbon' : 'text-signal-lime'}
            />
            <span>{t('landing.widgets.tab_categories', '3. Thematic Categories')}</span>
          </button>

          <button
            onClick={() => setActiveGroup('external')}
            className={`px-4 py-2 text-[12px] font-jetbrains-mono uppercase tracking-wider transition-all cursor-pointer border flex items-center gap-1.5 ${
              activeGroup === 'external'
                ? 'border-signal-lime bg-signal-lime text-carbon font-semibold shadow-[0_0_15px_rgba(197,255,74,0.3)]'
                : 'border-graphite bg-carbon text-ash hover:text-chalk hover:border-ash/60'
            }`}
          >
            <Globe
              size={13}
              className={activeGroup === 'external' ? 'text-carbon' : 'text-violet-400'}
            />
            <span>{t('landing.widgets.tab_external', '4. External & Community')}</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          <div
            key={activeGroup}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-stretch"
          >
            {filteredWidgets.map((widget, idx) => (
              <motion.div
                key={widget.id}
                initial={{ opacity: 0, y: 28, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{
                  duration: 0.55,
                  delay: 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={widget.spanClass}
              >
                <SpotlightCard className="p-5 sm:p-6 flex flex-col justify-between space-y-4 transition-all duration-300 group shadow-lg hover:shadow-[0_0_25px_rgba(197,255,74,0.1)] border-graphite h-full">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-graphite/60 pb-2.5">
                      <div>
                        <span className="font-jetbrains-mono text-[10px] text-ash uppercase tracking-wider block">
                          [ {widget.subCategory} ]
                        </span>
                        <h3 className="font-inter-tight font-semibold text-[16px] sm:text-[17px] text-chalk mt-0.5">
                          {widget.name}
                        </h3>
                      </div>

                      <span
                        className="px-2 py-0.5 bg-carbon border font-jetbrains-mono text-[9px] uppercase tracking-wider shrink-0"
                        style={{
                          borderColor: widget.badgeColor ? `${widget.badgeColor}40` : '#252525',
                          color: widget.badgeColor || '#c5ff4a',
                        }}
                      >
                        {widget.badge}
                      </span>
                    </div>

                    <p className="font-inter-tight text-[12px] text-bone leading-relaxed">
                      {widget.desc}
                    </p>

                    <div className="p-3 bg-carbon border border-graphite overflow-hidden flex items-center justify-center group-hover:border-signal-lime/30 transition-colors">
                      <div
                        suppressHydrationWarning
                        className="w-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-w-full [&>svg]:object-contain shadow-md"
                        dangerouslySetInnerHTML={{ __html: widget.svgMarkup }}
                      />
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-graphite/40 flex items-center justify-between">
                    <span className="font-jetbrains-mono text-[10px] text-ash">
                      API: <code className="text-signal-lime">?widgets={widget.id}</code>
                    </span>
                    <span className="font-jetbrains-mono text-[9px] uppercase text-signal-lime/70">
                      {t('landing.widgets.live_vector', 'Live Vector')}
                    </span>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="p-6 bg-carbon border border-graphite grid grid-cols-1 md:grid-cols-4 gap-4 font-jetbrains-mono text-[11px]"
        >
          <div className="space-y-1">
            <span className="text-signal-lime uppercase block font-semibold">
              {t('landing.widgets.cat1_title', '1. Featured')}
            </span>
            <p className="text-ash">
              {t('landing.widgets.cat1_desc', 'GitFest Lineup, Pokémon TCG Card, GitFut 99 OVR')}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-signal-lime uppercase block font-semibold">
              {t('landing.widgets.cat2_title', '2. GitAscii Native')}
            </span>
            <p className="text-ash">
              {t(
                'landing.widgets.cat2_desc',
                'Stats Card, Languages Bar, ASCII Matrix, Tech Stack, Neofetch'
              )}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-signal-lime uppercase block font-semibold">
              {t('landing.widgets.cat3_title', '3. Categories')}
            </span>
            <p className="text-ash">
              {t(
                'landing.widgets.cat3_desc',
                'ASCII Premium, ASCII Profile, GodProfile, Control Plane, Codeweb, rugbedbugg'
              )}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-violet-400 uppercase block font-semibold">
              {t('landing.widgets.cat4_title', '4. Community')}
            </span>
            <p className="text-ash">
              {t(
                'landing.widgets.cat4_desc',
                'Snake Game, Trophies, Profile Views, External Modules'
              )}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center pt-2"
        >
          <Magnet distance={80} strength={0.2}>
            <Link
              href="/widgets"
              className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3.5 bg-signal-lime hover:bg-signal-lime-hover text-carbon font-inter-tight font-semibold text-[14px] uppercase tracking-wider transition-colors shadow-[0_0_20px_rgba(197,255,74,0.2)]"
            >
              <span>
                {t('landing.widgets.explore_all', `Explore Complete Widget Library (${count}+)`, {
                  count: String(count),
                })}
              </span>
              <span aria-hidden="true">→</span>
            </Link>
          </Magnet>
        </motion.div>
      </div>
    </section>
  )
}

export default WidgetsShowcase
