import type { Metadata } from 'next'

import { APP_URL } from '@/constants'
import { PrivacyPolicyClient } from '@/features/legal/PrivacyPolicyClient'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Learn how GitAscii collects, uses, and protects information when you use our GitHub Profile README generator.',
  robots: { index: true, follow: true },
  alternates: { canonical: `${APP_URL}/privacy` },
}

export default function PrivacyPage() {
  return <PrivacyPolicyClient />
}
