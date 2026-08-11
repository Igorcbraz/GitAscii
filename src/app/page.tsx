import type { Metadata } from 'next'

import KineticGrid from '@/components/ui/kinetic-grid'
import DemoSection from '@/features/landing/components/DemoSection'
import { FAQ } from '@/features/landing/components/FAQ'
import { FeaturesGrid } from '@/features/landing/components/FeaturesGrid'
import { Footer } from '@/features/landing/components/Footer'
import Hero from '@/features/landing/components/Hero'
import { HowItWorks } from '@/features/landing/components/HowItWorks'
import InteractiveShowcase from '@/features/landing/components/InteractiveShowcase'
import Navbar from '@/features/landing/components/Navbar'
import { SummarySection } from '@/features/landing/components/SummarySection'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}): Promise<Metadata> {
  const params = await searchParams
  const isPtBr = params.lang === 'pt'

  const ogImage = isPtBr
    ? 'https://git-ascii.vercel.app/og-image-pt-br.png'
    : 'https://git-ascii.vercel.app/og-image.png'

  const title = isPtBr
    ? 'GitAscii — Gerador Premium de README e Arte ASCII para o GitHub'
    : 'GitAscii — Premium GitHub Profile README & ASCII Art Generator'

  return {
    title,
    openGraph: {
      title,
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
      images: [ogImage],
    },
  }
}

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <KineticGrid className="min-h-screen!">
        <Navbar />
        <Hero />
        <SummarySection />
        <DemoSection />
        <InteractiveShowcase />
        <FeaturesGrid />
        <HowItWorks />
        <FAQ />
        <Footer />
      </KineticGrid>
    </main>
  )
}
