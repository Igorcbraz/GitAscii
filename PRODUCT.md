# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Developers, open-source maintainers, and tech creators who want an effortless, highly aesthetic GitHub README profile that stays automatically updated without ongoing maintenance.

## Product Purpose

GitAscii is a visual GitHub profile README editor where cryptic terminals meet editorial newspaper design. It combines ASCII art, GitHub data widgets, templates, and publishing in one workspace. Version 2 publishes finished SVGs to the user's own GitHub profile repository.

## Positioning

GitAscii replaces a collection of separate profile widgets with an editable composition. The standard README embed points to dark and light SVG files on the user's `gitascii` branch; a repository GitHub Action refreshes those files. The HTTP rendering API remains available for previews and specialized uses.

## Operating Context

- Used in web browsers to visually compose, drag, drop, and edit GitHub profile README layouts.
- The editor writes a `<picture>` embed to `username/username/README.md` using stable `raw.githubusercontent.com` URLs for the published dark and light SVGs.
- GitHub serves the published files, often through its Camo image proxy. The browser selects the theme from the `<picture>` sources; visiting the README does not trigger a GitAscii render.
- GitAscii Pro can manage multiple slugs, profile versions, publication health, and a separate analytics badge. Badge requests are a proxy signal, not exact people or unique visits.

## Capabilities and Constraints

- **Visual Builder:** Drag-and-drop editor interface for arranging widgets, ASCII graphics, and GitHub metrics.
- **ASCII Engine:** Browser-side canvas image processing converting images into ASCII character matrices based on luminance mapping.
- **Adaptive Themes:** Publishes separate `dark.svg` and `light.svg` files; a README `<picture>` uses `prefers-color-scheme` to select between them.
- **GitHub-Native Delivery:** An initial publish and scheduled GitHub Action runs render self-contained SVGs from saved configuration and fresh GitHub data on the `gitascii` branch.
- **HTTP API:** Next.js routes can render previews and custom variants; Pro dynamic rules use the API when explicitly enabled.
- **Output Constraints:** Published SVGs inline permitted external assets so GitHub can display them without loading third-party images at view time.

## Brand Commitments

- **Tagline:** "Where cryptic terminals meet editorial newspaper design."
- **Color Identity:** Carbon dark canvas (`#060606`), signal lime (`#c5ff4a`) primary accent, graphite/onyx surfaces (`#1f1f1f`), bone text (`#e5e5e5`).
- **Typography:** Display headlines in PT Serif, UI & body text in Inter Tight, code & terminal elements in JetBrains Mono.

## Evidence on Hand

- **Live Platform:** `https://gitascii.com/`
- **Output Preview:** `public/example.svg`
- **Interface Previews:** `public/hero.webp`, `public/editor.webp`

## Product Principles

1. **Effortless Elevation:** Transform static GitHub profile Markdown into a visual statement with scheduled refreshes.
2. **Centralized Platform:** Consolidate README creation, widget composition, and publication management in one workspace.
3. **GitHub-Native Delivery:** Serve the published SVGs from the user's repository with stable URLs and dark/light variants.
4. **Editorial Terminal Aesthetic:** Juxtapose crisp, technical terminal output with high-contrast serif typography and signal lime accents.
