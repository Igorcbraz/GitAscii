import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

import KineticGrid from '@/components/ui/kinetic-grid'
import { APP_URL, EXTERNAL_LINKS, fetchLandingMetrics } from '@/constants'
import { getStoredProfiles } from '@/features/explore/getCommunityProfiles'
import Hero from '@/features/landing/components/Hero'
import { LandingBackgroundDecorations } from '@/features/landing/components/LandingBackgroundDecorations'
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
  const isJa = lang === 'ja'
  const isDe = lang === 'de'
  const isFr = lang === 'fr'

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
  } else if (isJa) {
    title = 'GitAscii — GitHubプロフィールREADME & ASCIIアートジェネレーター'
    description =
      '動的SVGバッジ、リアルタイム統計カード、ASCIIアートエンジン、インタラクティブエディターで魅力的なGitHubプロフィールを作成。完全無料でオープンソース。'
    canonicalUrl = `${APP_URL}?lang=ja`
  } else if (isDe) {
    title = 'GitAscii — GitHub Profil README & ASCII Generator'
    description =
      'Erstellen Sie beeindruckende GitHub Profil-READMEs mit dynamischen SVGs, ASCII-Art-Engine und einem interaktiven visuellen Editor. Schnell, kostenlos und Open Source.'
    canonicalUrl = `${APP_URL}?lang=de`
  } else if (isFr) {
    title = 'GitAscii — Générateur de README GitHub & Art ASCII'
    description =
      'Créez de superbes READMEs de profil GitHub avec des SVGs dynamiques, un moteur d’art ASCII et un éditeur visuel interactif. Rapide, gratuit et open source.'
    canonicalUrl = `${APP_URL}?lang=fr`
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
        <WidgetsShowcase count={metrics.widgets} />
        <EcosystemHub metrics={metrics} />
        <ComparisonTable />
        <FAQ />
        <FinalCTA metrics={metrics} />
        <Footer />
      </div>
    </main>
  )
}
