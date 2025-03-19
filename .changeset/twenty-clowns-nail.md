---
"@keystone-6/core": patch
---

Adding a `shadowDatabaseUrl` is no longer necessary when using `keystone migrate create` when the database url used allows creating databases, similar to Prisma's built-in commands
