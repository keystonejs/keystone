---
'@keystonejs/adapter-knex': major
'@keystonejs/adapter-mongoose': major
'@keystonejs/keystone': major
---

Removed the `prepareFieldAdapter()` method of `BaseListAdapter`, `MongooseAdapter` and `KnexListAdapter`. No action is required unless you were explicitly using this method in your code.
