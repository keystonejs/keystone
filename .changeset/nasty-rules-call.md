---
'@keystonejs/adapter-knex': patch
'@keystonejs/api-tests': patch
---

Fixed a query generation bug when performing `count` operations on `1:1` relationships with a filter.
