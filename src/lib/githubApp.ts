import crypto from 'crypto'

import { API_ENDPOINTS } from '@/services/endpoints'

function base64url(input: string | Buffer): string {
  return (typeof input === 'string' ? Buffer.from(input) : input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

export function generateGitHubAppJWT(): string {
  const appId = process.env.GITHUB_APP_ID
  let privateKey = process.env.GITHUB_APP_PRIVATE_KEY

  if (!privateKey) {
    throw new Error('Missing GITHUB_APP_PRIVATE_KEY environment variable')
  }

  privateKey = privateKey.replace(/^["']|["']$/g, '')
  privateKey = privateKey.replace(/\\n/g, '\n')

  const header = {
    alg: 'RS256',
    typ: 'JWT',
  }

  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iat: now - 60,
    exp: now + 5 * 60,
    iss: appId,
  }

  const headerEncoded = base64url(JSON.stringify(header))
  const payloadEncoded = base64url(JSON.stringify(payload))

  const dataToSign = `${headerEncoded}.${payloadEncoded}`

  const sign = crypto.createSign('RSA-SHA256')
  sign.update(dataToSign)
  sign.end()

  const signature = sign.sign(privateKey)
  const signatureEncoded = base64url(signature)

  return `${dataToSign}.${signatureEncoded}`
}

export async function getInstallationTokenForUser(
  username: string
): Promise<{ token: string | null; installUrl: string | null }> {
  try {
    const jwt = generateGitHubAppJWT()
    const appRes = await fetch(API_ENDPOINTS.GITHUB.APP_INFO, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'GitAscii-App',
      },
    })

    let htmlUrl = ''
    if (appRes.ok) {
      const appData = await appRes.json()
      htmlUrl = appData.html_url
    }

    const installUrl = htmlUrl
      ? `${htmlUrl}/installations/new`
      : API_ENDPOINTS.GITHUB.APP_DEV_INSTALL

    const instRes = await fetch(API_ENDPOINTS.GITHUB.USER_INSTALLATION(username), {
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'GitAscii-App',
      },
    })

    if (instRes.status === 404) {
      return { token: null, installUrl }
    }

    if (!instRes.ok) {
      throw new Error(`Failed to fetch installation: ${await instRes.text()}`)
    }

    const instData = await instRes.json()
    const installationId = instData.id

    const tokenRes = await fetch(API_ENDPOINTS.GITHUB.INSTALLATION_ACCESS_TOKENS(installationId), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'GitAscii-App',
      },
    })

    if (!tokenRes.ok) {
      throw new Error(`Failed to mint token: ${await tokenRes.text()}`)
    }

    const tokenData = await tokenRes.json()
    return { token: tokenData.token, installUrl }
  } catch (error) {
    console.error('Error getting installation token:', error)
    return { token: null, installUrl: null }
  }
}

export async function getInstallationTokenById(
  installationId: string
): Promise<{ token: string | null; username: string | null }> {
  try {
    const jwt = generateGitHubAppJWT()

    const instRes = await fetch(API_ENDPOINTS.GITHUB.INSTALLATION_DETAILS(installationId), {
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'GitAscii-App',
      },
    })

    if (!instRes.ok) {
      console.error('Failed to fetch installation details', await instRes.text())
      return { token: null, username: null }
    }

    const instData = await instRes.json()
    const username = instData.account.login

    const tokenRes = await fetch(API_ENDPOINTS.GITHUB.INSTALLATION_ACCESS_TOKENS(installationId), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'GitAscii-App',
      },
    })

    if (!tokenRes.ok) {
      console.error('Failed to mint token', await tokenRes.text())
      return { token: null, username: null }
    }

    const tokenData = await tokenRes.json()
    return { token: tokenData.token, username }
  } catch (error) {
    console.error('Error getting installation token by ID:', error)
    return { token: null, username: null }
  }
}

import { unstable_cache } from 'next/cache'

export const getAppInstallations = unstable_cache(
  async (): Promise<string[]> => {
    try {
      const jwt = generateGitHubAppJWT()
      const allLogins: string[] = []

      let url = `${API_ENDPOINTS.GITHUB.APP_INSTALLATIONS}&page=1`
      
      const firstPageRes = await fetch(url, {
        headers: {
          Authorization: `Bearer ${jwt}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'GitAscii-App',
        },
        next: { revalidate: 600 },
        signal: AbortSignal.timeout(10000),
      })

      if (!firstPageRes.ok) {
        console.error(`[getAppInstallations] API error: ${firstPageRes.status}`)
        return []
      }

      const processPageData = (data: any) => {
        if (!Array.isArray(data)) return []
        return data
          .map((inst: any) => inst.account?.login)
          .filter((login): login is string => typeof login === 'string')
      }

      const firstData = await firstPageRes.json()
      allLogins.push(...processPageData(firstData))

      const linkHeader = firstPageRes.headers.get('link') ?? ''
      const lastMatch = linkHeader.match(/[?&]page=(\d+)>;\s*rel="last"/)
      
      if (lastMatch) {
        const lastPage = parseInt(lastMatch[1], 10)
        if (lastPage > 1) {
          const pagePromises = []
          // Limit to max 25 pages to avoid extreme abuse/rate limits during build
          const maxPages = Math.min(lastPage, 25)
          for (let p = 2; p <= maxPages; p++) {
            const pageUrl = `${API_ENDPOINTS.GITHUB.APP_INSTALLATIONS}&page=${p}`
            pagePromises.push(
              fetch(pageUrl, {
                headers: {
                  Authorization: `Bearer ${jwt}`,
                  Accept: 'application/vnd.github.v3+json',
                  'User-Agent': 'GitAscii-App',
                },
                next: { revalidate: 600 },
                signal: AbortSignal.timeout(10000),
              }).then(async (res) => {
                if (res.ok) {
                  return processPageData(await res.json())
                }
                return []
              }).catch(() => [])
            )
          }
          
          const results = await Promise.all(pagePromises)
          for (const logins of results) {
            allLogins.push(...logins)
          }
        }
      }

      return allLogins
    } catch (error) {
      console.warn('Failed to fetch App installations for Explore:', error)
      return []
    }
  },
  ['github-app-installations'],
  { revalidate: 600 }
)

export async function getAppInstallUrl(): Promise<string> {
  try {
    const jwt = generateGitHubAppJWT()
    const appRes = await fetch(API_ENDPOINTS.GITHUB.APP_INFO, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'GitAscii-App',
      },
      signal: AbortSignal.timeout(5000),
    })
    if (appRes.ok) {
      const appData = await appRes.json()
      if (appData && appData.html_url) {
        return `${appData.html_url}/installations/new`
      }
    }
  } catch (e) {
    console.warn('Unable to fetch GitHub App info, falling back to default install URL:', e)
  }
  return API_ENDPOINTS.GITHUB.APP_DEV_INSTALL
}
