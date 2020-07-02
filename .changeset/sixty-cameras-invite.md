---
'@keystonejs/adapter-knex': major
'@keystonejs/adapter-mongoose': major
'create-keystone-app': patch
---

Adapters must now be explicitly configured with a connection string. A default based on the project name is no longer used. See the docs for [`adapter-knex`](/packages/adapter-knex/README.md) and [`adapter-mongoose`](/packages/adapter-mongoose/README.md).
