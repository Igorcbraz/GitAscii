import { Sparkles } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { APP_URL } from '@/constants'
import { Footer } from '@/features/landing/components/Footer'
import Navbar from '@/features/landing/components/Navbar'

export const dynamicParams = false

interface CompetitorData {
  slug: string
  name: string
  title: string
  description: string
  summary: string
  prosGitAscii: string[]
  comparisonPoints: { feature: string; gitascii: string; competitor: string }[]
  faqs: { question: string; answer: string }[]
}

const competitors: Record<string, CompetitorData> = {
  'readme-so': {
    slug: 'readme-so',
    name: 'Readme.so',
    title: 'GitAscii vs Readme.so — Feature & Performance Comparison',
    description:
      'In-depth comparison between GitAscii and Readme.so. Discover why GitAscii offers live SVG rendering, custom ASCII art engine, and dynamic profile stats.',
    summary:
      'While Readme.so is a popular section-based markdown builder, GitAscii provides live SVG rendering, dynamic stats widgets, an image-to-ASCII converter, and dark/light mode automatic theme adaptation.',
    prosGitAscii: [
      'Live SVG Widget Endpoints served on Vercel Edge Serverless functions.',
      'Built-in Image-to-ASCII Art Converter Engine.',
      'Support for multiple named profiles per GitHub username.',
      'Automatic dark and light theme switching via HTML <picture> elements.',
    ],
    comparisonPoints: [
      {
        feature: 'Live Dynamic SVGs',
        gitascii: 'Yes (Auto-refreshing)',
        competitor: 'No (Static Markdown)',
      },
      { feature: 'ASCII Art Engine', gitascii: 'Yes (6+ Charsets)', competitor: 'No' },
      { feature: 'Visual Editor', gitascii: 'Drag & Drop Canvas', competitor: 'Section List' },
      {
        feature: 'Multi-Profile Support',
        gitascii: 'Unlimited Named Profiles',
        competitor: 'Single Layout',
      },
    ],
    faqs: [
      {
        question: 'Why choose GitAscii over Readme.so?',
        answer:
          'GitAscii goes beyond static markdown text by rendering live SVG stats, contribution streaks, and custom ASCII art banners that update automatically on GitHub.',
      },
    ],
  },
  gprm: {
    slug: 'gprm',
    name: 'GPRM (GitHub Profile README Maker)',
    title: 'GitAscii vs GPRM — Detailed Comparison & Alternatives',
    description:
      'Compare GitAscii with GPRM (GitHub Profile README Maker). Modern visual editor vs form inputs, 13+ handcrafted theme presets, and live SVG stats.',
    summary:
      'GPRM offers basic form inputs for creating READMEs. GitAscii elevates the experience with an interactive drag-and-drop visual canvas, instant auto-generation, 13+ theme presets, and full typography controls.',
    prosGitAscii: [
      'Interactive visual canvas with real-time drag-and-drop positioning.',
      '13+ theme presets (Terminal, Minimal, Cyberpunk, Dracula, Nord, Tokyo Night, etc.).',
      'Smart profile auto-generation based on public GitHub repository data.',
    ],
    comparisonPoints: [
      { feature: 'Interface', gitascii: 'Visual Drag & Drop Canvas', competitor: 'Form Fields' },
      {
        feature: 'Themes & Aesthetics',
        gitascii: '13+ Handcrafted Themes',
        competitor: 'Basic Styles',
      },
      { feature: 'ASCII Art Converter', gitascii: 'Yes', competitor: 'No' },
    ],
    faqs: [
      {
        question: 'Can I migrate my GPRM profile to GitAscii?',
        answer:
          'Yes! Simply enter your GitHub username into GitAscii and our smart generator will auto-create an optimized profile layout.',
      },
    ],
  },
  'github-profile-readme-generator': {
    slug: 'github-profile-readme-generator',
    name: 'Generic Profile Generators',
    title: 'GitAscii vs Generic GitHub Profile Generators',
    description:
      'Compare GitAscii against static, generic GitHub profile generators. Learn why dynamic SVGs and ASCII art create higher-converting developer profiles.',
    summary:
      'Generic generators rely on static badges and uninspired forms. GitAscii offers real-time live SVG rendering, ASCII art, multi-profile layouts, and SEO/GEO structured metadata.',
    prosGitAscii: [
      'Live stats that automatically update as you commit code on GitHub.',
      'High-DPI vector rendering on dark and light themes.',
    ],
    comparisonPoints: [
      {
        feature: 'Live Data Updates',
        gitascii: 'Real-time via URL',
        competitor: 'Static Hardcoded',
      },
      { feature: 'Design Aesthetic', gitascii: 'Premium Modern UI', competitor: 'Basic Defaults' },
    ],
    faqs: [
      {
        question: 'What makes GitAscii different from basic generators?',
        answer:
          'GitAscii combines live SVG stats widgets, an ASCII art engine, theme templates, and multi-profile support in one free open-source platform.',
      },
    ],
  },
}

