---
'@keystone-next/keystone': major
'@keystone-next/types': major
---

Removed the `none` case in `MigrationAction` and require that the PrismaClient is passed to be able to connect to the database for the `none-skip-client-generation` case.
