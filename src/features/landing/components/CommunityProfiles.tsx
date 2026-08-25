'use client'

import {
  CheckCircle2,
  Code2,
  ExternalLink,
  Github,
  Layers,
  Users,
} from 'lucide-react'
import { motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useMemo, useState } from 'react'

import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import Magnet from '@/components/ui/Magnet'
import ShinyText from '@/components/ui/ShinyText'
import SpotlightCard from '@/components/ui/SpotlightCard'
import { DEFAULT_LANDING_METRICS, type LandingMetrics } from '@/constants/metrics'
import type { CommunityProfileItem } from '@/features/explore/getCommunityProfiles'
import { useI18n } from '@/i18n'
import { API_ENDPOINTS } from '@/services/endpoints'

interface CommunityProfilesProps {
  profiles?: CommunityProfileItem[]
  metrics?: LandingMetrics
  usersCount?: number
}

interface ProfileDossier {
  username: string
  name: string
  role: string
  templateId: string
  widgetsCount: number
  hasAsciiArt: boolean
  tags: string[]
}

const FEATURED_PROFILES: ProfileDossier[] = [
  {
    username: 'Igorcbraz',
    name: 'Igor Braz',
    role: 'Creator of GitAscii & Full Stack Engineer',
    templateId: 'native',
    widgetsCount: 6,
    hasAsciiArt: true,
    tags: ['Terminal CLI', 'ASCII Matrix', 'Live Stats', 'Verified Creator'],
  },
  {
    username: 'shadcn',
    name: 'shadcn',
    role: 'Creator of shadcn/ui & Design Technologist',
    templateId: 'minimal_luxe',
    widgetsCount: 5,
    hasAsciiArt: true,
    tags: ['Minimal Light', 'Tech Stack', 'Clean Vectors'],
  },
  {
    username: 'leerob',
    name: 'Lee Robinson',
    role: 'VP of Product & Next.js Ecosystem',
    templateId: 'bento_grid',
    widgetsCount: 5,
    hasAsciiArt: true,
    tags: ['Edge Native', 'Activity Graph', 'Top Repos'],
  },
  {
    username: 'antfu',
    name: 'Anthony Fu',
    role: 'Vue & Vite Core Team · Open Source Author',
    templateId: 'codeweb',
    widgetsCount: 7,
    hasAsciiArt: true,
    tags: ['Cyberpunk Neon', 'ASCII Banner', 'OSS Streaks'],
  },
  {
    username: 'schunckleonardo',
    name: 'Leonardo Schunck',
    role: 'Core Contributor & Software Engineer',
    templateId: 'ascii_native',
    widgetsCount: 4,
    hasAsciiArt: false,
    tags: ['Dracula Theme', 'Stats Widget', 'Verified Contributor'],
  },
  {
    username: 'sindresorhus',
    name: 'Sindre Sorhus',
    role: 'Full-Time Open-Sourcerer & Maker',
    templateId: 'hacker',
    widgetsCount: 6,
    hasAsciiArt: true,
    tags: ['Hacker Matrix', 'CLI Packages', 'Verified Maker'],
  },
  {
    username: 'developit',
    name: 'Jason Miller',
    role: 'Creator of Preact · Web Architect',
    templateId: 'native_simple',
    widgetsCount: 5,
    hasAsciiArt: true,
    tags: ['Lightweight', 'Micro-framework', 'Edge Fast'],
  },
]

