import { afterEach, beforeEach, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ list: vi.fn(), create: vi.fn() }))
vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(function () {
    return { prices: { list: mocks.list }, checkout: { sessions: { create: mocks.create } } }
  }),
}))
vi.mock('@/lib/auth', () => ({ getSession: async () => ({ username: 'alice', githubId: 1 }) }))
vi.mock('@/features/pro/server/entitlements', () => ({ isProUser: async () => false }))
import { POST } from './route'

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_mock')
  vi.stubEnv('STRIPE_PRICE_ID', 'price_old')
  vi.stubEnv('STRIPE_PRICE_LOOKUP_KEY', 'gitascii_pro_lifetime')
  mocks.create.mockResolvedValue({ url: 'https://checkout.stripe.com/mock' })
})
afterEach(() => vi.unstubAllEnvs())
const request = () =>
  new Request('https://gitascii.com/api/pro/subscribe', { method: 'POST', body: '{}' })

it('uses the active lookup price instead of a stale environment price ID', async () => {
  mocks.list.mockResolvedValue({ data: [{ id: 'price_new_usd3' }] })
  expect((await POST(request())).status).toBe(200)
  expect(mocks.list).toHaveBeenCalledWith({
    lookup_keys: ['gitascii_pro_lifetime'],
    active: true,
    limit: 1,
  })
  expect(mocks.create).toHaveBeenCalledWith(
    expect.objectContaining({ line_items: [{ price: 'price_new_usd3', quantity: 1 }] })
  )
})

it('does not charge the stale price when the lookup is missing', async () => {
  mocks.list.mockResolvedValue({ data: [] })
  expect((await POST(request())).status).toBe(500)
  expect(mocks.create).not.toHaveBeenCalled()
})

it('preserves explicitly configured price IDs when lookup is not enabled', async () => {
  vi.stubEnv('STRIPE_PRICE_LOOKUP_KEY', '')
  expect((await POST(request())).status).toBe(200)
  expect(mocks.list).not.toHaveBeenCalled()
  expect(mocks.create).toHaveBeenCalledWith(
    expect.objectContaining({ line_items: [{ price: 'price_old', quantity: 1 }] })
  )
})
