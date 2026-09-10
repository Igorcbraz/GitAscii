import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

import KineticGrid from '@/components/ui/kinetic-grid'
import { APP_URL, EXTERNAL_LINKS, fetchLandingMetrics } from '@/constants'
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

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = EXTERNAL_LINKS.DEFAULT_APP_OG_IMAGE

  const title = 'GitAscii — GitHub Profile README & ASCII Generator'
  const description =
    'Create stunning custom GitHub Profile READMEs with live SVGs, ASCII art generator engine, and an interactive visual editor. Fast, free, and open source for developers.'
  const canonicalUrl = APP_URL

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: APP_URL,
        'pt-BR': `${APP_URL}?lang=pt`,
        'es-ES': `${APP_URL}?lang=es`,
        'zh-CN': `${APP_URL}?lang=zh`,
        'ja-JP': `${APP_URL}?lang=ja`,
        'de-DE': `${APP_URL}?lang=de`,
        'fr-FR': `${APP_URL}?lang=fr`,
        'x-default': APP_URL,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      title,
      description,
      images: [ogImage],
    },
  }
}

export const revalidate = 3600

export default async function LandingPage() {
  const [metrics, storedProfiles] = await Promise.all([fetchLandingMetrics(), getStoredProfiles()])

  return (
    <main className="min-h-screen relative bg-carbon">
      <Navbar />
      <KineticGrid className="min-h-screen">
        <Hero />
      </KineticGrid>

      <div className="relative z-10 w-full bg-carbon">
        <LandingBackgroundDecorations />
        <div className="-mt-[clamp(80px,10vw,140px)]">
          <InteractiveEditorDemo defaultUsername="Igorcbraz" />
        </div>
        <TractionBar metrics={metrics} />
        <CommunityProfiles profiles={storedProfiles} usersCount={metrics.users} />
        <TemplatesPreview count={metrics.templates} />
        <ComparisonTable proCustomers={metrics.proCustomers} proUsernames={metrics.proUsernames} />
        <WidgetsShowcase count={metrics.widgets} />
        <EcosystemHub metrics={metrics} />
        <FAQ />
        <FinalCTA metrics={metrics} />
        <Footer />
      </div>
      <LandingMascotClient />
    </main>
  )
}
