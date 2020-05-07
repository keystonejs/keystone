---
'@keystonejs/adapter-knex': minor
'@keystonejs/adapter-mongoose': minor
'@keystonejs/keystone': minor
'@keystonejs/mongo-join-builder': minor
---

Added new `sortBy` query argument.

Each list now has an additional `Sort<List>By` enum type that represents the valid sorting options for all orderable fields in the list. `sortBy` takes one or more of these enum types, allowing for multi-field/column sorting.
