---
'@keystone-next/adapter-prisma-legacy': major
---

Removed migrationMode and all migration related methods on the adapter and instead require that a prisma client is passed to the adapter to be able to connect to the database
