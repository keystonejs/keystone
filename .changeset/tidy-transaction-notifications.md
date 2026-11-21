---
'@keystone-6/core': minor
---

Add list and field `hooks.transaction.afterCommit` and `hooks.transaction.afterRollback` callbacks for writes made through explicit `context.transaction()` calls. Callbacks receive operation snapshots and usable contexts preserving their originating session and privileges. Existing `beforeOperation` and `afterOperation` hooks remain inside the transaction. Commit callback failures cannot undo committed writes; rollback callback failures are logged without replacing the transaction failure. Ordinary mutations and raw Prisma writes do not generate transaction-hook events.
