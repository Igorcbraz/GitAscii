import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: 'https://270e37f22093789f435508f64600f3ff@o4511883467751424.ingest.us.sentry.io/4511883474567168',

  tracesSampleRate: 0.05,

  ignoreErrors: [
    'The destination stream closed early',
    'failed to pipe response',
    'Router action dispatched before initialization',
    'The router state header was sent but could not be parsed',
    "NotFoundError: Failed to execute 'removeChild' on 'Node'",
    "Failed to execute 'removeChild' on 'Node'",
    'The node to be removed is not a child of this node',
    "NotFoundError: Failed to execute 'insertBefore' on 'Node'",
    "Failed to execute 'insertBefore' on 'Node'",
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

  dataCollection: {},
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
