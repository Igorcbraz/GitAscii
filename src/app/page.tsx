import type { Metadata } from 'next'
import { Suspense } from 'react'

import KineticGrid from '@/components/ui/kinetic-grid'
import { APP_URL, EXTERNAL_LINKS, fetchLandingMetrics, LANDING_FAQS } from '@/constants'
import { DEFAULT_LANDING_METRICS, type LandingMetrics } from '@/constants/metrics'
import type { CommunityProfileItem } from '@/features/explore/getCommunityProfiles'
import { getStoredProfiles } from '@/features/explore/getCommunityProfiles'
import {
  DeferredCommunityProfiles,
  DeferredComparisonTable,
  DeferredEcosystemHub,
  DeferredFAQ,
  DeferredFinalCTA,
  DeferredFooter,
  DeferredInteractiveEditorDemo,
  DeferredTemplatesPreview,
  DeferredTractionBar,
  DeferredWidgetsShowcase,
} from '@/features/landing/components/DeferredLandingPreviews'
import Hero from '@/features/landing/components/Hero'
import { LandingBackgroundDecorations } from '@/features/landing/components/LandingBackgroundDecorations'
import { LandingMascotClient } from '@/features/landing/components/LandingMascotClient'
import Navbar from '@/features/landing/components/Navbar'

export const metadata: Metadata = {
  title: 'GitAscii — Turn Your GitHub Profile into ASCII Art & READMEs',
  description:
    'See your GitHub profile as ASCII art. Build a custom profile README with live SVG widgets, templates, and a visual editor. Free and open source.',
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
  return <DeferredTractionBar metrics={await metricsPromise} />
}

async function LandingCommunity({
  metricsPromise,
  profilesPromise,
}: {
  metricsPromise: Promise<LandingMetrics>
  profilesPromise: Promise<CommunityProfileItem[]>
}) {
  const [metrics, profiles] = await Promise.all([metricsPromise, profilesPromise])
  return (
    <DeferredCommunityProfiles profiles={profiles} usersCount={metrics.users} metrics={metrics} />
  )
}

async function LandingMetricsSections({
  metricsPromise,
}: {
  metricsPromise: Promise<LandingMetrics>
}) {
  const metrics = await metricsPromise
  return (
    <>
      <DeferredComparisonTable
        proCustomers={metrics.proCustomers}
        proUsernames={metrics.proUsernames}
      />
      <DeferredWidgetsShowcase count={metrics.widgets} />
      <DeferredEcosystemHub metrics={metrics} />
      <DeferredFAQ faqs={LANDING_FAQS} />
      <DeferredFinalCTA metrics={metrics} />
    </>
  )
}

export default function LandingPage() {
  const metricsPromise = fetchLandingMetrics()
  const profilesPromise = getStoredProfiles()

  return (
    <main className="min-h-screen relative bg-carbon">
      <Navbar />
      <KineticGrid className="min-h-screen">
        <Hero />
      </KineticGrid>

      <div className="relative z-10 w-full bg-carbon">
        <LandingBackgroundDecorations />
        <div className="-mt-[clamp(80px,10vw,140px)]">
          <DeferredInteractiveEditorDemo defaultUsername="Igorcbraz" />
        </div>
        <Suspense fallback={<DeferredTractionBar />}>
          <LandingTraction metricsPromise={metricsPromise} />
        </Suspense>
        <Suspense fallback={<DeferredCommunityProfiles />}>
          <LandingCommunity metricsPromise={metricsPromise} profilesPromise={profilesPromise} />
        </Suspense>
        <DeferredTemplatesPreview count={DEFAULT_LANDING_METRICS.templates} />
        <Suspense fallback={<div className="min-h-96" aria-hidden="true" />}>
          <LandingMetricsSections metricsPromise={metricsPromise} />
        </Suspense>
        <DeferredFooter />
      </div>
      <LandingMascotClient />
    </main>
  )
}
