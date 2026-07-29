import Navbar from "@/features/landing/components/Navbar";
import Hero from "@/features/landing/components/Hero";
import DemoSection from "@/features/landing/components/DemoSection";
import TemplatesShowcase from "@/features/landing/components/TemplatesShowcase";
import { FeaturesGrid } from "@/features/landing/components/FeaturesGrid";
import { HowItWorks } from "@/features/landing/components/HowItWorks";
import { FAQ } from "@/features/landing/components/FAQ";
import { Footer } from "@/features/landing/components/Footer";
import KineticGrid from "@/components/ui/kinetic-grid";

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
  );
}
