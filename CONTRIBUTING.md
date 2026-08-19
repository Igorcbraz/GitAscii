# Contributing to GitAscii

First off, thank you for considering contributing to GitAscii! It's people like you that make GitAscii such a great tool.

## Code of Conduct

By participating in this project, you are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md).

## Coding Standards & Guidelines

When contributing code to GitAscii, follow these standard practices:

1. **Centralized Endpoints**: All API route endpoints and external URLs must be defined in `src/services/endpoints.ts` (`API_ENDPOINTS`). Do not hardcode endpoint URLs inside components, libs, or routes.
2. **Minimal & Meaningful Comments**: Avoid redundant comments that simply explain self-explanatory code. Only add comments when explaining complex, non-obvious business rules or specific edge cases.
3. **Proper Catch Error Handling**: Always handle `catch` blocks properly (log with context, report, or return fallback values). Never leave silent catch blocks or catches with only empty comments.
4. **Early Returns**: Favor early returns (guard clauses) to reduce nesting and make control flow cleaner and easier to follow.