export function CommunityProfiles({
  profiles = [],
  metrics = DEFAULT_LANDING_METRICS,
  usersCount,
}: CommunityProfilesProps) {
  const { t } = useI18n()
  const resolvedUsersCount = usersCount || metrics?.users || DEFAULT_LANDING_METRICS.users
  const resolvedProfilesCount = metrics?.profiles || DEFAULT_LANDING_METRICS.profiles

  const profileList = useMemo(() => {
    if (profiles && profiles.length >= 3) {
      const merged: ProfileDossier[] = []
      const knownHandles = new Set<string>()

      profiles.slice(0, 6).forEach((p) => {
        const found = FEATURED_PROFILES.find(
          (fp) => fp.username.toLowerCase() === p.username.toLowerCase()
        )
        if (found) {
          merged.push(found)
        } else {
          merged.push({
            username: p.username,
            name: p.username,
            role: 'Developer & GitAscii Creator',
            templateId: p.templateId || 'native',
            widgetsCount: p.widgetsCount || 4,
            hasAsciiArt: p.hasAsciiArt,
            tags: p.tags || ['Dynamic SVG', 'Verified Profile'],
          })
        }
        knownHandles.add(p.username.toLowerCase())
      })

      FEATURED_PROFILES.forEach((fp) => {
        if (!knownHandles.has(fp.username.toLowerCase()) && merged.length < 6) {
          merged.push(fp)
        }
      })
      return merged
    }
    return FEATURED_PROFILES.slice(0, 6)
  }, [profiles])

  const totalCommunityCount = Math.max(resolvedUsersCount, resolvedProfilesCount, (profiles?.length || 0))
  const remainingProfilesCount = Math.max(1, totalCommunityCount - profileList.length)

  const [activeUsername, setActiveUsername] = useState<string>(profileList[0]?.username || 'Igorcbraz')
  const activeProfile = useMemo(
    () => profileList.find((p) => p.username === activeUsername) || profileList[0],
    [profileList, activeUsername]
  )

  const [imageLoaded, setImageLoaded] = useState<boolean>(false)
  const [imageError, setImageError] = useState<boolean>(false)

  const handleSelectProfile = (username: string) => {
    if (username === activeUsername) return
    setActiveUsername(username)
    setImageLoaded(false)
    setImageError(false)
  }

  const avatarUrl = API_ENDPOINTS.GITHUB.AVATAR(activeProfile.username, 96)
  const previewEndpoint = `/api/${activeProfile.username}?template=${activeProfile.templateId}`
  const githubUrl = API_ENDPOINTS.GITHUB.USER_PROFILE(activeProfile.username)

  return (
    <section
      id="community-showcase"
      className="relative z-10 w-full bg-transparent py-20 md:py-32 px-4 sm:px-6 lg:px-8 border-b border-graphite/60 overflow-hidden"
      aria-label="Community Showcase"
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
            <Users className="w-3.5 h-3.5" />
            <ShinyText speed={3}>
              [ <AnimatedCounter value={resolvedProfilesCount} suffix="+" /> {t('landing.community.badge', 'VERIFIED COMMUNITY PROFILES')} ]
            </ShinyText>
          </div>

          <h2 className="font-pt-serif font-light text-3xl sm:text-heading leading-[0.95] tracking-[-0.02em] text-chalk">
            {t('landing.community.title_start', 'See How Developers Build Their ')}
            <em className="italic text-signal-lime">
              {t('landing.community.title_highlight', 'READMEs.')}
            </em>
          </h2>

          <p className="font-inter-tight text-body text-bone leading-body max-w-xl mx-auto">
            {t(
              'landing.community.subtitle',
              'Real dynamic profiles created by developers worldwide. Inspect the exact layouts, widgets, and styles they selected for their GitHub Profile README.'
            )}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex flex-col justify-between gap-3"
          >
            <div className="flex items-center justify-between px-1 pb-2 border-b border-graphite text-ash font-jetbrains-mono text-[11px] uppercase">
              <span>{t('landing.community.verified_devs', 'Verified Developers')}</span>
              <span>
                {t('landing.community.featured_profiles', `${profileList.length} Featured Profiles`, {
                  count: String(profileList.length),
                })}
              </span>
            </div>

            <div className="flex flex-col justify-between flex-1 gap-2">
              {profileList.map((p, idx) => {
                const isSelected = p.username === activeUsername
                const itemAvatar = API_ENDPOINTS.GITHUB.AVATAR(p.username, 64)

                return (
                  <motion.div
                    key={p.username}
                    onClick={() => handleSelectProfile(p.username)}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.15 }}
                    className={`p-3 border transition-colors duration-200 cursor-pointer relative overflow-hidden select-none flex-1 min-h-[64px] flex flex-col justify-center ${
                      isSelected
                        ? 'bg-onyx border-signal-lime shadow-[0_0_20px_rgba(197,255,74,0.12)]'
                        : 'bg-carbon/70 border-graphite hover:border-ash/60 hover:bg-onyx/50'
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="activeProfileIndicator"
                        className="absolute left-0 top-0 bottom-0 w-1.5 bg-signal-lime shadow-[0_0_12px_rgba(197,255,74,0.8)]"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative shrink-0">
                          <Image
                            src={itemAvatar}
                            alt={`@${p.username}`}
                            width={34}
                            height={34}
                            loading="lazy"
                            unoptimized
                            className={`size-8.5 rounded-full border bg-carbon object-cover transition-colors ${
                              isSelected ? 'border-signal-lime' : 'border-graphite'
                            }`}
                          />
                          {isSelected && (
                            <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-signal-lime flex items-center justify-center text-carbon">
                              <CheckCircle2 className="w-3 h-3" />
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-inter-tight font-semibold text-[13px] truncate transition-colors ${
                                isSelected ? 'text-signal-lime' : 'text-chalk'
                              }`}
                            >
                              @{p.username}
                            </span>
                            <span className="font-jetbrains-mono text-[10px] text-ash shrink-0">
                              [ 0{idx + 1} ]
                            </span>
                          </div>
                          <span className="font-inter-tight text-[11px] text-ash truncate block">
                            {p.role}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0 gap-1">
                        <span
                          className={`font-jetbrains-mono text-[9px] uppercase px-2 py-0.5 border ${
                            isSelected
                              ? 'border-signal-lime/40 bg-signal-lime/10 text-signal-lime'
                              : 'border-graphite bg-carbon text-ash'
                          }`}
                        >
                          {p.templateId}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}

              <Link
                href="/explore"
                className="p-3 border border-dashed border-signal-lime/50 bg-signal-lime/5 hover:bg-signal-lime/10 hover:border-signal-lime transition-all duration-300 cursor-pointer flex items-center justify-between group min-h-[64px] select-none"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xs bg-signal-lime text-black shrink-0 group-hover:scale-105 transition-transform">
                    <Users size={14} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-inter-tight font-semibold text-[13px] text-signal-lime leading-tight group-hover:text-signal-lime-hover transition-colors truncate">
                      {t(
                        'landing.community.more_profiles',
                        `+${remainingProfilesCount} Perfis Disponíveis`,
                        { count: String(remainingProfilesCount) }
                      )}
                    </h4>
                    <p className="font-inter-tight text-[11px] text-ash leading-tight mt-0.5 truncate">
                      {t(
                        'landing.community.more_profiles_desc',
                        'Explore a galeria completa da comunidade'
                      )}
                    </p>
                  </div>
                </div>
                <span className="font-jetbrains-mono text-[9px] text-signal-lime uppercase px-2 py-0.5 border border-signal-lime/40 bg-signal-lime/10 flex items-center gap-1 shrink-0 group-hover:border-signal-lime transition-colors">
                  <span>{t('landing.community.more_profiles_badge', 'Explorar')}</span>
                  <span aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform">
                    →
                  </span>
                </span>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 flex flex-col"
          >
            <SpotlightCard className="p-6 sm:p-7 flex flex-col justify-between h-full bg-onyx border-graphite">
              <div className="flex flex-col h-full justify-between space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-graphite/80">
                  <div className="flex items-center gap-3.5">
                    <div className="relative">
                      <Image
                        src={avatarUrl}
                        alt={`@${activeProfile.username}`}
                        width={48}
                        height={48}
                        loading="lazy"
                        unoptimized
                        className="size-12 rounded-full border-2 border-signal-lime bg-carbon object-cover shadow-[0_0_15px_rgba(197,255,74,0.3)]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                          @{activeProfile.username}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-signal-lime/10 border border-signal-lime/30 text-signal-lime text-[10px] font-jetbrains-mono uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 size={10} />
                          {t('landing.community.verified_badge', 'Verified')}
                        </span>
                      </div>
                      <p className="font-inter-tight text-[13px] text-ash mt-0.5">
                        {activeProfile.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 border border-graphite bg-carbon hover:border-signal-lime text-ash hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 font-jetbrains-mono text-[11px]"
                      title={t('landing.community.view_profile', 'View GitHub Profile')}
                    >
                      <Github size={14} />
                      <span className="hidden sm:inline">GitHub</span>
                      <ExternalLink size={11} className="text-ash" />
                    </a>
                  </div>
                </div>

                <div className="my-1 py-2 px-3 bg-carbon border border-graphite/70 flex flex-wrap items-center justify-between gap-3 font-jetbrains-mono text-[11px]">
                  <div className="flex items-center gap-2 text-ash uppercase">
                    <span>{t('landing.community.applied_template', 'Applied Template:')}</span>
                    <span className="text-signal-lime font-bold">
                      {activeProfile.templateId}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-ash">
                    <span className="flex items-center gap-1.5">
                      <Layers size={12} className="text-signal-lime" />
                      {t('landing.community.widgets_active', `${activeProfile.widgetsCount} Widgets Active`, {
                        count: String(activeProfile.widgetsCount),
                      })}
                    </span>
                    <span className="text-graphite">|</span>
                    <span className="text-pearl">
                      {t('landing.community.live_readme_card', 'Live README Card')}
                    </span>
                  </div>
                </div>

                <div className="bg-void-black border border-graphite my-2 overflow-hidden w-full h-[380px] min-h-[380px] max-h-[380px] flex items-center justify-center relative shadow-inner">
                  {!imageLoaded && !imageError && (
                    <div className="absolute inset-0 bg-void-black flex flex-col items-center justify-center gap-2 z-10 transition-opacity duration-150">
                      <span className="w-5 h-5 border-2 border-signal-lime border-t-transparent rounded-full animate-spin" />
                      <span className="font-jetbrains-mono text-caption text-ash">
                        {t('landing.community.rendering_card', 'Rendering dynamic SVG card...')}
                      </span>
                    </div>
                  )}

                  {!imageError ? (
                    <div className="w-full h-full flex items-center justify-center p-3">
                      <Image
                        key={`${activeProfile.username}-${activeProfile.templateId}`}
                        src={previewEndpoint}
                        alt={`GitAscii Card for @${activeProfile.username}`}
                        width={800}
                        height={360}
                        loading="eager"
                        unoptimized
                        className={`w-full max-w-full h-full max-h-[350px] object-contain shadow-lg transition-opacity duration-200 ${
                          imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageError(true)}
                      />
                    </div>
                  ) : (
                    <div className="py-10 text-center space-y-2">
                      <Code2 size={24} className="text-signal-lime mx-auto" />
                      <span className="font-jetbrains-mono text-caption text-ash block">
                        ~/gitascii/api/{activeProfile.username}?template={activeProfile.templateId}
                      </span>
                      <span className="font-jetbrains-mono text-[10px] text-signal-lime uppercase block">
                        {t('landing.community.vector_ready', '[ Vector Ready on Edge CDN ]')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activeProfile.tags.map((tag, tagIdx) => (
                    <span
                      key={tagIdx}
                      className="px-2 py-0.5 border border-graphite rounded-none font-jetbrains-mono text-[9px] uppercase text-pearl bg-carbon"
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 border border-graphite rounded-none font-jetbrains-mono text-[9px] uppercase text-ash tracking-wider bg-carbon flex items-center gap-1">
                    <Layers size={10} className="text-signal-lime" />
                    {t('landing.community.modules_active', `${activeProfile.widgetsCount} Modules Active`, {
                      count: String(activeProfile.widgetsCount),
                    })}
                  </span>
                </div>

                <div className="pt-3 border-t border-graphite/60 flex flex-wrap items-center justify-between gap-3">
                  <span className="font-jetbrains-mono text-[11px] text-ash">
                    {t('landing.community.live_cdn_endpoint', 'Live CDN Endpoint:')} <code className="text-signal-lime">/api/{activeProfile.username}</code>
                  </span>
                  <span className="font-jetbrains-mono text-[10px] text-signal-lime uppercase">
                    {t('landing.community.dynamic_readme', '[ Dynamic GitHub README ]')}
                  </span>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>
        </div>

        <div className="text-center pt-4">
          <Magnet distance={80} strength={0.2}>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3.5 bg-signal-lime hover:bg-signal-lime-hover text-carbon font-inter-tight font-semibold text-[14px] uppercase tracking-wider transition-colors shadow-[0_0_20px_rgba(197,255,74,0.2)]"
            >
              <span>{t('landing.community.explore_all', 'Explore All Verified Community Profiles')}</span>
              <span aria-hidden="true">→</span>
            </Link>
          </Magnet>
          <span className="block font-jetbrains-mono text-[11px] text-ash mt-3">
            {t(
              'landing.community.join_text',
              `Join ${resolvedUsersCount}+ developers building live dynamic profile cards.`,
              { count: String(resolvedUsersCount) }
            )}
          </span>
        </div>
      </div>
    </section>
  )
}

export default CommunityProfiles
