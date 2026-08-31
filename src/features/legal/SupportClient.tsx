'use client'

import {
  ArrowLeft,
  BookOpen,
  Clock,
  ExternalLink,
  Github,
  Mail,
  MessageSquare,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { EXTERNAL_LINKS, SUPPORT_EMAIL } from '@/constants'
import { Footer } from '@/features/landing/components/Footer'
import Navbar from '@/features/landing/components/Navbar'
import { useI18n } from '@/i18n'

export function SupportClient() {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(SUPPORT_EMAIL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-carbon text-chalk">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-jetbrains-mono text-xs uppercase tracking-wider text-ash hover:text-signal-lime transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('legal.back_home', 'Back to Home')}</span>
          </Link>
        </div>

        <div className="mb-12">
          <span className="font-inter-tight text-eyebrow font-medium uppercase tracking-[0.22em] text-ash mb-4 block">
            {t('support.tag', '[ HELP & CUSTOMER SERVICE ]')}
          </span>
          <h1 className="font-pt-serif font-light text-4xl sm:text-heading-sm leading-tight tracking-heading-sm text-chalk mb-4">
            {t('support.title', 'GitAscii Support Center')}
          </h1>
          <p className="font-inter-tight text-body text-ash max-w-2xl">
            {t(
              'support.subtitle',
              'Need help with GitAscii, billing, Pro features, or experiencing any issues? We are here to help.'
            )}
          </p>
        </div>

        <div className="w-full h-px bg-graphite mb-12 relative">
          <div className="absolute left-0 w-16 h-px bg-signal-lime shadow-[0_0_8px_rgba(197,255,74,0.4)]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="p-6 sm:p-8 bg-onyx/40 border border-graphite/40 flex flex-col justify-between space-y-6 hover:border-signal-lime/40 transition-colors">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-sm bg-signal-lime/10 border border-signal-lime/30 flex items-center justify-center text-signal-lime">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-inter-tight font-semibold text-lg text-chalk mb-1">
                  {t('support.direct_email_title', 'Direct Email Support')}
                </h2>
                <p className="font-inter-tight text-sm text-ash leading-relaxed">
                  {t(
                    'support.direct_email_desc',
                    'Contact our team for billing, license transfers, refund requests, or account inquiries.'
                  )}
                </p>
              </div>
              <div className="p-3.5 bg-void-black/60 border border-graphite/40 font-jetbrains-mono text-sm text-signal-lime flex items-center justify-between">
                <span>{SUPPORT_EMAIL}</span>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="text-xs uppercase text-bone hover:text-signal-lime transition-colors cursor-pointer"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-graphite/20">
              <div className="flex items-center gap-2 text-xs font-jetbrains-mono text-ash">
                <Clock className="w-3.5 h-3.5 text-signal-lime" />
                <span>
                  {t('support.sla', 'Response time: 1–2 business days (Priority for Pro)')}
                </span>
              </div>
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=Support%20Request%20-%20GitAscii`}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-signal-lime text-carbon font-inter-tight font-semibold text-xs uppercase tracking-wider rounded-sm hover:brightness-110 transition-all cursor-pointer"
              >
                <span>{t('support.send_email_cta', 'Compose Email')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="p-6 sm:p-8 bg-onyx/40 border border-graphite/40 flex flex-col justify-between space-y-6 hover:border-signal-lime/40 transition-colors">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-sm bg-signal-lime/10 border border-signal-lime/30 flex items-center justify-center text-signal-lime">
                <Github className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-inter-tight font-semibold text-lg text-chalk mb-1">
                  {t('support.github_issues_title', 'GitHub Issues & Bugs')}
                </h2>
                <p className="font-inter-tight text-sm text-ash leading-relaxed">
                  {t(
                    'support.github_issues_desc',
                    'Found a bug, want to suggest an ASCII widget, or contribute code? Open an issue on our open-source repo.'
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-graphite/20">
              <div className="flex items-center gap-2 text-xs font-jetbrains-mono text-ash">
                <MessageSquare className="w-3.5 h-3.5 text-signal-lime" />
                <span>
                  {t('support.github_open_source', 'Public repository & community discussions')}
                </span>
              </div>
              <a
                href={`${EXTERNAL_LINKS.GITHUB_REPO}/issues`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-void-black text-chalk border border-graphite/60 font-inter-tight font-semibold text-xs uppercase tracking-wider rounded-sm hover:border-signal-lime hover:text-signal-lime transition-all"
              >
                <span>{t('support.open_issue_cta', 'Open GitHub Issue')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        <div className="p-8 bg-onyx/20 border border-graphite/40 space-y-6">
          <h2 className="font-pt-serif text-xl text-chalk font-normal">
            {t('support.quick_help_title', 'Quick Troubleshooting & Common Topics')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <Link
              href="/refund"
              className="p-4 bg-carbon/60 border border-graphite/40 hover:border-signal-lime/40 transition-colors group"
            >
              <ShieldCheck className="w-4 h-4 text-signal-lime mb-2" />
              <h3 className="font-inter-tight font-medium text-sm text-chalk group-hover:text-signal-lime transition-colors">
                {t('support.refund_link_title', 'Refund Policy')}
              </h3>
              <p className="font-inter-tight text-xs text-ash mt-1">
                {t('support.refund_link_desc', '14-day 100% money-back guarantee details.')}
              </p>
            </Link>

            <Link
              href="/terms"
              className="p-4 bg-carbon/60 border border-graphite/40 hover:border-signal-lime/40 transition-colors group"
            >
              <BookOpen className="w-4 h-4 text-signal-lime mb-2" />
              <h3 className="font-inter-tight font-medium text-sm text-chalk group-hover:text-signal-lime transition-colors">
                {t('support.terms_link_title', 'Terms of Use')}
              </h3>
              <p className="font-inter-tight text-xs text-ash mt-1">
                {t('support.terms_link_desc', 'Acceptable use rules & licensing terms.')}
              </p>
            </Link>

            <Link
              href="/privacy"
              className="p-4 bg-carbon/60 border border-graphite/40 hover:border-signal-lime/40 transition-colors group"
            >
              <Zap className="w-4 h-4 text-signal-lime mb-2" />
              <h3 className="font-inter-tight font-medium text-sm text-chalk group-hover:text-signal-lime transition-colors">
                {t('support.privacy_link_title', 'Privacy Policy')}
              </h3>
              <p className="font-inter-tight text-xs text-ash mt-1">
                {t('support.privacy_link_desc', 'Cookieless analytics and zero tracking data.')}
              </p>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
