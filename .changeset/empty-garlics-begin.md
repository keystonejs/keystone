---
'@keystone-next/adapter-prisma-legacy': patch
---

Replaced usage of prisma cli when in `migrationMode: 'prototype'` with programmatic calls to `@prisma/migrate` to improve performance
