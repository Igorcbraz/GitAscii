export const STRIPE_SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  TRIALING: 'trialing',
  PAST_DUE: 'past_due',
  CANCELED: 'canceled',
  UNPAID: 'unpaid',
  INCOMPLETE: 'incomplete',
} as const

export const STRIPE_SEARCH_LIMIT = 1
export const STRIPE_SUBSCRIPTION_LIMIT = 5
