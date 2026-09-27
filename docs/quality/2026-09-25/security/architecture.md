# Architecture and audit scope

GitAscii is a Next.js/React/TypeScript GitHub profile editor, with Pro profile management, analytics and publication health. Zustand owns editor state; PostgreSQL owns persistent data when configured, Redis and process memory act as caches. Cloudflare/vinext is an additional deployment target. GitHub App credentials publish configurations and static SVGs to each user's profile repository; the bundled GitHub Action refreshes those SVGs.

Comparable baseline: GitHub profile badge/render services and repository-backed README generators. Public GitHub data and published SVG/configuration are intentionally public. Cross-account writes, access-token disclosure and executable content in the editor are not intended. No conclusion is drawn from a comparable without tracing this implementation.

Trust model: anonymous visitors can load GitHub data/config and render profiles; authenticated sessions own profile mutations; Pro entitlements limit features; GitHub installation tokens permit repository publication; signed webhooks/OIDC authenticate service events. Input crosses HTTP JSON, local/imported configuration, GitHub files and API responses, third-party SVG/image fetches, and Action inputs. Do not access live accounts or production data during validation.

Key paths:

- `src/lib/auth.ts`, `src/app/api/auth/session/route.ts`: session and token boundary.
- `src/app/api/pro/profiles/**`, `src/features/pro/server/profileManagerStore.ts`: profile CRUD, versions, restoration and ownership.
- `src/lib/profileStorage.ts`, `src/lib/db/repositories/profileRepository.ts`: config identity and caches.
- `src/features/editor/components/EditorLayout.tsx`, `Toolbar/ProfileSwitcher.tsx`, `src/features/pro/components/profiles/ProfilesDashboard.tsx`: editor/Pro consumers.
- `src/engine/core/{SVGEngine,WidgetRenderer,WidgetRegistry}.ts`: shared widget rendering.
- `src/features/editor/components/Canvas/WidgetNode.tsx`, GitHubReadmeCanvas and Pro health preview: inline SVG DOM sinks.
- `src/utils/{svgSanitizer,ssrfValidator}.ts`, external asset processors: untrusted SVG and network boundary.
- `src/lib/v2/profilePublisher.ts`, `src/lib/migration/branchBootstrap.ts`, `action/src/*`: publication and Git operations.
- `.github/workflows/ci.yml`, `release-please.yml`, Vitest/Playwright configs: release quality gates.

Prior audits: two August runs under the user's security-audit-skill directory. Run 1 reported SSRF, sanitization, upstream workflow and routing concerns; run 2 reported none. Treat old claims as historical candidates, not confirmed current defects. This run prioritizes profile identity/version boundaries, inline browser SVG and cross-component failure handling.

Limitations: source and local mocked execution; production OAuth, database migrations, Stripe and real GitHub writes are outside local validation. Review findings against the original revision and record fixes separately.
