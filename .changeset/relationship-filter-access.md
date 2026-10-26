---
'@keystone-6/core': major
---

Applies `access.{operation,filter}.query` to relationships in user-supplied filters. Relationship checks use `one` for `findOne` and mutation lookups, `many` for `findMany`, and `count` for counts.
