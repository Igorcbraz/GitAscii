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
  ],

  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: [],
  },
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
