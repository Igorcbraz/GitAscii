# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Developers, open-source maintainers, and tech creators who want an effortless, highly aesthetic GitHub README profile that stays automatically updated without ongoing maintenance.

## Product Purpose

GitAscii is a complete README creation and management platform where cryptic terminals meet editorial newspaper design. It unifies ASCII art generation, dynamic GitHub statistics tracking, customization tools, and edge asset hosting into a single centralized workspace to build and evolve developer GitHub presences.

## Positioning

Beyond single-purpose ASCII generators or static badge tools, GitAscii provides an end-to-end visual README workspace. It fuses terminal aesthetics with editorial layout design, generating auto-updating dynamic SVGs served via Edge endpoints or self-hosted setups—replacing scattered profile tools with one cohesive environment.

## Operating Context

- Used in web browsers to visually compose, drag, drop, and edit GitHub profile README layouts.
- Output embedded directly into GitHub profile `README.md` files via single dynamic image URLs.
- Rendered live by GitHub's Camo image proxy upon each visitor page load, adapting dynamically to the visitor's dark or light theme preference.

## Capabilities and Constraints

- **Visual Builder:** Drag-and-drop editor interface for arranging widgets, ASCII graphics, and real-time GitHub metrics.
- **ASCII Engine:** Browser-side canvas image processing converting images into ASCII character matrices based on luminance mapping.
- **Adaptive Themes:** Uses SVG media queries (`prefers-color-scheme`) to serve tailored light and dark designs from a single URL.
- **Dynamic Edge Rendering:** Next.js Edge APIs construct optimized SVG markup on the fly, cached efficiently for GitHub Camo.
- **Output Constraints:** SVG assets must maintain fast loading (<100KB target) while preserving rich typography and high-density widget layouts.

## Brand Commitments

- **Tagline:** "Where cryptic terminals meet editorial newspaper design."
- **Color Identity:** Carbon dark canvas (`#060606`), signal lime (`#c5ff4a`) primary accent, graphite/onyx surfaces (`#1f1f1f`), bone text (`#e5e5e5`).
- **Typography:** Display headlines in PT Serif, UI & body text in Inter Tight, code & terminal elements in JetBrains Mono.

## Evidence on Hand

- **Live Platform:** `https://gitascii.com/`
- **Output Preview:** [`public/example.svg`](file:///C:/Repos/GitAscii/public/example.svg)
- **Interface Previews:** [`public/hero.webp`](file:///C:/Repos/GitAscii/public/hero.webp), [`public/editor.webp`](file:///C:/Repos/GitAscii/public/editor.webp)

## Product Principles

1. **Effortless Elevation:** Transform static GitHub profile Markdown into a high-craft visual statement without constant manual updates.
2. **Centralized Platform:** Consolidate README creation, widget composition, hosting, and asset management into one unified workspace.
3. **GitHub Edge Native:** Deliver lightweight, fast-loading dynamic SVGs tailored specifically to GitHub's Camo image proxy and dark/light modes.
4. **Editorial Terminal Aesthetic:** Juxtapose crisp, technical terminal output with high-contrast serif typography and signal lime accents.
