function initializeSentry(Sentry: typeof import('@sentry/nextjs')) {
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

    beforeSend(event: any, hint: any) {
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
        event.exception?.values?.some((val: any) =>
          val.stacktrace?.frames?.some(
            (frame: any) =>
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
}

let sentryPromise: Promise<typeof import('@sentry/nextjs')> | undefined

function loadSentry() {
  sentryPromise ??= import('@sentry/nextjs').then((Sentry) => {
    initializeSentry(Sentry)
    window.removeEventListener('error', captureEarlyError)
    window.removeEventListener('unhandledrejection', captureEarlyRejection)
    return Sentry
  })
  return sentryPromise
}

function captureEarlyError(event: ErrorEvent) {
  if (!event.error && !event.message) return
  void loadSentry()
    .then((Sentry) => Sentry.captureException(event.error ?? new Error(event.message)))
    .catch(() => {})
}

function captureEarlyRejection(event: PromiseRejectionEvent) {
  void loadSentry()
    .then((Sentry) => Sentry.captureException(event.reason))
    .catch(() => {})
}

if (window.location.pathname === '/') {
  window.addEventListener('error', captureEarlyError)
  window.addEventListener('unhandledrejection', captureEarlyRejection)
} else {
  void loadSentry().catch(() => {})
}

export function onRouterTransitionStart(href: string, navigationType: string) {
  void loadSentry()
    .then((Sentry) => Sentry.captureRouterTransitionStart(href, navigationType))
    .catch(() => {})
}
