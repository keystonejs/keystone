---
'@keystone-next/keystone': major
'@keystone-next/types': major
---

Removed `search` argument from the GraphQL API for finding many items, Lists/DB API and to-many relationship fields. You should use `contains` filters instead.
