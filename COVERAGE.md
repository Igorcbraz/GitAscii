# Test Coverage Matrix

| Feature / Component     | Storybook (Visual) | Storybook (Interaction) | Playwright (E2E)    | Visual Regression (Snapshot) | Accessibility (a11y) |
| ----------------------- | ------------------ | ----------------------- | ------------------- | ---------------------------- | -------------------- |
| **Editor Canvas**       | 🟢 Yes             | 🟢 Yes (play)           | 🟢 Yes              | 🟢 Yes                       | 🟢 Yes               |
| **Properties Panel**    | 🟢 Yes             | 🟢 Yes (play)           | 🟢 Yes              | 🟢 Yes                       | 🟢 Yes               |
| **Layers Panel**        | 🟢 Yes             | 🟢 Yes (play)           | 🟢 Yes              | 🟢 Yes                       | 🟢 Yes               |
| **Toolbar/Modals**      | 🟢 Yes             | 🟢 Yes (play)           | 🟢 Yes              | 🟢 Yes                       | 🟢 Yes               |
| **Widget Library**      | 🟢 Yes             | 🔴 No                   | 🟢 Yes              | 🟢 Yes                       | 🟢 Yes               |
| **Landing Page**        | 🟢 Yes             | 🔴 No                   | 🟢 Yes              | 🟢 Yes                       | 🟢 Yes               |
| **Export/Import**       | 🟢 Yes             | 🟢 Yes                  | 🟢 Yes (Mocked)     | 🟢 Yes                       | 🟢 Yes               |
| **Undo/Redo**           | 🟢 Yes             | 🟢 Yes (play)           | 🟢 Yes              | 🟢 Yes                       | N/A                  |
| **Drag & Resize**       | 🟢 Yes             | 🟢 Yes (play)           | 🟢 Yes (data-attrs) | 🟢 Yes                       | N/A                  |
| **Themes (Dark/Light)** | 🟢 Yes             | 🔴 No                   | 🟢 Yes              | 🟢 Yes                       | 🟢 Yes               |

**Legend:**

- 🟢 **Yes**: Fully covered
- 🟡 **Partial**: Covered partially (e.g. state mocked or only basic visual states)
- 🔴 **No**: Not covered yet
- **N/A**: Not applicable for this type of test

### E2E Behaviors Validated

- Drag-and-drop constraints (using explicit DOM `data-x` e `data-y`)
- Multiple selection (using explicit `data-selected` attrs)
- Copy/Paste flows (mocked `navigator.clipboard`)
- Zoom & Pan (using explicit `data-zoom` on canvas wrapper)
- Rejection of dragged locked widgets (Regression test)
- Layers Panel ordering and selection synchronization
- Extended keyboard shortcuts (Escape, Arrow Keys, Delete, Undo, Redo, Copy, Paste)
- Strict Accessibility Enforcement via @axe-core/playwright (Landing, Editor, Templates, Explore)
