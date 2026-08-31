# Test Coverage Matrix

| Feature / Component          | Unit Tests (Vitest) | Storybook (Visual) | Playwright (E2E) | Accessibility (a11y) |
| ---------------------------- | ------------------- | ------------------ | ---------------- | -------------------- |
| **Editor Canvas**            | 🟢 Yes              | 🟢 Yes (play)      | 🟢 Yes           | 🟢 Yes               |
| **Properties Panel**         | 🟢 Yes              | 🟢 Yes (play)      | 🟢 Yes           | 🟢 Yes               |
| **Layers Panel**             | 🟢 Yes              | 🟢 Yes (play)      | 🟢 Yes           | 🟢 Yes               |
| **Toolbar/Modals**           | 🟢 Yes              | 🟢 Yes (play)      | 🟢 Yes           | 🟢 Yes               |
| **Widget Library**           | 🟢 Yes              | 🟢 Yes             | 🟢 Yes           | 🟢 Yes               |
| **Landing Page**             | 🟢 Yes              | 🟢 Yes             | 🟢 Yes           | 🟢 Yes               |
| **Explore & Templates**      | 🟢 Yes              | 🟢 Yes             | 🟢 Yes           | 🟢 Yes               |
| **Pro Overview Dashboard**   | 🟢 Yes              | 🟢 Yes             | 🟢 Yes           | 🟢 Yes               |
| **Pro Analytics & Charts**   | 🟢 Yes              | 🟢 Yes             | 🟢 Yes           | 🟢 Yes               |
| **Pro Reports & Share Card** | 🟢 Yes              | 🟢 Yes             | 🟢 Yes           | 🟢 Yes               |
| **Pro Profiles Manager**     | 🟢 Yes              | 🟢 Yes             | 🟢 Yes           | 🟢 Yes               |
| **Pro Widget Errors Track**  | 🟢 Yes              | 🟢 Yes             | 🟢 Yes           | 🟢 Yes               |
| **Pro Email Notifications**  | 🟢 Yes              | 🟢 Yes             | 🟢 Yes           | 🟢 Yes               |
| **Pro Server Stores & APIs** | 🟢 Yes              | N/A                | 🟢 Yes (Mocked)  | N/A                  |
| **Privacy & LGPD Hashing**   | 🟢 Yes              | N/A                | N/A              | N/A                  |
| **Entitlements & Gating**    | 🟢 Yes              | N/A                | 🟢 Yes           | N/A                  |

---

### Pro Architecture Test Coverage Highlights

1. **Unit & Integration Testing (Vitest)**:
   - **`analyticsStore.test.ts` & `pro.test.ts`**: Validates high-performance $O(1)$ HyperLogLog unique visitor estimation, multi-profile ingestion, daily/hourly aggregations, cache validation ratios, and time-range filtering (`24h`, `7d`, `30d`, `90d`, `all`).
   - **`errorTrackerStore.test.ts`**: Tests error deduplication, 1-hour email cooldown suppression, occurrence counters, error resolution, and bulk clearing.
   - **`profileManagerStore.test.ts`**: Validates slug normalization, multi-profile limits per plan tier, immutable default profile constraints, and CRUD lifecycle.
   - **`entitlements.test.ts`**: Verifies Free vs Pro tier gating, environment variable overrides (`PRO_USERNAMES` / `PRO_ADMIN_USERS`), and persistent user settings.
   - **`emailLogStore.test.ts`**: Enforces 90-day retention, reverse-chronological sorting, and strict 3 test digest quota limits.
   - **`proRoutes.test.ts`**: End-to-end unit tests for all `/api/pro/*` endpoints (`overview`, `analytics`, `reports`, `errors`, `profiles`, `emails`, `admin/grant`, `dev-toggle`).

2. **Component & Design System Isolation (Storybook)**:
   - **Pro Dashboards**: `OverviewDashboard`, `AnalyticsDashboard`, `ReportsDashboard`, `ProfilesDashboard`, `WidgetErrorsDashboard`, `EmailNotificationsDashboard`.
   - **Telemetry Visualizations**: `AreaChart`, `HourlyBarChart`, `DonutChart`, `DimensionRanking`, `StackedRatioBar`, `HeatmapChart`, `WorldMap`.
   - **Atomic Components & Modals**: `ProBadge`, `ProStatCard`, `ProEmptyState`, `CountryFlag`, `ConfirmDialog`, `ProfileScopeSelect`, `ShareReportModal`, `ProHeader`, `ProSidebar`.

3. **End-to-End User Journeys & Compliance (Playwright)**:
   - **`e2e/specs/pro.spec.ts`**:
     - Complete tab navigation across all 6 Pro dashboards.
     - Telemetry time-range switcher and profile selector dropdown.
     - Profile creation and embed copying flow.
     - Widget error diagnostics and resolution.
     - Performance report generation and 1200x630 share card preview.
     - Automated WCAG 2.1 AA accessibility compliance via `@axe-core/playwright`.
