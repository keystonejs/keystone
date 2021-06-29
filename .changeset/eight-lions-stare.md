---
'@keystone-next/keystone': major
'@keystone-next/types': major
---

Replaced the `idField` list configuration option with a more constrained option, `db.idField`, that accepts an object with a `kind` property with a value of `cuid`, `uuid` or `autoincrement`. `db.idField` can be set on either the top level `config` object, or on individual lists.

The default behaviour has changed from using `autoincrement` to using cuids. To keep the current behaviour, you should set `{ kind: 'autoincrement' }` at `db.idField` in your top level config.
