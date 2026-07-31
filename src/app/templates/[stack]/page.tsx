import { ArrowRight, Check } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Footer } from '@/features/landing/components/Footer'
import Navbar from '@/features/landing/components/Navbar'

export const dynamicParams = false

interface StackData {
  slug: string
  name: string
  title: string
  description: string
  vibe: string
  accent: string
  bg: string
  badges: string[]
  codeSnippet: string
  bestPractices: string[]
  commonMistakes: string[]
  faqs: { question: string; answer: string }[]
}

const stacks: Record<string, StackData> = {
  react: {
    slug: 'react',
    name: 'React.js',
    title: 'React Developer GitHub Profile README Template',
    description:
      'Handcrafted GitHub Profile README template for React developers. Showcase your React ecosystem skills, Next.js projects, Component libraries, and contribution stats with dynamic SVGs.',
    vibe: 'Modern Component-Driven Interface',
    accent: '#61dafb',
    bg: '#0d1117',
    badges: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Redux', 'Zustand'],
    codeSnippet: `<!-- React Developer Profile Card -->
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://git-ascii.vercel.app/api/YOUR_USERNAME?theme=tokyo-night">
  <source media="(prefers-color-scheme: light)" srcset="https://git-ascii.vercel.app/api/YOUR_USERNAME?theme=minimal">
  <img alt="React Developer Stats" src="https://git-ascii.vercel.app/api/YOUR_USERNAME">
</picture>`,
    bestPractices: [
      'Highlight key React component libraries and open-source packages you maintain.',
      'Embed dynamic contribution streaks to demonstrate active React open-source involvement.',
      'Use HTML <picture> tags to adapt profile cards between GitHub dark and light themes.',
    ],
    commonMistakes: [
      'Overloading the README with dozens of static badges without context.',
      'Using static images instead of live SVG endpoints that auto-update.',
    ],
    faqs: [
      {
        question: 'How do I use this React GitHub Profile template?',
        answer:
          'Enter your GitHub username into GitAscii, select the React template preset, customize your stack badges, and copy the generated Markdown snippet directly into your profile README.md.',
      },
      {
        question: 'Does it support Next.js and Server Components?',
        answer:
          'Yes! The template includes pre-configured badges and widgets tailored for fullstack React, Next.js App Router, and TypeScript developers.',
      },
    ],
  },
  nextjs: {
    slug: 'nextjs',
    name: 'Next.js',
    title: 'Next.js Fullstack Developer GitHub Profile Template',
    description:
      'Tailored GitHub Profile README template for Next.js fullstack engineers. Highlight Server Components, Vercel deployments, SSR/SSG expertise, and live stats.',
    vibe: 'Fullstack Vercel & React Server Components',
    accent: '#ffffff',
    bg: '#000000',
    badges: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Prisma', 'Vercel'],
    codeSnippet: `<!-- Next.js Fullstack Profile Card -->
![Next.js Profile](https://git-ascii.vercel.app/api/YOUR_USERNAME?theme=terminal)`,
    bestPractices: [
      'Highlight serverless API routes, ISR/SSG projects, and deployed web apps.',
      'Include live SVG widgets showing total pull requests merged and star counts.',
    ],
    commonMistakes: ['Forgetting to link live demo URLs for Next.js web applications.'],
    faqs: [
      {
        question: 'Is this Next.js template free?',
        answer: 'Yes, 100% free and open-source under the MIT license.',
      },
    ],
  },
  python: {
    slug: 'python',
    name: 'Python & AI',
    title: 'Python & AI/ML Engineer GitHub Profile README Template',
    description:
      'GitHub Profile README template for Python developers, Data Scientists, and Machine Learning engineers. Showcase PyTorch, TensorFlow, FastAPI, and data projects.',
    vibe: 'Data Science, Machine Learning & Automation',
    accent: '#3776ab',
    bg: '#0e1726',
    badges: ['Python', 'PyTorch', 'TensorFlow', 'FastAPI', 'Pandas', 'Docker'],
    codeSnippet: `<!-- Python & AI Developer Profile Card -->
![Python Profile](https://git-ascii.vercel.app/api/YOUR_USERNAME?theme=nord)`,
    bestPractices: [
      'Feature Jupyter notebooks, ML models, and automated Python pipelines.',
      'Use ASCII art headers to represent neural networks or Python code blocks.',
    ],
    commonMistakes: ['Not specifying Python package contributions or PyPI libraries.'],
    faqs: [
      {
        question: 'Can I showcase Machine Learning repositories?',
        answer:
          'Yes, GitAscii automatically pulls your top starred Python & ML repositories and displays them in dynamic language distribution cards.',
      },
    ],
  },
  node: {
    slug: 'node',
    name: 'Node.js',
    title: 'Node.js Backend Engineer GitHub Profile Template',
    description:
      'Professional GitHub Profile README template for Node.js, Express, NestJS, and Microservices backend engineers.',
    vibe: 'Event-Driven Microservices & APIs',
    accent: '#339933',
    bg: '#111b11',
    badges: ['Node.js', 'Express', 'NestJS', 'TypeScript', 'PostgreSQL', 'Redis'],
    codeSnippet: `<!-- Node.js Backend Profile Card -->
![Node.js Profile](https://git-ascii.vercel.app/api/YOUR_USERNAME?theme=matrix)`,
    bestPractices: [
      'Highlight REST & GraphQL API performance, database optimizations, and npm packages.',
    ],
    commonMistakes: ['Omitting deployment environment badges (Docker, K8s, AWS).'],
    faqs: [
      {
        question: 'Does it support NestJS and Express badges?',
        answer: 'Yes, GitAscii includes official badges for the entire Node.js backend ecosystem.',
      },
    ],
  },
  go: {
    slug: 'go',
    name: 'Go (Golang)',
    title: 'Go Systems & Cloud Engineer GitHub Profile Template',
    description:
      'Sleek GitHub Profile README template for Golang developers, DevOps engineers, and cloud infrastructure maintainers.',
    vibe: 'Concurrent Systems & Cloud Native Infrastructure',
    accent: '#00add8',
    bg: '#0b1620',
    badges: ['Go', 'Kubernetes', 'Docker', 'gRPC', 'PostgreSQL', 'AWS'],
    codeSnippet: `<!-- Go Developer Profile Card -->
![Go Profile](https://git-ascii.vercel.app/api/YOUR_USERNAME?theme=dracula)`,
    bestPractices: ['Highlight CLI utilities, gRPC services, and Kubernetes operators.'],
    commonMistakes: ['Using generic templates that don’t highlight Golang CLI projects.'],
    faqs: [
      {
        question: 'Is Golang ASCII art included?',
        answer: 'Yes! You can generate custom Go Gopher ASCII art banners for your profile README.',
      },
    ],
  },
  rust: {
    slug: 'rust',
    name: 'Rust',
    title: 'Rust High-Performance Developer GitHub Profile Template',
    description:
      'GitHub Profile README template for Rust developers, WebAssembly engineers, and systems programmers.',
    vibe: 'Memory Safe & High Performance',
    accent: '#dea584',
    bg: '#1a120c',
    badges: ['Rust', 'WebAssembly', 'Tokio', 'Cargo', 'Linux', 'C++'],
    codeSnippet: `<!-- Rust Developer Profile Card -->
![Rust Profile](https://git-ascii.vercel.app/api/YOUR_USERNAME?theme=gruvbox)`,
    bestPractices: ['Showcase crates.io published packages and memory safety benchmarks.'],
    commonMistakes: ['Forgetting to list CLI tools created with Rust.'],
    faqs: [
      {
        question: 'Can I display my published crates.io stats?',
        answer:
          'Yes, GitAscii renders live star and contribution counters across all your Rust repositories.',
      },
    ],
  },
}

