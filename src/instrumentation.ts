import * as Sentry from '@sentry/nextjs'
import { EventEmitter } from 'events'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    EventEmitter.defaultMaxListeners = 30
    await import('../sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config')
  }
}

export const onRequestError = Sentry.captureRequestError
