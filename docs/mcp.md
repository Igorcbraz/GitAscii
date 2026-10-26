# GitAscii MCP

GitAscii exposes its existing editor, GitHub data and Pro services through a remote MCP server. The website remains the primary interface. Purchases, payments and plan changes stay on the website; no MCP tool grants Pro or performs checkout.

## Connect as a user

1. Sign in to GitAscii with GitHub.
2. Open **Connected apps** from the account menu (`/settings/connections`).
3. Copy the server URL, normally `https://gitascii.com/mcp`, into the assistant's MCP/integration settings. Pasting it as an ordinary chat message does not install a connection.
4. Complete OAuth and review the application's name, return hostname and permissions.
5. Ask the assistant to inspect the account, analyze GitHub data or edit a shared draft. Return to Connected apps to revoke access at any time.

Example prompts:

- “Analyze my public GitHub profile. Separate current statistics from actual historical measurements.”
- “Read my default shared draft, add my top repositories and align the widgets. Do not publish yet.”
- “Create a work profile and schedule it on weekdays, from 09:00 to 18:00 in America/Sao_Paulo.”
- “Compare my Pro badge requests over the last 30 days and inspect failed publications.”
- “Show the changes and publish this reviewed draft to my GitHub README.”

Clients must support remote Streamable HTTP and OAuth with public-client registration, PKCE S256 and the resource parameter. Client-specific setup and public directory listings require separate verification. The automated tests exercise the official TypeScript client and the HTTP transport; they are not a claim that every commercial client has been manually verified.

## Browser and assistant workflow

The editor toolbar has **Shared draft** controls:

- Save the current browser layout for the assistant.
- Load the current shared layout into the editor. This replacement can be undone locally.
- Undo/redo shared changes, with a history bounded to 20 snapshots.

Browser-local changes are not silently uploaded. Assistant changes are not silently applied to an open browser tab. Both surfaces use a revision check when updating the cloud draft; a conflict requires reloading. Publication is explicit and separate from saving a draft. All tool responses include a browser alternative where appropriate.

Editing uses a new isolated instance of the existing editor store, with persistence injected. The browser retains its normal local persistence. Widget operations are therefore shared, including alignment, distribution, resize, layer order, templates, properties and animation configuration. Widget IDs use UUIDs so batches cannot collide within the same millisecond.

The draft API is also session-authenticated for browser use: `GET /api/editor/draft?slug=default` and `PUT /api/editor/draft`. Writes require the canonical same-origin header, a valid session and an expected revision. A named profile must already exist. Draft identity is derived from the authenticated account, never imported from JSON. Tool links with `?shared=1` open the shared-draft controls without silently overwriting local changes. `GET /api/editor/export` provides authenticated JSON/SVG downloads; SVG downloads are sanitized and served as attachments with a sandbox policy.

## Tools shipped

| Area            | Tools                                                                                                                                                                   |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Account         | `get_account`                                                                                                                                                           |
| GitHub analysis | `get_github_profile`, `get_repositories`                                                                                                                                |
| Catalog         | `list_templates`, `list_widgets`, `get_widget_options`                                                                                                                  |
| Editing         | `get_draft`, `edit_draft`, `generate_draft`, `draft_history`, `export_draft`                                                                                            |
| Profiles        | `list_profiles`, `create_profile`, `duplicate_profile`, `update_profile`, `list_profile_versions`, `restore_version_to_draft`                                           |
| Pro analysis    | `get_analytics`, `get_publication_health`                                                                                                                               |
| Automations     | `get_dynamic_rules`, `save_dynamic_rule`, `delete_dynamic_rule`, `configure_dynamic_rules`, `simulate_dynamic_rules`, `get_publish_settings`, `update_publish_settings` |
| Publication     | `prepare_publication`, `publish_draft`, `get_publication_status`                                                                                                        |

`edit_draft` supports atomic batches of add, configure, move, resize, scale, align, distribute, rename, duplicate, remove, visibility, lock, layer, reorder, global style, template and layout import operations. Configuration is validated for structure, size, nesting, IDs and unsafe values. Widget-specific defaults and template examples are discoverable; exhaustive property-by-property schemas are a future improvement.

Shared drafts are bounded to 250 widgets and 250,000 serialized characters. Batches allow up to 100 operations. This limit is intentional; large imports need reducing before cloud editing.

Pro access is checked at execution using the existing entitlement service, including its cache policy. No client-provided flag can upgrade a user. Identity uses the stable GitHub ID and resolves the current username from the account database.

## Meaning of analytics

GitHub statistics are a current, potentially cached public snapshot. They are not repository traffic analytics or a historical growth series. Pro traffic fields describe requests observed at the separate badge endpoint, including cache and proxy behavior; they are not exact human README visits. Health reflects Action reports, not continuous monitoring.

Schedule automation uses the six existing rule types: work hours, weekend, date range, event, temporary and custom. Explicit timezones are required. Dynamic rules affect the HTTP embed using `dynamic=1`; static GitHub-hosted SVGs do not change for each visitor. Republish the default embed from the site when changing delivery mode.

## OAuth and security

