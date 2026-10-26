import { z } from 'zod'

import { readBody, requireSameOrigin } from '@/features/automation/config'
import { browserActor, errorResponse, privateHeaders } from '@/features/automation/http'
import { sql } from '@/lib/db/client'

export async function GET() {
  try {
    const actor = await browserActor()
    const connections =
      await sql`SELECT c.id, cl.name, c.scopes, c.created_at, c.expires_at FROM assistant_connections c
      JOIN assistant_clients cl ON c.client_id = cl.id WHERE c.github_id = ${actor.githubId} AND c.revoked_at IS NULL AND c.expires_at > NOW() ORDER BY c.created_at DESC`
    return Response.json({ connections }, { headers: privateHeaders })
  } catch (error) {
    return errorResponse(error)
  }
}
export async function DELETE(request: Request) {
  try {
    requireSameOrigin(request)
    const actor = await browserActor()
    const { id } = z
      .object({ id: z.string().uuid() })
      .strict()
      .parse(JSON.parse(await readBody(request, 1024)))
    await sql`UPDATE assistant_connections SET revoked_at = NOW() WHERE id = ${id}::uuid AND github_id = ${actor.githubId}`
    return Response.json({ revoked: true }, { headers: privateHeaders })
  } catch (error) {
    return errorResponse(error)
  }
}
