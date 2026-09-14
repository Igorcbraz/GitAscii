# GitHub Camo: static SVG publication on Workers Free

The confirmed incident was a render terminated at 10 ms CPU (`exceededCpu`), including an actual `github-camo` request. Removing IP limits cannot fix this. The image publication service moves rendering to a standard GitHub Actions runner and serves the last successful SVG from Workers Static Assets.

## Architecture

- `gitascii` retains the application, editor, authentication and configuration APIs.
- `gitascii-images` resolves legacy image URLs and dynamic rules using published manifests. It never calls the renderer, GitHub, Redis or the database when serving a recognized profile image.
- `/profiles/<username>/<slug>/<variant>.svg` serves static assets directly, bypassing script execution. Legacy `/api/...` URLs still consume Worker requests.
- GitHub Actions reads existing layouts and public GitHub data, then runs the existing SVG engine in isolated Node processes. Database schemas do not change.
- Each run restores and verifies the complete previous snapshot, refreshes a bounded batch and deploys the whole snapshot atomically. Failed renders preserve the previous image. Failed restoration or deployment leaves production untouched.
- Private metadata travels in an authenticated snapshot index. SVG restoration uses public static URLs to avoid per-file Worker invocations.
- Missing variants enter an optional Workers KV queue. Queue quota failures do not prevent delivery of an existing image. A first unpublished profile gets a branded placeholder; a pending custom variant uses the saved base image.

## Zero-cost boundaries

This deployment uses **Workers Free + Static Assets + KV Free**, with standard GitHub-hosted runners in this **public repository**. It does not use R2, paid Workers CPU, larger runners, Actions artifacts or Actions caches. R2 was excluded because its free allowance is followed by billable usage; enabling R2 alone is not a hard spending cap. Do not upgrade Workers/KV to a paid plan for this design.

Cloudflare documents free, unlimited direct static asset requests and no asset storage charge. Script requests have the account-wide Workers Free daily cap (100,000 requests) and 10 ms CPU. Requests requiring the script can fail at the cap; published static paths bypass it. KV Free operations fail after their allowance, delaying new variants. Existing unrelated services and their billing remain outside this publication service.

Conservative publisher budgets: 18,000 files, 512 MiB total, 8 MiB per file, 16 requested variants per user, 200 sources per database page, 20 minutes of generation per run and 90 seconds per rendering process. Cloudflare Free currently permits 20,000 static files and 25 MiB per file. Capacity failures do not enable billing or delete the deployed snapshot.

These are capacity and failure controls, not an uptime guarantee. Camo can cache errors; GitHub API/provider outages can leave data stale. Actions schedules can be delayed and public repository schedules can be disabled after 60 days without repository activity. Large or invalid images may still be rejected by a proxy.

## Provisioning and rollout

1. Keep the account on Workers Free. Create `GITASCII_PUBLICATION_REQUESTS` in KV and put its ID in `wrangler.images.jsonc`.
2. Create a scoped Cloudflare API token: Account Workers Scripts Edit, Workers KV Storage Edit and Account Settings Read; for custom domains/routes, Zone Workers Routes Edit and Zone Read. Restrict resources to this account and `gitascii.com`. GitHub-hosted runners have no fixed source IP allowlist.
3. Configure repository Actions secrets:
   - `SVG_CLOUDFLARE_API_TOKEN`: deployment token.
   - `SVG_DATABASE_URL`: existing database connection (publisher only reads).
   - `SVG_PUBLICATION_READ_TOKEN`: random secret of at least 32 bytes.
4. Set the same read token in the Worker as `PUBLICATION_READ_TOKEN`, using `wrangler secret put PUBLICATION_READ_TOKEN --config wrangler.images.jsonc`. Never commit credentials or private manifests.
5. Configure repository variables `SVG_CLOUDFLARE_ACCOUNT_ID`, `SVG_PUBLICATION_ORIGIN` (image Worker origin) and `SVG_PUBLICATION_ENABLED=true` after validating the seed deployment.
6. First local publication: set `DATABASE_URL`, `GITHUB_TOKEN`, `PUBLICATION_BOOTSTRAP=1`; run `npm run publish:svgs`, then `npm run deploy:svgs`. `dist/publication` must be empty. `PUBLICATION_RESUME_LOCAL=1` is only for deliberately resumed local bootstrap. Subsequent runs must restore production.
7. Verify SVG bodies, HEAD, conditional GET, metadata protection, queue and snapshot restoration in preview before adding routes for existing image URLs. Forward ordinary application APIs to `gitascii`.
8. Push the workflow to the default branch and run it manually once. Confirm successful restore, refresh and deploy before relying on the schedule.

The workflow attempts a batch every 30 minutes; fresh statistics normally skip regeneration for six hours. Layout changes are picked up on the next visit to that source's batch. Backlogs and provider failures extend these intervals. Theme, saved layout, widget selection and dynamic rule selection are preserved. A cache-busting `v` parameter does not create a new rendering variant.

Image delivery no longer invokes the legacy renderer's database-backed view tracking.
Its image-view counters will therefore stop receiving these requests after cutover;
editor and page analytics are unchanged. This avoids reintroducing database work into
the image request. Treat this as a rollout limitation for the existing analytics dashboard.

## Operation and rollback

Inspect `Publish profile SVGs` Actions logs for per-profile failures. Public `/__publication/health` reports whether a snapshot exists, not whether every variant is ready. Image responses report `X-GitAscii-Publication` and successful publication timestamps.

To pause refresh, set `SVG_PUBLICATION_ENABLED=false`. Published static files remain available. Roll back a bad image deployment through Cloudflare version rollback for `gitascii-images`. Removing legacy URL routes returns those URLs to the original app and its original CPU limitations.

If GitHub retains a cached error after the origin is healthy, use its actual Camo URL and GitHub's documented purge procedure. Never put read tokens in README URLs, browser query strings or logs.

## References

- [Static Assets billing and limits](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
- [Workers limits](https://developers.cloudflare.com/workers/platform/limits/)
- [KV pricing](https://developers.cloudflare.com/kv/platform/pricing/)
- [GitHub Actions billing](https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions)
- [Scheduled workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)
- [GitHub anonymized URLs](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-anonymized-urls)