- `GET /.well-known/oauth-authorization-server`
- `GET /.well-known/oauth-protected-resource/mcp`
- `POST /oauth/register` (public clients, exact registered callbacks)
- `GET /oauth/authorize` (existing GitHub session and explicit consent)
- `POST /oauth/consent` (same-origin, authenticated, encrypted expiring consent ticket)
- `POST /oauth/token` (authorization code and refresh token grants)
- `POST /oauth/revoke`
- `GET/DELETE /api/account/connections` (browser-owned connection management)

Authorization codes expire after five minutes and are consumed atomically with token issuance in PostgreSQL. Access tokens last one hour; connections/refresh credentials expire after 30 days. Only token hashes are persisted. Refresh tokens rotate, and reuse of a previously consumed refresh token revokes the connection. Initialization, discovery and tool calls validate the current connection and account. A revoked connection cannot continue through a cached MCP session; the transport is stateless.

Protocol `ping` is public liveness only: it returns an empty result without authentication or SQL, so an idle assistant's keepalives do not keep Neon awake. It still enforces the deployment switch and Origin checks. It never returns identity, tools or account data. Actual MCP operations continue to consume database compute; avoid periodic tool polling while idle.

Permissions: `account:read`, `profiles:read`, `profiles:write`, `profiles:publish`, `analytics:read`, `rules:write`. Writing or publishing a draft also requires profile read access. The protected-resource metadata starts with read access; tools advertise the additional scopes they need. Dynamic client registration is implemented; CIMD is not advertised or implemented in this release.

Origin checks, bounded request bodies, schema validation and durable rate limits are enforced. Deploy behind the platform's WAF/rate limiting for unauthenticated OAuth traffic as well. Registration and token endpoints have shared abuse budgets; deployment edge limits should prevent one client from exhausting them. Do not log request bodies, cookies, authorization codes or bearer tokens.

## Publication behavior

The browser and MCP call `publishProfileRequest` in `src/features/github/server/publishProfile.ts`. That is the existing GitHub App publication workflow, including configuration, SVGs, README and workflow setup.

The assistant must prepare/review the current revision and use a UUID `requestId` for publication. Repeating that request ID returns the recorded outcome; reusing it with different input is rejected. A partial/failed attempt is not described as a rollback. An interrupted operation remains `running` and blocks further MCP publication for that profile; inspect GitHub before resolving it operationally. The browser remains available for recovery.

## Deployment

1. Use an isolated staging database and GitHub test account/repository first.
2. Configure `DATABASE_URL`, existing GitHub OAuth/App secrets, `SESSION_SECRET` and canonical HTTPS `NEXT_PUBLIC_APP_URL`. Do not use a preview URL as the production issuer.
3. Run `npm run db:migrate` to inspect pending migrations and database hostname. Then run `npm run db:migrate -- --apply` **against the intended staging database**. Migration `012_assistant_connections` adds OAuth, draft, rate-limit and publication tables. No live migrations are run by building the app.
4. Set `GITASCII_MCP_ENABLED=true`. The default is false; the MCP/OAuth endpoints otherwise reject use.
5. Run `npm run test:mcp`, then project checks. Use MCP Inspector and the target clients to verify connect, reject consent, refresh, revoke, insufficient scope, expired credentials, Free/Pro boundaries and cross-account isolation.
6. Test browser → shared draft → assistant → browser → publication with the test repository. Inspect SVGs, README, workflow and dynamic rules.
7. Monitor tool errors, OAuth failure rates, database latency and GitHub quotas. Keep OAuth endpoints and callbacks out of response/body logging and session replay capture.
8. Promote configuration and migration to production only after staging verification. Public marketplace distribution is an additional registration/review process, not implied by deploying this endpoint.

Rollback: set `GITASCII_MCP_ENABLED=false` to stop MCP and OAuth usage. Browser editing remains available. Keep additive tables until data retention and outstanding publications have been reviewed; do not delete them as part of an emergency rollback.

Maintenance: periodically remove expired authorization codes, old rate-limit rows, expired connections (their used refresh hashes cascade) and unreferenced client registrations. Retain publication attempts long enough to investigate partial GitHub writes. Deleting an account cascades its OAuth grants, drafts and publication attempts.

## Remaining release work

- Manually verify the deployed OAuth flow in each advertised assistant; marketplace submission is not performed by this change.
- Add property-specific schema descriptions for every specialized widget beyond defaults/examples.
- Add idempotent profile deletion/default-promotion tools; these actions remain available in the browser today.
- Optional MCP App visual UI, automatic live browser synchronization, downloadable report-image generation and notification controls are not part of this release.
- Existing product limitations remain: recorded email alerts are not proof of delivery, custom-domain/purge flags do not constitute implemented services, and GitHub Camo does not reveal individual visitor identity.

Tests use an isolated in-memory PostgreSQL engine for actual SQL, code consumption, token rotation, revocation, account isolation, revisions, shared undo/redo and publication idempotency. No production database or real GitHub publication is needed for these tests.

Local browser checks also exercised connection listing/revocation and saving a shared draft on desktop and mobile, with a synthetic session and mocked APIs. The shared-draft panel was checked for viewport containment on a 390px screen. These checks do not replace staging OAuth and real test-repository publication validation. No production migration, deployment or external publication was performed during implementation.
