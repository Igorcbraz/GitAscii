import type { Metadata } from 'next'

import { APP_URL } from '@/constants'
import { SupportClient } from '@/features/legal/SupportClient'

export const metadata: Metadata = {
  title: 'Support Center & Contact — GitAscii',
  description:
    'Need help with GitAscii, GitAscii Pro billing, refunds or reporting issues? Get in touch with our team at support@gitascii.com.',
  robots: { index: true, follow: true },
  alternates: { canonical: `${APP_URL}/support` },
}

export default function SupportPage() {
  return <SupportClient />
}
