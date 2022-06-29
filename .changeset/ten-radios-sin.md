---
'@keystone-6/core': patch
---

Fixes the generation of an invalid Prisma schema when `{field}.isIndexed: true` and `{field}.db.map` are set
