---
'@keystonejs/api-tests': patch
'@keystonejs/adapter-knex': patch
'@keystonejs/adapter-mongoose': patch
'@keystonejs/keystone': patch
---

Consolidated implementation of all `listAdapter.find\*()` methods to use the `itemsQuery()` API for internal consistency.
