'use client'

import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  Code2,
  Compass,
  Cpu,
  ExternalLink,
  Github,
  Grid,
  Layers,
  LayoutTemplate,
  LogIn,
  LogOut,
  Menu,
  Palette,
  Star,
  User,
  X,
  Zap,
} from 'lucide-react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

import LanguageSelector from '@/components/ui/LanguageSelector'
import { EXTERNAL_LINKS, NAVBAR_DROPDOWN_SECTIONS } from '@/constants'
import { useI18n } from '@/i18n'
import { API_ENDPOINTS } from '@/services/endpoints'

export interface UserSession {
  username: string
  githubId: number
}

const ITEM_ICONS: Record<string, React.ReactNode> = {
  templates: <LayoutTemplate className="size-4 text-signal-lime" />,
  widgets: <Grid className="size-4 text-signal-lime" />,
  explore: <Compass className="size-4 text-signal-lime" />,
  guides: <BookOpen className="size-4 text-signal-lime" />,
  quickstart: <Zap className="size-4 text-signal-lime" />,
  api_rendering: <Code2 className="size-4 text-signal-lime" />,
  ascii_pipeline: <Cpu className="size-4 text-signal-lime" />,
  design_tokens: <Palette className="size-4 text-signal-lime" />,
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [stars, setStars] = useState<number | null>(null)
  const [session, setSession] = useState<UserSession | null>(null)
  const [isLoginLoading, setIsLoginLoading] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { t } = useI18n()
  const pathname = usePathname()

  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 30)
  })

  const handleMouseEnter = (sectionKey: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActiveDropdown(sectionKey)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 150)
  }

  useEffect(() => {
    fetch(API_ENDPOINTS.GITHUB.GITASCII_REPO)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.stargazers_count === 'number') {
          setStars(data.stargazers_count)
        }
      })
      .catch(() => {})

    fetch(API_ENDPOINTS.AUTH.SESSION)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.session) {
          setSession(data.session)
        }
      })
      .catch(() => {})

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleLogout = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.AUTH.LOGOUT, { method: 'POST' })
      if (res.ok) {
        setSession(null)
        window.location.reload()
      } else {
        console.warn('Logout endpoint returned non-ok status:', res.status)
      }
    } catch (e) {
      console.error('Failed to log out:', e)
    }
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 flex justify-center pointer-events-none px-4 md:px-8">
      <motion.nav
        initial={false}
        animate={{
          width: isScrolled ? 'min(100%, 1120px)' : '100%',
          y: isScrolled ? 16 : 0,
          borderRadius: isScrolled ? 16 : 0,
          backgroundColor: isScrolled ? 'rgba(8, 8, 8, 0.82)' : 'rgba(8, 8, 8, 0)',
          borderColor: isScrolled ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0)',
          backdropFilter: isScrolled ? 'blur(16px)' : 'blur(0px)',
          boxShadow: isScrolled
            ? '0 20px 40px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 0 rgba(197, 255, 74, 0.2)'
            : '0 0 0 0 rgba(0, 0, 0, 0)',
        }}
        transition={{
          duration: 0.35,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="pointer-events-auto relative border transition-all"
      >
        <div className="relative mx-auto flex h-14 md:h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3 z-10">
            <Link href="/" className="flex items-center gap-0 group">
              <span className="font-inter-tight text-subheading font-medium text-white tracking-tight group-hover:text-chalk transition-colors">
                Git
              </span>
              <span className="font-pt-serif text-subheading font-light italic text-signal-lime tracking-tight">
                Ascii
              </span>
            </Link>
            <LanguageSelector align="left" className="ml-1" />
          </div>

          <div className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2 h-full">
            {NAVBAR_DROPDOWN_SECTIONS.map((section) => {
              const isOpened = activeDropdown === section.key
              const hasActiveChild = section.items.some(
                (it) => !it.isExternal && pathname.startsWith(it.href)
              )

              return (
                <div
                  key={section.key}
                  className="relative h-full flex items-center"
                  onMouseEnter={() => handleMouseEnter(section.key)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    onClick={() => setActiveDropdown(isOpened ? null : section.key)}
                    className={`group inline-flex items-center gap-1.5 px-3 py-1.5 font-inter-tight text-label font-medium uppercase tracking-[0.18em] transition-colors duration-200 cursor-pointer ${
                      isOpened || hasActiveChild
                        ? 'text-signal-lime'
                        : 'text-white hover:text-signal-lime'
                    }`}
                    aria-expanded={isOpened}
                  >
                    <span>{t(section.key, section.defaultLabel)}</span>
                    <ChevronDown
                      className={`size-3.5 transition-all duration-200 ${
                        isOpened
                          ? 'rotate-180 text-signal-lime'
                          : hasActiveChild
                            ? 'text-signal-lime'
                            : 'text-ash group-hover:text-signal-lime'
                      }`}
                    />
                  </button>

                  <AnimatePresence mode="wait">
                    {isOpened && (
                      <motion.div
                        key={section.key}
                        initial={{ opacity: 0, y: -6, scale: 0.97, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{
                          opacity: 0,
                          y: -8,
                          scale: 0.96,
                          filter: 'blur(4px)',
                          transition: { duration: 0.18, ease: [0.32, 0, 0.67, 0] },
                        }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute top-14 left-1/2 -translate-x-1/2 w-[480px] z-50 origin-top pt-2"
                      >
                        <div className="rounded-sm border border-graphite/80 bg-onyx/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.95)] overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-2 bg-void-black border-b border-graphite/70 select-none">
                            <div className="flex items-center gap-2">
                              <span className="font-jetbrains-mono text-[10px] uppercase text-ash tracking-widest">
                                {`// ${t(section.key, section.defaultLabel)}`}
                              </span>
                            </div>
                            <span className="font-jetbrains-mono text-[9px] text-ash uppercase tracking-widest">
                              GITASCII
                            </span>
                          </div>

                          <div className="p-2.5 flex flex-col gap-1.5">
                            {section.items.map((item) => {
                              const isItemActive =
                                !item.isExternal && pathname.startsWith(item.href)
                              const isFeatured = item.featured

                              const content = isFeatured ? (
                                <motion.div
                                  whileHover={{ x: 2 }}
                                  transition={{ duration: 0.15, ease: 'easeOut' }}
                                  className="relative flex flex-col gap-1.5 p-3.5 rounded-sm bg-linear-to-br from-carbon/90 via-onyx to-void-black hover:from-carbon hover:to-onyx transition-all duration-200 group cursor-pointer border-b border-graphite/50 pb-3 mb-1 overflow-hidden"
                                >
                                  <div className="absolute top-0 right-0 w-36 h-36 bg-signal-lime/5 rounded-full blur-2xl pointer-events-none group-hover:bg-signal-lime/10 transition-colors" />

                                  <div className="flex items-center justify-between z-10">
                                    <span className="font-jetbrains-mono text-[9px] uppercase tracking-widest text-signal-lime font-medium">
                                      {item.badge ? `[ ${item.badge} ]` : '[ FEATURED ]'}
                                    </span>
                                    {item.isExternal ? (
                                      <ExternalLink className="size-3 text-ash group-hover:text-signal-lime transition-colors" />
                                    ) : (
                                      <ArrowRight className="size-3 text-ash group-hover:text-signal-lime group-hover:translate-x-0.5 transition-all duration-200" />
                                    )}
                                  </div>

                                  <div className="flex flex-col mt-0.5 z-10">
                                    <h4 className="text-[17px] leading-snug">
                                      <span className="font-inter-tight font-medium text-white">
                                        {t(`landing.navbar.item.${item.key}`, item.defaultTitle)}
                                      </span>
                                    </h4>
                                    <p className="font-inter-tight text-[12px] text-bone/80 mt-1 leading-relaxed group-hover:text-white transition-colors">
                                      {t(`landing.navbar.item.${item.key}_desc`, item.defaultDesc)}
                                    </p>
                                  </div>
                                </motion.div>
                              ) : (
                                <motion.div
                                  whileHover={{ x: 2 }}
                                  transition={{ duration: 0.15, ease: 'easeOut' }}
                                  className="relative flex items-center justify-between gap-3 px-3 py-2 rounded-sm hover:bg-carbon/60 transition-colors duration-150 group cursor-pointer"
                                >
                                  <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span
                                        className={`font-inter-tight text-body font-medium transition-colors duration-150 ${
                                          isItemActive
                                            ? 'text-signal-lime'
                                            : 'text-chalk group-hover:text-white'
                                        }`}
                                      >
                                        {t(`landing.navbar.item.${item.key}`, item.defaultTitle)}
                                      </span>
                                      {item.badge && (
                                        <span className="font-jetbrains-mono text-[9px] text-ash uppercase">
                                          · {item.badge}
                                        </span>
                                      )}
                                    </div>
                                    <p className="font-inter-tight text-[12px] text-ash mt-0.5 leading-snug line-clamp-1 group-hover:text-bone transition-colors">
                                      {t(`landing.navbar.item.${item.key}_desc`, item.defaultDesc)}
                                    </p>
                                  </div>

                                  {item.isExternal ? (
                                    <ExternalLink className="size-3 text-ash group-hover:text-signal-lime transition-colors shrink-0" />
                                  ) : (
                                    <ArrowRight className="size-3 text-ash group-hover:text-signal-lime group-hover:translate-x-0.5 transition-all duration-150 shrink-0" />
                                  )}
                                </motion.div>
                              )

                              if (item.isExternal) {
                                return (
                                  <a
                                    key={item.key}
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setActiveDropdown(null)}
                                  >
                                    {content}
                                  </a>
                                )
                              }

                              return (
                                <Link
                                  key={item.key}
                                  href={item.href}
                                  onClick={() => setActiveDropdown(null)}
                                >
                                  {content}
                                </Link>
                              )
                            })}
                          </div>

                          {section.footerLink && (
                            <div className="px-4 py-2.5 bg-void-black border-t border-graphite/60 flex items-center justify-between">
                              {section.footerLink.isExternal ? (
                                <a
                                  href={section.footerLink.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-inter-tight text-[12px] text-ash hover:text-signal-lime flex items-center gap-1.5 transition-colors duration-200 group"
                                  onClick={() => setActiveDropdown(null)}
                                >
                                  <span>{t(section.footerLink.key, section.footerLink.defaultLabel)}</span>
                                  <ArrowRight className="size-3 text-ash group-hover:text-signal-lime group-hover:translate-x-0.5 transition-all duration-200" />
                                </a>
                              ) : (
                                <Link
                                  href={section.footerLink.href}
                                  className="font-inter-tight text-[12px] text-ash hover:text-signal-lime flex items-center gap-1.5 transition-colors duration-200 group"
                                  onClick={() => setActiveDropdown(null)}
                                >
                                  <span>{t(section.footerLink.key, section.footerLink.defaultLabel)}</span>
                                  <ArrowRight className="size-3 text-ash group-hover:text-signal-lime group-hover:translate-x-0.5 transition-all duration-200" />
                                </Link>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>

          <div className="hidden md:flex items-center gap-2 z-10">
            <a
              href={EXTERNAL_LINKS.GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-2.5 h-[32px] font-inter-tight text-label font-medium text-ash transition-all duration-200 hover:text-white active:scale-[0.98] cursor-pointer group"
              title={t('common.star_github', 'Star on GitHub')}
              aria-label={t('common.star_github', 'Star on GitHub')}
            >
              <Github className="size-3.5 text-ash group-hover:text-white transition-colors" />
              <span className="text-ash group-hover:text-white transition-colors font-medium">
                {t('common.star', 'Star')}
              </span>
              <span className="h-3 w-px bg-graphite/60 mx-0.5" />
              <div className="flex items-center gap-1 text-ash group-hover:text-signal-lime transition-colors">
                <Star className="size-3 fill-current" />
                <span className="font-jetbrains-mono text-[11px]">
                  {stars !== null ? stars : '—'}
                </span>
              </div>
            </a>

            {session ? (
              <div className="inline-flex items-center rounded-sm border border-graphite/70 bg-onyx h-[32px] w-[130px] overflow-hidden group hover:border-graphite transition-all duration-200">
                <Link
                  href={`/${session.username}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 h-full font-inter-tight text-label font-medium text-white hover:text-signal-lime hover:bg-carbon transition-colors min-w-0"
                  title={`Profile @${session.username}`}
                >
                  <User className="size-3.5 text-ash group-hover:text-signal-lime transition-colors shrink-0" />
                  <span className="truncate max-w-[65px] font-inter-tight">
                    @{session.username}
                  </span>
                </Link>
                <span className="h-4 w-px bg-graphite/80 shrink-0" />
                <button
                  onClick={handleLogout}
                  className="px-2 h-full flex items-center justify-center text-ash hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                  title={t('editor.toolbar.logout', 'Sign Out')}
                >
                  <LogOut className="size-3.5" />
                </button>
              </div>
            ) : (
              <Link
                href="/api/auth/login"
                prefetch={false}
                rel="nofollow"
                onClick={() => setIsLoginLoading(true)}
                className="inline-flex items-center justify-center gap-1.5 rounded-sm border border-graphite/70 bg-gradient-to-r from-onyx via-carbon to-onyx px-3 h-[32px] w-[130px] font-inter-tight text-label font-medium text-white transition-all duration-300 ease-in-out hover:border-graphite hover:bg-carbon hover:shadow-[0_0_14px_rgba(197,255,74,0.15)] active:scale-[0.98] group cursor-pointer overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-signal-lime/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                {isLoginLoading ? (
                  <span className="w-3.5 h-3.5 border-2 border-signal-lime border-t-transparent rounded-full animate-spin shrink-0" />
                ) : (
                  <LogIn className="size-3.5 text-signal-lime group-hover:translate-x-0.5 transition-transform duration-200 shrink-0" />
                )}
                <span className="font-inter-tight font-medium text-white tracking-wide z-10">
                  Log
                  <span className="font-pt-serif italic text-signal-lime ml-0.5 font-light text-[14px]">
                    in
                  </span>
                </span>
              </Link>
            )}
          </div>

          <button
            className="md:hidden text-white cursor-pointer transition-colors duration-300 ease-in-out hover:text-signal-lime min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={t('common.toggle_menu', 'Toggle menu')}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="absolute left-0 top-16 w-full bg-void-black/95 backdrop-blur-xl border-b border-graphite px-6 py-4 md:hidden flex flex-col gap-5 animate-in slide-in-from-top-2 duration-300 ease-in-out shadow-2xl z-40 max-h-[85vh] overflow-y-auto">
            {NAVBAR_DROPDOWN_SECTIONS.map((section) => (
              <div key={section.key} className="flex flex-col gap-2">
                <div className="flex items-center gap-2 pb-1 border-b border-graphite/40">
                  <span className="font-jetbrains-mono text-[10px] text-signal-lime font-bold uppercase tracking-widest">
                    ● {t(section.key, section.defaultLabel)}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1 pl-2">
                  {section.items.map((item) => {
                    const isItemActive = !item.isExternal && pathname.startsWith(item.href)
                    const itemIcon = ITEM_ICONS[item.key] || (
                      <Layers className="size-3.5 text-signal-lime" />
                    )

                    const itemInner = (
                      <div className="flex items-center gap-2.5 py-2 group">
                        <div className="p-1.5 rounded-sm bg-onyx border border-graphite/80 group-hover:border-signal-lime/40">
                          {itemIcon}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-inter-tight text-caption font-medium ${
                                isItemActive ? 'text-signal-lime' : 'text-chalk'
                              }`}
                            >
                              {t(`landing.navbar.item.${item.key}`, item.defaultTitle)}
                            </span>
                            {item.isExternal && <ExternalLink className="size-2.5 text-ash" />}
                          </div>
                        </div>
                      </div>
                    )

                    if (item.isExternal) {
                      return (
                        <a
                          key={item.key}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {itemInner}
                        </a>
                      )
                    }

                    return (
                      <Link
                        key={item.key}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {itemInner}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}

            <div className="flex flex-col gap-3 mt-2 border-t border-graphite/40 pt-4">
              {session ? (
                <div className="flex flex-col gap-2">
                  <Link
                    href={`/${session.username}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-sm border border-signal-lime/30 bg-onyx px-5 py-3 font-inter-tight text-label font-medium text-signal-lime transition-all duration-300 w-full min-h-[44px]"
                  >
                    <User className="size-3.5" />
                    <span>@{session.username}</span>
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      handleLogout()
                    }}
                    className="inline-flex items-center justify-center gap-1.5 rounded-sm border border-graphite bg-red-500/10 px-5 py-3 font-inter-tight text-label font-medium text-red-400 hover:bg-red-500/20 transition-all duration-300 w-full cursor-pointer min-h-[44px]"
                  >
                    <LogOut className="size-3.5" />
                    <span>{t('editor.toolbar.logout', 'Sign Out')}</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/api/auth/login"
                  prefetch={false}
                  rel="nofollow"
                  onClick={() => setIsLoginLoading(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-sm bg-signal-lime px-5 py-3 font-inter-tight text-label font-bold text-black transition-all duration-300 ease-in-out hover:brightness-110 w-full text-center cursor-pointer min-h-[44px]"
                >
                  {isLoginLoading ? (
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <LogIn className="size-4" />
                  )}
                  <span>{t('landing.hero.login_github', 'Login with GitHub')}</span>
                </Link>
              )}

              <div className="flex items-center justify-between py-2">
                <span className="text-label font-medium text-ash uppercase tracking-wider">
                  {t('common.language', 'Language')}
                </span>
                <LanguageSelector align="right" />
              </div>

              <a
                href={EXTERNAL_LINKS.GITHUB_REPO}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 rounded-sm border border-graphite bg-onyx px-5 py-2.5 font-inter-tight text-label font-medium text-white transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98] hover:border-signal-lime hover:bg-onyx/80 hover:shadow-[0_0_12px_rgba(197,255,74,0.4)] w-full text-center cursor-pointer group"
              >
                <Github className="size-4 text-ash group-hover:text-white transition-colors duration-300 ease-in-out" />
                <span className="transition-colors duration-300 ease-in-out">
                  {t('common.star_github', 'Star on GitHub')}
                </span>
                <span className="h-3 w-px bg-graphite" />
                <div className="flex items-center gap-1 text-ash group-hover:text-signal-lime transition-colors duration-300 ease-in-out">
                  <Star className="size-3.5 fill-current" />
                  <span>{stars !== null ? stars : '—'}</span>
                </div>
              </a>
            </div>
          </div>
        )}
      </motion.nav>
    </header>
  )
}
