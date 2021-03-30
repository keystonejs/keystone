---
'@keystone-next/test-utils-legacy': major
---

Removed usage of `getDbSchemaName`, `getPrismaPath`, `migrationMode` and `dropDatabase` adapter options. Note this means that dropping the database and running migrations will now only happen when creating a keystone instance from `setupFromConfig` rather than on every `keystone.connect`
