---
"@keystone-next/example-ecommerce": patch
"@keystone-next/keystone": major
"@keystone-next/types": major
---

Changed the `config.db.onConnect` argument to accept a `KeystoneContext` instance, created with `{ skipAccessControl: true }`, rather than a `BaseKeystone` instance.

Added database APIs to context: `knex` / `mongoose` / `prisma` (depending on the adapter in use)
