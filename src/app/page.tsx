import KineticGrid from '@/components/ui/kinetic-grid'
import DemoSection from '@/features/landing/components/DemoSection'
import { FAQ } from '@/features/landing/components/FAQ'
import { FeaturesGrid } from '@/features/landing/components/FeaturesGrid'
import { Footer } from '@/features/landing/components/Footer'
import Hero from '@/features/landing/components/Hero'
import { HowItWorks } from '@/features/landing/components/HowItWorks'
import Navbar from '@/features/landing/components/Navbar'
import TemplatesShowcase from '@/features/landing/components/TemplatesShowcase'

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <KineticGrid className="min-h-screen!">
        <Navbar />
        <Hero />
        <DemoSection />
        <TemplatesShowcase />
        <FeaturesGrid />
        <HowItWorks />
        <FAQ />
        <Footer />
      </KineticGrid>
    </main>
  )
}
