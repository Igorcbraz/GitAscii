# Frontend Expert

> Modern React/TypeScript development patterns for high-performance applications.

## 🚀 Quick Start

1. **Add to your project:**
   ```bash
   # Copy to project skills directory
   cp -r frontend-expert .agent/skills/
   ```

2. **Trigger naturally:**
   - "Create a new component for user profiles"
   - "Set up data fetching with TanStack Query"
   - "Add a new feature module"

## ✨ What It Does

Frontend Expert provides battle-tested patterns for:

| Category | Patterns |
|----------|----------|
| **Components** | `React.FC<Props>`, lazy loading, Suspense boundaries |
| **Data Fetching** | `useSuspenseQuery`, cache-first, API service layer |
| **Styling** | MUI v7 `sx` prop, inline vs separate rules |
| **Routing** | TanStack Router, folder-based, lazy routes |
| **Performance** | `useMemo`, `useCallback`, `React.memo` |
| **TypeScript** | Strict mode, no `any`, explicit types |

## 🔧 How It Works

The skill activates when you work on frontend code and provides:

1. **Checklists** - Step-by-step guidance for components/features
2. **Critical Rules** - Non-negotiable patterns (no early returns!)
3. **Templates** - Ready-to-copy code snippets
4. **Deep Guides** - 10 reference documents for detailed patterns

### Reference Documents

| Topic | File |
|-------|------|
| Component Patterns | `references/component-patterns.md` |
| Data Fetching | `references/data-fetching.md` |
| File Organization | `references/file-organization.md` |
| Styling Guide | `references/styling-guide.md` |
| Routing Guide | `references/routing-guide.md` |
| Loading & Errors | `references/loading-and-error-states.md` |
| Performance | `references/performance.md` |
| TypeScript | `references/typescript-standards.md` |
| Common Patterns | `references/common-patterns.md` |
| Complete Examples | `references/complete-examples.md` |

## 🔔 When to Use

- Creating new React components or pages
- Building feature modules with proper structure
- Fetching data with TanStack Query
- Setting up routes with TanStack Router
- Styling with MUI v7
- Optimizing frontend performance
- Organizing project file structure

## 📝 Examples

### Example 1: Create a New Component

**Request:** "Create a user profile component"

**Skill Response:**
```typescript
import React from 'react';
import { Box, Paper, Avatar, Typography } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { userApi } from '../api/userApi';

interface UserProfileProps {
    userId: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
    const { data: user } = useSuspenseQuery({
        queryKey: ['user', userId],
        queryFn: () => userApi.getUser(userId),
    });

    return (
        <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Avatar src={user.avatar} />
                <Typography variant="h6">{user.name}</Typography>
            </Box>
        </Paper>
    );
};

export default UserProfile;
```

### Example 2: Set Up a New Feature

**Request:** "Create an orders feature"

**Skill Response:**
```
features/
  orders/
    api/
      ordersApi.ts        # API service
    components/
      OrderList.tsx       # Main component
      OrderCard.tsx       # Card component
    hooks/
      useOrders.ts        # Custom hooks
    types/
      index.ts            # TypeScript types
    index.ts              # Public exports
```

---

## 🎯 Core Principles

1. **Lazy Load Everything Heavy** - Routes, DataGrid, charts
2. **Suspense for Loading** - Never early returns
3. **useSuspenseQuery** - Primary data fetching
4. **Feature Organization** - api/, components/, hooks/, types/
5. **Styles by Size** - <100 inline, >100 separate
6. **Import Aliases** - @/, ~types, ~components, ~features
7. **useMuiSnackbar** - All user notifications
