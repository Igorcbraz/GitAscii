# Pro pricing — 2026-10-29

Live Stripe product: `prod_VAf7nwiC2Se8qW`.
New default price: `price_1UW4TTABH3qRfPhdq4K5lJFY`.
Stable lookup key: `gitascii_pro_lifetime`.

| Currency | One-time price |
| -------- | -------------: |
| BRL      |          29.90 |
| USD      |           3.00 |
| AUD      |           4.70 |
| CAD      |           4.00 |
| EUR      |           3.00 |
| GBP      |           2.70 |
| INR      |         233.00 |
| JPY      |            470 |

International prices are fixed commercial amounts reduced proportionally from
the previous USD 9 offer, with local rounding. They are not live FX conversions.
The Brazilian price remains unchanged. All eight live Stripe amounts were read
back and verified. No payment was charged.

Stripe rejects amount changes for existing currencies, so a new price was created
and made the product default. The previous price was kept active so an older
deployment referencing it is not broken before rollout.

Vercel production variables `STRIPE_PRICE_ID` and `STRIPE_PRICE_LOOKUP_KEY` were
updated. They take effect on a new deployment. Cloudflare publication credentials
were unavailable; `wrangler.jsonc` now supplies the stable lookup key on the next
deployment. The checkout resolves that key with Stripe, taking precedence over
an old price ID, and fails instead of charging a stale price if lookup fails.

The frontend pricing constants and six translated FAQ/comparison texts were
updated. Displayed prices remain static code configuration; future changes must
still update this copy as well as Stripe. Locale mappings remain BRL for pt,
EUR for de/fr/es, JPY for ja and USD otherwise. Stripe handles the other supported
currencies at checkout.

Validation: 32 pricing/checkout tests, TypeScript and targeted ESLint passed.
Production deployment is pending; the currently running application can still
use its old bundled environment and display until redeployed.
