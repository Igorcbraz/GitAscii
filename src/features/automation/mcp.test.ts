import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { afterEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  entitlements: vi.fn(),
  github: vi.fn(),
  analytics: vi.fn(),
  writeDraft: vi.fn(),
  authenticate: vi.fn(),
}))
vi.mock('@/features/pro/server/entitlements', () => ({
  getProEntitlements: mocks.entitlements,
  getUserSettings: vi.fn(),
  updateUserSettings: vi.fn(),
}))
vi.mock('@/features/github/api/fetchProfile', () => ({ fetchGitHubProfile: mocks.github }))
vi.mock('@/features/pro/server/analyticsStore', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/pro/server/analyticsStore')>()),
  getAnalyticsSummary: mocks.analytics,
}))
vi.mock('./drafts', () => ({ readDraft: vi.fn(), writeDraft: mocks.writeDraft }))
vi.mock('./oauth', () => ({ authenticate: mocks.authenticate }))

import { POST } from '@/app/mcp/route'

import { SCOPES } from './config'
import { AutomationError } from './errors'
import { createAutomationServer } from './tools'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.clearAllMocks()
})

async function connect(scopes: readonly string[]) {
  const server = createAutomationServer({ username: 'alice', githubId: 1, scopes })
  const client = new Client({ name: 'test-client', version: '1' })
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
  await server.connect(serverTransport)
  await client.connect(clientTransport)
  return {
    client,
    close: async () => {
      await client.close()
      await server.close()
    },
  }
}

describe('MCP SDK tool contract', () => {
  it('answers protocol keepalives without database authentication or account data', async () => {
    vi.stubEnv('GITASCII_MCP_ENABLED', 'true')
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://gitascii.test')
    const response = await POST(
      new Request('https://gitascii.test/mcp', {
        method: 'POST',
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'ping' }),
      })
    )
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ jsonrpc: '2.0', id: 1, result: {} })
    expect(mocks.authenticate).not.toHaveBeenCalled()
  })

  it('does not let a keepalive bypass origin checks or the deployment switch', async () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://gitascii.test')
    const request = () =>
      new Request('https://gitascii.test/mcp', {
        method: 'POST',
        headers: { origin: 'https://other.test' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'ping' }),
      })
    vi.stubEnv('GITASCII_MCP_ENABLED', 'false')
    expect((await POST(request())).status).toBe(503)
    vi.stubEnv('GITASCII_MCP_ENABLED', 'true')
    expect((await POST(request())).status).toBe(403)
    expect(mocks.authenticate).not.toHaveBeenCalled()
  })

  it('initializes with the official client and exposes valid schemas, permissions and annotations', async () => {
    const { client, close } = await connect(SCOPES)
    try {
      const { tools } = await client.listTools()
      expect(tools.length).toBeGreaterThan(25)
      expect(tools.every((tool) => tool.inputSchema.type === 'object')).toBe(true)
      expect(
        tools.find((tool) => tool.name === 'get_github_profile')?.annotations?.readOnlyHint
      ).toBe(true)
      expect(
        tools.find((tool) => tool.name === 'publish_draft')?.annotations?.destructiveHint
      ).toBe(true)
      expect(tools.some((tool) => /checkout|purchase|grant_pro|dev_toggle/.test(tool.name))).toBe(
        false
      )
      const result = await client.callTool({ name: 'list_templates', arguments: {} })
      expect(result.isError).not.toBe(true)
      expect(result.structuredContent).toHaveProperty('templates')
    } finally {
      await close()
    }
  })
  it('rejects writes from read-only grants before running business logic and requests the correct scopes', async () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://gitascii.test')
    const { client, close } = await connect(['profiles:read'])
    try {
      const result = await client.callTool({
        name: 'edit_draft',
        arguments: { expectedRevision: 0, operations: [{ type: 'add', widgetId: 'header' }] },
      })
      expect(result.isError).toBe(true)
      expect(JSON.stringify(result)).toContain('INSUFFICIENT_SCOPE')
      expect(JSON.stringify(result._meta)).toContain('profiles:read profiles:write')
      expect(mocks.writeDraft).not.toHaveBeenCalled()
    } finally {
      await close()
    }
  })
  it('enforces live Pro access and labels proxy analytics without exposing billing metadata', async () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://gitascii.test')
    const { client, close } = await connect(SCOPES)
    try {
      mocks.entitlements.mockResolvedValue({ tier: 'free' })
      const denied = await client.callTool({ name: 'get_analytics', arguments: {} })
      expect(denied.isError).toBe(true)
      expect(JSON.stringify(denied)).toContain('PLAN_REQUIRED')
      expect(mocks.analytics).not.toHaveBeenCalled()
      mocks.entitlements.mockResolvedValue({ tier: 'pro' })
      mocks.analytics.mockResolvedValue({ totalViews: 10 })
      const allowed = await client.callTool({ name: 'get_analytics', arguments: {} })
      expect(allowed.isError).not.toBe(true)
      expect(allowed.structuredContent).toHaveProperty('semantics')
      expect(mocks.analytics).toHaveBeenCalledWith('alice', 'default', '30d')
    } finally {
      await close()
    }
  })
})

describe('stateless Streamable HTTP endpoint', () => {
  const rpcRequest = (body: unknown, headers: Record<string, string> = {}) =>
    new Request('https://gitascii.test/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
        ...headers,
      },
      body: JSON.stringify(body),
    })
  it('denies disabled deployments and supplies OAuth discovery on missing credentials', async () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://gitascii.test')
    vi.stubEnv('GITASCII_MCP_ENABLED', 'false')
    expect((await POST(rpcRequest({}))).status).toBe(503)
    vi.stubEnv('GITASCII_MCP_ENABLED', 'true')
    mocks.authenticate.mockRejectedValue(new AutomationError('UNAUTHORIZED', 'Connect.', 401))
    const response = await POST(rpcRequest({}))
    expect(response.status).toBe(401)
    expect(response.headers.get('www-authenticate')).toContain(
      '/.well-known/oauth-protected-resource/mcp'
    )
  })
  it('rejects cross-origin browser requests and handles an authenticated protocol handshake', async () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://gitascii.test')
    vi.stubEnv('GITASCII_MCP_ENABLED', 'true')
    mocks.authenticate.mockResolvedValue({ username: 'alice', githubId: 1, scopes: SCOPES })
    expect((await POST(rpcRequest({}, { Origin: 'https://evil.test' }))).status).toBe(403)
    expect(mocks.authenticate).not.toHaveBeenCalled()
    const response = await POST(
      rpcRequest({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2025-11-25',
          capabilities: {},
          clientInfo: { name: 'test', version: '1' },
        },
      })
    )
    expect(response.status).toBe(200)
    expect((await response.json()).result.serverInfo.name).toBe('gitascii')
    expect(response.headers.get('cache-control')).toBe('no-store')
  })
})
