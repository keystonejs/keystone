---
"@keystone-next/example-ecommerce": patch
"@keystone-next/keystone": major
"@keystone-next/types": major
---

Updated onConnect arguments to provide preconstructed `Context` instead of the `BaseKeystone` instance

Added database APIs to context: `knex` / `mongoose` / `prisma` (depending on the adapter in use)
