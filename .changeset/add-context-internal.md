---
"@keystone-6/core": minor
---

Adds `context.internal()` to spawn a context unaffected by `graphql.omit` on lists or fields

WARNING: `context.internal()` bypasses `{field}.isFilterable` and `{field}.isOrderable` access control for now, this should change before a stable release
