import { z } from 'zod'

import { renderSvg } from '@/engine/core/SVGEngine'
import { readDraft } from '@/features/automation/drafts'
import { slugSchema } from '@/features/automation/editor'
import { browserActor, errorResponse, privateHeaders } from '@/features/automation/http'
import { fetchGitHubProfile } from '@/features/github/api/fetchProfile'
import { sanitizeSvg } from '@/utils/svgSanitizer'

export async function GET(request: Request) {
  try {
    const actor = await browserActor()
    const params = new URL(request.url).searchParams
    const slug = slugSchema.parse(params.get('slug') || 'default')
    const format = z.enum(['svg', 'json']).parse(params.get('format') || 'json')
    const theme = z.enum(['dark', 'light']).parse(params.get('theme') || 'dark')
    const { config } = await readDraft(actor, slug)
    const content =
      format === 'json'
        ? JSON.stringify(config, null, 2)
        : sanitizeSvg(renderSvg(config, await fetchGitHubProfile(actor.username), { theme }))
    return new Response(content, {
      headers: {
        ...privateHeaders,
        'Content-Type': format === 'json' ? 'application/json' : 'image/svg+xml',
        'Content-Disposition': `attachment; filename="gitascii_${slug}.${format}"`,
        'Content-Security-Policy': "sandbox; default-src 'none'",
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    return errorResponse(error)
  }
}
