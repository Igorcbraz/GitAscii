# UIUX Designer

Your AI-powered UI/UX design intelligence system with 50+ design styles, 97 color palettes, 57 font pairings, and comprehensive guidelines for 12 technology stacks.

## 🚀 Quick Start

```bash
# Generate a complete design system for your project
python3 .agent/skills/uiux-designer/scripts/search.py "saas fintech dashboard" --design-system -p "My Project"

# Search specific domains
python3 .agent/skills/uiux-designer/scripts/search.py "glassmorphism" --domain style
python3 .agent/skills/uiux-designer/scripts/search.py "modern elegant" --domain typography

# Get stack-specific guidelines
python3 .agent/skills/uiux-designer/scripts/search.py "performance" --stack react
```

## ✨ What It Does

- **Design System Generation**: One command to get pattern, style, colors, typography, and effects
- **Multi-Domain Search**: Query styles, colors, fonts, charts, UX guidelines, and more
- **Stack-Specific Guidelines**: Best practices for React, Vue, Next.js, Flutter, SwiftUI, and 7 more
- **Priority-Based Rules**: Focus on what matters most (Accessibility > Interaction > Performance > Layout)
- **Pre-Delivery Checklists**: Catch common mistakes before shipping

## 🔧 How It Works

### 1. BM25 Search Engine
The skill uses a custom BM25 implementation to search through CSV knowledge bases, ranking results by relevance.

### 2. Knowledge Domains

| Domain | Content |
|--------|---------|
| `style` | 50+ UI styles (Glassmorphism, Neumorphism, Brutalism, etc.) |
| `color` | 97 color palettes organized by product type |
| `typography` | 57 font pairings with Google Fonts integration |
| `product` | Industry-specific design recommendations |
| `landing` | Landing page patterns and CTA strategies |
| `chart` | Data visualization best practices |
| `ux` | 99 UX guidelines with Do/Don't examples |

### 3. Tech Stack Support

- **Web**: HTML/Tailwind, React, Next.js, Vue, Svelte, Nuxt.js
- **Mobile**: SwiftUI, React Native, Flutter, Jetpack Compose
- **Components**: shadcn/ui, Nuxt UI

## 🔔 When to Use

Use this skill when:
- Starting a new UI/UX project and need design direction
- Choosing color palettes, fonts, or visual style
- Reviewing code for accessibility and UX issues
- Building landing pages, dashboards, or mobile apps
- Implementing responsive layouts or animations

## 📝 Examples

### Example 1: E-commerce Landing Page

```bash
python3 .agent/skills/uiux-designer/scripts/search.py "ecommerce fashion luxury" --design-system -p "Luxe Store"
```

**Output**: Complete design system with elegant style, premium color palette, serif typography, and conversion-optimized landing pattern.

### Example 2: Healthcare Dashboard

```bash
python3 .agent/skills/uiux-designer/scripts/search.py "healthcare medical dashboard" --design-system -p "MedPortal"
```

**Output**: Clean, accessible design with trust-building colors, professional fonts, and chart recommendations for medical data.

### Example 3: UX Review

```bash
# Check animation guidelines
python3 .agent/skills/uiux-designer/scripts/search.py "animation accessibility" --domain ux

# Check React performance patterns
python3 .agent/skills/uiux-designer/scripts/search.py "suspense lazy" --stack react
```

## 📂 Directory Structure

```
uiux-designer/
├── SKILL.md           # Main skill definition
├── README.md          # This file
├── scripts/
│   ├── search.py      # CLI entry point
│   ├── core.py        # BM25 search engine
│   └── design_system.py
└── data/
    ├── styles.csv     # 50+ design styles
    ├── colors.csv     # 97 color palettes
    ├── typography.csv # 57 font pairings
    ├── products.csv   # Product type recommendations
    ├── landing.csv    # Landing page patterns
    ├── charts.csv     # Chart recommendations
    ├── ux-guidelines.csv
    └── stacks/        # 12 stack-specific guidelines
```

## 🛡️ Pre-Delivery Checklist

Before shipping any UI code, verify:

- [ ] No emojis used as icons (use SVG)
- [ ] All clickable elements have `cursor-pointer`
- [ ] Color contrast ≥ 4.5:1 for text
- [ ] Touch targets ≥ 44x44px
- [ ] Smooth transitions (150-300ms)
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
