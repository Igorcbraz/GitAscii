import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { APP_URL } from '@/constants'
import { TemplateDetailClient } from '@/features/templates/TemplateDetailClient'

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
  <source media="(prefers-color-scheme: dark)" srcset="${APP_URL}/api/YOUR_USERNAME?theme=tokyo-night">
  <source media="(prefers-color-scheme: light)" srcset="${APP_URL}/api/YOUR_USERNAME?theme=minimal">
  <img alt="React Developer Stats" src="${APP_URL}/api/YOUR_USERNAME">
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
![Next.js Profile](${APP_URL}/api/YOUR_USERNAME?theme=terminal)`,
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
![Python Profile](${APP_URL}/api/YOUR_USERNAME?theme=nord)`,
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
![Node.js Profile](${APP_URL}/api/YOUR_USERNAME?theme=matrix)`,
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
![Go Profile](${APP_URL}/api/YOUR_USERNAME?theme=dracula)`,
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
![Rust Profile](${APP_URL}/api/YOUR_USERNAME?theme=gruvbox)`,
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

  const url = `${APP_URL}/templates/${stack}`

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
        item: APP_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Templates',
        item: `${APP_URL}/templates`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: data.name,
        item: `${APP_URL}/templates/${data.slug}`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <TemplateDetailClient data={data} allStackKeys={allStackKeys} stacks={stacks} />
    </>
  )
}
