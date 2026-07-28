---
name: frontend-expert
description: Use when creating React/TypeScript components, pages, or features. For modern patterns including Suspense, useSuspenseQuery, lazy loading, MUI v7 styling, TanStack Router, and performance optimization.
---

# Frontend Expert

Modern React/TypeScript development patterns for high-performance applications.

## 🎯 Overview

This skill provides comprehensive guidelines for building production-grade React applications with:
- **Suspense-first architecture** - No loading spinners, no early returns
- **Type-safe patterns** - Strict TypeScript, no `any` types
- **Performance by default** - Lazy loading, memoization, cache strategies
- **Organized structure** - Feature-based directory organization

## 📋 Quick Start: Component Checklist

```markdown
- [ ] Use `React.FC<Props>` pattern with TypeScript
- [ ] Lazy load if heavy component: `React.lazy(() => import())`
- [ ] Wrap in `<SuspenseLoader>` for loading states
- [ ] Use `useSuspenseQuery` for data fetching
- [ ] Import aliases: `@/`, `~types`, `~components`, `~features`
- [ ] Styles: Inline if <100 lines, separate file if >100 lines
- [ ] Use `useCallback` for event handlers passed to children
- [ ] Default export at bottom
- [ ] No early returns with loading spinners
- [ ] Use `useMuiSnackbar` for user notifications
- [ ] 🧩 **Componentization**: One component per file. Move sub-components to separate files in a feature directory.
- [ ] 🧩 **Constants & Types**: Extract to `constants.ts` and `types.ts` for cleaner main component files.
```

## 📋 Quick Start: Feature Checklist

```markdown
- [ ] Create `features/{feature-name}/` directory
- [ ] Create subdirectories: `api/`, `components/`, `hooks/`, `helpers/`, `types/`
- [ ] Create API service file: `api/{feature}Api.ts`
- [ ] Set up TypeScript types in `types/`
- [ ] Create route in `routes/{feature-name}/index.tsx`
- [ ] Lazy load feature components
- [ ] Use Suspense boundaries
- [ ] Export public API from feature `index.ts`
```

---

## 🧩 Import Aliases

| Alias | Resolves To | Example |
|-------|-------------|---------|
| `@/` | `src/` | `import { apiClient } from '@/lib/apiClient'` |
| `~types` | `src/types` | `import type { User } from '~types/user'` |
| `~components` | `src/components` | `import { SuspenseLoader } from '~components/SuspenseLoader'` |
| `~features` | `src/features` | `import { authApi } from '~features/auth'` |

---

## 🚫 Critical Rules

### No Early Returns for Loading

```typescript
// ❌ NEVER - Causes layout shift
if (isLoading) {
    return <LoadingSpinner />;
}

// ✅ ALWAYS - Consistent layout
<SuspenseLoader>
    <Content />
</SuspenseLoader>
```

### MUI v7 Grid Syntax

```typescript
<Grid size={{ xs: 12, md: 6 }}>  // ✅ v7 syntax
<Grid xs={12} md={6}>             // ❌ Old syntax
```

### API Route Format

```typescript
'/form/route'      // ✅ Correct
'/api/form/route'  // ❌ Wrong
```

---

## 📂 Topic Guides

### Component Patterns
- `React.FC<Props>` for type safety
- `React.lazy()` for code splitting
- Named const + default export pattern
- **[📖 Full Guide: references/component-patterns.md](references/component-patterns.md)**

### Data Fetching
- `useSuspenseQuery` as primary pattern
- Cache-first strategy
- API service layer in `features/{feature}/api/`
- **[📖 Full Guide: references/data-fetching.md](references/data-fetching.md)**

### File Organization
- `features/`: Domain-specific code
- `components/`: Truly reusable
- **[📖 Full Guide: references/file-organization.md](references/file-organization.md)**

### Styling with MUI v7
- `sx` prop with `SxProps<Theme>`
- Inline if <100 lines, separate if >100 lines
- **[📖 Full Guide: references/styling-guide.md](references/styling-guide.md)**

### TanStack Router
- Folder-based routing
- `createFileRoute` with lazy loading
- **[📖 Full Guide: references/routing-guide.md](references/routing-guide.md)**

### Loading & Error States
- SuspenseLoader for all loading states
- `useMuiSnackbar` for notifications
- **[📖 Full Guide: references/loading-and-error-states.md](references/loading-and-error-states.md)**

### Performance
- `useMemo` for expensive computations
- `useCallback` for handlers passed to children
- `React.memo` for expensive components
- **[📖 Full Guide: references/performance.md](references/performance.md)**

### TypeScript Standards
- Strict mode, no `any`
- Explicit return types
- Type imports with `import type`
- **[📖 Full Guide: references/typescript-standards.md](references/typescript-standards.md)**

### Common Patterns
- React Hook Form + Zod
- DataGrid wrappers
- Dialog standards
- **[📖 Full Guide: references/common-patterns.md](references/common-patterns.md)**

### Complete Examples
- Full component examples
- Feature structure template
- **[📖 Full Guide: references/complete-examples.md](references/complete-examples.md)**

---

## 🔧 Modern Component Template

```typescript
import React, { useState, useCallback } from 'react';
import { Box, Paper } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { featureApi } from '../api/featureApi';
import type { FeatureData } from '~types/feature';

interface MyComponentProps {
    id: number;
    onAction?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ id, onAction }) => {
    const [state, setState] = useState<string>('');

    const { data } = useSuspenseQuery({
        queryKey: ['feature', id],
        queryFn: () => featureApi.getFeature(id),
    });

    const handleAction = useCallback(() => {
        setState('updated');
        onAction?.();
    }, [onAction]);

    return (
        <Box sx={{ p: 2 }}>
            <Paper sx={{ p: 3 }}>
                {/* Content */}
            </Paper>
        </Box>
    );
};

export default MyComponent;
```

---

## 📚 Core Principles

1. **Lazy Load Everything Heavy** - Routes, DataGrid, charts, editors
2. **Suspense for Loading** - SuspenseLoader, not early returns
3. **useSuspenseQuery** - Primary data fetching pattern
4. **Features are Organized** - api/, components/, hooks/, helpers/ subdirs
5. **Styles Based on Size** - <100 inline, >100 separate
6. **Import Aliases** - Use @/, ~types, ~components, ~features
7. **No Early Returns** - Prevents layout shift
8. **useMuiSnackbar** - All user notifications
