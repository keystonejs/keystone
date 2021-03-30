---
'@keystone-next/keystone': major
'@keystone-next/types': major
---

Changed the behaviour of the `none` case in `MigrationAction` to not generate the Prisma client and require that the PrismaClient is passed to be able to connect to the database and removed `none-skip-client-generation` case.
