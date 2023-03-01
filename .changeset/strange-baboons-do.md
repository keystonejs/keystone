---
'@keystone-6/core': patch
---

Removes `prismaClient.$on('beforeExit'...` as it is no longer required and blocked Prisma Data Proxy support
