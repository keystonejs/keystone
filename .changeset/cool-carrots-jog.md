---
'@keystone-6/core': minor
---

Added support for Prisma's `shadowDatabaseUrl` option with `db.shadowDatabaseUrl`. Generated Prisma schemas now always include `shadowDatabaseUrl = env("SHADOW_DATABASE_URL")` though using `db.shadowDatabaseUrl` is optional.
