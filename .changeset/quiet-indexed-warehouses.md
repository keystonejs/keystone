---
'@keystone-6/core': minor
---

Add list-level `db.indexes` and `db.unique` declarations for ordered database indexes and compound unique constraints on stored scalar and enum fields. Declarations are validated during initialization and emitted before Prisma schema extensions. Existing field-level indexes and Keystone GraphQL unique selectors are unchanged. Nullable compound constraints use the database's standard null-distinct behavior.
