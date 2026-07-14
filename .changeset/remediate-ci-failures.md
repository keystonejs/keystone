---
"@keystone-6/core": patch
---

This patch remediates critical CI build failures and functional regressions introduced in recent validation hook refactoring:

- **Build Stability**: Resolved `MISSING_EXPORT` and Rollup bundling errors in `@keystone-6/core` by restoring robust type signatures and standardized export patterns.
- **Validation Preservation**: Fixed a regression where field-level validation messages were swallowed if a list-level hook crashed. Field errors and explicit validation messages are now prioritized and propagated correctly.
- **Access Control Transparency**: Resolved a regression where database-level errors during unique item checks were silently swallowed. These are now correctly rethrown for infrastructure failures, while maintaining consistent "item may not exist" feedback for access-denied and schema-omitted cases.
