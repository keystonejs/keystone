---
'@keystone-next/keystone': major
'@keystone-next/types': major
---

Replaced `idField` option with a more constrained option that an object with a kind property that is one of `cuid`, `uuid` or `autoincrement`. The default is now to use cuids. To keep the current behaviour, you should set `{ kind: 'autoincrement' }` at `db.idField` at the root of your config.
