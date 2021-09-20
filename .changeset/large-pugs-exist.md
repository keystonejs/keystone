---
'@keystone-next/auth': major
'@keystone-next/keystone': major
---

The API `context.lists` has been renamed to `context.query`, and `context.db.lists` has been renamed to `context.db`.

When using the experimental option `config.experimental.generateNodeAPI`, the `api` module now exports `query` rather than `lists`.
