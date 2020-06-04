---
'@keystonejs/adapter-knex': minor
'create-keystone-app': minor
'@keystonejs/keystone': minor
---

Added a new \_verifyTables method to the knex adapter. This is then used by the Keystone CLI to warn when tables have not been initialised or the database might need a migration.
