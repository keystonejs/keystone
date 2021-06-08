---
'@keystone-next/keystone': major
---

Filters returned from access control now go through GraphQL validation and coercion like filters that you pass in through the GraphQL API, this will produce better errors when you return invalid values.
