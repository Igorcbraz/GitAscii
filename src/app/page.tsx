import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

import { APP_URL, EXTERNAL_LINKS, fetchLandingMetrics } from '@/constants'
import { DEFAULT_LANDING_METRICS, type LandingMetrics } from '@/constants/metrics'
import type { CommunityProfileItem } from '@/features/explore/getCommunityProfiles'
import { getStoredProfiles } from '@/features/explore/getCommunityProfiles'
import Hero from '@/features/landing/components/Hero'
import { LandingBackgroundDecorations } from '@/features/landing/components/LandingBackgroundDecorations'
import { LandingMascotClient } from '@/features/landing/components/LandingMascotClient'
import Navbar from '@/features/landing/components/Navbar'
import { TractionBar } from '@/features/landing/components/TractionBar'

const InteractiveEditorDemo = dynamic(
  () => import('@/features/landing/components/InteractiveEditorDemo')
)
const CommunityProfiles = dynamic(() => import('@/features/landing/components/CommunityProfiles'))
const TemplatesPreview = dynamic(() => import('@/features/landing/components/TemplatesPreview'))
const WidgetsShowcase = dynamic(() => import('@/features/landing/components/WidgetsShowcase'))
const EcosystemHub = dynamic(() => import('@/features/landing/components/EcosystemHub'))
const ComparisonTable = dynamic(() => import('@/features/landing/components/ComparisonTable'))
const FAQ = dynamic(() => import('@/features/landing/components/FAQ').then((mod) => mod.FAQ))
const FinalCTA = dynamic(() => import('@/features/landing/components/FinalCTA'))
const Footer = dynamic(() =>
  import('@/features/landing/components/Footer').then((mod) => mod.Footer)
)

export const metadata: Metadata = {
  title: 'GitAscii — Turn Your GitHub Profile into ASCII Art & READMEs',
  description:
    'Turn your GitHub profile into ASCII art. Build a custom profile README with live SVG widgets and a visual editor. Free and open source.',
  alternates: {
    canonical: APP_URL,
  },
  openGraph: {
    title: 'GitAscii — Turn Your GitHub Profile into ASCII Art & READMEs',
    description:
      'Turn your GitHub profile into ASCII art. Build a custom profile README with live SVG widgets and a visual editor.',
    url: APP_URL,
    images: [
      {
        url: EXTERNAL_LINKS.DEFAULT_APP_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'GitAscii GitHub profile ASCII art and README builder',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    title: 'GitAscii — Turn Your GitHub Profile into ASCII Art & READMEs',
    description:
      'Turn your GitHub profile into ASCII art. Build a custom profile README with live SVG widgets and a visual editor.',
    images: [EXTERNAL_LINKS.DEFAULT_APP_OG_IMAGE],
  },
}

export const revalidate = 3600

async function LandingTraction({ metricsPromise }: { metricsPromise: Promise<LandingMetrics> }) {
  return <TractionBar metrics={await metricsPromise} />
}

async function LandingCommunity({
  metricsPromise,
  profilesPromise,
}: {
  metricsPromise: Promise<LandingMetrics>
  profilesPromise: Promise<CommunityProfileItem[]>
}) {
  const [metrics, profiles] = await Promise.all([metricsPromise, profilesPromise])
  return <CommunityProfiles profiles={profiles} usersCount={metrics.users} metrics={metrics} />
}

async function LandingMetricsSections({
  metricsPromise,
}: {
  metricsPromise: Promise<LandingMetrics>
}) {
  const metrics = await metricsPromise
  return (
    <>
      <ComparisonTable proCustomers={metrics.proCustomers} proUsernames={metrics.proUsernames} />
      <WidgetsShowcase count={metrics.widgets} />
      <EcosystemHub metrics={metrics} />
      <FAQ />
      <FinalCTA metrics={metrics} />
    </>
  )
}

export default function LandingPage() {
  const metricsPromise = fetchLandingMetrics()
  const profilesPromise = getStoredProfiles()

  return (
    <main className="min-h-screen relative bg-carbon">
      <Navbar />
      <Hero />

      <div className="relative z-10 w-full bg-carbon">
        <LandingBackgroundDecorations />
        <div className="-mt-[clamp(80px,10vw,140px)]">
          <InteractiveEditorDemo defaultUsername="Igorcbraz" />
        </div>
        <Suspense fallback={<TractionBar />}>
          <LandingTraction metricsPromise={metricsPromise} />
        </Suspense>
        <Suspense fallback={<CommunityProfiles />}>
          <LandingCommunity metricsPromise={metricsPromise} profilesPromise={profilesPromise} />
        </Suspense>
        <TemplatesPreview count={DEFAULT_LANDING_METRICS.templates} />
        <Suspense fallback={<div className="min-h-96" aria-hidden="true" />}>
          <LandingMetricsSections metricsPromise={metricsPromise} />
        </Suspense>
        <Footer />
      </div>
      <LandingMascotClient />
    </main>
  )
}
