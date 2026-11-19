---
'@keystone-6/core': minor
---

Expose compound unique selectors from list `db.unique` declarations in GraphQL, `context.db`, and `context.query`. Complete, non-null tuples can identify items in queries, single/bulk update and delete operations, relationship inputs, and pagination cursors without making their members individually unique. Selectors preserve list and member-field access checks and use generated input types.

Add `input.uniqueWhereValue` for custom fields to provide exact scalar/enum selector values independently of mutation inputs or standalone uniqueness. Declarative compound constraints now require supported member contracts and collision-free selector names. Nullable database columns remain supported, but null-containing tuples cannot be used as unique selectors.

Generated inputs now type the built-in `DateTime`, `CalendarDay`, `BigInt`, and `Hex` scalars using their accepted input representations instead of `any`. Unknown custom scalars use `NonNullable<unknown>` within compound tuples, with their precise representation validated at runtime.
