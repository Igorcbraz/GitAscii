import type { Metadata } from 'next'
import Link from 'next/link'

import { APP_DOMAIN, APP_URL } from '@/constants'
import { Footer } from '@/features/landing/components/Footer'
import Navbar from '@/features/landing/components/Navbar'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Learn how GitAscii collects, uses, and protects information when you use our GitHub Profile README generator.',
  robots: { index: true, follow: true },
  alternates: { canonical: `${APP_URL}/privacy` },
}

const LAST_UPDATED = '2026-08-09'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-carbon">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="mb-12">
          <span className="font-inter-tight text-eyebrow font-medium uppercase tracking-[0.22em] text-ash mb-4 block">
            [ LEGAL ]
          </span>
          <h1 className="font-pt-serif font-light text-4xl sm:text-heading-sm leading-tight tracking-heading-sm text-chalk mb-4">
            Privacy Policy
          </h1>
          <p className="font-inter-tight text-body text-ash">
            Last updated:{' '}
            <time dateTime={LAST_UPDATED}>
              {new Date(LAST_UPDATED).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
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
              <strong className="text-chalk">
                [PLACEHOLDER: Legal name of the project owner / organization]
              </strong>
              .
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
              {[
                'We do not have user accounts — no email, password, or profile database.',
                'GitHub login is used only to authorise README commits on your behalf. We do not store your GitHub credentials.',
                'The GitHub username you type in the generator is sent to the GitHub public API to fetch public profile data (avatar, stats, etc.). We do not log or store it.',
                'We do not sell, rent, or trade any personal data.',
              ].map((item, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="text-signal-lime font-jetbrains-mono mt-0.5 shrink-0">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-pt-serif font-light text-subheading text-chalk mb-4">
              2. Analytics & Tracking Technologies
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
              in the page footer.
            </p>

            <h3 className="font-inter-tight font-semibold text-chalk mt-6 mb-2">
              2.1 Google Analytics (GA4)
            </h3>
            <p>
              If you consent, we load Google Analytics 4, operated by Google LLC (USA). GA4 uses
              first-party cookies and browser storage to collect:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-ash">
              <li>Pages visited and navigation paths</li>
              <li>Session duration and engagement events</li>
              <li>General device and browser type</li>
              <li>Approximate country / region (IP is anonymised by default in GA4)</li>
              <li>Custom events: e.g., template selected, README generated, widget added</li>
            </ul>
            <p className="mt-3">
              We implement <strong className="text-chalk">Google Consent Mode v2</strong>. If you
              decline, the GA4 script is loaded (to preserve Consent Mode functionality) but all
              storage and tracking signals are set to{' '}
              <code className="font-jetbrains-mono text-signal-lime text-note">denied</code> —
              Google does not write cookies or send identifiable data.
            </p>
            <p className="mt-3 text-ash text-note">
              Google&rsquo;s Privacy Policy:{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-signal-lime hover:brightness-110"
              >
                policies.google.com/privacy
              </a>
            </p>

            <h3 className="font-inter-tight font-semibold text-chalk mt-6 mb-2">
              2.2 Microsoft Clarity
            </h3>
            <p>
              If you consent, we load Microsoft Clarity, a session analytics tool operated by
              Microsoft Corporation (USA). Clarity may capture:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-ash">
              <li>Mouse movement, clicks, and scrolling patterns (heatmaps)</li>
              <li>Session replays (anonymised — Clarity automatically masks input fields)</li>
              <li>Performance and error signals</li>
            </ul>
            <p className="mt-3">
              If you decline, the Clarity script is{' '}
              <strong className="text-chalk">not loaded at all</strong>.
            </p>
            <p className="mt-3 text-ash text-note">
              Microsoft Privacy Statement:{' '}
              <a
                href="https://privacy.microsoft.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-signal-lime hover:brightness-110"
              >
                privacy.microsoft.com
              </a>
            </p>

            <h3 className="font-inter-tight font-semibold text-chalk mt-6 mb-2">
              2.3 Sentry (Error Monitoring)
            </h3>
            <p>
              We use Sentry, operated by Functional Software Inc. (USA), for{' '}
              <strong className="text-chalk">technical error monitoring only</strong>. Sentry is not
              an analytics tool and is not controlled by the analytics consent banner. It collects:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-ash">
              <li>JavaScript errors and stack traces</li>
              <li>Browser and OS version</li>
              <li>The page URL where the error occurred</li>
              <li>A randomly generated session identifier (no personal identity)</li>
            </ul>
            <p className="mt-3">
              This data is strictly used to detect and fix bugs that affect all users. Sentry
              operates regardless of analytics consent because it is a fundamental reliability
              mechanism, not a marketing or tracking tool.
            </p>
            <p className="mt-3 text-ash text-note">
              Sentry Privacy Policy:{' '}
              <a
                href="https://sentry.io/privacy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-signal-lime hover:brightness-110"
              >
                sentry.io/privacy
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-pt-serif font-light text-subheading text-chalk mb-4">
              3. Cookies & Local Storage
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-note border-collapse">
                <thead>
                  <tr className="border-b border-graphite">
                    <th className="text-left py-2 pr-4 text-ash font-medium">Name / Key</th>
                    <th className="text-left py-2 pr-4 text-ash font-medium">Provider</th>
                    <th className="text-left py-2 pr-4 text-ash font-medium">Purpose</th>
                    <th className="text-left py-2 text-ash font-medium">Consent required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-graphite/50">
                  {[
                    [
                      'gitascii_analytics_consent',
                      'GitAscii',
                      'Stores your accept/decline choice',
                      'No (essential)',
                    ],
                    [
                      'gitascii_visited',
                      'GitAscii',
                      'First-visit flag for session tracking',
                      'Yes (analytics)',
                    ],
                    [
                      '_ga, _ga_*',
                      'Google Analytics',
                      'User/session identification',
                      'Yes (analytics)',
                    ],
                    [
                      '_clck, _clsk, MUID',
                      'Microsoft Clarity',
                      'Session replay identification',
                      'Yes (analytics)',
                    ],
                    ['sentry-*', 'Sentry', 'Error-session correlation', 'No (technical)'],
                  ].map(([name, provider, purpose, req], i) => (
                    <tr key={i}>
                      <td className="py-2 pr-4 font-jetbrains-mono text-signal-lime">{name}</td>
                      <td className="py-2 pr-4 text-bone">{provider}</td>
                      <td className="py-2 pr-4 text-ash">{purpose}</td>
                      <td className="py-2 text-ash">{req}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-pt-serif font-light text-subheading text-chalk mb-4">
              4. Purpose of Data Collection
            </h2>
            <p>We use analytics data exclusively to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-ash">
              <li>Understand which features are most used and improve the product</li>
              <li>Identify performance bottlenecks and UI friction points</li>
              <li>Measure the impact of new features and design changes</li>
              <li>Fix bugs faster through error context (Sentry)</li>
            </ul>
            <p className="mt-3">
              We do not use data for advertising, profiling, or selling to third parties.
            </p>
          </section>

          <section>
            <h2 className="font-pt-serif font-light text-subheading text-chalk mb-4">
              5. Sharing with Third Parties
            </h2>
            <p>
              We share data only with the analytics providers listed above (Google, Microsoft,
              Sentry), and only in the context of the services they provide. We do not disclose data
              to any other third party unless required by law.
            </p>
            <p className="mt-3">
              Our hosting provider is{' '}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-signal-lime hover:brightness-110"
              >
                Vercel
              </a>
              . Vercel may process server-side request logs (IP address, user agent) for
              infrastructure purposes under their own privacy policy.
            </p>
          </section>

          <section>
            <h2 className="font-pt-serif font-light text-subheading text-chalk mb-4">
              6. Your Rights
            </h2>
            <p>
              Depending on your jurisdiction (e.g., LGPD in Brazil, GDPR in the EU), you may have
              rights to access, correct, delete, or object to the processing of your personal data.
            </p>
            <p className="mt-3">
              Because GitAscii does not create user accounts or store personally identifiable
              information, most data subject rights do not apply to us directly — they should be
              exercised with the providers listed above (Google, Microsoft, Sentry) through their
              respective privacy portals.
            </p>
            <p className="mt-3">
              If you have questions or requests, contact us at:{' '}
              <strong className="text-chalk">[PLACEHOLDER: contact@example.com]</strong>
            </p>
          </section>

          <section>
            <h2 className="font-pt-serif font-light text-subheading text-chalk mb-4">
              7. Withdrawing Consent
            </h2>
            <p>You can change your analytics consent at any time:</p>
            <ol className="list-decimal list-inside mt-3 space-y-2 text-ash">
              <li>
                Scroll to the bottom of any page and click{' '}
                <strong className="text-chalk">Privacy Settings</strong>.
              </li>
              <li>Click &ldquo;Decline&rdquo; in the banner that appears.</li>
              <li>
                Alternatively, clear your browser&rsquo;s cookies and local storage for{' '}
                <code className="font-jetbrains-mono text-signal-lime text-note">{APP_DOMAIN}</code>
                .
              </li>
            </ol>
            <p className="mt-3">
              Withdrawing consent stops all future analytics collection. It does not retroactively
              delete data already collected under a previous granted consent — contact the
              respective providers to request deletion.
            </p>
          </section>

          <section>
            <h2 className="font-pt-serif font-light text-subheading text-chalk mb-4">
              8. Data Retention
            </h2>
            <p>
              GitAscii does not directly control the retention period for data stored by Google,
              Microsoft, or Sentry. Their default retention periods apply. Please refer to each
              provider&rsquo;s documentation to understand and manage retention settings.
            </p>
          </section>

          <section>
            <h2 className="font-pt-serif font-light text-subheading text-chalk mb-4">
              9. Children&rsquo;s Privacy
            </h2>
            <p>
              GitAscii is not directed at children under the age of 13 (or 16 in the EU). We do not
              knowingly collect data from minors.
            </p>
          </section>

          <section>
            <h2 className="font-pt-serif font-light text-subheading text-chalk mb-4">
              10. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. Material changes will be
              reflected in the &ldquo;Last updated&rdquo; date at the top of this page. Continued
              use of the Service after changes constitutes acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="font-pt-serif font-light text-subheading text-chalk mb-4">
              11. Contact
            </h2>
            <p>For privacy-related questions, contact us at:</p>
            <address className="mt-3 not-italic text-ash space-y-1">
              <p>
                <strong className="text-chalk">[PLACEHOLDER: Legal entity name]</strong>
              </p>
              <p>
                Email: <strong className="text-chalk">[PLACEHOLDER: contact@example.com]</strong>
              </p>
              <p>
                Address: <strong className="text-chalk">[PLACEHOLDER: Physical address]</strong>
              </p>
            </address>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-graphite">
          <Link
            href="/"
            className="font-inter-tight text-body text-ash hover:text-signal-lime transition-colors"
          >
            ← Back to GitAscii
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
