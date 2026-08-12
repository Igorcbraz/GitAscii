import { NextResponse } from 'next/server'

import { APP_URL } from '@/constants'

export const dynamic = 'force-static'

export async function GET() {
  const baseUrl = APP_URL

  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'GitAscii — GitHub Profile README & ASCII Art Generator',
    home_page_url: baseUrl,
    feed_url: `${baseUrl}/feed.json`,
    description:
      'Dynamic SVG widgets, ASCII art engine, and visual editor for GitHub profile READMEs.',
    icon: `${baseUrl}/icon-512.png`,
    favicon: `${baseUrl}/favicon.ico`,
    items: [
      {
        id: `${baseUrl}`,
        url: `${baseUrl}`,
        title: 'GitAscii — Premium GitHub Profile README Generator',
        content_text:
          'Build stunning GitHub Profile READMEs with live SVG stats and custom ASCII art.',
      },
      {
        id: `${baseUrl}/templates`,
        url: `${baseUrl}/templates`,
        title: '13+ Best GitHub Profile README Templates (2026)',
        content_text:
          'Handcrafted GitHub Profile README templates including Terminal, Minimal, Cyberpunk, and Dracula.',
      },
      {
        id: `${baseUrl}/widgets`,
        url: `${baseUrl}/widgets`,
        title: 'Free GitHub Profile Widgets & Dynamic SVGs',
        content_text: 'Live stats cards, streak counters, language graphs, and ASCII art banners.',
      },
      {
        id: `${baseUrl}/explore`,
        url: `${baseUrl}/explore`,
        title: 'Explore GitHub Profile README Examples',
        content_text: 'Directory of featured developer profiles and ASCII portfolios.',
      },
      {
        id: `${baseUrl}/guides`,
        url: `${baseUrl}/guides`,
        title: 'GitHub Profile README Guides & Tutorials',
        content_text: 'Comprehensive tutorials on building professional GitHub Profile READMEs.',
      },
      {
        id: `${baseUrl}/vs`,
        url: `${baseUrl}/vs`,
        title: 'GitAscii vs Competitors & Alternatives',
        content_text: 'Feature comparison matrix between GitAscii, Readme.so, and GPRM.',
      },
    ],
  }

  return NextResponse.json(feed, {
    headers: {
      'Content-Type': 'application/feed+json; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
    },
  })
}
