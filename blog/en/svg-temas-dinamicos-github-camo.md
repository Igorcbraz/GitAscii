---
title: 'Solving Dark/Light Themes in SVGs on GitHub Without DOM Access (Bypassing Camo)'
slug: 'svg-temas-dinamicos-github-camo'
published: false
description: 'GitHub Camo strips script tags and isolates image assets. Discover how to build dynamic, responsive dark/light mode SVGs using embedded CSS media queries executed entirely in the reader browser.'
tags: ['css', 'svg', 'github', 'frontend']
cover_image: 'assets/dynamic-svg-themes.jpg'
---

The most frustrating aspect of GitHub's image proxy, Camo, is not its caching behavior, but the absolute sandboxing of client-side scripts. This constraint creates a classic frontend challenge: how do you deliver a dynamic banner or layout inside a `README.md` that automatically adjusts to the reader's dark or light theme when you have zero access to the DOM or JavaScript?

Many dynamic profile engines try to solve this by appending theme parameters to the query string (e.g., `?theme=dark`). The obvious downside is that this is static: if the reader changes their operating system or browser theme, the image fails to adapt and breaks the layout's aesthetic.

In this deep dive, we look at how GitAscii uses **CSS-in-SVG** to bypass these constraints, using client-side media queries embedded directly inside vector assets.

![Dynamic SVG themes comparison](assets/dynamic-svg-themes.jpg)

---

### The Sandbox Constraints of GitHub Camo

When you embed an image link in a markdown file, GitHub's markdown parser processes it and redirects it through the Camo proxy. In the browser, this image is rendered inside a standard HTML `<img>` tag:

```html
<img src="https://camo.githubusercontent.com/.../img.svg" alt="Dynamic Canvas" />
```

According to the W3C specifications for SVG integration, when an SVG file is loaded via an `<img>` tag (or as a CSS `background-image`):

1. **JavaScript is fully disabled**: Any `<script>` tags inside the SVG are ignored and blocked by the browser's security sandbox.
2. **External resources are blocked**: The browser will not fetch external stylesheets (`<link rel="stylesheet">`) or external web fonts declared within the SVG.
3. **DOM Isolation**: The SVG is rendered in its own separate document context. It cannot query the parent document (the GitHub repository page) or inspect class attributes like `.theme-dark` on the `<html>` or `<body>` elements.

---

### Bypassing the Sandbox with Embedded Media Queries

Although external resources and scripts are blocked, **the browser's layout engine still evaluates internal style sheets** declared within the SVG itself. Because the SVG is parsed as an XML document, rules written inside `<style>` blocks are processed in the user's browser context.

This means we can embed the standard CSS media query `@media (prefers-color-scheme: dark)` inside the SVG payload returned by our Edge server. When the reader's browser renders the SVG, it evaluates the media query against the user's system preferences (dark or light mode) and applies the correct styling.

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="220" viewBox="0 0 800 220">
  <style>
    /* -------------------------------------------------------------
       Default styles (Light Mode configuration)
       ------------------------------------------------------------- */
    .canvas-bg {
      fill: #ffffff;
      stroke: #e1e4e8;
      stroke-width: 1px;
      transition: fill 0.3s ease, stroke 0.3s ease;
    }
    .text-title {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-weight: 600;
      font-size: 16px;
      fill: #24292e;
    }
    .text-body {
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
      font-size: 14px;
      fill: #586069;
    }
    .accent-bar {
      fill: #0366d6; /* GitHub Classic Light Blue */
    }

    /* -------------------------------------------------------------
       Media Query override (Executed by the reader's browser)
       ------------------------------------------------------------- */
    @media (prefers-color-scheme: dark) {
      .canvas-bg {
        fill: #0d1117; /* GitHub Dark canvas background */
        stroke: #30363d;
      }
      .text-title {
        fill: #c9d1d9; /* GitHub Dark text color */
      }
      .text-body {
        fill: #8b949e;
      }
      .accent-bar {
        fill: #c5ff4a; /* GitAscii Lime Accent */
      }
    }
  </style>

  <!-- Vector Layout Markup -->
  <rect class="canvas-bg" width="100%" height="100%" rx="8" />
  <rect class="accent-bar" x="0" y="0" width="8" height="100%" rx="4" />

  <text class="text-title" x="30" y="45">GitAscii Layout Engine</text>
  <text class="text-body" x="30" y="90">> Status: Active</text>
  <text class="text-body" x="30" y="120">> Theme Mode: Auto-Detecting System Colors</text>
  <text class="text-body" x="30" y="150">> Cache Resolution: Edge-Triggered</text>
</svg>
```

> [!NOTE]
> Even though the image file is fetched from GitHub's Camo CDN cache, the browser performs CSS rules evaluation locally. This guarantees that if a user switches their OS theme from light to dark, the SVG shifts color schemes instantly, without triggering a network request or requiring a page reload.

---

### Request and Evaluation Architecture

The diagram below details the boundary between server caching and client evaluation:

```
                  SERVER-SIDE (Edge & CDN)                    │       CLIENT-SIDE (Browser)
                                                              │
┌──────────────┐         ┌─────────────┐       ┌────────────┐ │ ┌────────────────────────────────┐
│ GitAscii DB  ├────────>│ Vercel Edge ├──────>│ GitHub CDN │ │ │ Reader Browser                  │
│ Layout Config│         │ XML Compile │       │ (Camo Cache) │ │ │                                │
└──────────────┘         └─────────────┘       └─────┬──────┘ │ │ 1. Load image: <img src="camo"> │
                                                     │        │ │ 2. Parse XML markup            │
                                                     └───────────> 3. Read internal <style>      │
                                                              │ │ 4. Evaluate system theme       │
                                                              │ │ 5. Render SVG colors dynamically│
                                                              │ └────────────────────────────────┘
```

### Key Considerations for Dynamic Themes

When using CSS-in-SVG for GitHub profiles, keep the following guidelines in mind:

1. **Avoid External Font References**: Font files imported via `@import url(...)` inside the SVG `<style>` tag will be blocked. Stick to system font stacks (e.g., `-apple-system`, `monospace`, or standard fonts like `Courier New`) to ensure clean rendering.
2. **Set XML Namespace Attributes**: Always include `xmlns="http://www.w3.org/2000/svg"` in your root `<svg>` tag. Without this, browsers might fail to parse the XML hierarchy, which prevents style sheets from applying.
3. **Use Transition Effects Sparingly**: While CSS transition rules (like `transition: fill 0.3s ease`) work in modern browsers, they can consume CPU cycles if there are too many animated SVG nodes. Focus transitions on background and main text layers.

> [!TIP]
> If you need to debug SVG styling issues, open the raw SVG file directly in your browser. Inspect it using your developer tools to view the applied CSS classes and toggle dark/light mode emulation.

### Conclusion

Open web standards like XML, CSS, and media queries provide robust workarounds for security sandboxes and CDN caching limits. By designing edge-rendered assets that contain their own responsive stylesheets, you can bypass GitHub Camo's strict scripting limitations and deliver theme-aware components that load instantly.