export function generateStaticParams() {
  return Object.keys(competitors).map((competitor) => ({ competitor }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ competitor: string }>
}): Promise<Metadata> {
  const { competitor } = await params
  const data = competitors[competitor]
  if (!data) return {}

  const url = `${APP_URL}/vs/${competitor}`

  return {
    title: `${data.title} | GitAscii`,
    description: data.description,
    keywords: [
      `GitAscii vs ${data.name}`,
      `${data.name} alternative`,
      'GitHub profile generator comparison',
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${data.title} | GitAscii`,
      description: data.description,
      url,
      siteName: 'GitAscii',
      type: 'website',
    },
  }
}

export default async function CompetitorPage({
  params,
}: {
  params: Promise<{ competitor: string }>
}) {
  const { competitor } = await params
  const data = competitors[competitor]
  if (!data) notFound()

  const webPageLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: data.title,
    description: data.description,
    url: `${APP_URL}/vs/${data.slug}`,
  }

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: APP_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Comparisons',
        item: `${APP_URL}/vs`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: data.name,
        item: `${APP_URL}/vs/${data.slug}`,
      },
    ],
  }

  return (
    <main className="min-h-screen bg-carbon text-chalk font-inter-tight">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <Navbar />

      <div className="border-b border-graphite bg-void-black/80 backdrop-blur-md px-6 py-3">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs items={[{ label: 'Comparisons', href: '/vs' }, { label: data.name }]} />
        </div>
      </div>

      <section className="py-16 px-6 max-w-4xl mx-auto text-center">
        <span className="font-jetbrains-mono text-caption uppercase tracking-[0.22em] text-ash mb-4 block">
          [ DETAILED COMPARISON ]
        </span>
        <h1 className="font-pt-serif font-light text-4xl md:text-5xl leading-tight mb-6">
          GitAscii vs <span className="italic text-signal-lime">{data.name}</span>
        </h1>
        <p className="text-body text-bone leading-relaxed max-w-2xl mx-auto mb-8">{data.summary}</p>

        <div className="bg-onyx border border-graphite p-6 text-left mb-8">
          <h2 className="text-label uppercase tracking-widest text-signal-lime mb-2 flex items-center gap-2 font-medium">
            <Sparkles size={16} /> Key Advantages of GitAscii
          </h2>
          <ul className="text-note text-bone space-y-2">
            {data.prosGitAscii.map((pro, i) => (
              <li key={i}>• {pro}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mb-16">
        <div className="bg-onyx border border-graphite overflow-x-auto">
          <table className="w-full text-left font-inter-tight text-note">
            <thead>
              <tr className="border-b border-graphite bg-void-black text-signal-lime uppercase tracking-widest text-caption">
                <th className="p-4">Feature</th>
                <th className="p-4">GitAscii</th>
                <th className="p-4">{data.name}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite text-bone">
              {data.comparisonPoints.map((pt, i) => (
                <tr key={i}>
                  <td className="p-4 font-medium text-chalk">{pt.feature}</td>
                  <td className="p-4 text-signal-lime font-bold">{pt.gitascii}</td>
                  <td className="p-4 text-ash">{pt.competitor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mb-20">
        <h2 className="text-heading font-pt-serif font-light text-chalk mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {data.faqs.map((faq, i) => (
            <div key={i} className="bg-onyx border border-graphite p-6">
              <h3 className="text-subheading font-medium text-signal-lime mb-2">{faq.question}</h3>
              <p className="text-body text-bone leading-relaxed text-note">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}
