import { describe, expect, it } from 'vitest'

import { verifyGitHubOidcToken } from './githubOidc'

function createMockJwt(header: any, payload: any): string {
  const h = Buffer.from(JSON.stringify(header)).toString('base64url')
  const p = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const s = Buffer.from('mock_signature').toString('base64url')
  return `${h}.${p}.${s}`
}

describe('GitHub Actions OIDC Token Verification Suite', () => {
  it('rejects malformed tokens', async () => {
    const res1 = await verifyGitHubOidcToken('invalid-token')
    expect(res1.valid).toBe(false)
    expect(res1.error).toContain('Malformed')

    const res2 = await verifyGitHubOidcToken('a.b.c.d')
    expect(res2.valid).toBe(false)
  })

  it('rejects tokens with invalid issuer', async () => {
    const token = createMockJwt(
      { alg: 'none', typ: 'JWT' },
      {
        iss: 'https://evil.com',
        aud: 'gitascii-pro',
        repository_owner: 'alice',
        repository: 'alice/alice',
        actor: 'alice',
        exp: Math.floor(Date.now() / 1000) + 3600,
      }
    )

    const res = await verifyGitHubOidcToken(token, 'gitascii-pro')
    expect(res.valid).toBe(false)
    expect(res.error).toContain('Invalid issuer')
  })

  it('rejects expired tokens', async () => {
    const token = createMockJwt(
      { alg: 'none', typ: 'JWT' },
      {
        iss: 'https://token.actions.githubusercontent.com',
        aud: 'gitascii-pro',
        repository_owner: 'alice',
        repository: 'alice/alice',
        actor: 'alice',
        exp: Math.floor(Date.now() / 1000) - 1000,
      }
    )

    const res = await verifyGitHubOidcToken(token, 'gitascii-pro')
    expect(res.valid).toBe(false)
    expect(res.error).toContain('Token expired')
  })

  it('rejects audience mismatch', async () => {
    const token = createMockJwt(
      { alg: 'none', typ: 'JWT' },
      {
        iss: 'https://token.actions.githubusercontent.com',
        aud: 'other-service',
        repository_owner: 'alice',
        repository: 'alice/alice',
        actor: 'alice',
        exp: Math.floor(Date.now() / 1000) + 3600,
      }
    )

    const res = await verifyGitHubOidcToken(token, 'gitascii-pro')
    expect(res.valid).toBe(false)
    expect(res.error).toContain('Audience mismatch')
  })

  it('accepts valid token in test environment', async () => {
    const token = createMockJwt(
      { alg: 'none', typ: 'JWT' },
      {
        iss: 'https://token.actions.githubusercontent.com',
        aud: 'gitascii-pro',
        repository_owner: 'octocat',
        repository: 'octocat/octocat',
        actor: 'octocat',
        workflow: 'GitAscii Sync',
        exp: Math.floor(Date.now() / 1000) + 3600,
      }
    )

    const res = await verifyGitHubOidcToken(token, 'gitascii-pro')
    expect(res.valid).toBe(true)
    expect(res.claims?.repository_owner).toBe('octocat')
    expect(res.claims?.repository).toBe('octocat/octocat')
  })
})
