import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://git-ascii.vercel.app'
  const currentDate = new Date()

  const staticHubs = [
    '',
    '/templates',
    '/widgets',
    '/explore',
    '/guides',
    '/vs',
    '/privacy',
    '/terms',
  ]

  const stackTemplates = [
    '/templates/react',
    '/templates/nextjs',
    '/templates/python',
    '/templates/node',
    '/templates/go',
    '/templates/rust',
  ]

  const widgetPages = [
    '/widgets/stats',
    '/widgets/streak',
    '/widgets/languages',
    '/widgets/ascii',
    '/widgets/badges',
  ]

  const vsPages = ['/vs/readme-so', '/vs/gprm', '/vs/github-profile-readme-generator']

  const sampleProfiles = ['torvalds', 'gaearon', 'yyx990803', 'sindresorhus', 'tj', 'Igorcbraz']

  const allPaths = [...staticHubs, ...stackTemplates, ...widgetPages, ...vsPages]

  const sitemapEntries: MetadataRoute.Sitemap = allPaths.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: currentDate,
    changeFrequency: path === '' || path === '/templates' ? 'daily' : 'weekly',
    priority:
      path === '' ? 1.0 : path.startsWith('/templates') || path.startsWith('/widgets') ? 0.9 : 0.8,
    alternates:
      path === ''
        ? {
            languages: {
              en: `${baseUrl}`,
              pt: `${baseUrl}?lang=pt`,
              es: `${baseUrl}?lang=es`,
            },
          }
        : undefined,
  }))

  const profileEntries: MetadataRoute.Sitemap = sampleProfiles.map((username) => ({
    url: `${baseUrl}/${username}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const feedEntries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/feed.xml`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/feed.json`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/llms.txt`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]

  return [...sitemapEntries, ...profileEntries, ...feedEntries]
}
