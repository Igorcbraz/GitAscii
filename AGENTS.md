<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Landing performance constraints

- Preserve the landing page's appearance and the hero's mouse hover animations, including the magnetic call to action and Strobi interactions.
- Keep the landing's PT Serif, Inter Tight, and JetBrains Mono fonts working in the browser; verify the hero actually renders PT Serif instead of a fallback font after changing font loading.
- Preserve the existing `motion.div` and related Motion entrance, hover, and exit animations. Do not replace them with static elements just to raise a performance score.
- Keep Google Analytics loading whenever `NEXT_PUBLIC_GA_MEASUREMENT_ID` is configured. Do not gate its script on analytics consent. This is an explicit project requirement; the existing consent choice may still control other integrations.
