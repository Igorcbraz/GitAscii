<div align="center">
  <img src="public/icon-512.png" width="120" height="120" alt="GitAscii Logo" />

  # ── GitAscii ──
  
  > **Where cryptic terminals meet editorial newspaper design** — elevate your GitHub presence to a premium design level dynamically and automatically.

  [![Next.js](https://img.shields.io/badge/Next.js-15.3-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.0-20232a?style=flat-square&logo=react&logoColor=61dafb)](https://react.dev/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  
</div>

---

### `[ STATUS: CLASSIFIED // SYSTEM OVERVIEW ]`

**GitAscii** is a platform that transforms GitHub profiles and commit histories into high-impact ASCII art and dynamic badges, wrapped in a sophisticated editorial design.

Unlike generic README generators, GitAscii combines the technical aesthetics of *command-line interfaces* with the elegance of classic newspaper layouts — featuring deep dark backgrounds (`Void Black`) accented by energetic neon green (`Signal Lime` / `#c5ff4a`) to spotlight crucial information.

Here is an example of a final profile generated with GitAscii:

<div align="center">
  <img src="public/example.svg" width="800" alt="GitAscii Example Profile Preview" />
</div>

---

## ⚡ Main Features

```
┌────────────────────────────────────────────────────────────────────────┐
│  FEATURE                │ DESCRIPTION                                  │
├─────────────────────────┼──────────────────────────────────────────────┤
│ 🎨 Visual Editor        │ Drag-and-drop interface inspired by Figma    │
│                         │ and Canva with real-time rendering.          │
├─────────────────────────┼──────────────────────────────────────────────┤
│ 📟 ASCII Engine         │ Convert images and photos into ASCII art     │
│                         │ with 6+ character sets and fine controls.    │
├─────────────────────────┼──────────────────────────────────────────────┤
│ 📐 Premium Templates    │ +13 ready-to-use layouts, from Minimalist    │
│                         │ Terminal to Industrial Cyberpunk.            │
├─────────────────────────┼──────────────────────────────────────────────┤
│ 🔗 Direct Rendering     │ Your SVGs are served via a dynamic URL,      │
│                         │ always keeping your GitHub profile updated.  │
├─────────────────────────┼──────────────────────────────────────────────┤
│ 🤖 Smart Generation     │ Analyze the user profile and automatically   │
│                         │ create the perfect layout in seconds.        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Color Palette & Design System

The visual identity of GitAscii follows strict rules documented in our [Design Guide](file:///C:/Repos/GitAscii/design.md):

*   **`Void Black` (`#000000`)** — The absolute background of the entire application.
*   **`Carbon` (`#060606`)** — The dominant canvas color to prevent visual fatigue.
*   **`Graphite` (`#252525`)** — The mid-neutral tone for elevated panels, navbars, and cards.
*   **`Signal Lime` (`#c5ff4a`)** — The only chromatic color. Strictly used for call-to-actions, active borders, and keyword emphasis.
*   **`Chalk` (`#ffffff`) & `Bone` (`#e5e5e5`)** — Text for high emphasis and readability without visual vibration.

---

## 🛠️ Tech Stack

The GitAscii ecosystem is built using modern technologies optimized for performance:

-   **Framework:** [Next.js 15.3](https://nextjs.org/) (App Router)
-   **Core Library:** [React 19](https://react.dev/)
-   **Styling:** [Tailwind CSS 4.0](https://tailwindcss.com/) & PostCSS
-   **Animations:** [Motion (Framer Motion 12)](https://motion.dev/)
-   **State Management:** [Zustand](https://github.com/pmndrs/zustand)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)

---

## 🚀 How to Run Locally

Follow these steps to run the project in a development environment:

### 1. Clone the repository
```bash
git clone https://github.com/Igorcbraz/GitAscii.git
cd GitAscii
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

---

## 📂 Directory Structure

```
GitAscii/
├── public/                 # Static public assets (Icons, Illustrations, Examples)
│   ├── icon-512.png        # Official main logo
│   └── example.svg         # Final result preview file
├── src/
│   ├── app/                # Next.js application routes, layouts, and pages
│   ├── components/         # Shared UI components
│   ├── constants/          # Static constants and data
│   ├── engine/             # ASCII conversion engines and renderers
│   ├── features/           # Modular features (editor, landing page, github api)
│   ├── lib/                # Auxiliary configurations and utilities
│   └── middleware.ts       # Route and security middleware
├── design.md               # Design System technical specifications
├── theme.css               # Custom CSS variable definitions
└── package.json            # Project dependencies and scripts
```

---

<div align="center">
  <sub>Built with design obsession by <a href="https://github.com/Igorcbraz">Igorcbraz</a>.</sub>
</div>