export function generateStaticParams() {
  return Object.keys(stacks).map((stack) => ({ stack }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ stack: string }>
}): Promise<Metadata> {
  const { stack } = await params
  const data = stacks[stack]
  if (!data) return {}

  const url = `https://git-ascii.vercel.app/templates/${stack}`

  return {
    title: `${data.title} | GitAscii`,
    description: data.description,
    keywords: [
      `${data.name} GitHub profile template`,
      `${data.name} README generator`,
      'GitHub README template',
      'GitAscii templates',
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
    twitter: {
      card: 'summary_large_image',
      title: `${data.title} | GitAscii`,
      description: data.description,
    },
  }
}

export default async function StackTemplatePage({
  params,
}: {
  params: Promise<{ stack: string }>
}) {
  const { stack } = await params
  const data = stacks[stack]
  if (!data) notFound()

  const allStackKeys = Object.keys(stacks)

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://git-ascii.vercel.app',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Templates',
        item: 'https://git-ascii.vercel.app/templates',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: data.name,
        item: `https://git-ascii.vercel.app/templates/${data.slug}`,
      },
    ],
  }

  return (
    <main className="min-h-screen bg-carbon text-chalk font-inter-tight">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <Navbar />

      <div className="border-b border-graphite bg-void-black/80 backdrop-blur-md px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Breadcrumbs items={[{ label: 'Templates', href: '/templates' }, { label: data.name }]} />
        </div>
      </div>

      <div className="bg-void-black border-b border-graphite px-6 py-3 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <span className="font-jetbrains-mono text-caption text-ash uppercase tracking-wider shrink-0 mr-2">
            [ LANGUAGE STACKS ]
          </span>
          <Link
            href="/templates"
            className="px-3 py-1 bg-carbon border border-graphite font-inter-tight text-caption text-ash hover:text-white uppercase transition-colors shrink-0"
          >
            ← All Templates
          </Link>
          {allStackKeys.map((sKey) => {
            const item = stacks[sKey]
            const isActive = sKey === data.slug
            return (
              <Link
                key={sKey}
                href={`/templates/${sKey}`}
                className={`px-3 py-1 font-inter-tight text-caption font-medium uppercase tracking-wider transition-all shrink-0 ${
                  isActive
                    ? 'bg-signal-lime text-black shadow-[0_0_8px_rgba(197,255,74,0.3)] font-bold'
                    : 'bg-carbon text-ash hover:text-white border border-graphite hover:border-signal-lime/50'
                }`}
              >
                {item.name}
              </Link>
            )
          })}
        </div>
      </div>

      <section className="py-16 px-6 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 border border-graphite bg-onyx text-signal-lime font-jetbrains-mono text-caption mb-4">
          <span className="size-2 rounded-full" style={{ backgroundColor: data.accent }} />
          <span>{data.vibe}</span>
        </div>
        <h1 className="font-pt-serif font-light text-4xl md:text-heading-lg leading-tight mb-6">
          {data.name} <span className="italic text-signal-lime">GitHub Profile</span> Template
        </h1>
        <p className="text-body text-bone max-w-2xl mx-auto leading-relaxed mb-8">
          {data.description}
        </p>

        <div className="pt-2">
          <Link
            href={`/?template=${data.slug}`}
            className="inline-flex items-center gap-2 bg-signal-lime text-black font-medium text-body px-8 py-4 uppercase tracking-wider hover:brightness-110 shadow-[0_0_12px_rgba(197,255,74,0.4)] transition-all"
          >
            <span>Use {data.name} Template in Editor</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-8 space-y-12 pb-24">
        <div className="bg-onyx border border-graphite p-8">
          <h2 className="text-subheading font-medium text-chalk mb-4">Included Ecosystem Badges</h2>
          <div className="flex items-center gap-2 flex-wrap mb-6">
            {data.badges.map((b) => (
              <span
                key={b}
                className="px-3 py-1 bg-carbon border border-graphite text-signal-lime font-jetbrains-mono text-note uppercase"
              >
                {b}
              </span>
            ))}
          </div>

          <h3 className="text-label font-medium uppercase tracking-wider text-ash mb-2">
            Markdown Embed Snippet:
          </h3>
          <div className="bg-carbon border border-graphite p-4 font-jetbrains-mono text-caption text-signal-lime overflow-x-auto">
            <pre>{data.codeSnippet}</pre>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-onyx border border-graphite p-8">
            <h3 className="text-subheading font-medium text-signal-lime mb-4 flex items-center gap-2">
              <Check size={18} /> Best Practices
            </h3>
            <ul className="space-y-3 text-body text-bone">
              {data.bestPractices.map((bp, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-signal-lime font-bold">•</span>
                  <span>{bp}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-onyx border border-graphite p-8">
            <h3 className="text-subheading font-medium text-red-400 mb-4 flex items-center gap-2">
              <span>✕</span> Common Mistakes to Avoid
            </h3>
            <ul className="space-y-3 text-body text-bone">
              {data.commonMistakes.map((cm, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span>{cm}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-onyx border border-graphite p-8">
          <h2 className="text-subheading font-medium text-chalk mb-6">
            Frequently Asked Questions ({data.name})
          </h2>
          <div className="space-y-6">
            {data.faqs.map((faq, idx) => (
              <div key={idx} className="border-b border-graphite/60 pb-4 last:border-0 last:pb-0">
                <h3 className="text-body font-medium text-chalk mb-2">{faq.question}</h3>
                <p className="text-note text-bone leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
