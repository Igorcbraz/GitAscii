import crypto from 'crypto'
import { cookies } from 'next/headers'

const SESSION_COOKIE_NAME = 'gitascii_session'
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30 // 30 days

function getSecretKey(): Buffer {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'SESSION_SECRET environment variable is required in production and must be at least 32 characters.'
      )
    }

    return Buffer.from(
      crypto.hkdfSync(
        'sha256',
        Buffer.from('gitascii-dev-fallback-session-key-32chars-min-ok'),
        Buffer.from('gitascii-session-salt-v1'),
        Buffer.from('gitascii-session-encryption-v1'),
        32
      )
    )
  }

  if (secret.length < 32 && process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET must be at least 32 characters long in production.')
  }

  return Buffer.from(
    crypto.hkdfSync(
      'sha256',
      Buffer.from(secret, 'utf-8'),
      Buffer.from('gitascii-session-salt-v1'),
      Buffer.from('gitascii-session-encryption-v1'),
      32
    )
  )
}

export interface UserSession {
  username: string
  githubId: number
  accessToken?: string
  createdAt?: number
  expiresAt?: number
}

export function encryptSession(text: string): string {
  const key = getSecretKey()
  const iv = crypto.randomBytes(12) // 96-bit standard GCM IV
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  let encrypted = cipher.update(text, 'utf8', 'base64')
  encrypted += cipher.final('base64')
  const authTag = cipher.getAuthTag()

  // Format: iv:authTag:ciphertext (base64url safe)
  return `${iv.toString('base64url')}.${authTag.toString('base64url')}.${Buffer.from(encrypted, 'base64').toString('base64url')}`
}

export function decryptSession(packed: string): string | null {
  try {
    const parts = packed.split('.')
    if (parts.length !== 3) return null

    const [ivB64, tagB64, dataB64] = parts
    if (!ivB64 || !tagB64 || !dataB64) return null

    const iv = Buffer.from(ivB64, 'base64url')
    const authTag = Buffer.from(tagB64, 'base64url')
    const encrypted = Buffer.from(dataB64, 'base64url')

    if (iv.length !== 12 || authTag.length !== 16) return null

    const key = getSecretKey()
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted, undefined, 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch {
    return null
  }
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

  if (!sessionCookie || !sessionCookie.value) {
    return null
  }

  const decrypted = decryptSession(sessionCookie.value)
  if (!decrypted) return null

  try {
    const session = JSON.parse(decrypted) as UserSession
    if (!session || typeof session !== 'object' || !session.username || !session.githubId) {
      return null
    }

    if (session.expiresAt && Date.now() > session.expiresAt) {
      return null
    }

    return session
  } catch {
    return null
  }
}

export async function setSession(session: UserSession): Promise<void> {
  const cookieStore = await cookies()
  const now = Date.now()
  const sessionPayload: UserSession = {
    ...session,
    createdAt: session.createdAt || now,
    expiresAt: now + SESSION_TTL_SECONDS * 1000,
  }

  const encrypted = encryptSession(JSON.stringify(sessionPayload))
  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: encrypted,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  })
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}
