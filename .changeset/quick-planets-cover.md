---
'@keystonejs/api-tests': patch
'@keystonejs/adapter-knex': patch
'@keystonejs/adapter-mongoose': patch
---

Fixed a bug which could lead to data loss (knex adapter only) when deleting items from a list which was the `1` side of a `1:N` relationship.
