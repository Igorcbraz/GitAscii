# zkPass — Style Reference

> Encrypted terminal meets classified broadsheet — a single lime-green signal cutting through near-black typography that mixes a whisper-weight serif with terminal-grade sans.

**Theme:** dark

zkPass is an encrypted-terminal meets editorial-broadsheet: a near-black canvas serves as the substrate for a single vivid chartreuse accent (#c5ff4a) that behaves like a signal light in a dark room. The display voice is PT Serif at weight 300 — a deliberate contrarian choice that lends editorial gravity to a cryptographic protocol, contrasting the cold tech feel with a typeset-newspaper authority. Body and UI chrome switch to Inter Tight, with uppercase tracked-out labels (0.18–0.26em) that read as classified-document metadata. Surfaces stack tightly: pure black canvas → near-black cards → slightly raised panels, all separated by hairline borders rather than shadows. The lime green only ever appears in three roles: filled CTA, glowing border, and italic accent word inside headlines. Everything else stays monochrome.

## Tokens — Colors

| Name        | Value     | Token                 | Role                                                                                                                                                                                                      |
| ----------- | --------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Void Black  | `#000000` | `--color-void-black`  | Page canvas, deep background layer — the absolute floor of the surface stack                                                                                                                              |
| Carbon      | `#060606` | `--color-carbon`      | Primary page background where pure black would be too harsh — the actual canvas color in the dominant layout                                                                                              |
| Graphite    | `#252525` | `--color-graphite`    | Card surfaces, nav bar, raised panels — the dominant mid-neutral                                                                                                                                          |
| Onyx        | `#1f1f1f` | `--color-onyx`        | Subtle elevation layer between canvas and card                                                                                                                                                            |
| Iron        | `#313131` | `--color-iron`        | Box-shadow depth, elevated surface tint — provides warmth on hover and focus                                                                                                                              |
| Slate       | `#3d3d3d` | `--color-slate`       | Hairline borders on dense tables, row dividers                                                                                                                                                            |
| Fog         | `#525252` | `--color-fog`         | Low-emphasis borders, disabled control outlines                                                                                                                                                           |
| Ash         | `#7a7a7a` | `--color-ash`         | Muted body text, helper copy, link underlines — the workhorse mid-gray                                                                                                                                    |
| Smoke       | `#8a8a8a` | `--color-smoke`       | Secondary captions, metadata text                                                                                                                                                                         |
| Pearl       | `#c5c5c5` | `--color-pearl`       | Tertiary text, subtle heading tints                                                                                                                                                                       |
| Bone        | `#e5e5e5` | `--color-bone`        | High-emphasis body text where pure white would vibrate against black                                                                                                                                      |
| Chalk       | `#ffffff` | `--color-chalk`       | Display text, primary headings, icon strokes — the only text color permitted above #e5e5e5                                                                                                                |
| Signal Lime | `#c5ff4a` | `--color-signal-lime` | Primary CTA fill, glowing borders, italic accent words in headlines — the single chromatic punctuation in an otherwise monochrome system; at 17.8:1 contrast against black it reads as emergency lighting |
| Olive Depth | `#597321` | `--color-olive-depth` | Dark green stroke for SVG world-map art and shadow glows under signal-lime elements                                                                                                                       |
| Moss Shadow | `#314013` | `--color-moss-shadow` | Deepest green used only as decorative stroke in dotted-globe illustrations                                                                                                                                |

## Tokens — Typography

### PT Serif — All display headlines, hero copy, section titles, and the italic accent words — the editorial voice. Weight 300 is anti-convention for a crypto site; most use 600-700, this whisper-weight signals authority through restraint, not volume. · `--font-pt-serif`

- **Substitute:** Source Serif 4 (Google), Cormorant Garamond Light
- **Weights:** 300
- **Sizes:** 20, 22, 24, 26, 32, 40, 49, 56, 60, 72, 75, 78, 86, 89, 130
- **Line height:** 0.88–1.20 (tight for display, opening up for medium text)
- **Letter spacing:** -0.0350em at 130px, -0.0250em at 56–60px, -0.0100em at 20–24px
- **OpenType features:** `"liga" on, "dlig" on`
- **Role:** All display headlines, hero copy, section titles, and the italic accent words — the editorial voice. Weight 300 is anti-convention for a crypto site; most use 600-700, this whisper-weight signals authority through restraint, not volume.

### Inter Tight — All UI chrome, body paragraphs, buttons, nav, tags, labels, links. Carries 500 for nav emphasis, 600 for button text. The uppercase tracked-out labels (0.18–0.26em) read as classified-document metadata stamps. · `--font-inter-tight`

- **Substitute:** Inter (Google)
- **Weights:** 400, 500, 600
- **Sizes:** 9, 10, 11, 12, 13, 14, 16, 20, 28
- **Line height:** 1.20–1.90 (wide for body, tight for nav)
- **Letter spacing:** 0.0050em, 0.0100em, 0.0200em, 0.0300em, 0.0400em, 0.0800em, 0.1100em, 0.1200em, 0.1600em, 0.1800em, 0.1830em, 0.2000em, 0.2200em, 0.2400em, 0.2600em
- **Role:** All UI chrome, body paragraphs, buttons, nav, tags, labels, links. Carries 500 for nav emphasis, 600 for button text. The uppercase tracked-out labels (0.18–0.26em) read as classified-document metadata stamps.

### JetBrains Mono — Code snippets, protocol names, terminal output, hex strings — the proof-of-cryptography evidence layer · `--font-jetbrains-mono`

- **Substitute:** Fira Code (Google)
- **Weights:** 400, 500, 600
- **Sizes:** 10, 11, 13
- **Line height:** 0.92, 1.20, 1.55
- **Letter spacing:** 0.0100em, 0.0600em, 0.1800em, 0.2200em, 0.2400em
- **Role:** Code snippets, protocol names, terminal output, hex strings — the proof-of-cryptography evidence layer

### ui-monospace — Inline monospace fallback, tiny hash strings, timestamps · `--font-ui-monospace`

- **Weights:** 400
- **Sizes:** 9, 11, 12
- **Line height:** 1.20, 1.55
- **Letter spacing:** 0.0400em, 0.2200em
- **Role:** Inline monospace fallback, tiny hash strings, timestamps

### Type Scale

| Role       | Size | Line Height | Letter Spacing | Token               |
| ---------- | ---- | ----------- | -------------- | ------------------- |
| caption    | 10px | 1.2         | 0.24px         | `--text-caption`    |
| body       | 14px | 1.55        | —              | `--text-body`       |
| subheading | 20px | 1.3         | -0.2px         | `--text-subheading` |
| heading-sm | 32px | 1.15        | -0.4px         | `--text-heading-sm` |
| heading    | 49px | 1.05        | -1px           | `--text-heading`    |
| heading-lg | 72px | 0.98        | -1.8px         | `--text-heading-lg` |
| display    | 89px | 0.94        | -3.1px         | `--text-display`    |

## Tokens — Spacing & Shapes

**Density:** comfortable

### Spacing Scale

| Name | Value | Token          |
| ---- | ----- | -------------- |
| 4    | 4px   | `--spacing-4`  |
| 6    | 6px   | `--spacing-6`  |
| 7    | 7px   | `--spacing-7`  |
| 8    | 8px   | `--spacing-8`  |
| 10   | 10px  | `--spacing-10` |
| 12   | 12px  | `--spacing-12` |
| 14   | 14px  | `--spacing-14` |
| 16   | 16px  | `--spacing-16` |
| 18   | 18px  | `--spacing-18` |
| 20   | 20px  | `--spacing-20` |
| 22   | 22px  | `--spacing-22` |
| 24   | 24px  | `--spacing-24` |
| 28   | 28px  | `--spacing-28` |
| 30   | 30px  | `--spacing-30` |
| 32   | 32px  | `--spacing-32` |
| 44   | 44px  | `--spacing-44` |

### Border Radius

| Element   | Value |
| --------- | ----- |
| tags      | 2px   |
| cards     | 0px   |
| buttons   | 4px   |
| logoTiles | 4px   |

### Shadows

| Name | Value                                      | Token         |
| ---- | ------------------------------------------ | ------------- |
| sm   | `rgba(197, 255, 74, 0.45) 0px 0px 8px 0px` | `--shadow-sm` |

### Layout

- **Page max-width:** 1280px
- **Section gap:** 80-120px
- **Card padding:** 32-48px
- **Element gap:** 16-20px

## Components

### Signal Lime CTA Button

**Role:** Primary action trigger — the only filled chromatic button in the system

Background #c5ff4a, text #000000, padding 14px 24px, radius 4px. Inter Tight weight 500 at 14px with 0.04em tracking. Carries a chromatic glow shadow 0 0 8px 0 rgba(197, 255, 74, 0.45) — this glow is the button's only elevation, signaling 'this is the thing that does something'.

### Ghost Nav Button

**Role:** Top-bar navigation items (PRODUCTS, TECHNOLOGY, ECOSYSTEM, $ZKP, RESOURCES)

Transparent background, text #ffffff, Inter Tight weight 500 at 13px, 0.18em uppercase tracking. No border, no background. Active state: text shifts to #c5ff4a.

### Outlined Green Button (Launch CTA)

**Role:** Secondary action with chromatic border

Transparent background, 1px border #c5ff4a, text #c5ff4a, padding 14px 24px, radius 4px. Inter Tight weight 500 at 14px uppercase with 0.08em tracking. Carries the same lime glow as the filled CTA.

### Sharp Content Card

**Role:** Feature panels for TransGate / TransGate SDK sections

Background #1f1f1f, 1px border #252525, padding 40px, radius 0px. No drop shadow — depth comes from the border-color step against the canvas. Contains a tracked-out label (#7a7a8a, 0.18em) at the top, a PT Serif weight 300 headline (32–40px), and a body paragraph in Inter Tight 14px.

### Code Block Panel

**Role:** Inline proof / SDK code display

Background #252525, padding 24px, radius 4px, 1px border #313131. JetBrains Mono 13px, line-height 1.55. Lime-green syntax highlighting tokens (#c5ff4a) on #000000 inline code spans. Tag pills (e.g. 'SCHEMA', 'BUNDLE', 'INTENT') sit right-aligned in lime.

### Metadata Label Stamp

**Role:** [ BUILT FOR HUMANS & AGENTS ] style section labels

Inter Tight 11px weight 500, uppercase, 0.22em tracking, color #7a7a8a, bracketed in literal square brackets. The bracket punctuation is part of the identity — never strip the brackets.

### Accent Word

**Role:** Single italic PT Serif word in lime green inside an otherwise white headline

PT Serif weight 300 italic, color #c5ff4a, sized to match the parent headline (e.g. 'Verifiable Internet.' inside a 89px display). This is the only place italic PT Serif appears and the only place lime hits a headline — use sparingly, one per headline maximum.

### Logo Tile

**Role:** Brand mark in lime green square

60×60 to 80×80px square, background #c5ff4a, radius 4px, contains a black 'P' mark centered. The glow shadow 0 0 8px rgba(197, 255, 74, 0.45) is applied to the tile, not the inner mark.

### Dotted Globe Visual

**Role:** Hero section world-map illustration

Pure SVG composed of 1.5px #ffffff dots on the #060606 canvas forming a world-map silhouette. The dots use opacity 0.4–0.7 to create continent density. No gradient fills, no fills at all — this is pointillism typography, not vector art.

### Neon Section Divider

**Role:** Horizontal lime strip separating major page sections

Full-width 6–8px bar, solid #c5ff4a, used once between hero and content. Functions as a 'classified document' red-bar moment. Do not repeat within a page; one per scroll is the rule.

### Status Tag Pill

**Role:** Signed/Verified status indicators (e.g. '✓ SIGNED', '● 3 MODES')

Background transparent, 1px border #c5ff4a, text #c5ff4a, padding 4px 10px, radius 9999px, Inter Tight 11px weight 500 uppercase 0.06em. Check mark or dot prefix in same lime.

### Top Navigation Bar

**Role:** Persistent page chrome

Background #000000, 1px bottom border #252525, height 64px, max-width 1280px centered. Left: wordmark. Center: 5 nav items in ghost button style. Right: lime CTA. Sticky on scroll.

### Section Eyebrow Bracket

**Role:** Above-title metadata tag for new content sections

Text 'FOR HUMANS · BROWSER EXTENSION' or 'FOR AGENTS · TRANSGATE SDK' in Inter Tight 11px weight 500, 0.22em tracking, color #7a7a8a. Period-separator between phrases. Right-aligned: 'B 01' / 'B 02' style section index in same treatment.

### Modal & Dialog Window (StarPromptModal / GuestLoginModal)

**Role:** Focused overlay dialogs for user actions, automation prompts, and confirmations

- **Backdrop:** `fixed inset-0 z-110 bg-black/80 backdrop-blur-xs transition-opacity duration-200`
- **Dialog Container:** `fixed z-111 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[480px] p-4 transition-all duration-200`
- **Card Shell:** `bg-carbon border border-graphite rounded-sm overflow-hidden shadow-2xl flex flex-col text-chalk`
- **Zone 1 (Header Bar):** `px-5 py-3.5 border-b border-graphite flex items-center justify-between bg-onyx/40`
  - Tag Eyebrow: `text-caption font-jetbrains-mono font-bold text-signal-lime uppercase tracking-wider` with `[ BRAND/SECTION · BADGE ]` bracket syntax
  - Close Button: `p-1 rounded text-ash hover:text-white hover:bg-graphite transition-colors cursor-pointer`
- **Zone 2 (Body Content):** `p-5 space-y-4`
  - Headline: `font-pt-serif font-light text-white text-2xl tracking-tight leading-snug` with `<span className="italic text-signal-lime font-pt-serif">highlight</span>`
  - Body: `font-inter-tight text-note text-pearl leading-relaxed mt-1`
  - Context / Feature Card: `p-3.5 rounded-sm bg-onyx/80 border border-graphite`
- **Zone 3 (Footer Action Bar):** `px-5 py-3.5 border-t border-graphite bg-onyx/40 flex items-center justify-between gap-3`
  - Dismiss: `px-3.5 py-1.5 rounded-sm text-note font-inter-tight text-ash hover:text-white hover:bg-graphite transition-colors cursor-pointer`
  - Primary CTA: `inline-flex items-center gap-2 px-4 py-1.5 rounded-sm bg-signal-lime text-black font-inter-tight font-semibold text-note hover:brightness-110 transition-all cursor-pointer shadow-[0_0_8px_rgba(197,255,74,0.45)] disabled:opacity-60`

### Guided Tour & Spotlight Walkthrough (EditorTour)

**Role:** Multi-step interactive feature tour with target spotlighting

- **Spotlight Mask:** SVG mask cutout with smooth cutout around target bounding rect.
- **Spotlight Pulse Box:** `fixed z-115 pointer-events-none rounded-md border-2 border-signal-lime shadow-[0_0_24px_rgba(197,255,74,0.65)] transition-all duration-300 animate-pulse` with tag `[ FOCO DO TOUR ]`.
- **Step Dots Indicator:** `h-1 rounded-full transition-all duration-200` (`w-6 bg-signal-lime` for active step, `w-2 bg-graphite hover:bg-ash` for inactive).
- **Navigation:** Back button (`ArrowLeft`), Skip button, and Next/Finish CTA (`ArrowRight` / `Check`).

### Floating Corner Banner (ConsentBanner)

**Role:** Non-blocking persistent floating notifications (analytics consent, system updates)

- **Container:** `fixed bottom-6 right-6 z-9999 w-[min(440px,calc(100vw-2rem))] transition-all duration-300 ease-out`
- **Transitions:** `translate-y-0 opacity-100 scale-100` (visible) vs `translate-y-6 opacity-0 scale-95 pointer-events-none` (hidden).
- **Structure:** Same 3-zone standard (`bg-carbon border border-graphite rounded-sm overflow-hidden shadow-2xl`).

## Do's and Don'ts

### Do

- Prefer canonical Tailwind utilities whenever a class can be expressed through a theme token or existing scale; if `suggestCanonicalClasses` proposes a replacement, use it instead of an arbitrary value.
- Use icons for UI affordances, labels, and status cues; do not use emojis in source or interface copy.
- Use #c5ff4a for filled CTA buttons, glowing borders, status pills, and exactly one italic accent word per headline — never for body text, never for icons at full size
- Set display headlines in PT Serif weight 300 with negative tracking (-0.025em at 56px scaling to -0.035em at 130px) and tight line-height (0.88–0.95)
- Set all UI labels in Inter Tight uppercase with 0.18–0.26em letter-spacing and bracket or period punctuation to read as classified-document metadata
- Separate surface levels using border color steps (#252525 → #1f1f1f → #313131) rather than drop-shadows; the system has exactly one glow and it belongs to the lime CTA
- Use #060606 as the dominant page background and reserve #000000 for absolute void areas (top bar, hero deep sections, code block inline spans)
- Compose hero sections with the dotted-globe SVG (white dots, no fills) on the near-black canvas; never use a photographic or gradient hero
- Scale the neon section divider (full-width 6–8px #c5ff4a bar) to exactly one per page between major page regions

### Don't

- Do not introduce any chromatic color beyond #c5ff4a, #597321, and #314013 — the entire chromatic palette is three greens against ten grays
- Do not apply drop-shadows to cards, panels, or modals; elevation is communicated through surface-tone layering only
- Do not use PT Serif at weight 400 or heavier for display; weight 300 is the signature and heavier weights break the whisper-authority effect
- Do not round corners beyond 4px on cards, panels, and tiles; the system is near-sharp by design — only the status pill and nothing else uses 9999px radius
- Do not use lime green for body copy, paragraph text, or long-form descriptions — it is reserved for actions, borders, and at most one italic accent word per headline
- Do not mix the display serif into UI chrome (buttons, nav, labels); Inter Tight owns everything below 24px
- Do not center long body paragraphs; content cards use left-aligned text with the metadata label and section index left/right mirrored above the title
- Do not use arbitrary Tailwind values when a canonical token exists; keep the codebase free of `suggestCanonicalClasses` warnings.
- Do not use emojis in the UI; use lucide icons or monochrome symbols instead.

## Surfaces

| Level | Name   | Value     | Purpose                                    |
| ----- | ------ | --------- | ------------------------------------------ |
| 0     | Canvas | `#060606` | Page background — the void                 |
| 1     | Card   | `#1f1f1f` | Content blocks, feature panels             |
| 2     | Raised | `#252525` | Nav bar, active panels, code blocks        |
| 3     | Hover  | `#313131` | Interactive hover state, elevated popovers |

## Elevation

- **Signal Lime CTA Button:** `0 0 8px 0 rgba(197, 255, 74, 0.45)`

## Imagery

Imagery is pointillist, not photographic. The hero uses a dotted SVG world-map (1.5px white dots, opacity 0.4–0.7 to suggest continent density) floating on the near-black canvas. No photographs, no lifestyle shots, no product renders. The only 'image' asset is the lime-green logo tile (square, 4px radius, black 'P' mark, with the signature glow). Section illustrations and diagrams live as code-block panels (JetBrains Mono on #252525) rather than rendered graphics. Iconography is line-only or filled monochrome in #ffffff or #c5ff4a — no multicolor icons, no duotone, no gradient icons. The overall density is text-dominant with whitespace and typography doing the visual heavy lifting; the dotted globe is the single largest graphic element on any page.

## Layout

Layout is max-width 1280px centered with generous outer gutters. The hero is a full-bleed dark canvas with a centered headline stack (eyebrow bracket → 89px PT Serif headline → 14px Inter Tight body → lime CTA), the dotted-globe SVG sitting behind the headline at roughly 60% page width. Below the hero, a 6–8px neon lime divider bar spans full width. Content sections alternate between single-column centered stacks (display headline + paragraph) and two-column card grids (TransGate / TransGate SDK pattern: card with metadata eyebrow, 32–40px serif title, body, and a code-block proof panel at the bottom). Vertical rhythm is spacious: 80–120px between major sections, 32–48px inside cards, 16–20px between elements within a card. Navigation is a sticky top bar with a black background, a 1px graphite bottom border, wordmark left, five centered ghost nav items, and a lime CTA pinned right. The page reads top-to-bottom as a single editorial column punctuated by section dividers, never as a dense dashboard grid.

## Agent Prompt Guide

Quick Color Reference:

- text (primary): #ffffff
- text (body): #e5e5e5
- text (muted/helper): #7a7a8a
- background (canvas): #060606
- background (card/panel): #1f1f1f
- border (hairline): #252525
- accent / primary action: #c5ff4a (filled action)

Example Component Prompts:

1. Create a hero section: background #060606. Eyebrow label '[ BUILT FOR HUMANS & AGENTS ]' in Inter Tight 11px weight 500 uppercase 0.22em tracking color #7a7a8a. Headline 'Privacy & Trust Layer for the Verifiable Internet.' in PT Serif weight 300 at 89px, line-height 0.94, letter-spacing -3.1px, color #ffffff — but the words 'Verifiable Internet.' are set in italic #c5ff4a. Body subtext in Inter Tight 14px weight 400 line-height 1.55 color #e5e5e5, max-width 480px centered. A dotted-globe SVG (white dots, opacity 0.4–0.7) sits behind the headline. Below the hero, a full-width 6px solid #c5ff4a divider bar.

2. Create a content card: background #1f1f1f, 1px border #252525, padding 40px, radius 0px. Eyebrow label 'FOR HUMANS · BROWSER EXTENSION' in Inter Tight 11px weight 500 uppercase 0.22em color #7a7a8a, with a right-aligned 'B 01' section index in the same treatment. Title 'TransGate' in PT Serif weight 300 at 40px line-height 1.05 color #ffffff. Body paragraph in Inter Tight 14px weight 400 line-height 1.55 color #e5e5e5. At the bottom, a code-block panel: background #252525, padding 24px, radius 4px, JetBrains Mono 13px line-height 1.55, with lime-green keyword tokens (#c5ff4a) and a right-aligned status pill ('✓ SIGNED' in a 1px #c5ff4a border pill, Inter Tight 11px weight 500 uppercase).

3. Create a top navigation bar: background #000000, 1px bottom border #252525, height 64px, max-width 1280px centered. Left: zkPass wordmark in PT Serif weight 300 at 20px color #ffffff. Center: five nav items (PRODUCTS, TECHNOLOGY, ECOSYSTEM, $ZKP, RESOURCES) in Inter Tight 13px weight 500 uppercase 0.18em tracking color #ffffff, no background, separated by 32px gaps. Right: a 'LAUNCH' ghost button — transparent background, 1px border #c5ff4a, text #c5ff4a, Inter Tight 13px weight 500 uppercase 0.08em tracking, padding 10px 20px, radius 4px, with the signature glow 0 0 8px rgba(197, 255, 74, 0.45). Sticky on scroll.

4. Create a logo tile: 64×64px square, background #c5ff4a, radius 4px, centered black 'P' mark in PT Serif weight 300 at 36px, with the glow shadow 0 0 8px rgba(197, 255, 74, 0.45) applied to the tile itself. Place it centered below the hero headline.

5. Create a section eyebrow: text 'Two audiences,' in PT Serif weight 300 at 49px line-height 1.05 color #ffffff, followed by 'one primitive.' in the same size and weight but italic and color #c5ff4a. Above it, a small bracket label '[ BUILT FOR HUMANS & AGENTS ]' in Inter Tight 11px weight 500 uppercase 0.22em color #7a7a8a. To the right of the headline, a 2-paragraph body block in Inter Tight 14px weight 400 line-height 1.55 color #e5e5e5, max-width 380px.

## Similar Brands

- **Nervos Network** — Same dark-canvas-plus-single-acid-green-accent language, and the same editorial-grade serif mixed with terminal-style monospace for cryptographic proof
- **Helium** — Near-black backgrounds with a single vivid chartreuse/lime as the only chromatic brand color, plus hairline-border card surfaces and a glow-on-CTA signature
- **Aleo** — Privacy-protocol crypto sites that pair whisper-weight display serif with uppercase tracked-out sans labels and lime-green CTA glow against near-black
- **Layer3** — Dark interface with neon-lime accent used sparingly as border, pill, and CTA glow; near-sharp corners; editorial section rhythm
- **Convex (defi)** — Mono-on-black product chrome with a single vivid green accent reserved exclusively for action states, status pills, and border highlights

## Quick Start

### CSS Custom Properties

```css
:root {
  /* Colors */
  --color-void-black: #000000;
  --color-carbon: #060606;
  --color-graphite: #252525;
  --color-onyx: #1f1f1f;
  --color-iron: #313131;
  --color-slate: #3d3d3d;
  --color-fog: #525252;
  --color-ash: #7a7a7a;
  --color-smoke: #8a8a8a;
  --color-pearl: #c5c5c5;
  --color-bone: #e5e5e5;
  --color-chalk: #ffffff;
  --color-signal-lime: #c5ff4a;
  --color-olive-depth: #597321;
  --color-moss-shadow: #314013;

  /* Typography — Font Families */
  --font-pt-serif: 'PT Serif', ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
  --font-inter-tight:
    'Inter Tight', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    sans-serif;
  --font-jetbrains-mono:
    'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  --font-ui-monospace:
    'ui-monospace', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

  /* Typography — Scale */
  --text-caption: 10px;
  --leading-caption: 1.2;
  --tracking-caption: 0.24px;
  --text-body: 14px;
  --leading-body: 1.55;
  --text-subheading: 20px;
  --leading-subheading: 1.3;
  --tracking-subheading: -0.2px;
  --text-heading-sm: 32px;
  --leading-heading-sm: 1.15;
  --tracking-heading-sm: -0.4px;
  --text-heading: 49px;
  --leading-heading: 1.05;
  --tracking-heading: -1px;
  --text-heading-lg: 72px;
  --leading-heading-lg: 0.98;
  --tracking-heading-lg: -1.8px;
  --text-display: 89px;
  --leading-display: 0.94;
  --tracking-display: -3.1px;

  /* Typography — Weights */
  --font-weight-light: 300;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;

  /* Spacing */
  --spacing-4: 4px;
  --spacing-6: 6px;
  --spacing-7: 7px;
  --spacing-8: 8px;
  --spacing-10: 10px;
  --spacing-12: 12px;
  --spacing-14: 14px;
  --spacing-16: 16px;
  --spacing-18: 18px;
  --spacing-20: 20px;
  --spacing-22: 22px;
  --spacing-24: 24px;
  --spacing-28: 28px;
  --spacing-30: 30px;
  --spacing-32: 32px;
  --spacing-44: 44px;

  /* Layout */
  --page-max-width: 1280px;
  --section-gap: 80-120px;
  --card-padding: 32-48px;
  --element-gap: 16-20px;

  /* Named Radii */
  --radius-tags: 2px;
  --radius-cards: 0px;
  --radius-buttons: 4px;
  --radius-logotiles: 4px;

  /* Shadows */
  --shadow-sm: rgba(197, 255, 74, 0.45) 0px 0px 8px 0px;

  /* Surfaces */
  --surface-canvas: #060606;
  --surface-card: #1f1f1f;
  --surface-raised: #252525;
  --surface-hover: #313131;
}
```

### Tailwind v4

```css
@theme {
  /* Colors */
  --color-void-black: #000000;
  --color-carbon: #060606;
  --color-graphite: #252525;
  --color-onyx: #1f1f1f;
  --color-iron: #313131;
  --color-slate: #3d3d3d;
  --color-fog: #525252;
  --color-ash: #7a7a7a;
  --color-smoke: #8a8a8a;
  --color-pearl: #c5c5c5;
  --color-bone: #e5e5e5;
  --color-chalk: #ffffff;
  --color-signal-lime: #c5ff4a;
  --color-olive-depth: #597321;
  --color-moss-shadow: #314013;

  /* Typography */
  --font-pt-serif: 'PT Serif', ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
  --font-inter-tight:
    'Inter Tight', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    sans-serif;
  --font-jetbrains-mono:
    'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  --font-ui-monospace:
    'ui-monospace', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

  /* Typography — Scale */
  --text-caption: 10px;
  --leading-caption: 1.2;
  --tracking-caption: 0.24px;
  --text-body: 14px;
  --leading-body: 1.55;
  --text-subheading: 20px;
  --leading-subheading: 1.3;
  --tracking-subheading: -0.2px;
  --text-heading-sm: 32px;
  --leading-heading-sm: 1.15;
  --tracking-heading-sm: -0.4px;
  --text-heading: 49px;
  --leading-heading: 1.05;
  --tracking-heading: -1px;
  --text-heading-lg: 72px;
  --leading-heading-lg: 0.98;
  --tracking-heading-lg: -1.8px;
  --text-display: 89px;
  --leading-display: 0.94;
  --tracking-display: -3.1px;

  /* Spacing */
  --spacing-4: 4px;
  --spacing-6: 6px;
  --spacing-7: 7px;
  --spacing-8: 8px;
  --spacing-10: 10px;
  --spacing-12: 12px;
  --spacing-14: 14px;
  --spacing-16: 16px;
  --spacing-18: 18px;
  --spacing-20: 20px;
  --spacing-22: 22px;
  --spacing-24: 24px;
  --spacing-28: 28px;
  --spacing-30: 30px;
  --spacing-32: 32px;
  --spacing-44: 44px;

  /* Shadows */
  --shadow-sm: rgba(197, 255, 74, 0.45) 0px 0px 8px 0px;
}
```
