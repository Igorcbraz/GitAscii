import type { Metadata } from 'next'

import { APP_URL } from '@/constants'
import { TermsOfUseClient } from '@/features/legal/TermsOfUseClient'

export const metadata: Metadata = {
  title: 'Terms of Use',
  description:
    'Read the Terms of Use for GitAscii — the free, open-source GitHub Profile README generator.',
  robots: { index: true, follow: true },
  alternates: { canonical: `${APP_URL}/terms` },
}

export default function TermsPage() {
  return <TermsOfUseClient />
}
