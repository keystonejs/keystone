---
'@keystone-next/keystone': major
---

Filtering and ordering is no longer enabled by default, as they have the potential to expose data which would otherwise be protected by access control. To enable filtering and ordering you can set `isFilterable: true` and `isOrderable: true` on specific fields, or set `defaultIsFilterable: true` and `defaultIsOrderable: true` at the list level.
