import type { Metadata } from 'next'

import KineticGrid from '@/components/ui/kinetic-grid'
import { APP_URL, EXTERNAL_LINKS } from '@/constants'
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
  const lang = typeof params.lang === 'string' ? params.lang : undefined
  const isPt = lang === 'pt'
  const isEs = lang === 'es'
  const isZh = lang === 'zh'

  const ogImage = isPt
    ? EXTERNAL_LINKS.DEFAULT_APP_OG_IMAGE_PT
    : EXTERNAL_LINKS.DEFAULT_APP_OG_IMAGE

  let title = 'GitAscii — GitHub Profile README & ASCII Generator'
  let description =
    'Create stunning custom GitHub Profile READMEs with live SVGs, ASCII art generator engine, and an interactive visual editor. Fast, free, and open source for developers.'
  let canonicalUrl = APP_URL

  if (isPt) {
    title = 'GitAscii — Gerador de README & Arte ASCII'
    description =
      'Crie READMEs impressionantes para seu perfil do GitHub com SVGs dinâmicos, conversor de arte ASCII e editor visual interativo. Totalmente grátis e de código aberto.'
    canonicalUrl = `${APP_URL}?lang=pt`
  } else if (isEs) {
    title = 'GitAscii — Generador de README y Arte ASCII'
    description =
      'Crea impresionantes READMEs para tu perfil de GitHub con SVGs dinámicos, motor de arte ASCII y editor visual interactivo. Rápido, gratis y de código abierto para desarrolladores.'
    canonicalUrl = `${APP_URL}?lang=es`
  } else if (isZh) {
    title = 'GitAscii — GitHub 个人主页 README 与 ASCII 艺术生成器'
    description =
      '使用动态 SVG 徽章、实时统计卡片、ASCII 艺术引擎和可视化编辑器打造惊艳的 GitHub 主页。完全免费且开源。'
    canonicalUrl = `${APP_URL}?lang=zh`
  }

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
