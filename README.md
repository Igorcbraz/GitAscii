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

## ⚡ What is GitAscii?

**GitAscii** is a complete platform designed to transform standard GitHub profiles into high-impact, self-updating visual experiences. 

Instead of dealing with static markdown tables or generic badges, GitAscii provides developers with a **visual drag-and-drop editor** backed by a powerful **ASCII and SVG rendering engine**. It combines the raw, technical aesthetics of a command-line interface with the elegance of a classic newspaper layout, resulting in a premium "classified document" look.

Once your profile is designed, GitAscii serves it via a dynamic URL, meaning your GitHub README stays updated automatically without any manual commits on your part.

<div align="center">
  <img src="public/example.svg" width="800" alt="GitAscii Example Profile Preview" />
</div>

---

## 🚀 Product Features & Widget Library

GitAscii comes packed with a rich library of internal widgets and seamless integrations with the most popular GitHub stats services, giving you ultimate control over your profile's aesthetic.

### 🎨 Visual Drag-and-Drop Editor
A robust, browser-based editor inspired by tools like Figma and Canva. It features real-time SVG rendering, allowing you to drag widgets, adjust layouts, and preview your final README instantly.

### 🔓 Frictionless Access (Two Ways to Play)
We respect your privacy and workflow. You don't necessarily need to authenticate via OAuth to use GitAscii. There are two ways to interact with the product:
1. **Public Sandbox (No Login)**: Just type any GitHub username and instantly start designing based on public data. Perfect for quick edits or trying out templates.
2. **Authenticated Mode**: Log in via GitHub OAuth to unlock private repositories data, save your layouts directly to your account, and manage your dynamic rendering links with ease.

### 📦 Portability (Import/Export Layouts)
You can seamlessly export your custom-crafted profile layout as a JSON file and import it anytime, or share it with other users in the community.

### 📟 Core & ASCII Widgets
- **ASCII Art Engine**: Convert photos, logos, or raw images into highly detailed character art directly in the browser (with 6+ character sets and contrast controls).
- **ASCII Text**: Render custom texts using true ASCII art fonts.
- **Terminal Info**: A Neofetch-style terminal info card summarizing your profile.
- **Tech Stack Gallery**: An interactive gallery of skill icons (React, Node, etc.).
- **Top Languages & GitHub Stats**: Clean, built-in metrics blocks for languages, repos, stars, and followers.
- **Featured Repos**: Highlight your best work in stylized repository cards.
- **Headers, Avatars, Bio & Footers**: Essential structural widgets that maintain the editorial newspaper look.

### 🌐 External Integrations
GitAscii embraces the open-source ecosystem. We natively support wrapping popular community tools into our design system:
- **GitFest**: Generate a festival lineup style poster of your top repos!
- **Contribution Snake**: The famous animated snake eating your commit graph.
- **GitHub Readme Stats & Streak Stats**: Fully integrated blocks tracking your commits and current streaks.
- **Profile Trophy**: Display achievements and trophies based on your GitHub activity.
- **Activity Graph**: A line chart mapping your last 31 days of commits.
- **Metrics Card & Views Counter**: Advanced infographics and real-time visitor counters.
- **Readme Quotes**: Daily motivational quotes for developers.

### 🔗 Dynamic Direct Rendering
Say goodbye to manual repository updates. GitAscii generates your layout as an SVG served via our dynamic URL system. Just paste one link into your GitHub README, and your stats, ASCII art, and badges will update automatically.

### 📐 Premium Templates & Smart Generation
Not a designer? No problem. GitAscii includes over 13 ready-to-use, premium layouts (such as "Minimalist Terminal" or "Industrial Cyberpunk"). Additionally, the Smart Generation feature can analyze your GitHub profile and instantly assemble the perfect layout tailored to your activity.

### 📊 Comprehensive Dashboard & Analytics
GitAscii tracks usage gracefully using a decoupled SaaS-level analytics architecture (supporting GA4, PostHog, etc.), complete with Consent Mode v2 and Web Vitals monitoring, ensuring optimal performance and user experience.

### 🌗 Adaptive Theme Rendering (Dark & Light)
GitAscii generates separate SVGs for both dark and light themes. By leveraging the HTML `<picture>` element in your GitHub README, your profile will automatically adapt to match the viewer's current GitHub theme preference.

### 📂 Multiple Profiles
Create different profiles for different purposes. Maintain separate configurations for a "Portfolio", a "Resume", or an "Open Source Contributor" look — all saved within a single account.

### 🌍 Full Internationalization (i18n)
The platform is fully localized in **English**, **Portuguese**, and **Spanish**, automatically detecting and adapting to the developer's native language.

---

## 🏗️ Technical Architecture

GitAscii is built to scale, using a modern stack and a modular architecture:

*   **Frontend Ecosystem:** Built on [Next.js 15.3](https://nextjs.org/) (App Router) and [React 19](https://react.dev/), leveraging [Tailwind CSS 4.0](https://tailwindcss.com/) for styling and [Framer Motion 12](https://motion.dev/) for fluid micro-animations. State is managed elegantly via [Zustand](https://github.com/pmndrs/zustand).
*   **Rendering Engine (`src/engine/`):** The core logic handling the complex conversion of images to ASCII matrices and assembling dynamic SVGs on the fly.
*   **Modular Features (`src/features/`):** The visual editor, templates gallery, and GitHub API integrations are decoupled into modular feature folders for maintainability.
*   **Analytics Subsystem (`src/lib/analytics/`):** A strictly typed, IoC (Inversion of Control) based tracking system that abstracts away the provider, allowing seamless event logging (e.g., `generate_readme`, `copy_svg`) without polluting business logic.

---

## 🎨 Design Philosophy

Our visual identity follows strict rules documented in our [Design Guide](design.md). The concept is **"Encrypted terminal meets classified broadsheet"**.

*   **The Void:** We use `Void Black` (`#000000`) and `Carbon` (`#060606`) as our absolute backgrounds to eliminate visual fatigue.
*   **The Signal:** `Signal Lime` (`#c5ff4a`) acts as an emergency light in a dark room. It is the *only* chromatic color used, strictly reserved for CTAs, glowing borders, and crucial keywords.
*   **Typography:** 
    *   **PT Serif (Weight 300)** brings an unexpected, whisper-weight editorial authority to display headlines.
    *   **Inter Tight** handles all UI chrome and tracked-out, uppercase metadata labels (like `[ BUILT FOR AGENTS ]`).
    *   **JetBrains Mono** is used exclusively for code snippets, providing a technical "proof" layer.

---

## 💻 How to Run Locally

Get the platform running on your machine in seconds:

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

Open [http://localhost:3000](http://localhost:3000) in your browser to start building.

---

## 📂 Directory Structure

```text
GitAscii/
├── public/                 # Static assets, logos, and preview images
├── src/
│   ├── app/                # Next.js App Router (Pages & Layouts)
│   ├── components/         # Shared UI components (Buttons, Cards, Modals)
│   ├── constants/          # Static data and configuration
│   ├── engine/             # Core logic for ASCII generation & SVG rendering
│   ├── features/           # Domains (Visual Editor, Smart Generator, Landing)
│   ├── lib/                # Utilities, Hooks, and the Analytics subsystem
│   └── middleware.ts       # Route protection and security
├── design.md               # Detailed Design System specifications
├── analytics.md            # SaaS analytics & event tracking documentation
├── theme.css               # Global CSS variables (Colors & Tokens)
└── package.json            # Dependencies and scripts
```

---

<div align="center">
  <sub>Built with design obsession by <a href="https://github.com/Igorcbraz">Igorcbraz</a>.</sub>
</div>
