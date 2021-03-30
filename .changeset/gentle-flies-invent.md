---
'@keystone-next/keystone': major
'@keystone-next/types': major
---

Removed `migrationAction` argument to `createSystem` and require that the PrismaClient is passed to `createSystem` to be able to connect to the database.
