import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'

import { appOrigin, readBody, requireAutomation } from '@/features/automation/config'
import { AutomationError } from '@/features/automation/errors'
import { errorResponse } from '@/features/automation/http'
import { authenticate } from '@/features/automation/oauth'
import { createAutomationServer } from '@/features/automation/tools'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    requireAutomation()
    const origin = request.headers.get('origin')
    if (origin && origin !== appOrigin())
      throw new AutomationError('INVALID_ORIGIN', 'Origin is not allowed.', 403)
    const parsedBody = JSON.parse(await readBody(request))
    // Protocol keepalives carry no account data and must not wake PostgreSQL.
    // All initialization, discovery and tool calls still authenticate below.
    if (
      parsedBody?.jsonrpc === '2.0' &&
      parsedBody.method === 'ping' &&
      (typeof parsedBody.id === 'string' ||
        (typeof parsedBody.id === 'number' && Number.isFinite(parsedBody.id))) &&
      (parsedBody.params === undefined ||
        (parsedBody.params !== null &&
          typeof parsedBody.params === 'object' &&
          !Array.isArray(parsedBody.params) &&
          Object.keys(parsedBody.params).length === 0))
    ) {
      return Response.json(
        { jsonrpc: '2.0', id: parsedBody.id, result: {} },
        { headers: { 'Cache-Control': 'no-store' } }
      )
    }
    const actor = await authenticate(request)
    const server = createAutomationServer(actor)
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    })
    await server.connect(transport)
    try {
      const response = await transport.handleRequest(request, { parsedBody })
      // JSON-only stateless responses are fully materialized before closing the transport.
      const body = await response.text()
      return new Response(body || null, {
        status: response.status,
        headers: { ...Object.fromEntries(response.headers), 'Cache-Control': 'no-store' },
      })
    } finally {
      await server.close()
    }
  } catch (error) {
    const response = errorResponse(error)
    if (error instanceof AutomationError && error.status === 401)
      response.headers.set(
        'WWW-Authenticate',
        `Bearer resource_metadata="${appOrigin()}/.well-known/oauth-protected-resource/mcp"`
      )
    return response
  }
}
export function GET() {
  return new Response(null, {
    status: 405,
    headers: { Allow: 'POST', 'Cache-Control': 'no-store' },
  })
}
export function DELETE() {
  return GET()
}
