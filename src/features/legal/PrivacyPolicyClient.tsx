'use client'

import Link from 'next/link'
import React from 'react'

import {
  APP_DOMAIN,
  APP_URL,
  COOKIE_INVENTORY,
  EXTERNAL_LINKS,
  LEGAL_LAST_UPDATED,
  PRIVACY_DATA_PRACTICES,
} from '@/constants'
import { Footer } from '@/features/landing/components/Footer'
import Navbar from '@/features/landing/components/Navbar'
import { useI18n } from '@/i18n'

export function PrivacyPolicyClient() {
  const { t, language } = useI18n()

  const localeCode =
    language === 'pt'
      ? 'pt-BR'
      : language === 'es'
        ? 'es-ES'
        : language === 'zh'
          ? 'zh-CN'
          : 'en-US'
  const formattedDate = new Date(LEGAL_LAST_UPDATED).toLocaleDateString(localeCode, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-carbon">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="mb-12">
          <span className="font-inter-tight text-eyebrow font-medium uppercase tracking-[0.22em] text-ash mb-4 block">
            {t('legal.tag', '[ LEGAL ]')}
          </span>
          <h1 className="font-pt-serif font-light text-4xl sm:text-heading-sm leading-tight tracking-heading-sm text-chalk mb-4">
            {t('legal.privacy_title', 'Privacy Policy')}
          </h1>
          <p className="font-inter-tight text-body text-ash">
            {t('legal.last_updated', `Last updated: ${formattedDate}`, { date: formattedDate })}
          </p>
        </div>

        <div className="w-full h-px bg-graphite mb-12 relative">
          <div className="absolute left-0 w-16 h-px bg-signal-lime shadow-[0_0_8px_rgba(197,255,74,0.4)]" />
        </div>

        <div className="prose-policy space-y-10 font-inter-tight text-body text-bone leading-body">
          <section>
            <p>
              This Privacy Policy explains how GitAscii (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
              &ldquo;our&rdquo;) collects, uses, and shares information when you visit{' '}
              <a href={APP_URL} className="text-signal-lime hover:brightness-110 transition-colors">
                {APP_DOMAIN}
              </a>{' '}
              (the &ldquo;Service&rdquo;). GitAscii is a free, open-source tool for creating GitHub
              Profile READMEs and is operated by{' '}
              <strong className="text-chalk">GitAscii Team</strong>.
            </p>
            <p className="mt-4 text-ash text-note">
              This policy is written to be transparent about our data practices. It is not legal
              advice. If you need confirmation of compliance with specific regulations (LGPD, GDPR,
              CCPA, etc.), please consult a qualified lawyer.
            </p>
          </section>

          <section>
            <h2 className="font-pt-serif font-light text-subheading text-chalk mb-4">
              1. Information We Collect
            </h2>
            <p>We do not collect personal data in the traditional sense. Specifically:</p>
            <ul className="list-none mt-4 space-y-3">
              {PRIVACY_DATA_PRACTICES.map((item, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="text-signal-lime font-jetbrains-mono mt-0.5 shrink-0">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-pt-serif font-light text-subheading text-chalk mb-4">
              2. Analytics &amp; Tracking Technologies
            </h2>
            <p>
              We use analytics tools{' '}
              <strong className="text-chalk">only with your explicit consent</strong>. A
              cookie/consent banner is shown on your first visit. You can accept or decline
              analytics at any time via{' '}
              <Link
                href="#privacy-settings"
                className="text-signal-lime hover:brightness-110 transition-colors"
              >
                Privacy Settings
              </Link>{' '}
              in the footer.
            </p>

            <h3 className="font-pt-serif font-light text-body text-chalk mt-6 mb-3">
              Cookie Inventory
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-note text-left border border-graphite">
                <thead>
                  <tr className="border-b border-graphite bg-onyx text-ash font-medium">
                    <th className="p-3">Cookie / Storage Key</th>
                    <th className="p-3">Provider</th>
                    <th className="p-3">Purpose</th>
                    <th className="p-3">Consent Required?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-graphite">
                  {COOKIE_INVENTORY.map((c, i) => (
                    <tr key={i} className="hover:bg-onyx/50 transition-colors">
                      <td className="p-3 font-jetbrains-mono text-signal-lime">{c.name}</td>
                      <td className="p-3">{c.provider}</td>
                      <td className="p-3">{c.purpose}</td>
                      <td className="p-3">{c.consentRequired}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-pt-serif font-light text-subheading text-chalk mb-4">
              3. Third-Party Services
            </h2>
            <ul className="list-none space-y-4">
              <li className="flex gap-3 items-start">
                <span className="text-signal-lime font-jetbrains-mono mt-0.5 shrink-0">→</span>
                <div>
                  <strong className="text-chalk">GitHub API &amp; OAuth:</strong> Used for fetching
                  public profile data and optional README commits. Subject to{' '}
                  <a
                    href={EXTERNAL_LINKS.GITHUB_PRIVACY}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-signal-lime hover:brightness-110 transition-colors"
                  >
                    GitHub&rsquo;s Privacy Statement ↗
                  </a>
                  .
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-signal-lime font-jetbrains-mono mt-0.5 shrink-0">→</span>
                <div>
                  <strong className="text-chalk">Google Analytics 4:</strong> Collects anonymized
                  usage events (pageviews, clicks). Loaded only after consent. IP addresses are
                  anonymized.
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-signal-lime font-jetbrains-mono mt-0.5 shrink-0">→</span>
                <div>
                  <strong className="text-chalk">Microsoft Clarity:</strong> Provides session
                  replays and heatmaps to improve UX. Loaded only after consent. Sensitive inputs
                  are masked by default.
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-signal-lime font-jetbrains-mono mt-0.5 shrink-0">→</span>
                <div>
                  <strong className="text-chalk">Sentry:</strong> Captures unhandled application
                  errors to fix bugs. Does not track users across sites.
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-signal-lime font-jetbrains-mono mt-0.5 shrink-0">→</span>
                <div>
                  <strong className="text-chalk">Stripe (Payments &amp; Billing):</strong> Processes
                  payments for GitAscii Pro. All payment information (credit card numbers, billing
                  details) is handled directly by Stripe in compliance with PCI-DSS standards. We
                  never store or process sensitive credit card data on our servers. Subject to{' '}
                  <a
                    href="https://stripe.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-signal-lime hover:brightness-110 transition-colors"
                  >
                    Stripe&rsquo;s Privacy Policy ↗
                  </a>
                  .
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-signal-lime font-jetbrains-mono mt-0.5 shrink-0">→</span>
                <div>
                  <strong className="text-chalk">Resend (Transactional Emails):</strong> Used to
                  deliver payment receipts, Pro activation confirmations, and optional widget error
                  alerts. Subject to{' '}
                  <a
                    href="https://resend.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-signal-lime hover:brightness-110 transition-colors"
                  >
                    Resend&rsquo;s Privacy Policy ↗
                  </a>
                  .
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-signal-lime font-jetbrains-mono mt-0.5 shrink-0">→</span>
                <div>
                  <strong className="text-chalk">Vercel &amp; Upstash Redis:</strong> Hosts the
                  application, Edge functions, and caches visitor metrics and Pro settings.
                </div>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-pt-serif font-light text-subheading text-chalk mb-4">
              4. Your Rights (LGPD, GDPR, CCPA)
            </h2>
            <p>
              Under applicable data protection laws, you have rights regarding your personal data:
            </p>
            <ul className="list-none mt-4 space-y-2">
              <li className="flex gap-3 items-start">
                <span className="text-signal-lime font-jetbrains-mono mt-0.5 shrink-0">→</span>
                <span>
                  <strong className="text-chalk">Right to revoke consent:</strong> You can withdraw
                  analytics consent at any time via the Privacy Settings button in the footer.
                </span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-signal-lime font-jetbrains-mono mt-0.5 shrink-0">→</span>
                <span>
                  <strong className="text-chalk">Right to access/erasure:</strong> Since we do not
                  store personal data, there are no profiles to delete. To remove local storage,
                  simply clear your browser cookies for this site.
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-pt-serif font-light text-subheading text-chalk mb-4">
              5. Open Source Transparency
            </h2>
            <p>
              GitAscii is open-source software under the MIT License. You can inspect the entire
              source code, including analytics tracking and consent logic, on GitHub at{' '}
              <a
                href={EXTERNAL_LINKS.GITHUB_REPO}
                target="_blank"
                rel="noopener noreferrer"
                className="text-signal-lime hover:brightness-110 transition-colors"
              >
                {EXTERNAL_LINKS.GITHUB_REPO} ↗
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-pt-serif font-light text-subheading text-chalk mb-4">
              6. Changes to this Policy
            </h2>
            <p>
              We may update this Privacy Policy periodically. Changes will be posted on this page
              with an updated &ldquo;Last updated&rdquo; date. Significant changes will also be
              noted in our GitHub release notes.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
