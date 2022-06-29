---
'@keystone-6/core': minor
---

Adds support for Prisma's `shadowDatabaseUrl` option with `db.shadowDatabaseUrl`.
Your Prisma schemas will now always include `shadowDatabaseUrl = env("SHADOW_DATABASE_URL")`, though using `db.shadowDatabaseUrl` is optional
