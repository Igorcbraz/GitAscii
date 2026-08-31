'use client'

import {
  BarChart3,
  BookOpen,
  ExternalLink,
  FileText,
  Github,
  Layers,
  LayoutDashboard,
  Mail,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

import { UserMenuDropdown } from '@/components/ui/UserMenuDropdown'
import { EXTERNAL_LINKS } from '@/constants/links'
import { useI18n } from '@/i18n'

import { ProBadge } from './ProBadge'

export interface ProSidebarProps {
  username?: string
  avatarUrl?: string
  isPro?: boolean
  activeErrorsCount?: number
}

export const ProSidebar: React.FC<ProSidebarProps> = ({
  username,
  avatarUrl,
  isPro = false,
  activeErrorsCount = 0,
}) => {
  const pathname = usePathname()
  const { t } = useI18n()

  const navItems = [
    {
      label: t('pro.sidebar.nav.overview', 'Overview'),
      href: '/pro',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: t('pro.sidebar.nav.analytics', 'Analytics'),
      href: '/pro/analytics',
      icon: BarChart3,
    },
    {
      label: t('pro.sidebar.nav.profiles', 'Profiles'),
      href: '/pro/profiles',
      icon: Layers,
    },
    {
      label: t('pro.sidebar.nav.health', 'Health'),
      href: '/pro/health',
      icon: ShieldCheck,
      badge: activeErrorsCount > 0 ? activeErrorsCount : undefined,
      badgeVariant: 'rose' as const,
    },
    {
      label: t('pro.sidebar.nav.reports', 'Reports'),
      href: '/pro/reports',
      icon: FileText,
    },
    {
      label: t('pro.sidebar.nav.emails', 'Email Logs'),
      href: '/pro/emails',
      icon: Mail,
    },
  ]

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col justify-between h-screen sticky top-0 bg-[#080808] border-r border-white/[0.07] z-40 select-none">
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between px-2 pt-1">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-sm font-bold tracking-tight text-white font-mono flex items-center gap-1.5">
              <span className="text-[#c5ff4a] font-mono">&gt;</span> GitAscii
            </span>
            <ProBadge variant="lime">{t('pro.common.badge', 'PRO')}</ProBadge>
          </Link>
        </div>

        <nav className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#7a7a7a]">
            {t('pro.sidebar.workspace', 'Workspace')}
          </div>
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  active
                    ? 'bg-white/[0.08] text-white font-medium'
                    : 'text-[#8a8a8a] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${active ? 'text-[#c5ff4a]' : 'text-[#7a7a7a]'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-4 space-y-3">
        <a
          href={`${EXTERNAL_LINKS.DOCS}/pro/overview`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-1.5 p-0 text-xs font-medium text-[#7a7a7a] cursor-pointer group select-none"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#7a7a7a] group-hover:text-[#c5ff4a] transition-colors" />
          <span>{t('pro.sidebar.nav.docs', 'Docs')}</span>
          <ExternalLink className="w-3 h-3 text-[#7a7a7a] opacity-70" />
        </a>

        <div className="p-3.5 rounded-xl bg-gradient-to-b from-[#141414] to-[#0c0c0c] border border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
              <Zap className={`w-3.5 h-3.5 ${isPro ? 'text-[#c5ff4a]' : 'text-[#7a7a7a]'}`} />
              <span>
                {isPro
                  ? t('pro.sidebar.member', 'Pro Member')
                  : username
                    ? t('pro.sidebar.free_plan', 'Free Plan')
                    : t('pro.common.pro_workspace', 'Pro Workspace')}
              </span>
            </div>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                isPro
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                  : username
                    ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                    : 'text-[#8a8a8a] bg-white/5 border-white/10'
              }`}
            >
              {isPro
                ? t('pro.sidebar.active', 'Active')
                : username
                  ? t('pro.sidebar.free', 'Free')
                  : t('pro.sidebar.guest', 'Guest')}
            </span>
          </div>
          <p className="text-[11px] text-[#8a8a8a] leading-relaxed">
            {isPro
              ? t(
                  'pro.sidebar.member_desc',
                  '90-day analytics retention, widget error alerts & multi-profile management enabled.'
                )
              : username
                ? t(
                    'pro.sidebar.free_desc',
                    'Upgrade to Pro to unlock 90-day analytics retention, widget error alerts and multiple profiles.'
                  )
                : t(
                    'pro.sidebar.guest_desc',
                    'Connect your GitHub account to enable telemetry, errors, and multiple profiles.'
                  )}
          </p>
          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isPro
                  ? 'bg-[#c5ff4a] w-full'
                  : username
                    ? 'bg-amber-400 w-1/3'
                    : 'bg-white/20 w-1/4'
              }`}
            />
          </div>
        </div>

        <div className="pt-2 border-t border-white/5">
          {username ? (
            <UserMenuDropdown
              username={username}
              avatarUrl={avatarUrl}
              variant="card"
              direction="up"
            />
          ) : (
            <Link
              href={`/api/auth/login?redirect_to=${encodeURIComponent(pathname || '/pro')}`}
              prefetch={false}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-[#c5ff4a]/10 hover:border-[#c5ff4a]/30 text-xs font-medium text-white hover:text-[#c5ff4a] transition-all cursor-pointer group"
            >
              <Github className="w-3.5 h-3.5 text-[#7a7a7a] group-hover:text-[#c5ff4a] transition-colors" />
              <span>{t('pro.sidebar.connect_github', 'Connect with GitHub')}</span>
            </Link>
          )}
        </div>
      </div>
    </aside>
  )
}
