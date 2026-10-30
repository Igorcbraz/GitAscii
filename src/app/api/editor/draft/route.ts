import { z } from 'zod'

import { readBody, requireSameOrigin } from '@/features/automation/config'
import { readDraft, writeDraft } from '@/features/automation/drafts'
import { layoutSchema, operationSchema, slugSchema } from '@/features/automation/editor'
import { browserActor, errorResponse, privateHeaders } from '@/features/automation/http'
import { rateLimit } from '@/features/automation/oauth'

const changeSchema = z
  .object({
    slug: slugSchema,
    expectedRevision: z.number().int().min(0),
    layout: layoutSchema.optional(),
    operations: z.array(operationSchema).min(1).max(100).optional(),
    history: z.enum(['undo', 'redo']).optional(),
  })
  .strict()
  .refine(
    (v) => [v.layout, v.operations, v.history].filter((x) => x !== undefined).length === 1,
    'Provide exactly one change.'
  )

export async function GET(request: Request) {
  try {
    const actor = await browserActor()
    const draft = await readDraft(
      actor,
      slugSchema.parse(new URL(request.url).searchParams.get('slug') || 'default')
    )
    return Response.json(
      {
        revision: draft.revision,
        config: draft.config,
        canUndo: !!draft.history.past.length,
        canRedo: !!draft.history.future.length,
      },
      { headers: privateHeaders }
    )
  } catch (error) {
    return errorResponse(error)
  }
}
export async function PUT(request: Request) {
  try {
    requireSameOrigin(request)
    const actor = await browserActor()
    await rateLimit(`draft:${actor.githubId}`)
    const body = changeSchema.parse(JSON.parse(await readBody(request)))
    return Response.json(await writeDraft(actor, body.slug, body.expectedRevision, body), {
      headers: privateHeaders,
    })
  } catch (error) {
    return errorResponse(error)
  }
}
