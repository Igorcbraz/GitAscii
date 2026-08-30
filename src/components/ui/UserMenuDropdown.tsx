'use client'

import { ChevronDown, Layers, LogOut, User, Zap } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

import { PRO_PLAN_TIERS } from '@/constants'
import { useI18n } from '@/i18n'
import { API_ENDPOINTS } from '@/services/endpoints'

export interface UserMenuDropdownProps {
  username?: string
  avatarUrl?: string
  align?: 'left' | 'right'
  direction?: 'down' | 'up'
  variant?: 'pill' | 'card'
  className?: string
  editorHref?: string
  onLogout?: () => void
}

export function UserMenuDropdown({
  username,
  avatarUrl,
  align = 'right',
  direction = 'down',
  variant = 'pill',
  className = '',
  editorHref,
  onLogout,
}: UserMenuDropdownProps) {
  const { t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const [isProUser, setIsProUser] = useState<boolean | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname() || ''

  const finalEditorHref = editorHref || `/${username}`
  const resolvedAvatarUrl =
    avatarUrl || (username ? `https://github.com/${username}.png` : undefined)

  useEffect(() => {
    if (isOpen && process.env.NODE_ENV !== 'production') {
      fetch(API_ENDPOINTS.AUTH.SESSION)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.session) {
            setIsProUser(Boolean(data.session.isPro || data.session.tier !== PRO_PLAN_TIERS.FREE))
          }
        })
        .catch(() => {})
    }
  }, [isOpen])

  const isLanding = pathname === '/'
  const isPro = pathname.startsWith('/pro')
  const isEditor =
    !isPro &&
    (pathname === `/${username}` ||
      pathname.startsWith(`/${username}/`) ||
      (pathname !== '/' &&
        !pathname.startsWith('/templates') &&
        !pathname.startsWith('/explore') &&
        !pathname.startsWith('/guides') &&
        !pathname.startsWith('/vs') &&
        !pathname.startsWith('/widgets') &&
        !pathname.startsWith('/privacy') &&
        !pathname.startsWith('/terms')))

  const handleLogout = async () => {
    setIsOpen(false)
    if (onLogout) {
      onLogout()
      return
    }
    try {
      await fetch(API_ENDPOINTS.AUTH.LOGOUT, { method: 'POST' })
      window.location.reload()
    } catch {
      window.location.reload()
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div
      ref={dropdownRef}
      className={`relative ${variant === 'card' ? 'w-full' : 'inline-block'} text-left ${className}`}
    >
      {variant === 'card' ? (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          className={`w-full flex items-center justify-between p-2 rounded-xl transition-all duration-200 cursor-pointer text-left group ${
            isOpen
              ? 'bg-white/10 border border-white/20'
              : 'hover:bg-white/5 border border-transparent'
          }`}
          title={t('landing.nav.account_menu', 'Account menu @{username}', {
            username: username || '',
          })}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-xs font-bold text-white overflow-hidden flex-shrink-0 relative">
              {resolvedAvatarUrl ? (
                <Image
                  src={resolvedAvatarUrl}
                  alt={username || 'User'}
                  width={28}
                  height={28}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{(username || 'U').charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-white truncate leading-tight group-hover:text-signal-lime transition-colors">
                {username ? `@${username}` : 'GitAscii User'}
              </p>
              <p className="text-[10px] text-[#7a7a7a] font-mono truncate">
                {t('landing.nav.pro_plan', 'Pro Plan')}
              </p>
            </div>
          </div>

          <ChevronDown
            className={`w-3.5 h-3.5 text-[#7a7a7a] transition-transform duration-200 flex-shrink-0 group-hover:text-white ${
              isOpen
                ? direction === 'up'
                  ? ''
                  : 'rotate-180'
                : direction === 'up'
                  ? 'rotate-180'
                  : ''
            }`}
          />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          className={`inline-flex items-center gap-1.5 px-2.5 h-[32px] rounded-sm border bg-onyx transition-all duration-200 cursor-pointer group ${
            isOpen
              ? 'border-signal-lime/60 bg-carbon text-white shadow-[0_0_12px_rgba(197,255,74,0.15)]'
              : 'border-graphite/70 text-white hover:border-graphite hover:bg-carbon'
          }`}
          title={t('landing.nav.account_menu', 'Account menu @{username}', {
            username: username || '',
          })}
        >
          <div className="size-5 rounded-full bg-signal-lime/10 border border-signal-lime/30 overflow-hidden flex items-center justify-center shrink-0 relative">
            {resolvedAvatarUrl ? (
              <Image
                src={resolvedAvatarUrl}
                alt={username || 'User'}
                width={20}
                height={20}
                className="size-full object-cover rounded-full"
              />
            ) : (
              <User className="size-2.5 text-signal-lime" />
            )}
          </div>
          <span className="font-inter-tight text-[12px] font-medium text-white group-hover:text-signal-lime transition-colors max-w-[90px] truncate">
            @{username}
          </span>
          <ChevronDown
            className={`size-3 text-ash transition-transform duration-200 shrink-0 group-hover:text-white ${
              isOpen
                ? direction === 'up'
                  ? ''
                  : 'rotate-180 text-signal-lime'
                : direction === 'up'
                  ? 'rotate-180'
                  : ''
            }`}
          />
        </button>
      )}

      {isOpen && (
        <div
          className={`absolute z-50 ${
            direction === 'up' ? 'bottom-full mb-2' : 'top-full mt-1.5'
          } ${
            variant === 'card'
              ? 'w-full left-0'
              : 'w-56 ' + (align === 'right' ? 'right-0' : 'left-0')
          } rounded-sm bg-void-black border border-graphite/80 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150`}
        >
          {isLanding && (
            <div className="px-2.5 py-2 mb-1 border-b border-graphite/40 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="size-6 rounded-full bg-white/10 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center relative">
                  {resolvedAvatarUrl ? (
                    <Image
                      src={resolvedAvatarUrl}
                      alt={username || 'User'}
                      width={24}
                      height={24}
                      className="size-full object-cover"
                    />
                  ) : (
                    <User className="size-3 text-signal-lime" />
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-ash">
                    {t('landing.nav.connected_as', 'Connected as')}
                  </span>
                  <span className="text-xs font-semibold text-white truncate">@{username}</span>
                </div>
              </div>
              <div className="size-2 rounded-full bg-signal-lime animate-pulse" title="Online" />
            </div>
          )}

          {!isEditor && (
            <Link
              href={finalEditorHref}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-sm text-xs font-medium text-chalk hover:text-white hover:bg-onyx transition-colors group cursor-pointer"
            >
              <div className="size-6 rounded-sm bg-onyx border border-graphite/60 flex items-center justify-center group-hover:border-signal-lime/40 group-hover:text-signal-lime transition-colors shrink-0">
                <Layers className="size-3.5 text-signal-lime" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="leading-tight">
                  {t('landing.nav.go_to_editor', 'Go to Editor')}
                </span>
                <span className="text-[10px] text-ash group-hover:text-ash/90">
                  {t('landing.nav.edit_profile', 'Edit README profile')}
                </span>
              </div>
            </Link>
          )}

          {!isPro && (
            <Link
              href="/pro"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-sm text-xs font-medium text-chalk hover:text-white hover:bg-onyx transition-colors group cursor-pointer ${
                !isEditor ? 'mt-0.5' : ''
              }`}
            >
              <div className="size-6 rounded-sm bg-signal-lime/10 border border-signal-lime/30 flex items-center justify-center group-hover:bg-signal-lime/20 transition-colors shrink-0">
                <Zap className="size-3.5 text-signal-lime" />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="leading-tight text-white font-semibold">
                  {t('landing.nav.go_to_pro', 'Go to Pro')}
                </span>
                <span className="text-[10px] text-ash group-hover:text-ash/90">
                  {t('landing.nav.pro_desc', 'Analytics, reports & errors')}
                </span>
              </div>
            </Link>
          )}

          <div className="h-px bg-graphite/50 my-1" />

          {process.env.NODE_ENV !== 'production' && (
            <div className="px-2.5 py-1.5 rounded-sm bg-onyx/40 border border-amber-500/20 mb-1 flex items-center justify-between">
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-[10px] font-mono text-amber-300 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Dev: Pro Mode
                </span>
                <span className="text-[9px] text-ash">
                  {isProUser ? 'Active (Pro Plan)' : 'Inactive (Free Plan)'}
                </span>
              </div>
              <button
                type="button"
                onClick={async (e) => {
                  e.stopPropagation()
                  try {
                    const currentActive = isProUser ?? isPro
                    const nextTier = currentActive ? 'free' : 'pro'
                    await fetch(API_ENDPOINTS.PRO.DEV_TOGGLE, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ tier: nextTier }),
                    })
                    window.location.reload()
                  } catch (err) {
                    console.error('Failed to toggle dev pro mode:', err)
                  }
                }}
                className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  (isProUser ?? isPro) ? 'bg-signal-lime' : 'bg-graphite'
                }`}
                title={(isProUser ?? isPro) ? 'Disable Pro (Simulate Free)' : 'Enable Pro'}
              >
                <span
                  className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-void-black shadow-lg ring-0 transition duration-200 ease-in-out ${
                    (isProUser ?? isPro) ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-sm text-[11px] font-medium text-ash/80 hover:text-red-400 hover:bg-red-500/10 transition-colors group cursor-pointer text-left"
          >
            <LogOut className="size-3 text-ash/70 group-hover:text-red-400 transition-colors shrink-0" />
            <span>{t('landing.nav.logout', 'Log out')}</span>
          </button>
        </div>
      )}
    </div>
  )
}
