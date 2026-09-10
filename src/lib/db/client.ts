import type { NeonQueryFunction } from '@neondatabase/serverless'
import { neon } from '@neondatabase/serverless'

let cachedSql: NeonQueryFunction<false, false> | null = null
let cachedDirectSql: NeonQueryFunction<false, false> | null = null

export function hasDbConfig(): boolean {
  return Boolean(process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED)
}

export function getDbUrl(): string {
  const rawUrl = process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED
  if (!rawUrl) {
    throw new Error('DATABASE_URL is not defined in environment variables.')
  }
  return rawUrl.trim().replace(/^["']|["']$/g, '')
}

export function getDbClient(): NeonQueryFunction<false, false> {
  if (!cachedSql) {
    const dbUrl = getDbUrl()
    cachedSql = neon(dbUrl)
  }

  return cachedSql
}

export function getDirectDbClient(): NeonQueryFunction<false, false> {
  if (!cachedDirectSql) {
    const rawUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
    if (!rawUrl) throw new Error('DATABASE_URL_UNPOOLED or DATABASE_URL is not defined.')
    cachedDirectSql = neon(rawUrl.trim().replace(/^["']|["']$/g, ''))
  }
  return cachedDirectSql
}

export const sql = (
  strings: TemplateStringsArray,
  ...values: any[]
): Promise<Record<string, any>[]> => {
  const client = getDbClient()
  return client(strings, ...values)
}

export const transaction = (queriesOrFn: any, opts?: any): Promise<any> => {
  const client = getDbClient()
  return client.transaction(queriesOrFn, opts)
}

export const directSql = (
  strings: TemplateStringsArray,
  ...values: any[]
): Promise<Record<string, any>[]> => getDirectDbClient()(strings, ...values)
