// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: 'https://270e37f22093789f435508f64600f3ff@o4511883467751424.ingest.us.sentry.io/4511883474567168',

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 0.05,

  ignoreErrors: [
    'The destination stream closed early',
    'failed to pipe response',
    'Router action dispatched before initialization',
    'The router state header was sent but could not be parsed',
    // DOM errors caused by Google Translate or browser extension DOM manipulations
    "NotFoundError: Failed to execute 'removeChild' on 'Node'",
    "Failed to execute 'removeChild' on 'Node'",
    'The node to be removed is not a child of this node',
    "NotFoundError: Failed to execute 'insertBefore' on 'Node'",
    "Failed to execute 'insertBefore' on 'Node'",
    // Browser extensions / injected scripts
    /tronlinkParams/i,
    /'set' on proxy: trap returned falsish/i,
    /ResizeObserver loop completed with undelivered notifications/,
    /ResizeObserver loop limit exceeded/,
  ],

  beforeSend(event, hint) {
    const error = hint?.originalException
    const message =
      (typeof error === 'string' ? error : error instanceof Error ? error.message : '') ||
      event.message ||
      ''

    if (
      message.includes('tronlinkParams') ||
      message.includes('removeChild') ||
      message.includes('The node to be removed is not a child of this node')
    ) {
      return null
    }

    if (
      event.exception?.values?.some((val) =>
        val.stacktrace?.frames?.some(
          (frame) =>
            frame.filename?.includes('chrome-extension://') ||
            frame.filename?.includes('moz-extension://') ||
            frame.filename?.includes('safari-web-extension://') ||
            frame.filename?.includes('injected')
        )
      )
    ) {
      return null
    }

    return event
  },

  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: [],
  },
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
