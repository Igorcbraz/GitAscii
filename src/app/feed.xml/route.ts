import { NextResponse } from 'next/server'

import { APP_URL } from '@/constants'

export const dynamic = 'force-static'

export async function GET() {
  const baseUrl = APP_URL
  const pubDate = new Date().toUTCString()

  const items = [
    {
      title: 'GitAscii — Premium GitHub Profile README & ASCII Art Generator',
      link: `${baseUrl}`,
      description:
        'Build stunning GitHub Profile READMEs with live SVG stats, custom ASCII art engine, and a visual editor.',
      pubDate,
    },
    {
      title: '13+ Best GitHub Profile README Templates (2026)',
      link: `${baseUrl}/templates`,
      description:
        'Explore 13+ handcrafted, responsive GitHub Profile README templates including Terminal, Minimal, Cyberpunk, Dracula, and Nord.',
      pubDate,
    },
    {
      title: 'Free GitHub Profile Widgets & Dynamic SVGs',
      link: `${baseUrl}/widgets`,
      description:
        'Discover dynamic SVG widgets for GitHub profile READMEs: live stats cards, streak counters, and ASCII banners.',
      pubDate,
    },
    {
      title: 'Explore Developer Profile README Examples',
      link: `${baseUrl}/explore`,
      description:
        'Discover featured developer profiles, GitHub README examples, and ASCII portfolios.',
      pubDate,
    },
    {
      title: 'GitHub Profile README Guides & Tutorials',
      link: `${baseUrl}/guides`,
      description:
        'Comprehensive tutorials on building professional GitHub Profile READMEs and automating theme switching.',
      pubDate,
    },
    {
      title: 'GitAscii vs Competitors & Alternatives',
      link: `${baseUrl}/vs`,
      description: 'Feature comparison matrix between GitAscii, Readme.so, and GPRM.',
      pubDate,
    },
  ]

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>GitAscii — GitHub Profile README &amp; ASCII Art Generator</title>
    <link>${baseUrl}</link>
    <description>Dynamic SVG widgets, ASCII art engine, and visual editor for GitHub profile READMEs.</description>
    <language>en-us</language>
    <pubDate>${pubDate}</pubDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items
      .map(
        (item) => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.link}</guid>
      <description><![CDATA[${item.description}]]></description>
      <pubDate>${item.pubDate}</pubDate>
    </item>`
      )
      .join('')}
  </channel>
</rss>`

  return new NextResponse(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
    },
  })
}
