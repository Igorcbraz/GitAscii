import { describe, expect, it } from 'vitest'

import { de } from '@/i18n/locales/de'
import { en } from '@/i18n/locales/en'
import { es } from '@/i18n/locales/es'
import { fr } from '@/i18n/locales/fr'
import { ja } from '@/i18n/locales/ja'
import { pt } from '@/i18n/locales/pt'
import { zh } from '@/i18n/locales/zh'

import { getProPricing } from './pricing'

describe('localized Pro lifetime pricing', () => {
  it.each([
    ['pt', 'BRL', 'R$ 29,90', 'R$ 69,90', 57],
    ['en', 'USD', '$9', '$19', 53],
    ['de', 'EUR', '9 €', '19 €', 53],
    ['fr', 'EUR', '9 €', '19 €', 53],
    ['es', 'EUR', '9 €', '19 €', 53],
    ['ja', 'JPY', '¥1,400', '¥3,000', 53],
    ['zh', 'USD', '$9', '$19', 53],
  ])(
    'returns the expected lifetime offer for %s',
    (language, currency, price, originalPrice, discount) => {
      const pricing = getProPricing(language)

      expect(pricing.billingModel).toBe('lifetime')
      expect(pricing.currency).toBe(currency)
      expect(pricing.priceFormatted).toBe(price)
      expect(pricing.originalPriceFormatted).toBe(originalPrice)
      expect(pricing.discountPercentage).toBe(discount)
      expect(pricing.guaranteeDays).toBe(14)
    }
  )

  it('normalizes language casing and safely falls back to USD', () => {
    expect(getProPricing('PT').currency).toBe('BRL')
    expect(getProPricing('unknown').currency).toBe('USD')
    expect(getProPricing().currency).toBe('USD')
  })

  it.each([
    ['pt', pt, '29,90'],
    ['en', en, '9'],
    ['de', de, '9'],
    ['es', es, '9'],
    ['fr', fr, '9'],
    ['ja', ja, '1,400'],
    ['zh', zh, '9'],
  ])('keeps the lifetime FAQ and comparison copy aligned for %s', (_, locale, expectedPrice) => {
    expect(locale['pro.pricing.faq.lifetime_a']).toContain(expectedPrice)
    expect(locale['pro.pricing.comp.pro_recurring_val']).toContain(expectedPrice)
  })
})
