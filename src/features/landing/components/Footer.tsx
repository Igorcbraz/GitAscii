'use client'

import Link from 'next/link'
import React from 'react'

import { APP_VERSION, EXTERNAL_LINKS } from '@/constants'
import { useI18n } from '@/i18n'
import { PrivacySettingsButton } from '@/lib/consent/ConsentBanner'

export function Footer() {
  const { t } = useI18n()

  return (
    <footer className="relative w-full bg-void-black border-t border-graphite">
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
            <div className="md:col-span-4 flex flex-col items-start">
              <div className="text-subheading mb-3 flex items-center">
                <span className="font-inter-tight font-medium text-chalk">Git</span>
                <span className="font-pt-serif font-light italic text-signal-lime">Ascii</span>
              </div>
              <p className="font-inter-tight text-note text-ash mb-5 max-w-xs leading-relaxed">
                {t(
                  'landing.footer.description',
                  'Transform your GitHub contributions into stunning ASCII art. Premium SVGs and a visual editor for developers.'
                )}
              </p>
              <div className="inline-flex items-center justify-center px-3 py-1 rounded-full border border-signal-lime bg-transparent">
                <span className="font-inter-tight text-signal-lime text-eyebrow uppercase tracking-[0.22em]">
                  ● {t('common.open_source', 'OPEN SOURCE')}
                </span>
              </div>
            </div>

            <div className="md:col-span-2 flex flex-col">
              <span className="font-inter-tight text-eyebrow uppercase tracking-[0.22em] text-ash mb-6">
                {t('landing.footer.product', '[ PRODUCT ]')}
              </span>
              <ul className="flex flex-col gap-4 font-inter-tight text-body text-pearl">
                <li>
                  <Link href="/templates" className="transition-colors hover:text-signal-lime">
                    {t('landing.footer.item.templates_catalog', 'Templates Catalog')}
                  </Link>
                </li>
                <li>
                  <Link href="/widgets" className="transition-colors hover:text-signal-lime">
                    {t('landing.footer.item.dynamic_widgets', 'Dynamic Widgets')}
                  </Link>
                </li>
                <li>
                  <Link href="/explore" className="transition-colors hover:text-signal-lime">
                    {t('landing.footer.item.explore_profiles', 'Explore Profiles')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#hero-username-input"
                    className="transition-colors hover:text-signal-lime"
                  >
                    {t('landing.footer.item.visual_editor', 'Visual Editor')}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="md:col-span-2 flex flex-col">
              <span className="font-inter-tight text-eyebrow uppercase tracking-[0.22em] text-ash mb-6">
                {t('landing.footer.resources', '[ RESOURCES ]')}
              </span>
              <ul className="flex flex-col gap-4 font-inter-tight text-body text-pearl">
                <li>
                  <a
                    href={EXTERNAL_LINKS.DOCS}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-signal-lime"
                  >
                    {t('landing.footer.item.documentation', 'Documentation')}
                  </a>
                </li>
                <li>
                  <Link href="/guides" className="transition-colors hover:text-signal-lime">
                    {t('landing.footer.item.guides', 'Guides & Tutorials')}
                  </Link>
                </li>
                <li>
                  <Link href="/llms.txt" className="transition-colors hover:text-signal-lime">
                    {t('landing.footer.item.ai_docs', 'llms.txt (AI Docs)')}
                  </Link>
                </li>
                <li>
                  <Link href="/sitemap.xml" className="transition-colors hover:text-signal-lime">
                    {t('landing.footer.item.sitemap', 'Sitemap XML')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/manifest.webmanifest"
                    className="transition-colors hover:text-signal-lime"
                  >
                    {t('landing.footer.item.app_manifest', 'App Manifest')}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="md:col-span-2 flex flex-col">
              <span className="font-inter-tight text-eyebrow uppercase tracking-[0.22em] text-ash mb-6">
                {t('landing.footer.community', '[ COMMUNITY ]')}
              </span>
              <ul className="flex flex-col gap-4 font-inter-tight text-body text-pearl">
                <li>
                  <a
                    href={EXTERNAL_LINKS.GITHUB_REPO}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-signal-lime"
                  >
                    {t('landing.footer.item.github_repo', 'GitHub Repository')}
                  </a>
                </li>
                <li>
                  <a
                    href={EXTERNAL_LINKS.GITHUB_FORK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-signal-lime"
                  >
                    {t('landing.footer.item.fork_contribute', 'Fork & Contribute')}
                  </a>
                </li>
                <li>
                  <a
                    href={EXTERNAL_LINKS.GITHUB_ISSUES}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-signal-lime"
                  >
                    {t('landing.footer.item.issues_requests', 'Issues & Feature Requests')}
                  </a>
                </li>
              </ul>
            </div>

            <div className="md:col-span-2 flex flex-col">
              <span className="font-inter-tight text-eyebrow uppercase tracking-[0.22em] text-ash mb-6">
                {t('landing.footer.legal', '[ LEGAL ]')}
              </span>
              <ul className="flex flex-col gap-4 font-inter-tight text-body text-pearl">
                <li>
                  <Link href="/privacy" className="transition-colors hover:text-signal-lime">
                    {t('landing.footer.item.privacy_policy', 'Privacy Policy')}
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="transition-colors hover:text-signal-lime">
                    {t('landing.footer.item.terms_of_use', 'Terms of Use')}
                  </Link>
                </li>
                <li>
                  <PrivacySettingsButton />
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-graphite flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="font-inter-tight text-note text-ash flex items-center gap-2">
              <span className="font-jetbrains-mono text-caption text-ash">{'// '}</span>©{' '}
              {new Date().getFullYear()} {t('landing.footer.copyright', 'GitAscii. MIT License.')}
            </p>
            <p className="font-jetbrains-mono text-caption text-ash uppercase tracking-[0.18em]">
              {`v${APP_VERSION} · BUILD 2026.08`}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
