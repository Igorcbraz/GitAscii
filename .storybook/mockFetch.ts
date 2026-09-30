type MockResponse = { body: unknown; status?: number }

export function mockStoryFetch(
  resolve: (url: string, init?: RequestInit) => MockResponse | undefined
) {
  const originalFetch = window.fetch
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    const fixture = resolve(url, init)
    if (fixture) {
      return Promise.resolve(
        new Response(JSON.stringify(fixture.body), {
          status: fixture.status ?? 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    }
    return originalFetch(input, init)
  }
  return () => {
    window.fetch = originalFetch
  }
}

export function mockSession(username?: string, stars = 563, isPro = true) {
  return mockStoryFetch((url) => {
    if (url.includes('/api/auth/session')) {
      return {
        body: {
          session: username
            ? { username, githubId: 40432351, isPro, tier: isPro ? 'pro' : 'free' }
            : null,
        },
      }
    }
    if (/^https?:\/\/api\.github\.com(?:\/|$)/.test(url)) {
      return { body: { stargazers_count: stars } }
    }
    if (url.includes('/api/pro/social-proof'))
      return { body: { count: 124, usernames: ['octocat'] } }
    if (url.includes('/api/pro/errors')) return { body: { errors: [] } }
    return undefined
  })
}
