'use client'

import { Check, Copy, ShieldCheck } from 'lucide-react'
import React, { useState } from 'react'

import { useI18n } from '@/i18n'

import { ProBadge } from '../ProBadge'

interface HealthBadgeSectionProps {
  username: string
}

export const HealthBadgeSection: React.FC<HealthBadgeSectionProps> = ({ username }) => {
  const { t } = useI18n()
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const effectiveUsername = username || 'user'
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://gitascii.com'

  const badgeImgUrl = `${origin}/api/${encodeURIComponent(effectiveUsername)}/health-badge`
  const markdownSnippet = `[![${t('pro.health.badge_alt', 'GitAscii Health')}](${badgeImgUrl})](${origin}/${encodeURIComponent(effectiveUsername)})`

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2500)
  }

  return (
    <section id="badge" className="w-full space-y-4 scroll-mt-6">
      <section className="rounded border border-white/[0.06] bg-[#0c0c0c] p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#c5ff4a]" />
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white">
                {t('pro.health.badge_title', 'Real-Time Health Status Badge')}
              </h3>
            </div>
          </div>
        </div>

        <div className="w-full space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono text-[#7a7a7a] tracking-wider">
              {t('pro.health.live_badge_preview', 'Live Uptime & Health Badge')}
            </span>
            <ProBadge variant="lime" size="sm">
              SVG Dynamic (100% Vector)
            </ProBadge>
          </div>

          <div className="w-full flex items-center justify-center p-6 rounded bg-white/[0.02] border border-white/5">
            <img
              src={`/api/${encodeURIComponent(effectiveUsername)}/health-badge?t=${Date.now()}`}
              alt={t('pro.health.badge_alt', 'GitAscii Health Badge')}
              className="h-8 w-auto select-none"
            />
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8a8a8a] text-[11px] font-mono">
                {t('pro.health.badge_markdown', 'Badge Markdown')}
              </span>
              <button
                onClick={() => handleCopy('badge_md', markdownSnippet)}
                className="inline-flex items-center gap-1 text-[11px] font-mono text-[#c5ff4a] hover:underline cursor-pointer"
              >
                {copiedKey === 'badge_md' ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>
                  {copiedKey === 'badge_md'
                    ? t('pro.common.copied', 'Copied!')
                    : t('pro.health.copy_badge', 'Copy Badge')}
                </span>
              </button>
            </div>
            <div className="w-full p-3 rounded bg-black/50 border border-white/10 font-mono text-[11px] text-[#ccc] select-all break-all">
              {markdownSnippet}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8a8a8a] text-[11px] font-mono">
                {t('pro.health.direct_svg_url', 'Direct SVG URL')}
              </span>
              <button
                onClick={() => handleCopy('badge_url', badgeImgUrl)}
                className="inline-flex items-center gap-1 text-[11px] font-mono text-[#c5ff4a] hover:underline cursor-pointer"
              >
                {copiedKey === 'badge_url' ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>
                  {copiedKey === 'badge_url'
                    ? t('pro.common.copied', 'Copied!')
                    : t('pro.common.copy_url', 'Copy URL')}
                </span>
              </button>
            </div>
            <div className="w-full p-3 rounded bg-black/50 border border-white/10 font-mono text-[11px] text-[#ccc] select-all break-all">
              {badgeImgUrl}
            </div>
          </div>
        </div>
      </section>
    </section>
  )
}
