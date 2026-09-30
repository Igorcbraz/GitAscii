# GitAscii Pro architecture (v2)

This document describes the current publication, telemetry, and persistence paths. The GitHub-hosted profile SVG and the separate Pro badge have different request flows.

## Publication and delivery

1. The signed-in editor uses a GitHub App installation to create or update the user's `username/username` repository. It writes `gitascii.json` (or `gitascii_[slug].json`) and an initial dark/light SVG pair to the `gitascii` branch.
2. The app writes `.github/workflows/gitascii.yml` and the generated `<picture>` block to the repository's default branch.
3. The bundled GitHub Action reads all saved configurations, fetches current GitHub data, renders both themes with the shared `src/engine/` implementation, inlines permitted external assets, and atomically commits changed SVGs to `gitascii`.
4. The README loads `profiles/[slug]/dark.svg` or `light.svg` from `raw.githubusercontent.com`, often through GitHub Camo. A normal README visit does not call the GitAscii rendering API.

The workflow supports manual dispatch. The editor installs a daily Free schedule and a Pro hourly schedule; the Action also enforces the server-provided minimum interval for scheduled runs. The app's HTTP SVG API remains available for previews and custom embeds. When Pro dynamic rules are enabled for the default profile, the generated embed explicitly uses `?dynamic=1` and the API evaluates a profile selection.

## Pro signals

| Signal               | Origin                                    | What it means                                                                                                                  |
| :------------------- | :---------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| Badge analytics      | `GET /api/badge/[username]?slug=...`      | Requests observed by GitAscii for the separate badge, usually GitHub Camo cache refreshes. Not exact views or unique visitors. |
| Publication health   | GitHub Action → `POST /api/pro/telemetry` | Authenticated run outcome, duration, profile slug, and failed external assets.                                                 |
| Health badge         | `GET /api/[username]/health-badge`        | SVG summary of stored publication health.                                                                                      |
| Optional HTTP render | `GET /api/[username]` and variants        | Preview or custom API response; may redirect to a published v2 SVG when there are no render overrides.                         |

The Action authenticates Pro telemetry with a GitHub OIDC token. The server verifies it and associates the report with the repository owner. Failed external assets can create error records and trigger Pro email alerts when enabled, subject to a one-hour cooldown. The badge endpoint and workflow telemetry do not provide a reliable viewer IP, geography, browser, device, or identity for the GitHub-hosted README image.

## Persistence

PostgreSQL is the persistent store for profiles and Pro records when `DATABASE_URL` or `DATABASE_URL_UNPOOLED` is configured. Redis handles caches and some telemetry operations. Without a database configuration, several stores use Upstash Redis, with an in-memory fallback for local development. The published configuration and SVGs also live in GitHub, which the app can read as a fallback for profile configuration.

The earlier Redis-only design and request-time README rendering model no longer describe v2. The implementation entry points are `src/app/api/github/commit/route.ts`, `src/lib/migration/branchBootstrap.ts`, `src/lib/migration/workflowGenerator.ts`, `action/src/index.ts`, `src/app/api/badge/[username]/route.ts`, and `src/app/api/pro/telemetry/route.ts`.

## Relevant environment

| Variable                                                        | Purpose                                                    |
| :-------------------------------------------------------------- | :--------------------------------------------------------- |
| `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`                       | GitHub App installation tokens for repository publication. |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `SESSION_SECRET`    | Sign-in and session handling.                              |
| `DATABASE_URL` or `DATABASE_URL_UNPOOLED`                       | PostgreSQL persistence when configured.                    |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`            | Redis backing for caches and fallback stores.              |
| `RESEND_API_KEY`                                                | Optional email delivery.                                   |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID` | Pro subscription integration.                              |
| `NEXT_PUBLIC_APP_URL`                                           | Public app URL for links and callbacks.                    |

See `.env.example` for the full development environment template.
