---
"@keystone-6/core": patch
---

`create`, `update` and `delete` mutations now run their write inside a database transaction, so each item is written atomically. Previously a mutation with nested creates could leave orphaned related rows behind (or a partially-applied item) if a nested write, a `beforeOperation`/`validate` hook, or a database constraint failed partway through — now the whole write rolls back cleanly.

For the `*Many` mutations (`createMany`, `updateMany`, `deleteMany`) each item is written in its own transaction and the items are processed one at a time, so a single failing item rolls back on its own while the rest of the batch still succeeds — the existing per-item partial-success behaviour is unchanged.

`afterOperation` hooks are unaffected: they still run after the write has committed, and an error thrown from an `afterOperation` hook still does not roll the write back.
