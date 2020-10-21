---
'@keystonejs/adapter-knex': patch
---

Fixed bug in `.dropDatabase()`, relationship join tables are now correctly dropped when using a non-default `schemaName`.
