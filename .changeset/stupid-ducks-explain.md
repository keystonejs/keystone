---
'@keystonejs/adapter-knex': major
'@keystonejs/adapter-mongoose': major
'@keystonejs/keystone': major
'@keystonejs/mongo-join-builder': major
---

Added new `sortBy` query argument.

Each list now has an additional `Sort<List>By` enum type that refresents the valid sorting options for all orderable fields in the list. `sortBy` takes one or more of these enum types, allowing for multi-field/column sorting.
