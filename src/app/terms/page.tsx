import type { Metadata } from 'next'
import Link from 'next/link'

import {
  APP_DOMAIN,
  APP_URL,
  EXTERNAL_LINKS,
  LEGAL_LAST_UPDATED,
  TERMS_ACCEPTABLE_USE_RULES,
} from '@/constants'
import { Footer } from '@/features/landing/components/Footer'
import Navbar from '@/features/landing/components/Navbar'

export const metadata: Metadata = {
  title: 'Terms of Use',
  description:
    'Read the Terms of Use for GitAscii — the free, open-source GitHub Profile README generator.',
  robots: { index: true, follow: true },
  alternates: { canonical: `${APP_URL}/terms` },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-carbon">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="mb-12">
          <span className="font-inter-tight text-eyebrow font-medium uppercase tracking-[0.22em] text-ash mb-4 block">
            [ LEGAL ]
          </span>
          <h1 className="font-pt-serif font-light text-4xl sm:text-heading-sm leading-tight tracking-heading-sm text-chalk mb-4">
            Terms of Use
          </h1>
          <p className="font-inter-tight text-body text-ash">
            Last updated:{' '}
            <time dateTime={LEGAL_LAST_UPDATED}>
              {new Date(LEGAL_LAST_UPDATED).toLocaleDateString('en-US', {
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

        <div className="space-y-10 font-inter-tight text-body text-bone leading-body">
          <section>
            <p>
              These Terms of Use (&ldquo;Terms&rdquo;) govern your access to and use of GitAscii, a
              free and open-source GitHub Profile README generator available at{' '}
              <a href={APP_URL} className="text-signal-lime hover:brightness-110 transition-colors">
                {APP_DOMAIN}
              </a>{' '}
              (the &ldquo;Service&rdquo;), operated by{' '}
              <strong className="text-chalk">
                [PLACEHOLDER: Legal name of the project owner / organization]
              </strong>{' '}
              (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;).
            </p>
            <p className="mt-4">
              By using the Service you agree to these Terms. If you do not agree, please do not use
              the Service.
            </p>
          </section>

          <section>
            <h2 className="font-pt-serif font-light text-subheading text-chalk mb-4">
              1. Description of the Service
            </h2>
            <p>
              GitAscii is a developer tool that lets you create customisable GitHub Profile README
              files. It offers:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-ash">
              <li>A visual drag-and-drop editor for README layouts</li>
              <li>Live SVG-based GitHub stats widgets (fetched from public GitHub APIs)</li>
              <li>An ASCII art engine that converts images to character-based art</li>
              <li>13+ handcrafted themes and templates</li>
              <li>
                Optional GitHub App integration for committing READMEs directly to your profile
                repository
              </li>
            </ul>
            <p className="mt-3">
              The Service is provided free of charge. The source code is released under the{' '}
              <a
                href={EXTERNAL_LINKS.GITHUB_LICENSE}
                target="_blank"
                rel="noopener noreferrer"
                className="text-signal-lime hover:brightness-110"
              >
                MIT License
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-pt-serif font-light text-subheading text-chalk mb-4">
              2. Acceptable Use
            </h2>
            <p>You agree not to use the Service to:</p>
            <ul className="list-none mt-4 space-y-3">
              {TERMS_ACCEPTABLE_USE_RULES.map((item, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="text-signal-lime font-jetbrains-mono mt-0.5 shrink-0">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-pt-serif font-light text-subheading text-chalk mb-4">
              3. Content You Generate
            </h2>
            <p>
              GitAscii generates README files and SVG assets based on inputs you provide (username,
              theme, widget configuration). You own the output you create.
            </p>
            <p className="mt-3">
              You are solely responsible for the content of the READMEs and assets you publish to
              GitHub or any other platform. We do not review or moderate user-generated content.
            </p>
            <p className="mt-3">
              By using the Service you represent that you have the right to use any images or assets
              you upload for ASCII art conversion.
            </p>
          </section>

          <section>
            <h2 className="font-pt-serif font-light text-subheading text-chalk mb-4">
              4. GitHub Integration
            </h2>
            <p>
              GitAscii offers optional GitHub OAuth and GitHub App authentication to allow
              committing READMEs directly to your profile repository.
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-ash">
              <li>
                We request only the minimum GitHub permissions required (read public profile, write
                to the specific repository).
              </li>
              <li>
                We do not store your GitHub access tokens beyond the session, and we do not read
                repositories beyond what you explicitly authorise.
              </li>
              <li>
                GitHub&rsquo;s own Terms of Service and Privacy Policy apply to your GitHub account
                and activity.
              </li>
            </ul>
            <p className="mt-3 text-ash text-note">
              GitHub Terms:{' '}
              <a
                href={EXTERNAL_LINKS.GITHUB_TERMS}
                target="_blank"
                rel="noopener noreferrer"
                className="text-signal-lime hover:brightness-110"
              >
                docs.github.com/en/site-policy
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-pt-serif font-light text-subheading text-chalk mb-4">
              5. Service Availability
            </h2>
            <p>
              We provide the Service on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis.
              We do not guarantee uninterrupted or error-free availability. We may modify, suspend,
              or discontinue any part of the Service at any time without notice.
            </p>
            <p className="mt-3">
              Live SVG widgets depend on the GitHub public API and third-party services. Their
              availability is outside our control.
            </p>
          </section>

          <section>
            <h2 className="font-pt-serif font-light text-subheading text-chalk mb-4">
              6. Limitation of Liability
            </h2>
            <p>
              To the fullest extent permitted by applicable law, GitAscii and its maintainers shall
              not be liable for any indirect, incidental, special, consequential, or punitive
              damages arising from your use of or inability to use the Service, including loss of
              data, loss of profits, or damage to reputation.
            </p>
            <p className="mt-3">
              Our total liability for any claim related to the Service shall not exceed the amount
              you paid us in the twelve months preceding the claim — which, because the Service is
              free, is zero.
            </p>
          </section>

          <section>
            <h2 className="font-pt-serif font-light text-subheading text-chalk mb-4">
              7. Intellectual Property
            </h2>
            <p>
              The GitAscii source code, UI design, brand assets, and documentation are licensed
              under the MIT License. You are free to fork, modify, and redistribute the project in
              accordance with that license.
            </p>
            <p className="mt-3">
              The &ldquo;GitAscii&rdquo; name and logo are trademarks of{' '}
              <strong className="text-chalk">[PLACEHOLDER: Legal name]</strong>. You may not use
              them to imply endorsement or affiliation without written permission.
            </p>
          </section>

          <section>
            <h2 className="font-pt-serif font-light text-subheading text-chalk mb-4">
              8. Third-Party Services
            </h2>
            <p>
              The Service integrates with GitHub, Vercel, Google Analytics, Microsoft Clarity, and
              Sentry. Use of those services is subject to their respective terms and privacy
              policies. We are not responsible for the practices of any third-party service.
            </p>
          </section>

          <section>
            <h2 className="font-pt-serif font-light text-subheading text-chalk mb-4">
              9. Changes to These Terms
            </h2>
            <p>
              We reserve the right to modify these Terms at any time. Changes are effective when
              posted on this page with an updated &ldquo;Last updated&rdquo; date. Continued use of
              the Service after changes constitutes your acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="font-pt-serif font-light text-subheading text-chalk mb-4">
              10. Contact
            </h2>
            <p>Questions about these Terms? Contact us at:</p>
            <address className="mt-3 not-italic text-ash space-y-1">
              <p>
                <strong className="text-chalk">[PLACEHOLDER: Legal entity name]</strong>
              </p>
              <p>
                Email: <strong className="text-chalk">[PLACEHOLDER: contact@example.com]</strong>
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
