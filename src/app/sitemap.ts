import type { MetadataRoute } from 'next'

import { APP_URL } from '@/constants'
import { WIDGET_DOCS_MAP } from '@/constants/widgets'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = APP_URL

  const staticHubs = [
    '',
    '/templates',
    '/widgets',
    '/explore',
    '/guides',
    '/vs',
    '/privacy',
    '/terms',
    '/support',
    '/watch/gitascii-overview',
  ]

  const stackTemplates = [
    '/templates/react',
    '/templates/nextjs',
    '/templates/python',
    '/templates/node',
    '/templates/go',
    '/templates/rust',
  ]

  const widgetPages = Object.keys(WIDGET_DOCS_MAP).map((id) => `/widgets/${id}`)

  const vsPages = ['/vs/readme-so', '/vs/gprm', '/vs/github-profile-readme-generator']

  const allPaths = [...staticHubs, ...stackTemplates, ...widgetPages, ...vsPages]

  return allPaths.map((path) => ({
    url: `${baseUrl}${path}`,
  }))
}
