---
'@keystone-next/keystone': major
'@keystone-next/adapter-prisma-legacy': major
---

Removed `getDbSchemaName` and `getPrismaPath` database adapter options. To change the database schema that Keystone uses, you can add `?schema=whatever` to the database url.
