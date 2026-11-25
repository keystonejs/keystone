---
'@keystone-6/core': major
---

Unique `where` inputs must now have at least one key and their values cannot be `null`, including in relationships. These previously selected an arbitrary item, or returned `null` from `findOne` for `{}`. Relationships in unique `where` inputs now also resolve the related list's unique `where`, so its id parsing and field resolvers apply.
