import type { MetadataRoute } from 'next'

import { APP_URL } from '@/constants'

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
    'OAI-SearchBot',
    'ClaudeBot',
    'Claude-Web',
    'anthropic-ai',
    'PerplexityBot',
    'Google-Extended',
    'Cohere-ai',
    'Meta-ExternalAgent',
    'Bytespider',
    'CCBot',
    'Amazonbot',
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
        '/vs',
        '/privacy',
        '/terms',
        '/.well-known/llms.txt',
        '/llms.txt',
        '/llms-full.txt',
        '/feed.xml',
        '/feed.json',
        '/api/svg/',
        '/api/*$',
      ],
      disallow: ['/api/auth/', '/api/save/', '/_next/'],
    })),
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL,
  }
}
