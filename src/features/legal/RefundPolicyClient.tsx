'use client'

import { ArrowLeft, CheckCircle2, Mail, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

import { APP_DOMAIN, APP_URL, LEGAL_LAST_UPDATED, SUPPORT_EMAIL } from '@/constants'
import { Footer } from '@/features/landing/components/Footer'
import Navbar from '@/features/landing/components/Navbar'
import { useI18n } from '@/i18n'

export function RefundPolicyClient() {
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
    <div className="min-h-screen bg-carbon text-chalk">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
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
            {t('legal.tag', '[ LEGAL & BILLING ]')}
          </span>
          <h1 className="font-pt-serif font-light text-4xl sm:text-heading-sm leading-tight tracking-heading-sm text-chalk mb-4">
            {t('legal.refund_title', 'Refund & Return Policy')}
          </h1>
          <p className="font-inter-tight text-body text-ash">
            {t('legal.last_updated', `Last updated: ${formattedDate}`, { date: formattedDate })}
          </p>
        </div>

        <div className="w-full h-px bg-graphite mb-12 relative">
          <div className="absolute left-0 w-16 h-px bg-signal-lime shadow-[0_0_8px_rgba(197,255,74,0.4)]" />
        </div>

        <div className="space-y-10 font-inter-tight text-body text-bone/90 leading-relaxed">
          <div className="p-6 bg-onyx/40 border border-signal-lime/30 rounded-none relative overflow-hidden">
            <div className="flex items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-signal-lime shrink-0 mt-1" />
              <div>
                <h2 className="font-jetbrains-mono text-sm uppercase tracking-wider text-chalk font-semibold mb-1">
                  {t('legal.refund_guarantee_title', '14-Day Money-Back Guarantee')}
                </h2>
                <p className="text-sm text-ash leading-relaxed">
                  {t(
                    'legal.refund_guarantee_desc',
                    'We want you to be completely satisfied with GitAscii Pro. If you are not satisfied with your purchase for any reason within 14 days of your initial payment, we will issue a full 100% refund — no questions asked.'
                  )}
                </p>
              </div>
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="font-pt-serif text-xl text-chalk font-normal">
              1. {t('legal.refund_sec1_title', 'Scope of Policy')}
            </h2>
            <p>
              {t(
                'legal.refund_sec1_p1',
                'This Refund and Return Policy applies to all purchases of digital goods, licenses, and services made on'
              )}{' '}
              <a href={APP_URL} className="text-signal-lime hover:underline">
                {APP_DOMAIN}
              </a>
              ,{' '}
              {t(
                'legal.refund_sec1_p2',
                'including the GitAscii Pro lifetime license and digital add-ons.'
              )}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-pt-serif text-xl text-chalk font-normal">
              2. {t('legal.refund_sec2_title', 'Eligibility for Refunds')}
            </h2>
            <ul className="space-y-2.5 list-none pl-0">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-signal-lime shrink-0 mt-1" />
                <span>
                  <strong>{t('legal.refund_eligibility_1_bold', 'Time Window:')}</strong>{' '}
                  {t(
                    'legal.refund_eligibility_1_text',
                    'Refund requests must be submitted within 14 calendar days from the date and time of the initial transaction.'
                  )}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-signal-lime shrink-0 mt-1" />
                <span>
                  <strong>{t('legal.refund_eligibility_2_bold', 'Digital Products:')}</strong>{' '}
                  {t(
                    'legal.refund_eligibility_2_text',
                    'Because GitAscii Pro is a digital license with immediate access, upon processing a refund, your account will simply be reverted to the Free tier.'
                  )}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-signal-lime shrink-0 mt-1" />
                <span>
                  <strong>{t('legal.refund_eligibility_3_bold', 'No Physical Returns:')}</strong>{' '}
                  {t(
                    'legal.refund_eligibility_3_text',
                    'Since no physical merchandise is shipped, there is no requirement to return physical goods or pay return shipping fees.'
                  )}
                </span>
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-pt-serif text-xl text-chalk font-normal">
              3. {t('legal.refund_sec3_title', 'How to Request a Refund')}
            </h2>
            <p>
              {t(
                'legal.refund_sec3_desc',
                'To initiate a refund, please send an email to our support team with your GitHub username or the email address used during checkout:'
              )}
            </p>
            <div className="p-4 bg-onyx/20 border border-graphite/40 font-jetbrains-mono text-sm text-chalk flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-signal-lime" />
                <span>{SUPPORT_EMAIL}</span>
              </div>
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=Refund%20Request%20-%20GitAscii%20Pro`}
                className="text-xs uppercase text-signal-lime hover:underline tracking-wider"
              >
                {t('legal.refund_send_email', 'Send Request →')}
              </a>
            </div>
            <p className="text-xs text-ash">
              {t(
                'legal.refund_sla',
                'Our support team will review and process your request within 1 to 2 business days.'
              )}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-pt-serif text-xl text-chalk font-normal">
              4. {t('legal.refund_sec4_title', 'Refund Processing Time & Currency')}
            </h2>
            <p>
              {t(
                'legal.refund_sec4_desc',
                'Approved refunds will be processed immediately through Stripe back to the original method of payment (credit card, debit card, etc.). Depending on your financial institution or credit card issuer, funds typically appear on your statement within 5 to 10 business days.'
              )}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-pt-serif text-xl text-chalk font-normal">
              5. {t('legal.refund_sec5_title', 'Questions & Contact')}
            </h2>
            <p>
              {t(
                'legal.refund_sec5_desc',
                'If you have any questions regarding your billing, charge details, or this policy, please reach out to us directly at'
              )}{' '}
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
