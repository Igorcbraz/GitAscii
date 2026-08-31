import type { Metadata } from 'next'

import { APP_URL } from '@/constants'
import { RefundPolicyClient } from '@/features/legal/RefundPolicyClient'

export const metadata: Metadata = {
  title: 'Refund & Return Policy — GitAscii',
  description:
    'Read the Refund and Return Policy for GitAscii Pro — including our 14-day 100% money-back guarantee.',
  robots: { index: true, follow: true },
  alternates: { canonical: `${APP_URL}/refund` },
}

export default function RefundPage() {
  return <RefundPolicyClient />
}
