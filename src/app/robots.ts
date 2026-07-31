import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const allowedUserAgents = [
    '*',
    'Googlebot',
    'Googlebot-Image',
    'Googlebot-News',
    'Bingbot',
    'Applebot',
    'GPTBot',
    'ChatGPT-User',
    'ClaudeBot',
    'PerplexityBot',
    'Google-Extended',
    'FacebookExternalHit',
    'LinkedInBot',
    'Slackbot',
    'Discordbot',
  ]

  return {
    rules: allowedUserAgents.map((agent) => ({
      userAgent: agent,
      allow: [
        '/',
        '/templates',
        '/widgets',
        '/explore',
        '/guides',
        '/api/svg/',
        '/api/*$',
        '/llms.txt',
        '/llms-full.txt',
      ],
      disallow: ['/api/auth/', '/api/save/', '/_next/'],
    })),
    sitemap: 'https://git-ascii.vercel.app/sitemap.xml',
    host: 'https://git-ascii.vercel.app',
  }
}
