# Sentry review — 2026-10-29

Project: `igorcbraz/javascript-nextjs`. PR: https://github.com/Igorcbraz/GitAscii/pull/242.

## Changes

- `40`, `54`: reject incomplete report responses and clear a previous report on failure.
- `41`, `53`: render missing profile counters as unavailable while preserving real zero values.
- `4Z`: use the public site origin by default in production; explicit insecure origins still fail validation.
- `3`, `4W`: narrowly filter the known external link-scanner signature.
- `1M`: filter the injected `M_ID` error only when every frame belongs to `executors/N.js`.
- `44`: bounded automatic reload for chunk errors, plus manual reload. This is recovery, not a guarantee of asset availability across deployments.
- `51`, `52`: preserve the external image URL on network failure and await FileReader rejection inside the existing catch block. Injected fetch wrappers may still emit their own independent rejections.

`1E` and `50` were classified as transport cancellation noise and ignored until escalation, with reasons recorded in Sentry. They were not represented as application fixes.

## Remaining investigation

`3W`: the Cloudflare bundle includes a React Email rendering dependency that resolves `react-dom/server` under RSC conditions. The same incompatibility is reported upstream at https://github.com/cloudflare/vinext/issues/882. A successful build and HTTP smoke test do not exercise actual email rendering. Sending a real email was not used as a test. Seer could not start because Sentry requires a repository connection for this project. This issue must remain open until the rendering path is isolated and tested in the Worker runtime.

`4X`, `4Y`: historical localhost development Suspense failures lack a useful application stack. They have not been blanket-filtered or claimed fixed.

## PR validation changes

PGlite setup hooks now allow 120 seconds, and CI uses two test workers. Assertions and security checks remain enabled. Python tooling was audited after updating certifi, msgpack and urllib3: no known vulnerabilities. Compatible npm updates removed high and critical advisories; npm still reports low/moderate transitive advisories, including packages without an available fix. Use Node >=22.22.1 for the updated dependencies.

Final local validation with Node 22.23.2: 498 tests passed in 75 files. Full lint,
Next compilation/typechecking and the updated Cloudflare production build passed.
