<div align="center">
  <a href="https://gitascii.com">
    <img src="src/app/icon-512.png" width="80" height="80" alt="GitAscii Logo" />
  </a>
  <h1>Contributing to GitAscii</h1>
  <p>Thank you for your interest in contributing to GitAscii! We welcome contributions of all kinds.</p>
</div>

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features & Widgets](#suggesting-features--widgets)
  - [Adding Community Templates](#adding-community-templates)
  - [Improving Documentation](#improving-documentation)
- [Development Workflow](#development-workflow)
  - [Prerequisites](#prerequisites)
  - [Setting Up Locally](#setting-up-locally)
  - [Running the Project](#running-the-project)
- [Project Architecture & Key Directories](#project-architecture--key-directories)
- [Coding Standards & Guidelines](#coding-standards--guidelines)
  - [1. Centralized Endpoints](#1-centralized-endpoints)
  - [2. Conventional Commits](#2-conventional-commits)
  - [3. Design Tokens & Styling (Tailwind v4)](#3-design-tokens--styling-tailwind-v4)
  - [4. Robust Error Handling](#4-robust-error-handling)
  - [5. Guard Clauses & Clean Flow](#5-guard-clauses--clean-flow)
  - [6. Testing & Quality Checks](#6-testing--quality-checks)
  - [7. Storybook for Widgets](#7-storybook-for-widgets)
- [Pull Request Checklist](#pull-request-checklist)

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please report unacceptable behavior to `igorcbraz1@gmail.com`.

---

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report, please check existing [GitHub Issues](https://github.com/Igorcbraz/GitAscii/issues) to see if the problem has already been reported.

When creating a bug report, please include:

- A clear and descriptive title.
- Steps to reproduce the behavior.
- Expected vs. actual behavior.
- Browser/OS version, and relevant screenshots or console error logs.

### Suggesting Features & Widgets

We love new ideas for widgets, ASCII conversion filters, and telemetry decks! Open a Feature Request issue detailing:

- The problem your feature solves or the aesthetic experience it adds.
- Proposed design or ASCII mockups.
- Any API/data dependencies (e.g. GitHub GraphQL, WakaTime, etc.).

### Adding Community Templates

Adding custom pre-built templates for the community is straightforward:

1. Design your template inside the [GitAscii Web Editor](https://gitascii.com).
2. Click **Export Template** in the sidebar (this automatically removes personal data like custom bio, usernames, and avatars).
3. Save the file into `src/data/templates/<template_name>.json`.
4. Register the template in `src/data/templates/index.ts`.
5. Submit a PR!

### Improving Documentation

Our documentation is powered by **Mintlify** inside the `docs/` folder. You can run and preview the docs locally with:

```bash
npm run docs
```

---

## Development Workflow

### Prerequisites

- **Node.js**: v20.x or higher
- **npm**: v10.x or higher (or compatible package managers)
- **Git**

### Setting Up Locally

```bash
# 1. Fork the repo on GitHub, then clone your fork locally:
git clone https://github.com/<your-username>/GitAscii.git
cd GitAscii

# 2. Install dependencies (Husky git hooks are set up automatically):
npm install

# 3. Create your feature branch:
git checkout -b feat/your-feature-name
```

### Running the Project

| Command             | Description                                                           |
| :------------------ | :-------------------------------------------------------------------- |
| `npm run dev`       | Boots the Next.js local development server on `http://localhost:3000` |
| `npm run storybook` | Boots the Storybook component workbench on `http://localhost:6006`    |
| `npm run test`      | Runs the Vitest test suite                                            |
| `npm run test:e2e`  | Runs Playwright end-to-end browser tests                              |
| `npm run check`     | Executes full verification (`typecheck` + `lint` + `build`)           |

---

## Project Architecture & Key Directories

```text
GitAscii/
├── src/
│   ├── app/                # Next.js App Router (Pages, Layouts, Dynamic SVG API Routes)
│   ├── components/         # Reusable core UI components & shared modals
│   ├── constants/          # Application constants, links, limits, and widget IDs
│   ├── data/
│   │   └── templates/      # Community pre-built profile templates (.json)
│   ├── engine/             # Core rendering engine (SVG compiler, Canvas ASCII converter)
│   ├── features/
│   │   ├── editor/         # Visual Canvas, Zustand stores, Toolbar, Property Panels
│   │   ├── widgets/        # Dynamic widget implementations & showcase logic
│   │   └── templates/      # Template gallery and detail views
│   ├── services/
│   │   └── endpoints.ts    # Centralized registry for all internal and external API URLs
│   └── utils/              # Helper utilities (clipboard, formatting, telemetry)
├── docs/                   # Mintlify interactive documentation source
├── design.md               # Visual design system specifications & tokens
└── theme.css               # Global CSS variables and typography tokens
```

---

## Coding Standards & Guidelines

### 1. Centralized Endpoints

All internal API route endpoints and external URLs **must** be defined in `src/services/endpoints.ts` (`API_ENDPOINTS` / `EXTERNAL_LINKS`).  
❌ **Never** hardcode endpoint strings inside UI components, hooks, or engine files.

### 2. Conventional Commits

Commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. Husky + Commitlint will validate this on every commit:

- `feat(editor): add multi-selection marquee support`
- `fix(engine): resolve contrast calculation in light theme SVG`
- `docs(api): update dynamic route query parameter references`
- `refactor(widgets): simplify commit heatmap matrix layout`

### 3. Design Tokens & Styling (Tailwind v4)

Follow the classified broadsheet & encrypted terminal design system documented in [`design.md`](design.md):

- **Colors:** Use canonical tokens (`bg-void-black`, `bg-carbon`, `bg-onyx`, `bg-graphite`, `text-chalk`, `text-bone`, `text-signal-lime`).
- **Typography:** Display titles in PT Serif (`font-pt-serif font-light`), UI chrome in Inter Tight (`font-inter-tight`), and telemetry data in JetBrains Mono (`font-jetbrains-mono`).
- **Borders & Radii:** Near-sharp borders (max `rounded-sm` / `rounded` for cards; no arbitrary rounded values).

### 4. Robust Error Handling

- Always handle `catch` blocks with contextual logging or graceful fallbacks.
- Never leave empty/silent catch statements.
- Dynamic SVG API routes must return a valid error SVG fallback rather than crashing with an unhandled 500 error.

### 5. Guard Clauses & Clean Flow

- Prefer early returns (guard clauses) to reduce nesting and keep functions readable.
- Avoid redundant, self-explanatory code comments. Write clear, self-documenting TypeScript code.

### 6. Testing & Quality Checks

Before opening a PR, always ensure your code passes static analysis and tests:

```bash
# Run type check, linting, and build verification
npm run check

# Run unit tests
npm run test
```

### 7. Storybook for Widgets

When creating or updating UI widgets, add or update their corresponding Storybook stories (`*.stories.tsx`) so other contributors can test them in isolation.

---

## Pull Request Checklist

Before submitting your Pull Request, verify that:

- [ ] Branch is up to date with `main`.
- [ ] `npm run check` runs with zero TypeScript or ESLint errors.
- [ ] `npm run test` passes without failures.
- [ ] Commit messages follow the Conventional Commits format.
- [ ] Visual changes have been tested across both Dark and Light modes.
- [ ] Screenshots or animated GIFs/videos are attached to the PR description for any UI modifications.

Thank you for helping make GitAscii extraordinary! 🚀
