# Storybook component map

Run `npm run storybook` to browse the component catalog, `npm run build-storybook` to validate every CSF entry, and `npm run check-storybook-coverage` to detect visual TSX files that no story imports.

With Storybook running, `npm run test:storybook:smoke` checks the new visual stories in Chromium. Set `STORYBOOK_URL` when using a port other than 6006. The script checks that the hero loads the bundled PT Serif face.

Use `node scripts/storybook-smoke.mjs --catalog` to render every catalog entry in Chromium, or pass one or more `--id=story-id` flags to reproduce a failure. Email stories render their complete HTML inside a sandboxed iframe and the smoke check inspects its document.

The coverage check follows direct and dynamic imports from every story. It reports components with their own stories separately from components exercised by a composed screen. Route `page.tsx`, layout files, tests, and three nonvisual modules are excluded. The exceptions live in `scripts/audit-storybook.mjs` with their reasons. A passing audit means every eligible file is reachable from at least one story; it does not mean every state is tested.

## Authoring standard

- Give user facing components a typed `Meta` and `StoryObj` with realistic `args` when the component has props.
- Show consequential states: populated and empty data, guest and authenticated views, interactive behavior, and narrow layouts where relevant.
- Use stable fixtures. Do not use random data or live service responses in a story.
- Install fetch fixtures in `beforeEach`, then restore them on teardown. `.storybook/mockFetch.ts` is the local helper for components that request internal routes.
- Pro dashboard stories share typed sample data from `.storybook/proDashboardFixtures.ts`. Email preview links use a Storybook-only token substitute; they are intentionally nonfunctional examples.
- The Vite preview substitutes the server-backed landing metrics with the same default values and counts used by the application, so client stories do not bundle the metrics service's database and crypto dependencies.
- Keep animations, hover behavior, and loading boundaries present in the canvas. Group tightly coupled visual primitives or page compositions in a single CSF file when a standalone component story would remove essential context.
- Set `layout: 'fullscreen'` for sections, pages, and dashboards. Global preview CSS loads the same local font assets used by the app.

Automatic documentation is enabled globally. Accessibility findings appear in the addon panel; the existing project setting keeps them advisory until component violations are addressed.
