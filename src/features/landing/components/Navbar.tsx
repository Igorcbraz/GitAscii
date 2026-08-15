'use client'

import { Github, LogIn, LogOut, Menu, Star, User, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import LanguageSelector from '@/components/ui/LanguageSelector'
import { EXTERNAL_LINKS, NAVBAR_MENU_ITEMS } from '@/constants'
import { useI18n } from '@/i18n'
import { API_ENDPOINTS } from '@/services/endpoints'

export interface UserSession {
  username: string
  githubId: number
}

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [stars, setStars] = useState<number | null>(null)
  const [session, setSession] = useState<UserSession | null>(null)
  const [isLoginLoading, setIsLoginLoading] = useState(false)
  const { t } = useI18n()
  const pathname = usePathname()

  const menuItems = NAVBAR_MENU_ITEMS.map((item) => ({
    label: t(item.key, item.defaultLabel),
    href: item.href,
  }))

  useEffect(() => {
    fetch(API_ENDPOINTS.GITHUB.GITASCII_REPO)
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.stargazers_count === 'number') {
          setStars(data.stargazers_count)
        }
      })
      .catch(() => {})

    fetch(API_ENDPOINTS.AUTH.SESSION)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.session) {
          setSession(data.session)
        }
      })
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.AUTH.LOGOUT, { method: 'POST' })
      if (res.ok) {
        setSession(null)
        window.location.reload()
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-void-black border-b border-graphite transition-all duration-300">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-3 z-10">
          <Link href="/" className="flex items-center gap-1">
            <span className="font-inter-tight text-subheading font-medium text-white tracking-tight">
              Git
            </span>
            <span className="font-pt-serif text-subheading font-light italic text-signal-lime tracking-tight">
              Ascii
            </span>
          </Link>
          <LanguageSelector align="left" className="ml-2" />
        </div>
        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2 h-full">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`font-inter-tight text-label font-medium uppercase tracking-[0.18em] transition-colors duration-300 ease-in-out hover:text-signal-lime ${
                  isActive ? 'text-signal-lime' : 'text-white'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
        <div className="hidden md:flex items-center gap-3 z-10">
          {session ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleLogout}
                className="p-2 rounded-sm border border-graphite hover:border-red-500/50 hover:bg-red-500/10 text-ash hover:text-red-400 transition-all duration-300 cursor-pointer"
                title="Sair"
              >
                <LogOut className="size-4" />
              </button>
              <Link
                href={`/${session.username}`}
                className="inline-flex items-center gap-1.5 rounded-sm border border-signal-lime/30 bg-onyx px-3.5 py-2 font-inter-tight text-label font-medium text-signal-lime transition-all duration-300 hover:border-signal-lime hover:shadow-[0_0_8px_rgba(197,255,74,0.2)] hover:bg-onyx/80"
              >
                <User className="size-3.5" />
                <span>@{session.username}</span>
              </Link>
            </div>
          ) : (
            <Link
              href="/api/auth/login"
              prefetch={false}
              onClick={() => setIsLoginLoading(true)}
              className="inline-flex items-center gap-2 rounded-sm bg-signal-lime px-4 py-2 font-inter-tight text-label font-bold text-black transition-all duration-300 ease-in-out hover:scale-[1.03] active:scale-[0.98] hover:shadow-[0_0_12px_rgba(197,255,74,0.4)] hover:brightness-110 cursor-pointer"
            >
              {isLoginLoading ? (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn className="size-4" />
              )}
              <span>LOGIN</span>
            </Link>
          )}

          <a
            href={EXTERNAL_LINKS.GITHUB_REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-sm border border-graphite bg-onyx px-4 py-2 font-inter-tight text-label font-medium text-white transition-all duration-300 ease-in-out hover:scale-[1.03] active:scale-[0.98] hover:border-signal-lime hover:bg-onyx/80 hover:shadow-[0_0_12px_rgba(197,255,74,0.4)] group cursor-pointer"
          >
            <Github className="size-4 text-ash group-hover:text-white transition-colors duration-300 ease-in-out" />
            <span className="transition-colors duration-300 ease-in-out text-white group-hover:text-white">
              {t('common.star', 'Star')}
            </span>
            <span className="h-3 w-px bg-graphite transition-colors duration-300 ease-in-out group-hover:bg-graphite/60" />
            <div className="flex items-center gap-1 text-ash group-hover:text-signal-lime transition-colors duration-300 ease-in-out">
              <Star className="size-3.5 fill-current" />
              <span>{stars !== null ? stars : '—'}</span>
            </div>
          </a>
        </div>
        <button
          className="md:hidden text-white cursor-pointer transition-colors duration-300 ease-in-out hover:text-signal-lime"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {isMobileMenuOpen && (
        <div className="absolute left-0 top-16 w-full bg-void-black border-b border-graphite px-6 py-4 md:hidden flex flex-col gap-4 animate-in slide-in-from-top-2 duration-300 ease-in-out shadow-xl z-40">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`font-inter-tight text-label font-medium uppercase tracking-[0.18em] transition-colors duration-300 ease-in-out hover:text-signal-lime block py-2 ${
                  isActive ? 'text-signal-lime' : 'text-white'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            )
          })}
          <div className="flex flex-col gap-3 mt-2 border-t border-graphite/40 pt-4">
            {session ? (
              <div className="flex flex-col gap-2">
                <Link
                  href={`/${session.username}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-sm border border-signal-lime/30 bg-onyx px-5 py-2.5 font-inter-tight text-label font-medium text-signal-lime transition-all duration-300 w-full"
                >
                  <User className="size-3.5" />
                  <span>@{session.username}</span>
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    handleLogout()
                  }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-sm border border-graphite bg-red-500/10 px-5 py-2.5 font-inter-tight text-label font-medium text-red-400 hover:bg-red-500/20 transition-all duration-300 w-full cursor-pointer"
                >
                  <LogOut className="size-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                href="/api/auth/login"
                prefetch={false}
                onClick={() => setIsLoginLoading(true)}
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-signal-lime px-5 py-2.5 font-inter-tight text-label font-bold text-black transition-all duration-300 ease-in-out hover:brightness-110 w-full text-center cursor-pointer"
              >
                {isLoginLoading ? (
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogIn className="size-4" />
                )}
                <span>LOGIN COM GITHUB</span>
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
    </nav>
  )
}
