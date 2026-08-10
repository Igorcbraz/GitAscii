'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { useI18n } from '@/i18n'
import { PrivacySettingsButton } from '@/lib/consent/ConsentBanner'

export function Footer() {
  const { t } = useI18n()

  return (
    <footer className="relative w-full bg-void-black border-t border-graphite">
      <div className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <pre className="font-jetbrains-mono text-caption sm:text-body leading-tight text-graphite/30 whitespace-pre">
            {`
     ██████╗ ██╗████████╗ █████╗ ███████╗ ██████╗██╗██╗
    ██╔════╝ ██║╚══██╔══╝██╔══██╗██╔════╝██╔════╝██║██║
    ██║  ███╗██║   ██║   ███████║███████╗██║     ██║██║
    ██║   ██║██║   ██║   ██╔══██║╚════██║██║     ██║██║
    ╚██████╔╝██║   ██║   ██║  ██║███████║╚██████╗██║██║
     ╚═════╝ ╚═╝   ╚═╝   ╚═╝  ╚═╝╚══════╝ ╚═════╝╚═╝╚═╝
`}
          </pre>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center gap-8">
          <span className="font-inter-tight text-eyebrow font-medium uppercase tracking-[0.22em] text-ash">
            {t('landing.footer.eyebrow', '[ GET STARTED TODAY ]')}
          </span>
          <h2 className="font-pt-serif font-light text-4xl sm:text-heading leading-[0.95] tracking-[-0.02em] text-chalk">
            {t('landing.footer.title_normal', 'Ready to Transform Your ')}
            <span className="italic text-signal-lime">
              {t('landing.footer.title_italic', 'Profile?')}
            </span>
          </h2>
          <p className="font-inter-tight text-body text-bone leading-body max-w-md">
            {t(
              'landing.footer.subtitle',
              'Join developers who already elevated their GitHub presence with stunning ASCII art and premium SVGs.'
            )}
          </p>
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' })
              setTimeout(() => {
                document.getElementById('hero-username-input')?.focus()
              }, 600)
            }}
            className="bg-signal-lime text-black font-inter-tight font-medium text-body py-4 px-8 rounded-sm transition-all duration-300 shadow-[0_0_8px_rgba(197,255,74,0.45)] hover:shadow-[0_0_20px_rgba(197,255,74,0.65)] hover:brightness-110 flex items-center gap-2 cursor-pointer uppercase tracking-wide"
          >
            {t('landing.footer.start_building', 'Start Building')} <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div className="w-full h-px bg-graphite relative">
        <div className="absolute left-1/2 -translate-x-1/2 w-32 h-px bg-signal-lime shadow-[0_0_10px_rgba(197,255,74,0.5)]"></div>
      </div>

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
                  ● OPEN SOURCE
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
                    href="https://github.com/Igorcbraz/GitAscii"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-signal-lime"
                  >
                    {t('landing.footer.item.github_repo', 'GitHub Repository')}
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/Igorcbraz/GitAscii/fork"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-signal-lime"
                  >
                    {t('landing.footer.item.fork_contribute', 'Fork & Contribute')}
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/Igorcbraz/GitAscii/issues"
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
                [ LEGAL ]
              </span>
              <ul className="flex flex-col gap-4 font-inter-tight text-body text-pearl">
                <li>
                  <Link href="/privacy" className="transition-colors hover:text-signal-lime">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="transition-colors hover:text-signal-lime">
                    Terms of Use
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
              <span className="font-jetbrains-mono text-caption text-graphite">{'// '}</span>©{' '}
              {new Date().getFullYear()} {t('landing.footer.copyright', 'GitAscii. MIT License.')}
            </p>
            <p className="font-jetbrains-mono text-caption text-fog uppercase tracking-[0.18em]">
              {t('landing.footer.version', 'v1.0.0 · BUILD 2026.07')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
