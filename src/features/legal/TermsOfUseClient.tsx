'use client'

import Link from 'next/link'

import {
  APP_DOMAIN,
  APP_URL,
  EXTERNAL_LINKS,
  LEGAL_LAST_UPDATED,
  SUPPORT_EMAIL,
  TERMS_ACCEPTABLE_USE_RULES,
} from '@/constants'
import { Footer } from '@/features/landing/components/Footer'
import Navbar from '@/features/landing/components/Navbar'
import { useI18n } from '@/i18n'

export function TermsOfUseClient() {
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
            {t('legal.terms_title', 'Terms of Use')}
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
              Please read these Terms of Use (&ldquo;Terms&rdquo;) carefully before using the{' '}
              <a href={APP_URL} className="text-signal-lime hover:brightness-110 transition-colors">
                {APP_DOMAIN}
              </a>{' '}
              website and the GitAscii generator tool (collectively, the &ldquo;Service&rdquo;),
              operated by <strong className="text-chalk">GitAscii Team</strong> (&ldquo;we,&rdquo;
              &ldquo;us,&rdquo; or &ldquo;our&rdquo;).
            </p>
            <p className="mt-4">
              By accessing or using the Service, you agree to be bound by these Terms. If you
              disagree with any part of the terms, you may not use the Service.
            </p>
          </section>

          <section>
            <h2 className="font-pt-serif font-light text-subheading text-chalk mb-4">
              1. Description of Service
            </h2>
            <p>
              GitAscii is a free, open-source web application designed to help developers create
              custom GitHub Profile READMEs. The Service includes:
            </p>
            <ul className="list-none mt-4 space-y-3">
              {[
                'A visual drag-and-drop editor for README layouts',
                'Live SVG-based GitHub stats widgets (fetched from public GitHub APIs)',
                'An ASCII art engine that converts images to character-based art',
                'One-click README commit functionality via GitHub OAuth',
                'Community and external widget integrations',
              ].map((feature, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="text-signal-lime font-jetbrains-mono mt-0.5 shrink-0">→</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-pt-serif font-light text-subheading text-chalk mb-4">
              2. Acceptable Use
            </h2>
            <p>You agree not to use the Service to:</p>
            <ul className="list-none mt-4 space-y-3">
              {TERMS_ACCEPTABLE_USE_RULES.map((rule, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="text-signal-lime font-jetbrains-mono mt-0.5 shrink-0">✕</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-pt-serif font-light text-subheading text-chalk mb-4">
              3. Open Source License
            </h2>
            <p>
              GitAscii is released under the{' '}
              <a
                href={`${EXTERNAL_LINKS.GITHUB_REPO}/blob/main/LICENSE`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-signal-lime hover:brightness-110 transition-colors"
              >
                MIT License
              </a>
              . You are free to use, copy, modify, merge, publish, distribute, sublicense, and/or
              sell copies of the software, subject to the conditions of the MIT License.
            </p>
            <p className="mt-4">
              SVG widgets and README templates generated using GitAscii are yours to use freely in
              your personal and commercial projects without any attribution requirement, though a
              link back is always appreciated!
            </p>
          </section>

          <section>
            <h2 className="font-pt-serif font-light text-subheading text-chalk mb-4">
              4. GitAscii Pro &amp; Payments
            </h2>
            <p>
              GitAscii offers an optional paid upgrade (&ldquo;GitAscii Pro&rdquo;). GitAscii Pro is
              sold as a lifetime digital license for an individual GitHub account.
            </p>
            <ul className="list-none mt-4 space-y-2">
              <li className="flex gap-3 items-start">
                <span className="text-signal-lime font-jetbrains-mono mt-0.5 shrink-0">→</span>
                <span>
                  <strong className="text-chalk">Billing:</strong> Payments are processed securely
                  by Stripe. Prices are clearly displayed before purchase in BRL or USD depending on
                  your region.
                </span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-signal-lime font-jetbrains-mono mt-0.5 shrink-0">→</span>
                <span>
                  <strong className="text-chalk">Refunds &amp; 14-Day Guarantee:</strong> All
                  purchases are backed by our 14-day 100% money-back guarantee. Please review our
                  full{' '}
                  <Link href="/refund" className="text-signal-lime hover:underline">
                    Refund &amp; Return Policy
                  </Link>
                  .
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-pt-serif font-light text-subheading text-chalk mb-4">
              5. Disclaimer of Warranties
            </h2>
            <p className="uppercase text-note font-jetbrains-mono text-ash leading-relaxed">
              THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE,&rdquo; WITHOUT
              WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>
          </section>

          <section>
            <h2 className="font-pt-serif font-light text-subheading text-chalk mb-4">
              6. Third-Party Services &amp; APIs
            </h2>
            <p>
              The Service depends on third-party APIs, primarily GitHub&rsquo;s public REST and
              GraphQL APIs, and Stripe for payments. We are not responsible for:
            </p>
            <ul className="list-none mt-4 space-y-2">
              <li className="flex gap-3 items-start">
                <span className="text-signal-lime font-jetbrains-mono mt-0.5 shrink-0">→</span>
                <span>GitHub API rate limits, outages, or changes to their service.</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-signal-lime font-jetbrains-mono mt-0.5 shrink-0">→</span>
                <span>
                  External image proxy caching behaviors (e.g., GitHub&rsquo;s Camo proxy).
                </span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-signal-lime font-jetbrains-mono mt-0.5 shrink-0">→</span>
                <span>Inaccuracies in data returned by third-party APIs.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-pt-serif font-light text-subheading text-chalk mb-4">
              7. Limitation of Liability
            </h2>
            <p>
              To the fullest extent permitted by applicable law, in no event shall GitAscii, its
              maintainers, or contributors be liable for any indirect, incidental, special,
              consequential, or punitive damages, including loss of profits, data, or goodwill,
              arising out of or in connection with your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="font-pt-serif font-light text-subheading text-chalk mb-4">
              8. Governing Law
            </h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws applicable to
              the jurisdiction where the primary maintainer resides, without regard to its conflict
              of law provisions.
            </p>
          </section>

          <section>
            <h2 className="font-pt-serif font-light text-subheading text-chalk mb-4">
              9. Contact &amp; Support
            </h2>
            <p>
              If you have questions about these Terms, need billing assistance, or wish to report an
              issue, please visit our{' '}
              <Link href="/support" className="text-signal-lime hover:underline">
                Support Center
              </Link>{' '}
              or email{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-signal-lime hover:underline">
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
