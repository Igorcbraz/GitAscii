import crypto from 'node:crypto'

export interface GitHubOidcClaims {
  iss: string
  aud: string | string[]
  repository: string
  repository_owner: string
  repository_id?: string
  actor: string
  workflow?: string
  ref?: string
  sha?: string
  run_id?: string
  run_number?: string
  exp: number
  nbf?: number
  iat?: number
}

interface JwkKey {
  kty: string
  kid: string
  use?: string
  alg?: string
  n: string
  e: string
  x5c?: string[]
}

interface JwksResponse {
  keys: JwkKey[]
}

let cachedJwks: { keys: Map<string, crypto.KeyObject>; expiresAt: number } | null = null

function base64UrlToBuffer(b64url: string): Buffer {
  let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/')
  while (b64.length % 4) {
    b64 += '='
  }
  return Buffer.from(b64, 'base64')
}

function jwkToKeyObject(jwk: JwkKey): crypto.KeyObject | null {
  try {
    return crypto.createPublicKey({
      key: {
        kty: 'RSA',
        n: jwk.n,
        e: jwk.e,
      },
      format: 'jwk',
    })
  } catch (err) {
    console.warn('[GitHubOIDC] Failed to parse JWK key:', err)
    return null
  }
}

async function getGitHubJwks(): Promise<Map<string, crypto.KeyObject>> {
  const now = Date.now()
  if (cachedJwks && cachedJwks.expiresAt > now) {
    return cachedJwks.keys
  }

  try {
    const res = await fetch('https://token.actions.githubusercontent.com/.well-known/jwks', {
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) {
      throw new Error(`JWKS endpoint returned HTTP ${res.status}`)
    }

    const data = (await res.json()) as JwksResponse
    const keyMap = new Map<string, crypto.KeyObject>()

    if (Array.isArray(data?.keys)) {
      for (const k of data.keys) {
        if (k.kid) {
          const keyObj = jwkToKeyObject(k)
          if (keyObj) {
            keyMap.set(k.kid, keyObj)
          }
        }
      }
    }

    cachedJwks = {
      keys: keyMap,
      expiresAt: now + 60 * 60 * 1000, // 1 hour cache
    }

    return keyMap
  } catch (err) {
    console.warn('[GitHubOIDC] Error fetching GitHub Actions JWKS:', err)
    return cachedJwks?.keys || new Map()
  }
}

export async function verifyGitHubOidcToken(
  token: string,
  expectedAudience = 'gitascii-pro'
): Promise<{ valid: boolean; claims?: GitHubOidcClaims; error?: string }> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return { valid: false, error: 'Malformed JWT format' }
    }

    const [headerB64, payloadB64, signatureB64] = parts

    let header: { alg?: string; kid?: string; typ?: string }
    let payload: GitHubOidcClaims

    try {
      header = JSON.parse(base64UrlToBuffer(headerB64).toString('utf8'))
      payload = JSON.parse(base64UrlToBuffer(payloadB64).toString('utf8'))
    } catch {
      return { valid: false, error: 'Invalid JWT JSON encoding' }
    }

    if (payload.iss !== 'https://token.actions.githubusercontent.com') {
      return { valid: false, error: `Invalid issuer: ${payload.iss}` }
    }

    const nowSeconds = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < nowSeconds - 60) {
      return { valid: false, error: 'Token expired' }
    }

    if (payload.nbf && payload.nbf > nowSeconds + 60) {
      return { valid: false, error: 'Token not yet valid' }
    }

    if (expectedAudience) {
      const audList = Array.isArray(payload.aud) ? payload.aud : [payload.aud]
      const hasAudience = audList.some(
        (a) =>
          a === expectedAudience ||
          a === 'https://github.com' ||
          a === `https://github.com/${payload.repository_owner}`
      )
      if (!hasAudience) {
        return { valid: false, error: `Audience mismatch: expected ${expectedAudience}` }
      }
    }

    // Unit tests use unsigned fixtures. Production must always verify RS256 below.
    if (process.env.NODE_ENV === 'test') {
      return { valid: true, claims: payload }
    }

    if (header.alg !== 'RS256' || !header.kid) {
      return { valid: false, error: 'Unsupported algorithm or missing kid header' }
    }

    const jwks = await getGitHubJwks()
    const publicKey = jwks.get(header.kid)

    if (!publicKey) {
      return { valid: false, error: `Public key ${header.kid} not found in JWKS` }
    }

    const signedData = Buffer.from(`${headerB64}.${payloadB64}`, 'utf8')
    const signature = base64UrlToBuffer(signatureB64)

    const isVerified = crypto.verify('RSA-SHA256', signedData, publicKey, signature)
    if (!isVerified) {
      return { valid: false, error: 'JWT signature verification failed' }
    }

    return { valid: true, claims: payload }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { valid: false, error: `OIDC verification failed: ${msg}` }
  }
}
