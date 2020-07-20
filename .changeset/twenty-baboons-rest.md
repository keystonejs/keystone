---
'@keystonejs/api-tests': patch
'@keystonejs/adapter-knex': patch
---

Fixed bug where `_is_null` queries on relationship fields could generate invalid SQL in `one-to-one` relationships.
