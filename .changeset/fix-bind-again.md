---
'@keystone-6/core': patch
---

Reverts `::` as the default `config.server.options.host`, prefer `undefined` (the default for nodejs `httpServer`)
