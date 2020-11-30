---
"@keystone-next/example-ecommerce": patch
"@keystone-next/keystone": major
"@keystone-next/types": major
---

Updated onConnect arguments to provide `createContext` and `knex` / `mongoose` / `prisma` (depending on the adapter in use) instead of the BaseKeystone instance

Added database APIs to context
