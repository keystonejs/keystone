---
"@keystone-6/core": patch
---

Change `keystone migrate create` to not require `db.shadowDatabaseUrl`, opting to create a temporary new database if allowed
