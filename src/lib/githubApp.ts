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

  privateKey = privateKey.replace(/\\n/g, '\n')

  const header = {
    alg: 'RS256',
    typ: 'JWT',
  }

  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iat: now - 60,
    exp: now + 10 * 60,
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

export async function getAppInstallUrl(): Promise<string> {
  try {
    const jwt = generateGitHubAppJWT()
    const appRes = await fetch(API_ENDPOINTS.GITHUB.APP_INFO, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'GitAscii-App',
      },
    })
    if (appRes.ok) {
      const appData = await appRes.json()
      return `${appData.html_url}/installations/new`
    }
  } catch (e) {
    console.error(e)
  }
  return API_ENDPOINTS.GITHUB.APP_DEV_INSTALL
}
